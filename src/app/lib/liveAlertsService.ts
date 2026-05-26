/**
 * Live Alerts Service — Phase 3+ du Lokascore
 *
 * Récupère en temps réel les alertes catastrophes via des APIs publiques
 * CORS-friendly (pas besoin de proxy backend) :
 *
 *   - USGS Earthquakes (FDSNWS)  : https://earthquake.usgs.gov/fdsnws/event/1/
 *     → Séismes mondiaux des 7 derniers jours, mag ≥ 4.5
 *
 *   - ReliefWeb API (OCHA / ONU) : https://api.reliefweb.int/v1/disasters
 *     → Catastrophes en cours (status=ongoing) avec pays + type
 *
 * Ces alertes modulent la dimension N (Nature) du Lokascore :
 *   - Alerte orange : -15 points (décroissance 7 jours)
 *   - Alerte rouge  : -30 points (décroissance 14 jours)
 *
 * Conformément au mémoire méthodologique v1.0 §3.4.
 */

import { ISO3_TO_ISO2 } from './countryIsoMapping';

export type AlertSeverity = 'orange' | 'red';
export type AlertSource = 'USGS' | 'ReliefWeb';

export interface LiveAlert {
  /** Code ISO 3166-1 alpha-2 du pays affecté */
  countryIso: string;
  /** Type de catastrophe */
  type: 'earthquake' | 'flood' | 'storm' | 'volcano' | 'wildfire' | 'epidemic' | 'other';
  severity: AlertSeverity;
  source: AlertSource;
  /** Description humaine (ex: "M6.2 - 30km SE of Tokyo, Japan") */
  description: string;
  /** Date de détection */
  detectedAt: Date;
}

export interface LiveAlertsSnapshot {
  /** Map ISO pays → alertes actives */
  byCountry: Map<string, LiveAlert[]>;
  /** Timestamp du dernier fetch réussi */
  lastFetch: number;
  /** Sources effectivement contactées */
  sources: AlertSource[];
  /** True si au moins une source a renvoyé des données */
  ok: boolean;
}

// ─── Cache ──────────────────────────────────────────────────────────────────
const CACHE_DURATION = 30 * 60 * 1000; // 30 min
const SESSION_KEY = 'lokadia_live_alerts_v1';
let memoryCache: LiveAlertsSnapshot | null = null;
let fetchingPromise: Promise<LiveAlertsSnapshot> | null = null;

interface PersistedSnapshot {
  byCountry: Record<string, LiveAlert[]>;
  lastFetch: number;
  sources: AlertSource[];
}

function persistToSession(snap: LiveAlertsSnapshot): void {
  try {
    const persisted: PersistedSnapshot = {
      byCountry: Object.fromEntries(snap.byCountry),
      lastFetch: snap.lastFetch,
      sources: snap.sources,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(persisted));
  } catch {
    // sessionStorage indisponible
  }
}

function loadFromSession(): LiveAlertsSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const persisted = JSON.parse(raw) as PersistedSnapshot;
    if (Date.now() - persisted.lastFetch > CACHE_DURATION) return null;
    return {
      byCountry: new Map(Object.entries(persisted.byCountry).map(([k, v]) => [
        k,
        v.map(a => ({ ...a, detectedAt: new Date(a.detectedAt) })),
      ])),
      lastFetch: persisted.lastFetch,
      sources: persisted.sources,
      ok: persisted.sources.length > 0,
    };
  } catch {
    return null;
  }
}

