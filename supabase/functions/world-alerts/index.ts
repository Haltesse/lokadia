/**
 * Edge Function : world-alerts
 * ════════════════════════════════════════════════════════════════════════
 *  Agrégateur d'alertes mondiales temps réel pour la carte Lokadia.
 *
 *  Combine :
 *    - GDACS (ONU/UE)      : séismes, cyclones, inondations, volcans, sécheresses
 *    - USGS                : séismes M4.5+ (complète GDACS, coords précises)
 *    - ReliefWeb (OCHA)    : crises humanitaires en cours
 *    - OMS (WHO RSS)       : épidémies / pandémies
 *    - Couche géopolitique : guerres + instabilité politique (curée, basée sur
 *                            les advisories officiels — information publique)
 *
 *  Chaque alerte est catégorisée (type), géolocalisée (lat/lon) et notée en
 *  sévérité (info / orange / red). Cache 20 min côté serveur.
 *
 *  Endpoint : GET /functions/v1/world-alerts
 *  Déploiement : supabase functions deploy world-alerts --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type AlertType =
  | 'earthquake' | 'cyclone' | 'flood' | 'volcano' | 'drought' | 'wildfire'
  | 'epidemic' | 'war' | 'political' | 'humanitarian' | 'other';
type Severity = 'info' | 'orange' | 'red';

interface WorldAlert {
  id: string;
  type: AlertType;
  severity: Severity;
  title: string;
  countryIso: string | null;
  countryName: string;
  lat: number | null;
  lon: number | null;
  source: string;
  date: string;
}

// ─── Centroïdes pays (pour alertes sans coordonnées précises) ───────────────
const CENTROIDS: Record<string, { lat: number; lon: number; name: string }> = {
  FR:{lat:46.6,lon:2.2,name:'France'},GB:{lat:55.3,lon:-3.4,name:'United Kingdom'},DE:{lat:51.2,lon:10.4,name:'Germany'},ES:{lat:40.5,lon:-3.7,name:'Spain'},IT:{lat:41.9,lon:12.6,name:'Italy'},PT:{lat:39.4,lon:-8.2,name:'Portugal'},NL:{lat:52.1,lon:5.3,name:'Netherlands'},BE:{lat:50.5,lon:4.5,name:'Belgium'},CH:{lat:46.8,lon:8.2,name:'Switzerland'},AT:{lat:47.5,lon:14.6,name:'Austria'},IE:{lat:53.4,lon:-8.2,name:'Ireland'},SE:{lat:60.1,lon:18.6,name:'Sweden'},NO:{lat:60.5,lon:8.5,name:'Norway'},DK:{lat:56.3,lon:9.5,name:'Denmark'},FI:{lat:61.9,lon:25.7,name:'Finland'},IS:{lat:65,lon:-19,name:'Iceland'},PL:{lat:51.9,lon:19.1,name:'Poland'},CZ:{lat:49.8,lon:15.5,name:'Czech Republic'},GR:{lat:39.1,lon:21.8,name:'Greece'},RU:{lat:61.5,lon:105.3,name:'Russia'},TR:{lat:39,lon:35.2,name:'Turkey'},UA:{lat:48.4,lon:31.2,name:'Ukraine'},
  US:{lat:37.1,lon:-95.7,name:'United States'},CA:{lat:56.1,lon:-106.3,name:'Canada'},MX:{lat:23.6,lon:-102.5,name:'Mexico'},BR:{lat:-14.2,lon:-51.9,name:'Brazil'},AR:{lat:-38.4,lon:-63.6,name:'Argentina'},CL:{lat:-35.7,lon:-71.5,name:'Chile'},CO:{lat:4.6,lon:-74.3,name:'Colombia'},PE:{lat:-9.2,lon:-75,name:'Peru'},UY:{lat:-32.5,lon:-55.8,name:'Uruguay'},VE:{lat:6.4,lon:-66.6,name:'Venezuela'},HT:{lat:18.9,lon:-72.3,name:'Haiti'},
  MA:{lat:31.8,lon:-7.1,name:'Morocco'},EG:{lat:26.8,lon:30.8,name:'Egypt'},AE:{lat:23.4,lon:53.8,name:'UAE'},IL:{lat:31,lon:34.8,name:'Israel'},PS:{lat:31.9,lon:35.2,name:'Palestine'},ZA:{lat:-30.6,lon:22.9,name:'South Africa'},KE:{lat:0,lon:37.9,name:'Kenya'},TN:{lat:33.9,lon:9.5,name:'Tunisia'},JO:{lat:30.6,lon:36.2,name:'Jordan'},SA:{lat:23.9,lon:45.1,name:'Saudi Arabia'},QA:{lat:25.4,lon:51.2,name:'Qatar'},LB:{lat:33.9,lon:35.9,name:'Lebanon'},SY:{lat:34.8,lon:38.9,name:'Syria'},YE:{lat:15.5,lon:48.5,name:'Yemen'},IQ:{lat:33.2,lon:43.7,name:'Iraq'},IR:{lat:32.4,lon:53.7,name:'Iran'},SD:{lat:12.9,lon:30.2,name:'Sudan'},ML:{lat:17.6,lon:-4,name:'Mali'},BF:{lat:12.2,lon:-1.6,name:'Burkina Faso'},NE:{lat:17.6,lon:8.1,name:'Niger'},NG:{lat:9.1,lon:8.7,name:'Nigeria'},SO:{lat:5.2,lon:46.2,name:'Somalia'},ET:{lat:9.1,lon:40.5,name:'Ethiopia'},CD:{lat:-4,lon:21.8,name:'DR Congo'},LY:{lat:26.3,lon:17.2,name:'Libya'},TD:{lat:15.5,lon:18.7,name:'Chad'},CF:{lat:6.6,lon:20.9,name:'Central African Rep.'},MZ:{lat:-18.7,lon:35.5,name:'Mozambique'},AF:{lat:33.9,lon:67.7,name:'Afghanistan'},
  JP:{lat:36.2,lon:138.3,name:'Japan'},CN:{lat:35.9,lon:104.2,name:'China'},HK:{lat:22.3,lon:114.2,name:'Hong Kong'},KR:{lat:35.9,lon:127.8,name:'South Korea'},TH:{lat:15.9,lon:101,name:'Thailand'},SG:{lat:1.35,lon:103.8,name:'Singapore'},MY:{lat:4.2,lon:102,name:'Malaysia'},ID:{lat:-0.8,lon:113.9,name:'Indonesia'},IN:{lat:20.6,lon:79,name:'India'},VN:{lat:14.1,lon:108.3,name:'Vietnam'},PH:{lat:12.9,lon:121.8,name:'Philippines'},TW:{lat:23.7,lon:121,name:'Taiwan'},PK:{lat:30.4,lon:69.3,name:'Pakistan'},BD:{lat:23.7,lon:90.4,name:'Bangladesh'},NP:{lat:28.4,lon:84.1,name:'Nepal'},MM:{lat:21.9,lon:95.9,name:'Myanmar'},LK:{lat:7.9,lon:80.8,name:'Sri Lanka'},
  AU:{lat:-25.3,lon:133.8,name:'Australia'},NZ:{lat:-40.9,lon:174.9,name:'New Zealand'},PG:{lat:-6.3,lon:144,name:'Papua New Guinea'},
  HU:{lat:47.2,lon:19.5,name:'Hungary'},RO:{lat:45.9,lon:25,name:'Romania'},HR:{lat:45.1,lon:15.2,name:'Croatia'},SI:{lat:46.2,lon:15,name:'Slovenia'},SK:{lat:48.7,lon:19.7,name:'Slovakia'},EE:{lat:58.6,lon:25,name:'Estonia'},
};

const ISO3_TO_ISO2: Record<string, string> = {
  UKR:'UA',RUS:'RU',SYR:'SY',YEM:'YE',SDN:'SD',MLI:'ML',BFA:'BF',NER:'NE',NGA:'NG',SOM:'SO',ETH:'ET',COD:'CD',LBY:'LY',TCD:'TD',CAF:'CF',MOZ:'MZ',AFG:'AF',HTI:'HT',VEN:'VE',IRN:'IR',IRQ:'IQ',LBN:'LB',PSE:'PS',MMR:'MM',PAK:'PK',
  FRA:'FR',DEU:'DE',GBR:'GB',ESP:'ES',ITA:'IT',PRT:'PT',NLD:'NL',BEL:'BE',CHE:'CH',AUT:'AT',IRL:'IE',SWE:'SE',NOR:'NO',DNK:'DK',FIN:'FI',ISL:'IS',POL:'PL',CZE:'CZ',GRC:'GR',TUR:'TR',USA:'US',CAN:'CA',MEX:'MX',BRA:'BR',ARG:'AR',CHL:'CL',COL:'CO',PER:'PE',MAR:'MA',EGY:'EG',ARE:'AE',ISR:'IL',ZAF:'ZA',KEN:'KE',TUN:'TN',JOR:'JO',SAU:'SA',JPN:'JP',CHN:'CN',HKG:'HK',KOR:'KR',THA:'TH',SGP:'SG',MYS:'MY',IDN:'ID',IND:'IN',VNM:'VN',PHL:'PH',TWN:'TW',BGD:'BD',NPL:'NP',LKA:'LK',AUS:'AU',NZL:'NZ',PNG:'PG',
};

// GDACS / USGS utilisent des noms anglais — mapping nom → ISO2
const NAME_TO_ISO: Record<string, string> = {
  'Japan':'JP','China':'CN','Indonesia':'ID','Philippines':'PH','Mexico':'MX','Chile':'CL','Peru':'PE','Turkey':'TR','Türkiye':'TR','Greece':'GR','Italy':'IT','United States':'US','USA':'US','Russia':'RU','India':'IN','Taiwan':'TW','New Zealand':'NZ','Colombia':'CO','Argentina':'AR','Morocco':'MA','Egypt':'EG','Thailand':'TH','Malaysia':'MY','South Africa':'ZA','France':'FR','Spain':'ES','Vietnam':'VN','Viet Nam':'VN','Nepal':'NP','Pakistan':'PK','Bangladesh':'BD','Myanmar':'MM','Papua New Guinea':'PG','Iran':'IR','Iraq':'IQ','Afghanistan':'AF','Ethiopia':'ET','Kenya':'KE','Somalia':'SO','Sudan':'SD','Nigeria':'NG','Mali':'ML','Mozambique':'MZ','Haiti':'HT','Ecuador':'EC','Guatemala':'GT','Sri Lanka':'LK','Portugal':'PT','Algeria':'DZ','Tunisia':'TN','Yemen':'YE','Syria':'SY','Ukraine':'UA','Venezuela':'VE','Australia':'AU','Vanuatu':'VU','Fiji':'FJ','Tonga':'TO','Chad':'TD','Niger':'NE','Burkina Faso':'BF',
};

// ─── Couche géopolitique curée (guerres + instabilité politique) ────────────
// Information publique dérivée des advisories officiels MAE/FCDO/US State.
// Rafraîchie manuellement (pas d'API temps réel gratuite fiable).
const GEOPOLITICAL: Array<{ iso: string; type: AlertType; severity: Severity; title: string }> = [
  { iso: 'UA', type: 'war', severity: 'red', title: 'Conflit armé majeur en cours — voyage formellement déconseillé' },
  { iso: 'RU', type: 'war', severity: 'red', title: 'Pays en guerre — risque d\'enrôlement, sanctions, espace aérien fermé' },
  { iso: 'SY', type: 'war', severity: 'red', title: 'Guerre civile et terrorisme — zone de combat' },
  { iso: 'YE', type: 'war', severity: 'red', title: 'Guerre civile — crise humanitaire majeure' },
  { iso: 'SD', type: 'war', severity: 'red', title: 'Conflit armé généralisé — effondrement sécuritaire' },
  { iso: 'ML', type: 'war', severity: 'red', title: 'Terrorisme et conflit armé — zone rouge intégrale' },
  { iso: 'BF', type: 'war', severity: 'red', title: 'Insurrection djihadiste — voyage formellement déconseillé' },
  { iso: 'NE', type: 'war', severity: 'red', title: 'Coup d\'État et terrorisme — instabilité extrême' },
  { iso: 'SO', type: 'war', severity: 'red', title: 'Conflit armé et terrorisme (Al-Shabaab)' },
  { iso: 'AF', type: 'war', severity: 'red', title: 'Régime taliban — terrorisme, voyage formellement déconseillé' },
  { iso: 'CD', type: 'war', severity: 'red', title: 'Conflit armé à l\'est (M23) — violences graves' },
  { iso: 'HT', type: 'war', severity: 'red', title: 'Effondrement de l\'État — gangs armés, enlèvements' },
  { iso: 'PS', type: 'war', severity: 'red', title: 'Conflit Gaza/Cisjordanie — zone de guerre' },
  { iso: 'LB', type: 'political', severity: 'red', title: 'Tensions armées frontalières — situation volatile' },
  { iso: 'VE', type: 'political', severity: 'orange', title: 'Crise politique et économique — instabilité, criminalité' },
  { iso: 'IR', type: 'political', severity: 'orange', title: 'Tensions régionales et risque d\'arrestation arbitraire' },
  { iso: 'IQ', type: 'political', severity: 'orange', title: 'Instabilité sécuritaire — attentats possibles' },
  { iso: 'LY', type: 'war', severity: 'red', title: 'Conflit armé et milices — pas de contrôle étatique' },
  { iso: 'ET', type: 'political', severity: 'orange', title: 'Tensions ethniques et conflits régionaux' },
  { iso: 'NG', type: 'political', severity: 'orange', title: 'Terrorisme (nord) et enlèvements' },
  { iso: 'MZ', type: 'political', severity: 'orange', title: 'Insurrection djihadiste (Cabo Delgado)' },
  { iso: 'TD', type: 'political', severity: 'orange', title: 'Instabilité politique et terrorisme' },
  { iso: 'CF', type: 'war', severity: 'red', title: 'Conflit armé — présence de groupes rebelles' },
  { iso: 'MM', type: 'war', severity: 'red', title: 'Guerre civile post-coup d\'État' },
  { iso: 'PK', type: 'political', severity: 'orange', title: 'Terrorisme régional et instabilité politique' },
];

const clamp = (n: number) => Math.max(0, Math.min(100, n));

// ─── Fraîcheur : on ne compte PAS les infos trop datées (jours max par type) ──
const FRESHNESS_DAYS: Record<AlertType, number> = {
  earthquake: 7,    // un séisme n'est "actif" que quelques jours
  cyclone: 10,
  flood: 21,
  wildfire: 14,
  volcano: 45,
  drought: 120,     // phénomène lent
  epidemic: 90,
  humanitarian: 90,
  war: 99999,       // structurel (curé, toujours courant)
  political: 99999,
  other: 30,
};

/** True si l'alerte est encore fraîche selon son type */
function isFresh(type: AlertType, dateIso: string): boolean {
  const maxDays = FRESHNESS_DAYS[type] ?? 30;
  if (maxDays >= 99999) return true;
  const t = new Date(dateIso).getTime();
  if (!t || Number.isNaN(t)) return true; // pas de date → on garde
  return Date.now() - t <= maxDays * 24 * 3600 * 1000;
}

