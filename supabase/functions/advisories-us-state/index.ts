/**
 * Edge Function : US Department of State Travel Advisories
 *
 * Endpoint : GET /functions/v1/advisories-us-state?country={iso2}
 *
 * Stratégie 2026 : on parse le flux RSS officiel qui contient toutes les
 * advisories actives pour tous les pays en un seul appel.
 *
 * Format des items :
 *   <title>{Country Name} - Level X: {Description}</title>
 *
 * On extrait le niveau (1-4) depuis le titre, qui est beaucoup plus fiable
 * que le scraping HTML (qui est rendu côté client en SPA).
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
  countryName: string;
  lastUpdate: string;
  source: string;
}

// Mapping ISO2 → nom anglais utilisé dans le titre du RSS feed
const ISO_TO_NAME: Record<string, string> = {
  JP: 'Japan', FR: 'France', GB: 'United Kingdom', DE: 'Germany', ES: 'Spain',
  IT: 'Italy', PT: 'Portugal', NL: 'Netherlands', BE: 'Belgium', CH: 'Switzerland',
  AT: 'Austria', IE: 'Ireland', SE: 'Sweden', NO: 'Norway', DK: 'Denmark',
  FI: 'Finland', IS: 'Iceland', PL: 'Poland', CZ: 'Czechia', GR: 'Greece',
  RU: 'Russia', TR: 'Turkey', CA: 'Canada', MX: 'Mexico', BR: 'Brazil',
  AR: 'Argentina', MA: 'Morocco', EG: 'Egypt', AE: 'United Arab Emirates',
  IL: 'Israel', ZA: 'South Africa', CN: 'China', HK: 'Hong Kong',
  KR: 'Korea, Republic of', TH: 'Thailand', SG: 'Singapore', MY: 'Malaysia',
  ID: 'Indonesia', IN: 'India', AU: 'Australia', NZ: 'New Zealand',
  VN: 'Vietnam', PH: 'Philippines', TW: 'Taiwan', CL: 'Chile',
  CO: 'Colombia', PE: 'Peru', UY: 'Uruguay', KE: 'Kenya', TN: 'Tunisia',
  JO: 'Jordan', SA: 'Saudi Arabia', QA: 'Qatar', HU: 'Hungary',
  RO: 'Romania', HR: 'Croatia', SI: 'Slovenia', SK: 'Slovakia', EE: 'Estonia',
};

// Cache en mémoire du RSS feed (1 fetch toutes les 30min, partagé entre invocations)
let cachedFeed: { items: Array<{ title: string; pubDate: string }>; ts: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000;

async function getRssItems(): Promise<Array<{ title: string; pubDate: string }>> {
  if (cachedFeed && Date.now() - cachedFeed.ts < CACHE_DURATION) {
    return cachedFeed.items;
  }
  const url = 'https://travel.state.gov/_res/rss/TAsTWs.xml';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Lokadia Lokascore aggregator)' },
  });
  if (!res.ok) throw new Error(`US State RSS returned ${res.status}`);
  const xml = await res.text();
  const items: Array<{ title: string; pubDate: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = (block.match(/<title>(.*?)<\/title>/)?.[1] ?? '').trim();
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';
    if (title) items.push({ title, pubDate });
  }
  cachedFeed = { items, ts: Date.now() };
  return items;
}

function levelToSummary(level: 1 | 2 | 3 | 4 | null): string {
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

  const countryName = ISO_TO_NAME[countryIso];
  if (!countryName) {
    return new Response(JSON.stringify({ error: `Country ${countryIso} not mapped`, level: null }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const items = await getRssItems();

    // Chercher l'item dont le titre commence par le nom du pays
    const matchingItem = items.find((it) => {
      const lower = it.title.toLowerCase();
      const target = countryName.toLowerCase();
      return lower.startsWith(target + ' -') || lower.startsWith(target + ',');
    });

    let level: UsStateResponse['level'] = null;
    if (matchingItem) {
      const m = matchingItem.title.match(/Level\s+(\d)/i);
      if (m) {
        const lvl = parseInt(m[1], 10);
        if (lvl >= 1 && lvl <= 4) level = lvl as 1 | 2 | 3 | 4;
      }
    }

    const response: UsStateResponse = {
      level,
      summary: levelToSummary(level),
      countryIso,
      countryName,
      lastUpdate: new Date().toISOString(),
      source: 'US Department of State · travel.state.gov RSS feed',
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
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