// Hydratation immédiate depuis sessionStorage
if (typeof window !== 'undefined') {
  memoryCache = loadFromSession();
  if (memoryCache) {
    console.log(`💾 Live alerts hydratés : ${memoryCache.byCountry.size} pays affectés (${memoryCache.sources.join(', ')})`);
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extrait un nom de pays depuis une description USGS type "30km E of Tokyo, Japan" */
function extractCountryFromUSGSPlace(place: string): string | null {
  if (!place) return null;
  // Le pattern est presque toujours "..., {country}" en dernière partie
  const parts = place.split(',').map(p => p.trim());
  const candidate = parts[parts.length - 1];
  return USGS_PLACE_TO_ISO[candidate] ?? null;
}

/**
 * Mapping noms de pays anglais (tels qu'utilisés par USGS) → ISO2.
 * Couvre toutes les destinations Lokadia + grandes zones sismiques.
 */
const USGS_PLACE_TO_ISO: Record<string, string> = {
  'France': 'FR',
  'United Kingdom': 'GB',
  'England': 'GB',
  'Scotland': 'GB',
  'Germany': 'DE',
  'Spain': 'ES',
  'Italy': 'IT',
  'Portugal': 'PT',
  'Netherlands': 'NL',
  'Belgium': 'BE',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Ireland': 'IE',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Iceland': 'IS',
  'Poland': 'PL',
  'Czechia': 'CZ',
  'Czech Republic': 'CZ',
  'Greece': 'GR',
  'Russia': 'RU',
  'Turkey': 'TR',
  'United States': 'US',
  'USA': 'US',
  'Canada': 'CA',
  'Mexico': 'MX',
  'Brazil': 'BR',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Peru': 'PE',
  'Colombia': 'CO',
  'Morocco': 'MA',
  'Egypt': 'EG',
  'United Arab Emirates': 'AE',
  'Israel': 'IL',
  'South Africa': 'ZA',
  'Kenya': 'KE',
  'Nigeria': 'NG',
  'Japan': 'JP',
  'China': 'CN',
  'Hong Kong': 'HK',
  'Taiwan': 'TW',
  'South Korea': 'KR',
  'Korea': 'KR',
  'Thailand': 'TH',
  'Singapore': 'SG',
  'Malaysia': 'MY',
  'Indonesia': 'ID',
  'Vietnam': 'VN',
  'Philippines': 'PH',
  'India': 'IN',
  'Pakistan': 'PK',
  'Bangladesh': 'BD',
  'Nepal': 'NP',
  'Australia': 'AU',
  'New Zealand': 'NZ',
  'Papua New Guinea': 'PG',
};

/** Mappe un type de catastrophe ReliefWeb vers notre enum interne */
function mapReliefWebType(typeName: string | undefined): LiveAlert['type'] {
  if (!typeName) return 'other';
  const lower = typeName.toLowerCase();
  if (lower.includes('earthquake')) return 'earthquake';
  if (lower.includes('flood')) return 'flood';
  if (lower.includes('storm') || lower.includes('cyclone') || lower.includes('hurricane') || lower.includes('typhoon')) return 'storm';
  if (lower.includes('volcano') || lower.includes('volcanic')) return 'volcano';
  if (lower.includes('fire') || lower.includes('wildfire')) return 'wildfire';
  if (lower.includes('epidemic') || lower.includes('outbreak')) return 'epidemic';
  return 'other';
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

interface USGSFeature {
  properties: { mag: number; place: string; time: number; title: string };
}

async function fetchUSGSEarthquakes(): Promise<LiveAlert[]> {
  // Earthquakes mag ≥ 4.5, last 7 days, globally
  const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson';
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`USGS HTTP ${res.status}`);
  const data = await res.json() as { features: USGSFeature[] };
  return data.features
    .map((f): LiveAlert | null => {
      const mag = f.properties.mag;
      const iso = extractCountryFromUSGSPlace(f.properties.place);
      if (!iso || !mag) return null;
      // Seuil GDACS-like : M6+ = orange, M7+ = red
      if (mag < 6) return null;
      return {
        countryIso: iso,
        type: 'earthquake',
        severity: mag >= 7 ? 'red' : 'orange',
        source: 'USGS',
        description: `M${mag.toFixed(1)} - ${f.properties.place}`,
        detectedAt: new Date(f.properties.time),
      };
    })
    .filter((a): a is LiveAlert => a !== null);
}

interface ReliefWebDisaster {
  fields: {
    name: string;
    status: string;
    country?: Array<{ name: string; iso3?: string }>;
    type?: Array<{ name: string }>;
    date?: { created?: string };
    primary_type?: { name: string };
  };
}

async function fetchReliefWebDisasters(): Promise<LiveAlert[]> {
  // GET ongoing disasters with country + type + date
  const url = 'https://api.reliefweb.int/v1/disasters?appname=lokadia.fr&filter[field]=status&filter[value]=ongoing&limit=200&fields[include][]=name&fields[include][]=country&fields[include][]=type&fields[include][]=primary_type&fields[include][]=date';
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`ReliefWeb HTTP ${res.status}`);
  const data = await res.json() as { data: ReliefWebDisaster[] };
  const alerts: LiveAlert[] = [];
  for (const d of data.data) {
    const f = d.fields;
    if (!f.country) continue;
    const typeName = f.primary_type?.name ?? f.type?.[0]?.name;
    const detectedAt = f.date?.created ? new Date(f.date.created) : new Date();
    for (const c of f.country) {
      const iso3 = c.iso3?.toUpperCase();
      const iso2 = iso3 ? ISO3_TO_ISO2[iso3] : null;
      if (!iso2) continue;
      alerts.push({
        countryIso: iso2,
        type: mapReliefWebType(typeName),
        severity: 'orange', // ReliefWeb ne distingue pas orange/red
        source: 'ReliefWeb',
        description: f.name,
        detectedAt,
      });
    }
  }
  return alerts;
}

// ─── API publique ───────────────────────────────────────────────────────────

/** Force un nouveau fetch (utilisé par le ScheduledRefresh) */
export async function fetchLiveAlerts(forceRefresh: boolean = false): Promise<LiveAlertsSnapshot> {
  if (!forceRefresh && memoryCache && Date.now() - memoryCache.lastFetch < CACHE_DURATION) {
    return memoryCache;
  }
  if (fetchingPromise) return fetchingPromise;

  fetchingPromise = (async () => {
    const sources: AlertSource[] = [];
    const allAlerts: LiveAlert[] = [];

    // Fetch en parallèle, échecs isolés
    const [usgsResult, rwResult] = await Promise.allSettled([
      fetchUSGSEarthquakes(),
      fetchReliefWebDisasters(),
    ]);

    if (usgsResult.status === 'fulfilled') {
      sources.push('USGS');
      allAlerts.push(...usgsResult.value);
      console.log(`🌍 USGS : ${usgsResult.value.length} séismes M6+ détectés`);
    } else {
      console.warn('⚠️ USGS fetch failed:', usgsResult.reason);
    }

    if (rwResult.status === 'fulfilled') {
      sources.push('ReliefWeb');
      allAlerts.push(...rwResult.value);
      console.log(`🌍 ReliefWeb : ${rwResult.value.length} catastrophes actives`);
    } else {
      console.warn('⚠️ ReliefWeb fetch failed:', rwResult.reason);
    }

    // Group by country ISO
    const byCountry = new Map<string, LiveAlert[]>();
    for (const alert of allAlerts) {
      const existing = byCountry.get(alert.countryIso) ?? [];
      existing.push(alert);
      byCountry.set(alert.countryIso, existing);
    }

    const snapshot: LiveAlertsSnapshot = {
      byCountry,
      lastFetch: Date.now(),
      sources,
      ok: sources.length > 0,
    };

    memoryCache = snapshot;
    persistToSession(snapshot);
    fetchingPromise = null;

    console.log(`✅ Live alerts : ${byCountry.size} pays affectés (${sources.join(' + ')})`);
    return snapshot;
  })();

  return fetchingPromise;
}

/** Récupère les alertes en mémoire (sans déclencher de fetch) */
export function getLiveAlertsSnapshot(): LiveAlertsSnapshot | null {
  return memoryCache;
}

/** Récupère la sévérité max d'un pays (utilisé par computeNature) */
export function getMaxAlertSeverityForCountry(iso: string): AlertSeverity | null {
  if (!memoryCache) return null;
  const alerts = memoryCache.byCountry.get(iso);
  if (!alerts || alerts.length === 0) return null;
  return alerts.some(a => a.severity === 'red') ? 'red' : 'orange';
}

/** Récupère toutes les alertes pour un pays (pour affichage UI) */
export function getAlertsForCountry(iso: string): LiveAlert[] {
  return memoryCache?.byCountry.get(iso) ?? [];
}

/** Listeners pour notifier les composants après un fetch */
type AlertsListener = (snapshot: LiveAlertsSnapshot) => void;
const listeners = new Set<AlertsListener>();

export function subscribeToLiveAlerts(listener: AlertsListener): () => void {
  listeners.add(listener);
  if (memoryCache) listener(memoryCache);
  return () => listeners.delete(listener);
}

function notifyListeners(snapshot: LiveAlertsSnapshot): void {
  listeners.forEach(l => {
    try {
      l(snapshot);
    } catch (e) {
      console.error('Live alerts listener error:', e);
    }
  });
}

/** Démarre le polling automatique des alertes (à appeler une fois au boot) */
export function startLiveAlertsPolling(): void {
  // Premier fetch immédiat (en background, ne bloque pas)
  fetchLiveAlerts().then(notifyListeners).catch(e => console.warn('Initial live alerts fetch failed:', e));
  // Refresh toutes les 30 min
  if (typeof window !== 'undefined') {
    window.setInterval(() => {
      fetchLiveAlerts(true).then(notifyListeners).catch(() => {});
    }, CACHE_DURATION);
  }
}