// ─── Parsers ────────────────────────────────────────────────────────────────
function gdacsType(t: string): AlertType {
  switch (t) {
    case 'EQ': return 'earthquake';
    case 'TC': return 'cyclone';
    case 'FL': return 'flood';
    case 'VO': return 'volcano';
    case 'DR': return 'drought';
    case 'WF': return 'wildfire';
    default: return 'other';
  }
}

async function fetchGDACS(): Promise<WorldAlert[]> {
  const r = await fetch('https://www.gdacs.org/xml/rss.xml', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Lokadia)' }, signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`GDACS ${r.status}`);
  const xml = await r.text();
  const alerts: WorldAlert[] = [];
  const items = xml.split('<item>').slice(1);
  let idx = 0;
  for (const block of items) {
    const title = (block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const evt = block.match(/<gdacs:eventtype>(\w+)<\/gdacs:eventtype>/)?.[1] ?? '';
    const level = (block.match(/<gdacs:alertlevel>(\w+)<\/gdacs:alertlevel>/)?.[1] ?? 'Green').toLowerCase();
    const lat = parseFloat(block.match(/<geo:lat>([\-\d.]+)<\/geo:lat>/)?.[1] ?? '');
    const lon = parseFloat(block.match(/<geo:long>([\-\d.]+)<\/geo:long>/)?.[1] ?? '');
    const countryName = (block.match(/<gdacs:country>([^<]*)<\/gdacs:country>/)?.[1] ?? '').trim();
    const pubDate = block.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1] ?? '';
    // On garde Orange et Red (les Green = mineurs, trop nombreux) sauf séismes M6.5+
    const sev: Severity = level === 'red' ? 'red' : level === 'orange' ? 'orange' : 'info';
    const magMatch = title.match(/Magnitude\s+([\d.]+)/);
    const mag = magMatch ? parseFloat(magMatch[1]) : 0;
    if (sev === 'info' && !(evt === 'EQ' && mag >= 6.5)) continue;
    const iso = NAME_TO_ISO[countryName] ?? null;
    alerts.push({
      id: `gdacs-${idx++}`,
      type: gdacsType(evt),
      severity: sev === 'info' ? 'orange' : sev,
      title,
      countryIso: iso,
      countryName: countryName || '—',
      lat: Number.isFinite(lat) ? lat : (iso ? CENTROIDS[iso]?.lat ?? null : null),
      lon: Number.isFinite(lon) ? lon : (iso ? CENTROIDS[iso]?.lon ?? null : null),
      source: 'GDACS',
      date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
  }
  return alerts;
}

async function fetchUSGS(): Promise<WorldAlert[]> {
  const r = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson', { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`USGS ${r.status}`);
  const d = await r.json();
  const alerts: WorldAlert[] = [];
  for (const f of d.features ?? []) {
    const mag = f.properties?.mag;
    if (!mag || mag < 5.5) continue; // USGS complète GDACS sur les M5.5+
    const place: string = f.properties?.place ?? '';
    const coords = f.geometry?.coordinates ?? [];
    const country = place.split(',').map((s: string) => s.trim()).pop() ?? '';
    const iso = NAME_TO_ISO[country] ?? null;
    alerts.push({
      id: `usgs-${f.id}`,
      type: 'earthquake',
      severity: mag >= 7 ? 'red' : mag >= 6 ? 'orange' : 'info',
      title: `Séisme M${mag.toFixed(1)} — ${place}`,
      countryIso: iso,
      countryName: country || '—',
      lat: coords[1] ?? null,
      lon: coords[0] ?? null,
      source: 'USGS',
      date: new Date(f.properties.time).toISOString(),
    });
  }
  return alerts;
}

async function fetchReliefWeb(): Promise<WorldAlert[]> {
  const url = 'https://api.reliefweb.int/v1/disasters?appname=lokadia.fr&filter[field]=status&filter[value]=ongoing&limit=100&fields[include][]=name&fields[include][]=country&fields[include][]=primary_type&fields[include][]=date';
  const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!r.ok) throw new Error(`ReliefWeb ${r.status}`);
  const d = await r.json();
  const alerts: WorldAlert[] = [];
  for (const item of d.data ?? []) {
    const f = item.fields ?? {};
    const typeName: string = (f.primary_type?.name ?? '').toLowerCase();
    let type: AlertType = 'humanitarian';
    if (typeName.includes('flood')) type = 'flood';
    else if (typeName.includes('earthquake')) type = 'earthquake';
    else if (typeName.includes('cyclone') || typeName.includes('storm')) type = 'cyclone';
    else if (typeName.includes('drought')) type = 'drought';
    else if (typeName.includes('volcano')) type = 'volcano';
    else if (typeName.includes('epidemic') || typeName.includes('outbreak')) type = 'epidemic';
    const c = (f.country ?? [])[0];
    const iso = c?.iso3 ? ISO3_TO_ISO2[c.iso3.toUpperCase()] ?? null : null;
    const cn = CENTROIDS[iso ?? ''] ?? null;
    alerts.push({
      id: `rw-${item.id}`,
      type,
      severity: 'orange',
      title: f.name ?? 'Crise humanitaire',
      countryIso: iso,
      countryName: c?.name ?? '—',
      lat: cn?.lat ?? null,
      lon: cn?.lon ?? null,
      source: 'ReliefWeb',
      date: f.date?.created ? new Date(f.date.created).toISOString() : new Date().toISOString(),
    });
  }
  return alerts;
}

const HEALTH_KW = ['outbreak','epidemic','pandemic','cholera','ebola','marburg','dengue','zika','measles','polio','mpox','monkeypox','h5n1','avian','plague','meningitis','lassa','nipah','yellow fever'];
async function fetchWHO(): Promise<WorldAlert[]> {
  const r = await fetch('https://www.who.int/rss-feeds/news-english.xml', { headers: { 'User-Agent': 'Mozilla/5.0 (Lokadia)' }, signal: AbortSignal.timeout(9000) });
  if (!r.ok) throw new Error(`WHO ${r.status}`);
  const xml = await r.text();
  const alerts: WorldAlert[] = [];
  const items = xml.split('<item>').slice(1);
  const now = Date.now();
  let idx = 0;
  for (const block of items) {
    const title = (block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
    const pubDate = block.match(/<pubDate>([^<]*)<\/pubDate>/)?.[1] ?? '';
    const ts = pubDate ? new Date(pubDate).getTime() : 0;
    if (ts < now - 120 * 24 * 3600 * 1000) continue; // 120 jours
    const lower = title.toLowerCase();
    if (!HEALTH_KW.some((k) => lower.includes(k))) continue;
    // Tenter de trouver un pays dans le titre
    let iso: string | null = null, cname = 'Mondial';
    for (const [name, code] of Object.entries(NAME_TO_ISO)) {
      if (lower.includes(name.toLowerCase())) { iso = code; cname = name; break; }
    }
    const cn = iso ? CENTROIDS[iso] : null;
    alerts.push({
      id: `who-${idx++}`,
      type: 'epidemic',
      severity: lower.includes('pandemic') || lower.includes('international concern') ? 'red' : 'orange',
      title,
      countryIso: iso,
      countryName: cname,
      lat: cn?.lat ?? null,
      lon: cn?.lon ?? null,
      source: 'OMS',
      date: ts ? new Date(ts).toISOString() : new Date().toISOString(),
    });
  }
  return alerts;
}

function geopoliticalAlerts(): WorldAlert[] {
  return GEOPOLITICAL.map((g, i) => {
    const c = CENTROIDS[g.iso];
    return {
      id: `geo-${g.iso}-${i}`,
      type: g.type,
      severity: g.severity,
      title: g.title,
      countryIso: g.iso,
      countryName: c?.name ?? g.iso,
      lat: c?.lat ?? null,
      lon: c?.lon ?? null,
      source: g.type === 'war' ? 'Conseils aux voyageurs (zone rouge)' : 'Conseils aux voyageurs',
      date: new Date().toISOString(),
    };
  });
}

// ─── Cache ──────────────────────────────────────────────────────────────────
let cache: { body: string; ts: number } | null = null;
const TTL = 20 * 60 * 1000;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  if (cache && Date.now() - cache.ts < TTL) {
    return new Response(cache.body, { headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1200' } });
  }

  const sources: string[] = [];
  const raw: WorldAlert[] = [];

  const [gd, us, rw, who] = await Promise.allSettled([fetchGDACS(), fetchUSGS(), fetchReliefWeb(), fetchWHO()]);
  if (gd.status === 'fulfilled') { sources.push('GDACS'); raw.push(...gd.value); }
  if (us.status === 'fulfilled') { sources.push('USGS'); raw.push(...us.value); }
  if (rw.status === 'fulfilled') { sources.push('ReliefWeb'); raw.push(...rw.value); }
  if (who.status === 'fulfilled') { sources.push('OMS'); raw.push(...who.value); }
  // Couche géopolitique (toujours présente, structurelle)
  sources.push('Advisories');
  raw.push(...geopoliticalAlerts());

  // ─── Filtre fraîcheur : on exclut les infos trop datées ───
  const all: WorldAlert[] = raw.filter((a) => isFresh(a.type, a.date));

  // Stats par type
  const stats: Record<string, number> = {};
  for (const a of all) stats[a.type] = (stats[a.type] ?? 0) + 1;

  // Group par pays (pour rétro-compat avec la carte actuelle)
  const byCountry: Record<string, WorldAlert[]> = {};
  for (const a of all) {
    if (!a.countryIso) continue;
    (byCountry[a.countryIso] ??= []).push(a);
  }

  const body = JSON.stringify({
    alerts: all,
    byCountry,
    stats,
    sources,
    total: all.length,
    lastFetch: Date.now(),
  });
  cache = { body, ts: Date.now() };

  return new Response(body, {
    headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=1200' },
  });
});
