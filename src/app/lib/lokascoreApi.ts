/**
 * lokascoreApi — client de l'Edge Function `lokascore-compute`.
 *
 * Toute la logique de calcul (formule, pondérations, matrice profil, dataset
 * curé) vit côté serveur. Le client envoie un destinationId + un profil et
 * reçoit uniquement le résultat (score, dimensions, niveau, noms de sources).
 * Aucune pondération ne transite par le navigateur.
 */

export interface LokascoreApiResult {
  destination: string;
  profile: string;
  score: number | null;
  level: string;
  label: string;
  dimensions: {
    security: number;
    health: number;
    nature: number;
    infrastructure: number;
  };
  /** Noms des sources qui ont contribué, par dimension (pas de valeurs/poids) */
  sources: {
    security: string[];
    health: string[];
    nature: string[];
    infrastructure: string[];
  };
  hasOfficialSource: boolean;
  usedLiveAdvisories: boolean;
  natureAlert: 'orange' | 'red' | null;
  available: boolean;
  lastUpdate: string;
}

const cache = new Map<string, { result: LokascoreApiResult; ts: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 min
const inflight = new Map<string, Promise<LokascoreApiResult | null>>();
const SESSION_KEY = 'lokadia_lokascore_api_v1';

// ─── Persistance sessionStorage (survit aux navigations) ───
function loadSession(): void {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const stored = JSON.parse(raw) as Record<string, { result: LokascoreApiResult; ts: number }>;
    const now = Date.now();
    for (const [k, v] of Object.entries(stored)) {
      if (now - v.ts < CACHE_DURATION) cache.set(k, v);
    }
  } catch { /* ignore */ }
}
function persistSession(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(Object.fromEntries(cache)));
  } catch { /* ignore */ }
}
if (typeof window !== 'undefined') loadSession();

// ─── Concurrence limitée (la liste charge 57 destinations d'un coup) ───
const MAX_CONCURRENT = 6;
let active = 0;
const queue: Array<() => void> = [];
function drain() {
  while (active < MAX_CONCURRENT && queue.length > 0) queue.shift()!();
}
async function withLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) await new Promise<void>((r) => queue.push(r));
  active++;
  try { return await fn(); }
  finally { active--; drain(); }
}

async function getConfig(): Promise<{ baseUrl: string; key: string }> {
  const { projectId, publicAnonKey } = await import('../../../utils/supabase/info');
  return { baseUrl: `https://${projectId}.supabase.co/functions/v1`, key: publicAnonKey };
}

function cacheKey(destinationId: string, profile: string, live: boolean): string {
  return `${destinationId}|${profile}|${live ? 'L' : 'S'}`;
}

/**
 * Récupère le Lokascore depuis le backend.
 * @param live  true sur la fiche destination (enrichit avec advisories temps réel)
 */
export async function fetchLokascore(
  destinationId: string,
  profile: string,
  opts: { live?: boolean; forceRefresh?: boolean } = {}
): Promise<LokascoreApiResult | null> {
  const live = opts.live ?? false;
  const key = cacheKey(destinationId, profile, live);

  if (!opts.forceRefresh) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_DURATION) return cached.result;
    const existing = inflight.get(key);
    if (existing) return existing;
  }

  const promise = withLimit(async () => {
    try {
      const { baseUrl, key: anonKey } = await getConfig();
      const liveParam = live ? '&live=1' : '';
      const u = `${baseUrl}/lokascore-compute?destination=${encodeURIComponent(destinationId)}&profile=${encodeURIComponent(profile)}${liveParam}`;
      const res = await fetch(u, {
        headers: { Authorization: `Bearer ${anonKey}` },
        signal: AbortSignal.timeout(live ? 15000 : 9000),
      });
      if (!res.ok) return null;
      const data = await res.json() as LokascoreApiResult;
      if (data.available) {
        cache.set(key, { result: data, ts: Date.now() });
        persistSession();
      }
      return data.available ? data : null;
    } catch (e) {
      console.warn(`⚠️ lokascore-compute indisponible pour ${destinationId}`, e);
      return null;
    } finally {
      inflight.delete(key);
    }
  });

  inflight.set(key, promise);
  return promise;
}

/** Lecture synchrone du cache (sans déclencher de fetch) */
export function getCachedLokascore(destinationId: string, profile: string, live = false): LokascoreApiResult | null {
  const cached = cache.get(cacheKey(destinationId, profile, live));
  if (cached && Date.now() - cached.ts < CACHE_DURATION) return cached.result;
  // Fallback : version non-live si la version live n'est pas encore en cache
  if (live) {
    const fallback = cache.get(cacheKey(destinationId, profile, false));
    if (fallback && Date.now() - fallback.ts < CACHE_DURATION) return fallback.result;
  }
  return null;
}
