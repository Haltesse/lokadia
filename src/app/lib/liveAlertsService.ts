/**
 * Live Alerts Service — alertes mondiales temps réel.
 *
 * Consomme l'Edge Function `world-alerts` qui agrège côté serveur :
 *   - GDACS (séismes, cyclones, inondations, volcans, sécheresses)
 *   - USGS (séismes M5.5+)
 *   - ReliefWeb (crises humanitaires)
 *   - OMS (épidémies / pandémies)
 *   - Couche géopolitique curée (guerres + instabilité politique)
 *
 * Chaque alerte est catégorisée, géolocalisée (lat/lon) et notée en sévérité.
 */

import { Activity, Tornado, Waves, Mountain, Sun, Flame, Biohazard, Swords, Landmark, LifeBuoy, Wind, AlertTriangle, type LucideIcon } from 'lucide-react';

export type AlertSeverity = 'orange' | 'red';
export type AlertType =
  | 'earthquake' | 'cyclone' | 'flood' | 'volcano' | 'drought' | 'wildfire'
  | 'epidemic' | 'war' | 'political' | 'humanitarian' | 'other'
  // valeurs legacy tolérées
  | 'storm';
export type AlertSource = string;

export interface LiveAlert {
  /** Code ISO 3166-1 alpha-2 du pays affecté (peut être null pour zone océanique) */
  countryIso: string;
  type: AlertType;
  severity: AlertSeverity;
  source: AlertSource;
  /** Titre / description humaine */
  description: string;
  /** Coordonnées exactes de l'événement (quand disponibles) */
  lat: number | null;
  lon: number | null;
  detectedAt: Date;
}

export interface LiveAlertsSnapshot {
  /** Liste complète des alertes (avec coordonnées) */
  alerts: LiveAlert[];
  /** Map ISO pays → alertes (rétro-compat) */
  byCountry: Map<string, LiveAlert[]>;
  /** Compteurs par type */
  stats: Record<string, number>;
  lastFetch: number;
  sources: AlertSource[];
  ok: boolean;
}

/** Métadonnées d'affichage par type d'alerte (label FR, emoji, couleur) */
export const ALERT_TYPE_META: Record<string, { label: string; Icon: LucideIcon; color: string }> = {
  earthquake:   { label: 'Séisme',              Icon: Activity,      color: '#b45309' },
  cyclone:      { label: 'Cyclone / Tempête',   Icon: Tornado,       color: '#0369a1' },
  flood:        { label: 'Inondation',          Icon: Waves,         color: '#0e7490' },
  volcano:      { label: 'Volcan',              Icon: Mountain,      color: '#c2410c' },
  drought:      { label: 'Sécheresse',          Icon: Sun,           color: '#a16207' },
  wildfire:     { label: 'Incendie',            Icon: Flame,         color: '#dc2626' },
  epidemic:     { label: 'Épidémie',            Icon: Biohazard,     color: '#7c3aed' },
  war:          { label: 'Guerre / Conflit',    Icon: Swords,        color: '#991b1b' },
  political:    { label: 'Instabilité politique', Icon: Landmark,    color: '#b91c1c' },
  humanitarian: { label: 'Crise humanitaire',   Icon: LifeBuoy,      color: '#be123c' },
  storm:        { label: 'Tempête',             Icon: Wind,          color: '#0369a1' },
  other:        { label: 'Alerte',              Icon: AlertTriangle, color: '#dc2626' },
};

const CACHE_DURATION = 20 * 60 * 1000; // 20 min
const SESSION_KEY = 'lokadia_world_alerts_v2';
let memoryCache: LiveAlertsSnapshot | null = null;
let fetchingPromise: Promise<LiveAlertsSnapshot> | null = null;

interface ApiAlert {
  id: string; type: AlertType; severity: AlertSeverity | 'info';
  title: string; countryIso: string | null; countryName: string;
  lat: number | null; lon: number | null; source: string; date: string;
}

