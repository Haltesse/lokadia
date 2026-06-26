/**
 * Edge Function : places-search
 *
 * Recherche de LIEUX (POI) riches via Foursquare Places API — avec photo,
 * catégorie, adresse — pour transformer le planner de « villes » en « vrais
 * lieux » (style Wanderlog).
 *
 * La clé Foursquare est CACHÉE côté serveur (jamais dans le bundle). Les
 * réponses sont mises en cache dans la table `places_cache` → on divise les
 * appels payants par 5-10 et on gagne l'offline.
 *
 * Endpoint : GET /functions/v1/places-search?query={texte}&ll={lat,lon}
 *   → { "results": [ { id, name, category, categoryIcon, lat, lon, address, photoUrl } ] }
 *
 * Dégradation gracieuse : en cas d'erreur (clé absente, Foursquare down…),
 * renvoie 200 avec results:[] pour ne JAMAIS casser le planner.
 *
 * Secrets requis (Supabase) :
 *   supabase secrets set FOURSQUARE_API_KEY="fsq_xxx"
 *   (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont injectés automatiquement.)
 *
 * Déploiement :
 *   supabase functions deploy places-search --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FSQ_KEY = Deno.env.get('FOURSQUARE_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

interface NormalizedPlace {
  id: string;
  name: string;
  category: string;
  categoryIcon?: string;
  lat: number;
  lon: number;
  address: string;
  photoUrl?: string;
}

function normalize(fsq: unknown): NormalizedPlace[] {
  const results = Array.isArray((fsq as { results?: unknown[] })?.results)
    ? (fsq as { results: Record<string, any>[] }).results
    : [];
  return results
    .map((p): NormalizedPlace => {
      const cat = Array.isArray(p.categories) ? p.categories[0] : undefined;
      const categoryIcon = cat?.icon?.prefix && cat?.icon?.suffix
        ? `${cat.icon.prefix}bg_64${cat.icon.suffix}`
        : undefined;
      const photo = Array.isArray(p.photos) ? p.photos[0] : undefined;
      const photoUrl = photo?.prefix && photo?.suffix
        ? `${photo.prefix}300x300${photo.suffix}`
        : undefined;
      const loc = p.location ?? {};
      const address = [loc.address, loc.locality, loc.country].filter(Boolean).join(', ');
      return {
        id: String(p.fsq_place_id ?? `${p.name}-${p.latitude}`),
        name: String(p.name ?? 'Lieu'),
        category: String(cat?.name ?? ''),
        categoryIcon,
        lat: Number(p.latitude),
        lon: Number(p.longitude),
        address,
        photoUrl,
      };
    })
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
}

async function readCache(key: string): Promise<NormalizedPlace[] | null> {
  if (!SUPABASE_URL || !SERVICE_ROLE) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/places_cache?query_key=eq.${encodeURIComponent(key)}&select=payload,created_at&limit=1`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const age = Date.now() - new Date(rows[0].created_at).getTime();
    if (age > CACHE_TTL_MS) return null;
    return rows[0].payload as NormalizedPlace[];
  } catch {
    return null;
  }
}

async function writeCache(key: string, payload: NormalizedPlace[]): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_ROLE) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/places_cache?on_conflict=query_key`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ query_key: key, payload, created_at: new Date().toISOString() }),
    });
  } catch {
    /* écriture de cache best-effort — on n'échoue jamais là-dessus */
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  const url = new URL(req.url);
  const query = (url.searchParams.get('query') ?? '').trim();
  const ll = url.searchParams.get('ll') ?? '';

  if (query.length < 2) return json({ results: [] });
  if (!FSQ_KEY) return json({ results: [], error: 'FOURSQUARE_API_KEY non configurée' });

  const cacheKey = `search:${query.toLowerCase()}:${ll || 'global'}`;

  const cached = await readCache(cacheKey);
  if (cached) return json({ results: cached, cached: true });

  try {
    const fsqUrl = new URL('https://places-api.foursquare.com/places/search');
    fsqUrl.searchParams.set('query', query);
    fsqUrl.searchParams.set('limit', '10');
    if (ll) fsqUrl.searchParams.set('ll', ll);
    fsqUrl.searchParams.set('fields', 'fsq_place_id,name,latitude,longitude,categories,location,photos');

    const res = await fetch(fsqUrl.toString(), {
      headers: {
        Authorization: `Bearer ${FSQ_KEY}`,
        'X-Places-Api-Version': '2025-06-17',
        accept: 'application/json',
      },
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      return json({ results: [], error: `Foursquare ${res.status}`, detail });
    }

    const data = await res.json();
    const normalized = normalize(data);
    writeCache(cacheKey, normalized); // fire-and-forget
    return json({ results: normalized });
  } catch (e) {
    return json({ results: [], error: String(e) });
  }
});
