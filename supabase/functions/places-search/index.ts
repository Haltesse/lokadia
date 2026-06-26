/**
 * Edge Function : places-search
 *
 * Recherche de LIEUX (POI) via PHOTON (komoot) — moteur basé sur OpenStreetMap,
 * 100 % GRATUIT, SANS CLÉ ni carte bancaire. Transforme le planner de
 * « villes » en « lieux précis » (monuments, restaurants, magasins, parcs…).
 *
 * OSM ne fournit pas de photo → on renvoie nom + catégorie + adresse. Les
 * résultats sont mis en cache dans `places_cache` si la table existe (sinon
 * dégradation gracieuse — on appelle Photon à chaque fois, c'est gratuit).
 *
 * Endpoint : GET /functions/v1/places-search?query={texte}&ll={lat,lon}
 *   → { "results": [ { id, name, category, lat, lon, address } ] }
 *
 * Déploiement : supabase functions deploy places-search --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

const cap = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '';

function normalize(geojson: unknown): NormalizedPlace[] {
  const feats = Array.isArray((geojson as { features?: unknown[] })?.features)
    ? (geojson as { features: Record<string, any>[] }).features
    : [];
  return feats
    .filter((f) => f?.properties?.name)
    .map((f): NormalizedPlace => {
      const p = f.properties ?? {};
      const coords = Array.isArray(f.geometry?.coordinates) ? f.geometry.coordinates : [];
      const category = cap(p.osm_value || p.osm_key || p.type || '');
      const address = [
        [p.housenumber, p.street].filter(Boolean).join(' '),
        p.city || p.town || p.village || p.county || p.state,
        p.country,
      ]
        .filter(Boolean)
        .join(', ');
      return {
        id: `${p.osm_type ?? 'X'}${p.osm_id ?? p.name}`,
        name: String(p.name),
        category,
        lat: Number(coords[1]),
        lon: Number(coords[0]),
        address,
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
    /* best-effort */
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

  const cacheKey = `photon:${query.toLowerCase()}:${ll || 'global'}`;
  const cached = await readCache(cacheKey);
  if (cached) return json({ results: cached, cached: true });

  try {
    const photon = new URL('https://photon.komoot.io/api/');
    photon.searchParams.set('q', query);
    photon.searchParams.set('limit', '10');
    photon.searchParams.set('lang', 'fr');
    if (ll) {
      const [lat, lon] = ll.split(',');
      if (lat && lon) {
        photon.searchParams.set('lat', lat);
        photon.searchParams.set('lon', lon);
      }
    }

    const res = await fetch(photon.toString(), {
      headers: { 'User-Agent': 'Lokadia trip planner (places-search)' },
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      return json({ results: [], error: `Photon ${res.status}`, detail });
    }

    const data = await res.json();
    const normalized = normalize(data);
    writeCache(cacheKey, normalized); // fire-and-forget
    return json({ results: normalized });
  } catch (e) {
    return json({ results: [], error: String(e) });
  }
});
