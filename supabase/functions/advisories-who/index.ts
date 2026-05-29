/**
 * Edge Function : OMS Disease Outbreak / Alertes santé par pays
 *
 * Endpoint : GET /functions/v1/advisories-who?country={iso2}
 *
 * Stratégie 2026 : l'ancien feed `feeds/entity/csr/don/en/rss.xml` est
 * supprimé. On utilise maintenant le flux général `rss-feeds/news-english.xml`
 * et on filtre les items dont le titre contient le nom du pays + un mot-clé
 * sanitaire (épidémie, virus, outbreak, cholera, ebola, etc.).
 *
 * Réponse : nombre d'alertes actives + liste des titres récents.
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
  matchedKeywords: string[];
}

interface WhoResponse {
  countryIso: string;
  countryName: string;
  activeAlertCount: number;
  alerts: WhoAlert[];
  lastUpdate: string;
  source: string;
}

const ISO_TO_NAME: Record<string, string[]> = {
  // Pays principaux + alias (pour matcher les variantes de nom)
  FR: ['France'], GB: ['United Kingdom', 'UK'], DE: ['Germany'],
  ES: ['Spain'], IT: ['Italy'], PT: ['Portugal'], NL: ['Netherlands'],
  BE: ['Belgium'], CH: ['Switzerland'], AT: ['Austria'], IE: ['Ireland'],
  SE: ['Sweden'], NO: ['Norway'], DK: ['Denmark'], FI: ['Finland'],
  IS: ['Iceland'], PL: ['Poland'], CZ: ['Czechia', 'Czech Republic'],
  GR: ['Greece'], RU: ['Russia', 'Russian Federation'], TR: ['Turkey', 'Türkiye'],
  US: ['United States', 'USA'], CA: ['Canada'], MX: ['Mexico'],
  BR: ['Brazil'], AR: ['Argentina'], CL: ['Chile'], CO: ['Colombia'],
  PE: ['Peru'], UY: ['Uruguay'], MA: ['Morocco'], EG: ['Egypt'],
  AE: ['United Arab Emirates', 'UAE'], IL: ['Israel'],
  ZA: ['South Africa'], KE: ['Kenya'], TN: ['Tunisia'], JO: ['Jordan'],
  SA: ['Saudi Arabia'], QA: ['Qatar'], NG: ['Nigeria'], CD: ['Congo', 'Democratic Republic of the Congo', 'DRC'],
  UG: ['Uganda'], TZ: ['Tanzania'],
  JP: ['Japan'], CN: ['China'], HK: ['Hong Kong'], KR: ['Republic of Korea', 'South Korea'],
  TH: ['Thailand'], SG: ['Singapore'], MY: ['Malaysia'], ID: ['Indonesia'],
  IN: ['India'], VN: ['Viet Nam', 'Vietnam'], PH: ['Philippines'],
  TW: ['Taiwan'], AU: ['Australia'], NZ: ['New Zealand'],
  HU: ['Hungary'], RO: ['Romania'], HR: ['Croatia'], SI: ['Slovenia'],
  SK: ['Slovakia'], EE: ['Estonia'],
};

// Mots-clés sanitaires qui qualifient un item RSS comme "alerte santé"
const HEALTH_KEYWORDS = [
  'outbreak', 'epidemic', 'pandemic', 'cholera', 'ebola', 'marburg',
  'yellow fever', 'dengue', 'zika', 'chikungunya', 'malaria', 'measles',
  'polio', 'rabies', 'mpox', 'monkeypox', 'covid', 'mers', 'sars',
  'influenza', 'h5n1', 'h7n9', 'avian', 'plague', 'meningitis',
  'lassa', 'nipah', 'hantavirus', 'zoonotic', 'cases reported',
];

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

interface RssItem { title: string; pubDate: string; link: string }

// Cache du feed RSS (1 fetch toutes les 30 min, partagé)
let cachedFeed: { items: RssItem[]; ts: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000;

async function getWhoFeedItems(): Promise<RssItem[]> {
  if (cachedFeed && Date.now() - cachedFeed.ts < CACHE_DURATION) {
    return cachedFeed.items;
  }
  const res = await fetch('https://www.who.int/rss-feeds/news-english.xml', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Lokadia Lokascore aggregator)' },
  });
  if (!res.ok) throw new Error(`WHO RSS returned ${res.status}`);
  const xml = await res.text();
  const items: RssItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null) {
    const block = m[1];
    const title = (block.match(/<title>(.*?)<\/title>/)?.[1] ?? '').trim();
    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '';
    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? '';
    items.push({ title, pubDate, link });
  }
  cachedFeed = { items, ts: Date.now() };
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

  const names = ISO_TO_NAME[countryIso];
  if (!names) {
    return new Response(JSON.stringify({ error: `Country ${countryIso} not mapped`, activeAlertCount: 0 }), {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const items = await getWhoFeedItems();
    const now = Date.now();

    const matching: WhoAlert[] = [];
    for (const item of items) {
      const ts = item.pubDate ? new Date(item.pubDate).getTime() : 0;
      if (ts < now - NINETY_DAYS_MS) continue;
      const lower = item.title.toLowerCase();

      // Match pays (au moins un des noms / alias)
      const countryMatched = names.some((n) => lower.includes(n.toLowerCase()));
      if (!countryMatched) continue;

      // Match au moins un mot-clé sanitaire
      const matchedKws = HEALTH_KEYWORDS.filter((kw) => lower.includes(kw));
      if (matchedKws.length === 0) continue;

      matching.push({
        title: item.title,
        publishedAt: ts ? new Date(ts).toISOString() : '',
        link: item.link,
        matchedKeywords: matchedKws,
      });
    }

    const response: WhoResponse = {
      countryIso,
      countryName: names[0],
      activeAlertCount: matching.length,
      alerts: matching.slice(0, 10),
      lastUpdate: new Date().toISOString(),
      source: 'WHO News (English) · who.int/rss-feeds — filtré par pays + keywords santé',
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
      JSON.stringify({ error: String(e), countryIso, activeAlertCount: 0 }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
