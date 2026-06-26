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

// Catégories OSM « bruit » à masquer (transports, mobilier urbain, voirie…)
const NOISE = new Set([
  'bus_stop', 'bus_station', 'stop_position', 'platform', 'subway_entrance', 'train_station_entrance',
  'tram_stop', 'halt', 'stop', 'station', 'ferry_terminal', 'taxi', 'parking', 'parking_entrance',
  'parking_space', 'bicycle_parking', 'motorcycle_parking', 'traffic_signals', 'crossing', 'street_lamp',
  'bench', 'waste_basket', 'vending_machine', 'recycling', 'fire_hydrant', 'drinking_water', 'toilets',
  'telephone', 'post_box', 'bicycle_rental', 'charging_station', 'fuel', 'atm', 'clock', 'surveillance',
  'camera', 'screen', 'give_way', 'turning_circle', 'elevator', 'steps', 'traffic_calming',
  'motorway_junction', 'construction', 'tree', 'street_cabinet', 'switch', 'milestone', 'level_crossing',
]);

// Étiquettes FR pour les catégories courantes (sinon on capitalise le tag OSM)
const CATEGORY_FR: Record<string, string> = {
  attraction: 'Site touristique', museum: 'Musée', gallery: "Galerie d'art", artwork: 'Œuvre d\'art',
  viewpoint: 'Point de vue', monument: 'Monument', memorial: 'Mémorial', castle: 'Château',
  ruins: 'Ruines', fort: 'Fort', tower: 'Monument', place_of_worship: 'Lieu de culte',
  restaurant: 'Restaurant', cafe: 'Café', bar: 'Bar', pub: 'Pub', fast_food: 'Restauration rapide',
  bakery: 'Boulangerie', ice_cream: 'Glacier', winery: 'Domaine viticole',
  hotel: 'Hôtel', hostel: 'Auberge', guest_house: "Maison d'hôtes", apartment: 'Appartement',
  park: 'Parc', garden: 'Jardin', beach: 'Plage', nature_reserve: 'Réserve naturelle',
  zoo: 'Zoo', aquarium: 'Aquarium', theme_park: "Parc d'attractions", water_park: 'Parc aquatique',
  theatre: 'Théâtre', cinema: 'Cinéma', nightclub: 'Boîte de nuit', casino: 'Casino',
  marketplace: 'Marché', mall: 'Centre commercial', department_store: 'Grand magasin',
  supermarket: 'Supermarché', books: 'Librairie',
  peak: 'Sommet', waterfall: 'Cascade', cave_entrance: 'Grotte', spring: 'Source',
  city: 'Ville', town: 'Ville', village: 'Village', hamlet: 'Hameau',
  suburb: 'Quartier', neighbourhood: 'Quartier', square: 'Place', stadium: 'Stade',
};

const cap = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ') : '';

function normalize(geojson: unknown): NormalizedPlace[] {
  const feats = Array.isArray((geojson as { features?: unknown[] })?.features)
    ? (geojson as { features: Record<string, any>[] }).features
    : [];
  const out: NormalizedPlace[] = [];
  const seen = new Set<string>();
  for (const f of feats) {
    const p = f?.properties ?? {};
    if (!p.name) continue;
    const value = String(p.osm_value || '');
    if (NOISE.has(value)) continue; // on jette le bruit OSM (arrêts de bus, parkings…)
    const coords = Array.isArray(f.geometry?.coordinates) ? f.geometry.coordinates : [];
    const lat = Number(coords[1]);
    const lon = Number(coords[0]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    // Dédoublonnage : même nom quasi au même endroit (lieu tagué plusieurs fois dans OSM)
    const key = `${String(p.name).toLowerCase()}|${lat.toFixed(3)}|${lon.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const category = CATEGORY_FR[value] || cap(value || p.osm_key || p.type || '');
    const address = [
      [p.housenumber, p.street].filter(Boolean).join(' '),
      p.city || p.town || p.village || p.county || p.state,
      p.country,
    ]
      .filter(Boolean)
      .join(', ');
    out.push({
      id: `${p.osm_type ?? 'X'}${p.osm_id ?? p.name}`,
      name: String(p.name),
      category,
      lat,
      lon,
      address,
    });
  }
  return out;
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
