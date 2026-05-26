/**
 * Edge Function : OMS Disease Outbreak News
 *
 * Endpoint : GET /functions/v1/advisories-who?country={iso2}
 *
 * Récupère le flux RSS de l'OMS Disease Outbreak News et filtre les alertes
 * concernant le pays demandé sur les 90 derniers jours.
 *
 * RSS feed : https://www.who.int/feeds/entity/csr/don/en/rss.xml
 *
 * Réponse : nombre d'alertes actives + liste des titres
 *
 * Déploiement :
 *   supabase functions deploy advisories-who --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhoAlert {
  title: string;
  publishedAt: string;
  link: string;
  countryMatch: string;
}

interface WhoResponse {
  countryIso: string;
  countryName: string;
  activeAlertCount: number;
  alerts: WhoAlert[];
  lastUpdate: string;
  source: string;
}

const ISO_TO_NAME: Record<string, string> = {
  FR: 'France', GB: 'United Kingdom', DE: 'Germany', ES: 'Spain', IT: 'Italy',
  PT: 'Portugal', NL: 'Netherlands', BE: 'Belgium', CH: 'Switzerland', AT: 'Austria',
  IE: 'Ireland', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
  IS: 'Iceland', PL: 'Poland', CZ: 'Czechia', GR: 'Greece', RU: 'Russia',
  TR: 'Turkey', US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil',
  AR: 'Argentina', MA: 'Morocco', EG: 'Egypt', AE: 'United Arab Emirates',
  IL: 'Israel', ZA: 'South Africa', JP: 'Japan', CN: 'China', HK: 'Hong Kong',
  KR: 'Republic of Korea', TH: 'Thailand', SG: 'Singapore', MY: 'Malaysia',
  ID: 'Indonesia', IN: 'India', AU: 'Australia',
};

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

/** Parser RSS minimal (sans dépendance externe) */
function parseRssItems(xml: string): Array<{ title: string; pubDate: string; link: string }> {
  const items: Array<{ title: string; pubDate: string; link: string }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = (block.match(/<title>(.*?)<\/title>/)?.[1] ?? '').replace(/<!\[CDATA\[(.*?)\]\]>/, '$1');
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? '';
    items.push({ title, pubDate, link });
  }
  return items;
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
    return new Response(JSON.stringify({ error: `Country ${countryIso} not mapped` }), {
      status: 404,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await fetch('https://www.who.int/feeds/entity/csr/don/en/rss.xml', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Lokadia Lokascore aggregator)' },
    });
    if (!res.ok) throw new Error(`WHO RSS returned ${res.status}`);
    const xml = await res.text();
    const items = parseRssItems(xml);

    const now = Date.now();
    const recentAlerts: WhoAlert[] = items
      .filter((it) => {
        const ts = it.pubDate ? new Date(it.pubDate).getTime() : 0;
        return ts > now - NINETY_DAYS_MS;
      })
      .filter((it) => it.title.toLowerCase().includes(countryName.toLowerCase()))
      .map((it) => ({
        title: it.title,
        publishedAt: new Date(it.pubDate).toISOString(),
        link: it.link,
        countryMatch: countryName,
      }));

    const response: WhoResponse = {
      countryIso,
      countryName,
      activeAlertCount: recentAlerts.length,
      alerts: recentAlerts.slice(0, 10),
      lastUpdate: new Date().toISOString(),
      source: 'WHO Disease Outbreak News · who.int',
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
      JSON.stringify({ error: String(e), countryIso }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
