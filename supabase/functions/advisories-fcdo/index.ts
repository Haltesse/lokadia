/**
 * Edge Function : UK Foreign, Commonwealth & Development Office (FCDO)
 * Travel Advice
 *
 * Endpoint : GET /functions/v1/advisories-fcdo?country={slug}
 *
 * Source : https://www.gov.uk/foreign-travel-advice/{country-slug}
 *
 * Échelle FCDO normalisée :
 *   - No advisory                         → 100 (none)
 *   - "see our advice against ..."        → 60  (advisory)
 *   - "essential travel only"             → 30  (essential)
 *   - "all travel" / "do not travel"      → 0   (donottravel)
 *
 * Exemple : /functions/v1/advisories-fcdo?country=japan
 *   → { "level": "none", "summary": "...", ... }
 *
 * Déploiement :
 *   supabase functions deploy advisories-fcdo --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type FcdoLevel = 'none' | 'advisory' | 'essential' | 'donottravel' | 'unknown';

interface FcdoResponse {
  level: FcdoLevel;
  countrySlug: string;
  summary: string;
  lastUpdate: string;
  source: string;
}

function detectFcdoLevel(html: string): FcdoLevel {
  const lower = html.toLowerCase();
  // Patterns du plus restrictif au moins restrictif
  if (lower.includes('advises against all travel') || lower.includes('do not travel')) {
    return 'donottravel';
  }
  if (lower.includes('advises against all but essential travel') || lower.includes('essential travel only')) {
    return 'essential';
  }
  if (lower.includes('advises against travel') || lower.includes('advises against all travel to parts')) {
    return 'advisory';
  }
  if (lower.includes('see our advice') || lower.includes('warning') || lower.includes('our advice on travel')) {
    return 'advisory';
  }
  // Si la page existe mais sans advisory spécifique, on suppose 'none'
  if (lower.includes('foreign travel advice') && lower.includes('safety and security')) {
    return 'none';
  }
  return 'unknown';
}

function levelToSummary(level: FcdoLevel): string {
  switch (level) {
    case 'none': return 'No specific FCDO advisory active';
    case 'advisory': return 'FCDO advises caution / partial restrictions';
    case 'essential': return 'FCDO advises against all but essential travel';
    case 'donottravel': return 'FCDO advises against all travel';
    default: return 'FCDO advisory unknown';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const country = url.searchParams.get('country');
  if (!country) {
    return new Response(JSON.stringify({ error: 'Missing country slug parameter' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const fcdoUrl = `https://www.gov.uk/foreign-travel-advice/${country}`;
    const res = await fetch(fcdoUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Lokadia Lokascore aggregator)' },
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `FCDO returned ${res.status}`, countrySlug: country }),
        { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const html = await res.text();
    const level = detectFcdoLevel(html);

    const response: FcdoResponse = {
      level,
      countrySlug: country,
      summary: levelToSummary(level),
      lastUpdate: new Date().toISOString(),
      source: 'UK FCDO · gov.uk/foreign-travel-advice',
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
      JSON.stringify({ error: String(e), countrySlug: country }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