// ─── Persistance sessionStorage ───
function persist(snap: LiveAlertsSnapshot): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      alerts: snap.alerts.map(a => ({ ...a, detectedAt: a.detectedAt.toISOString() })),
      stats: snap.stats, lastFetch: snap.lastFetch, sources: snap.sources,
    }));
  } catch { /* ignore */ }
}
function hydrate(): LiveAlertsSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (Date.now() - p.lastFetch > CACHE_DURATION) return null;
    const alerts: LiveAlert[] = (p.alerts ?? []).map((a: any) => ({ ...a, detectedAt: new Date(a.detectedAt) }));
    return buildSnapshot(alerts, p.stats ?? {}, p.sources ?? [], p.lastFetch);
  } catch { return null; }
}

function buildSnapshot(alerts: LiveAlert[], stats: Record<string, number>, sources: string[], lastFetch: number): LiveAlertsSnapshot {
  const byCountry = new Map<string, LiveAlert[]>();
  for (const a of alerts) {
    if (!a.countryIso) continue;
    const arr = byCountry.get(a.countryIso) ?? [];
    arr.push(a);
    byCountry.set(a.countryIso, arr);
  }
  return { alerts, byCountry, stats, sources, lastFetch, ok: sources.length > 0 };
}

if (typeof window !== 'undefined') {
  memoryCache = hydrate();
  if (memoryCache) console.log(`💾 ${memoryCache.alerts.length} alertes mondiales restaurées (${memoryCache.sources.join(', ')})`);
}

async function getConfig(): Promise<{ url: string; key: string }> {
  const { projectId, publicAnonKey } = await import('../../../utils/supabase/info');
  return { url: `https://${projectId}.supabase.co/functions/v1/world-alerts`, key: publicAnonKey };
}

// ─── API publique ───
export async function fetchLiveAlerts(forceRefresh = false): Promise<LiveAlertsSnapshot> {
  if (!forceRefresh && memoryCache && Date.now() - memoryCache.lastFetch < CACHE_DURATION) return memoryCache;
  if (fetchingPromise) return fetchingPromise;

  fetchingPromise = (async () => {
    try {
      const { url, key } = await getConfig();
      const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`world-alerts ${res.status}`);
      const data = await res.json() as { alerts: ApiAlert[]; stats: Record<string, number>; sources: string[]; total: number };
      const alerts: LiveAlert[] = (data.alerts ?? [])
        .filter(a => a.severity !== 'info')
        .map(a => ({
          countryIso: a.countryIso ?? '',
          type: a.type,
          severity: (a.severity === 'red' ? 'red' : 'orange') as AlertSeverity,
          source: a.source,
          description: a.title,
          lat: a.lat,
          lon: a.lon,
          detectedAt: new Date(a.date),
        }));
      const snap = buildSnapshot(alerts, data.stats ?? {}, data.sources ?? [], Date.now());
      memoryCache = snap;
      persist(snap);
      console.log(`🌍 world-alerts : ${alerts.length} alertes (${data.sources?.join(' + ')})`);
      return snap;
    } catch (e) {
      console.warn('⚠️ world-alerts indisponible', e);
      return memoryCache ?? buildSnapshot([], {}, [], Date.now());
    } finally {
      fetchingPromise = null;
    }
  })();
  return fetchingPromise;
}

export function getLiveAlertsSnapshot(): LiveAlertsSnapshot | null {
  return memoryCache;
}

export function getMaxAlertSeverityForCountry(iso: string): AlertSeverity | null {
  if (!memoryCache) return null;
  const a = memoryCache.byCountry.get(iso);
  if (!a || a.length === 0) return null;
  return a.some(x => x.severity === 'red') ? 'red' : 'orange';
}

export function getAlertsForCountry(iso: string): LiveAlert[] {
  return memoryCache?.byCountry.get(iso) ?? [];
}

type AlertsListener = (snapshot: LiveAlertsSnapshot) => void;
const listeners = new Set<AlertsListener>();
export function subscribeToLiveAlerts(listener: AlertsListener): () => void {
  listeners.add(listener);
  if (memoryCache) listener(memoryCache);
  return () => listeners.delete(listener);
}
function notify(s: LiveAlertsSnapshot) { listeners.forEach(l => { try { l(s); } catch { /* */ } }); }

export function startLiveAlertsPolling(): void {
  fetchLiveAlerts().then(notify).catch(() => {});
  if (typeof window !== 'undefined') {
    window.setInterval(() => fetchLiveAlerts(true).then(notify).catch(() => {}), CACHE_DURATION);
  }
}
