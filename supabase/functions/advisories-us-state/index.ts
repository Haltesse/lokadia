/**
 * Edge Function : US Department of State Travel Advisories
 *
 * Endpoint : GET /functions/v1/advisories-us-state?country={iso2}
 *
 * Le State Department publie un flux JSON consolidé (geojson + advisories
 * structurés). On peut le scrape avec une URL stable :
 *   https://travel.state.gov/_res/rss/TAsTWs.xml
 *
 * Mais le format le plus pratique est la page HTML qui contient un Level 1-4
 * standardisé par pays.
 *
 * Exemple : /functions/v1/advisories-us-state?country=JP
 *   → { "level": 1, "summary": "Exercise normal precautions", ... }
 *
 * Déploiement :
 *   supabase functions deploy advisories-us-state --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UsStateResponse {
  level: 1 | 2 | 3 | 4 | null;
  summary: string;
  countryIso: string;
  lastUpdate: string;
  source: string;
}

// Mapping ISO2 → slug travel.state.gov
const ISO_TO_SLUG: Record<string, string> = {
  JP: 'japan', FR: 'france', GB: 'united-kingdom', DE: 'germany', ES: 'spain',
  IT: 'italy', PT: 'portugal', NL: 'netherlands', BE: 'belgium', CH: 'switzerland',
  AT: 'austria', IE: 'ireland', SE: 'sweden', NO: 'norway', DK: 'denmark',
  FI: 'finland', IS: 'iceland', PL: 'poland', CZ: 'czech-republic', GR: 'greece',
  RU: 'russia', TR: 'turkey', CA: 'canada', MX: 'mexico', BR: 'brazil',
  AR: 'argentina', MA: 'morocco', EG: 'egypt', AE: 'united-arab-emirates',
  IL: 'israel', ZA: 'south-africa', CN: 'china', HK: 'hong-kong', KR: 'korea',
  TH: 'thailand', SG: 'singapore', MY: 'malaysia', ID: 'indonesia', IN: 'india',
  AU: 'australia',
};

/** Détecte le Level 1-4 dans le HTML travel.state.gov */
function detectUsLevel(html: string): UsStateResponse['level'] {
  // Cherche le pattern "Travel Advisory Level X"
  const match = html.match(/Travel\s+Advisory\s+Level\s+(\d)/i);
  if (match) {
    const lvl = parseInt(match[1], 10);
    if (lvl >= 1 && lvl <= 4) return lvl as 1 | 2 | 3 | 4;
  }
  // Fallback : cherche les phrases standard
  if (/exercise\s+normal\s+precautions/i.test(html)) return 1;
  if (/exercise\s+increased\s+caution/i.test(html)) return 2;
  if (/reconsider\s+travel/i.test(html)) return 3;
  if (/do\s+not\s+travel/i.test(html)) return 4;
  return null;
}

function levelToSummary(level: UsStateResponse['level']): string {
  switch (level) {
    case 1: return 'Exercise normal precautions';
    case 2: return 'Exercise increased caution';
    case 3: return 'Reconsider travel';
    case 4: return 'Do not travel';
    default: return 'No advisory available';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const countryIso = url.searchParams.get('country')?.toUpperCase();

  if (!countryIso) {
    return new Response(JSON.stringify({ error: 'Missing country parameter (ISO2)' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const slug = ISO_TO_SLUG[countryIso];
  if (!slug) {
    return new Response(JSON.stringify({ error: `Country ${countryIso} not mapped`, level: null }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const usUrl = `https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/${slug}-travel-advisory.html`;
    const res = await fetch(usUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Lokadia Lokascore aggregator)' },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `US State returned ${res.status}`, countryIso, level: null }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const html = await res.text();
    const level = detectUsLevel(html);

    const response: UsStateResponse = {
      level,
      summary: levelToSummary(level),
      countryIso,
      lastUpdate: new Date().toISOString(),
      source: 'US Department of State · travel.state.gov',
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e), countryIso, level: null }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
