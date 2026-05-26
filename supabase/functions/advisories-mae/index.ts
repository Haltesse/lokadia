/**
 * Edge Function : Proxy MAE France (diplomatie.gouv.fr)
 *
 * Scrape la fiche "Conseils aux voyageurs" pour un pays donné et retourne
 * le niveau d'advisory (Vert / Jaune / Orange / Rouge / Noir) sous forme JSON.
 *
 * Endpoint : GET /functions/v1/advisories-mae?country={slug}
 *
 * Exemple : /functions/v1/advisories-mae?country=japon
 *   → { "level": "vert", "lastUpdate": "...", "source": "MAE France" }
 *
 * Déploiement :
 *   supabase functions deploy advisories-mae --no-verify-jwt
 *
 * NOTE : la structure HTML de diplomatie.gouv.fr peut évoluer. Ce parser est
 * basé sur la version mai 2026. À surveiller / mettre à jour si elle change.
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaeResponse {
  level: 'vert' | 'jaune' | 'orange' | 'rouge' | 'noir' | 'unknown';
  countrySlug: string;
  lastUpdate: string;
  source: string;
  rawSnippet?: string;
}

/**
 * Détecte le niveau MAE en cherchant les mots-clés dans le HTML.
 * Le site utilise une palette de couleurs cartographique standardisée.
 */
function detectMaeLevel(html: string): MaeResponse['level'] {
  // Le site MAE colore les pays sur une carte avec ces classes/keywords
  const lower = html.toLowerCase();

  // Cherche les patterns dans l'ordre du plus restrictif au moins restrictif
  // (pour éviter de matcher "vigilance renforcée" comme "vigilance" simple)
  if (lower.includes('formellement déconseillé') || lower.includes('zone-rouge')) {
    return 'rouge';
  }
  if (lower.includes('déconseillé sauf raison impérative') || lower.includes('zone-noire')) {
    return 'noir';
  }
  if (lower.includes('déconseillé') || lower.includes('zone-orange')) {
    return 'orange';
  }
  if (lower.includes('vigilance renforcée') || lower.includes('zone-jaune')) {
    return 'jaune';
  }
  if (lower.includes('vigilance normale') || lower.includes('zone-verte')) {
    return 'vert';
  }
  return 'unknown';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const country = url.searchParams.get('country');

  if (!country) {
    return new Response(JSON.stringify({ error: 'Missing country parameter' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const maeUrl = `https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/${country}/`;
    const res = await fetch(maeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Lokadia Lokascore aggregator)' },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `MAE returned ${res.status}`, countrySlug: country }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const html = await res.text();
    const level = detectMaeLevel(html);

    const response: MaeResponse = {
      level,
      countrySlug: country,
      lastUpdate: new Date().toISOString(),
      source: 'MAE France · diplomatie.gouv.fr',
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        // Cache 1h côté CDN Supabase
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e), countrySlug: country }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
