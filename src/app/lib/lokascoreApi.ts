/**
 * lokascoreApi — client de l'Edge Function `lokascore-compute`.
 *
 * Toute la logique de calcul (formule, pondérations, matrice profil, dataset
 * curé) vit côté serveur. Le client envoie un destinationId + un profil et
 * reçoit uniquement le résultat (score, dimensions, niveau, noms de sources).
 * Aucune pondération ne transite par le navigateur.
 */

import { cacheRead, cacheWrite } from './offlineCache';

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
  /** true = donnée servie depuis le cache local (réseau absent ou en échec) */
  fromCache?: boolean;
  /** Date de capture locale (ISO), à afficher quand fromCache est vrai */
  capturedAt?: string;
}

const cache = new Map<string, { result: LokascoreApiResult; ts: number }>();
/** Au-delà, on retente le réseau. En deçà, la donnée est servie telle quelle. */
const CACHE_DURATION = 30 * 60 * 1000; // 30 min

const inflight = new Map<string, Promise<LokascoreApiResult | null>>();

/**
 * Le cache mémoire est adossé au cache persistant (localStorage) : un score
 * déjà consulté reste lisible hors-ligne, avec sa date de capture. C'est la
 * contrainte « offline-first sur l'essentiel ».
 */
function persist(key: string, result: LokascoreApiResult): void {
  cacheWrite('lokascore', key, result);
}

/** Relit le cache persistant et signale explicitement la donnée périmée. */
function readPersisted(key: string): { result: LokascoreApiResult; fresh: boolean } | null {
  const entry = cacheRead<LokascoreApiResult>('lokascore', key);
  if (!entry) return null;
  const fresh = entry.ageMs < CACHE_DURATION;
  return {
    fresh,
    result: fresh
      ? entry.value
      : { ...entry.value, fromCache: true, capturedAt: entry.capturedAt },
  };
}

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
    const memo = cache.get(key);
    if (memo && Date.now() - memo.ts < CACHE_DURATION) return memo.result;
    const persisted = readPersisted(key);
    if (persisted?.fresh) return persisted.result;
    const existing = inflight.get(key);
    if (existing) return existing;
  }

  // Hors-ligne : inutile de tenter le réseau, on sert le cache daté
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return readPersisted(key)?.result ?? null;
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
      if (!res.ok) return readPersisted(key)?.result ?? null;
      const data = await res.json() as LokascoreApiResult;
      if (data.available) {
        cache.set(key, { result: data, ts: Date.now() });
        persist(key, data);
        return data;
      }
      return null;
    } catch (e) {
      console.warn(`lokascore-compute indisponible pour ${destinationId}`, e);
      // Réseau en échec : la dernière valeur connue vaut mieux qu'un vide,
      // à condition d'être présentée comme telle (fromCache + capturedAt).
      return readPersisted(key)?.result ?? null;
    } finally {
      inflight.delete(key);
    }
  });

  inflight.set(key, promise);
  return promise;
}

/** Lecture synchrone du cache (sans déclencher de fetch) */
export function getCachedLokascore(destinationId: string, profile: string, live = false): LokascoreApiResult | null {
  const key = cacheKey(destinationId, profile, live);
  const memo = cache.get(key);
  if (memo && Date.now() - memo.ts < CACHE_DURATION) return memo.result;

  const persisted = readPersisted(key);
  if (persisted) return persisted.result;

  // Pas de repli d'une variante sur l'autre. Il en existait un — la version
  // non-live servie en attendant la version live — qui reproduisait justement
  // l'incohérence qu'on vient de supprimer : le cache d'un ancien passage
  // affichait 91 pour Paris, puis le chiffre sautait à 87 une fois la réponse
  // arrivée. Mieux vaut l'état de chargement qu'un chiffre qu'on sait faux.
  return null;
}
