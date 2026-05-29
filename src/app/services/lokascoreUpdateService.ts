/**
 * Service de mise à jour automatique des Lokascore
 * Met à jour tous les scores de sécurité avec les données Numbeo en temps réel
 */

import { fetchNumbeoSafety, invalidateNumbeoCache } from './numbeoService';
import { destinationsDatabase } from '../data/destinationData';
import { buildDimensionsFromNumbeo, computeLokascore, type LokascoreDimensions } from '../lib/lokascore';
import { computeDimensionsFromSources, computeDimensionsFromSourcesLive, type LokascoreSourceTrace } from '../lib/lokascoreSources';
import { getCountryRiskForDestination } from '../data/countryRiskData';

interface LokascoreUpdate {
  destinationId: string;
  cityName: string;
  oldScore: number;
  newScore: number;
  safetyLevel: 'safe' | 'vigilance' | 'danger';
  lastUpdate: string;
}

// Cache global pour les scores Numbeo (security index uniquement, retro-compat)
const globalScoresCache = new Map<string, number>();
const scoreTimestamps = new Map<string, number>();
// Cache des 4 dimensions Lokascore (Security/Health/Nature/Infrastructure)
const dimensionsCache = new Map<string, LokascoreDimensions>();
// Cache des traces de sources (Phase 3) : permet à l'UI de montrer
// quelles sources officielles ont contribué à chaque dimension
const sourceTracesCache = new Map<string, LokascoreSourceTrace>();
const cacheTimestamp = { value: 0 };
const GLOBAL_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const loadingPromises = new Map<string, Promise<number | null>>();
const dimensionsLoadingPromises = new Map<string, Promise<LokascoreDimensions | null>>();

// ─── Persistance sessionStorage ──────────────────────────────────────────────
// Partage les scores au sein de la même session (entre navigations).
// Garantit que la liste et la fiche affichent toujours le même score Numbeo.
// IMPORTANT : la version dans la clé invalide automatiquement les anciens caches
// quand on change la logique des scores. Bumper si les scores statiques apparaissent.
const SESSION_KEY = 'lokadia_lokascore_scores_v3';
const SESSION_KEY_DIMENSIONS = 'lokadia_lokascore_dims_v1';

// Anciennes clés à nettoyer au démarrage (évite la pollution par d'anciens scores statiques)
const LEGACY_SESSION_KEYS = ['lokadia_lokascore_scores', 'lokadia_lokascore_scores_v1', 'lokadia_lokascore_scores_v2'];

function purgeLegacySessionCaches(): void {
  try {
    LEGACY_SESSION_KEYS.forEach(k => sessionStorage.removeItem(k));
  } catch {
    // Ignorer si sessionStorage indisponible
  }
}

// Purge immédiate au chargement du module
purgeLegacySessionCaches();

interface StoredEntry { score: number; ts: number }
type StoredScores = Record<string, StoredEntry>;

function readSessionCache(): StoredScores {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? '{}') as StoredScores;
  } catch {
    return {};
  }
}

function writeSessionCache(destinationId: string, score: number): void {
  try {
    const stored = readSessionCache();
    stored[destinationId] = { score, ts: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(stored));
  } catch {
    // sessionStorage peut être indisponible (mode privé strict, quota plein)
  }
}

// ─── sessionStorage pour les dimensions Lokascore ───
interface StoredDimensionsEntry { dims: LokascoreDimensions; ts: number }
type StoredDimensions = Record<string, StoredDimensionsEntry>;

function readDimensionsSessionCache(): StoredDimensions {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY_DIMENSIONS) ?? '{}') as StoredDimensions;
  } catch {
    return {};
  }
}

function writeDimensionsSessionCache(destinationId: string, dims: LokascoreDimensions): void {
  try {
    const stored = readDimensionsSessionCache();
    stored[destinationId] = { dims, ts: Date.now() };
    sessionStorage.setItem(SESSION_KEY_DIMENSIONS, JSON.stringify(stored));
  } catch {
    // ignorer
  }
}

/** Initialise le cache mémoire depuis sessionStorage au démarrage */
function hydrateFromSessionStorage(): void {
  const stored = readSessionCache();
  const now = Date.now();
  let hydratedCount = 0;
  for (const [id, { score, ts }] of Object.entries(stored)) {
    if (now - ts < GLOBAL_CACHE_DURATION) {
      globalScoresCache.set(id, score);
      scoreTimestamps.set(id, ts);
      hydratedCount++;
    }
  }
  // Hydrate aussi les dimensions Lokascore
  const storedDims = readDimensionsSessionCache();
  let hydratedDims = 0;
  for (const [id, { dims, ts }] of Object.entries(storedDims)) {
    if (now - ts < GLOBAL_CACHE_DURATION) {
      dimensionsCache.set(id, dims);
      hydratedDims++;
    }
  }
  if (hydratedCount > 0 || hydratedDims > 0) {
    console.log(`💾 Lokascore v4: ${hydratedCount} scores + ${hydratedDims} dimensions restaurés depuis sessionStorage`);
  } else {
    console.log(`🆕 Lokascore v4: cache vide, fetch Numbeo à la demande`);
  }
}

// Hydratation immédiate à l'import du module
hydrateFromSessionStorage();

// ─── Limiteur de concurrence ────────────────────────────────────────────────
// Quand 57 cartes chargent en même temps (DestinationCountScreen, AllDestinations),
// les appels simultanés saturent l'API Numbeo / Supabase Edge Function.
// On plafonne à MAX_CONCURRENT pour que tous les scores arrivent correctement.
const MAX_CONCURRENT = 6;
let activeCount = 0;
const waitQueue: Array<() => void> = [];

function drainQueue() {
  while (activeCount < MAX_CONCURRENT && waitQueue.length > 0) {
    const next = waitQueue.shift()!;
    next();
  }
}

async function withConcurrencyLimit<T>(fn: () => Promise<T>): Promise<T> {
  if (activeCount >= MAX_CONCURRENT) {
    await new Promise<void>(resolve => waitQueue.push(resolve));
  }
  activeCount++;
  try {
    return await fn();
  } finally {
    activeCount--;
    drainQueue();
  }
}

// Système d'événements pour notifier les composants des mises à jour
type ScoreUpdateListener = (destinationId: string, score: number) => void;
const scoreUpdateListeners = new Set<ScoreUpdateListener>();

// Listeners spécifiques aux mises à jour de dimensions
type DimensionsUpdateListener = (destinationId: string, dims: LokascoreDimensions) => void;
const dimensionsUpdateListeners = new Set<DimensionsUpdateListener>();

export function subscribeToDimensionsUpdate(listener: DimensionsUpdateListener): () => void {
  dimensionsUpdateListeners.add(listener);
  return () => dimensionsUpdateListeners.delete(listener);
}

function notifyDimensionsUpdate(destinationId: string, dims: LokascoreDimensions) {
  dimensionsUpdateListeners.forEach(listener => {
    try {
      listener(destinationId, dims);
    } catch (error) {
      console.error('❌ Erreur listener dimensions:', error);
    }
  });
}

function storeDimensions(destinationId: string, dims: LokascoreDimensions) {
  dimensionsCache.set(destinationId, dims);
  writeDimensionsSessionCache(destinationId, dims);
  notifyDimensionsUpdate(destinationId, dims);
}

function storeSourceTrace(destinationId: string, trace: LokascoreSourceTrace) {
  sourceTracesCache.set(destinationId, trace);
}

/** Récupère la trace des sources officielles utilisées pour calculer le Lokascore */
export function getSourceTraceFromCache(destinationId: string): LokascoreSourceTrace | null {
  return sourceTracesCache.get(destinationId) ?? null;
}

/**
 * Recalcule toutes les dimensions cachées en intégrant les alertes live
 * fraîchement reçues, SANS re-fetcher Numbeo (les indices statiques n'ont pas
 * changé — seules les alertes temporaires sont nouvelles). Notifie les
 * composants avec les nouveaux scores pour éviter tout flicker.
 */
export function invalidateAllDimensions(): void {
  const ids = Array.from(dimensionsCache.keys());
  if (ids.length === 0) return;
  console.log(`🔄 Recalcul ${ids.length} destinations avec nouvelles alertes live`);
  let recomputedCount = 0;
  for (const destinationId of ids) {
    // Pour recalculer correctement, on doit récupérer les indices Numbeo bruts.
    // Sans accès au cache Numbeo ici, on déclenche un re-fetch asynchrone
    // (qui sera servi depuis le cache numbeoService → ~0ms).
    fetchGoSafeScoreForDestination(destinationId).then(() => {
      recomputedCount++;
    }).catch(() => {});
  }
}

/**
 * Abonne un listener aux mises à jour de scores
 */
export function subscribeToScoreUpdates(listener: ScoreUpdateListener): () => void {
  scoreUpdateListeners.add(listener);
  return () => scoreUpdateListeners.delete(listener);
}

/**
 * Notifie tous les listeners d'une mise à jour de score
 */
function notifyScoreUpdate(destinationId: string, score: number) {
  scoreUpdateListeners.forEach(listener => {
    try {
      listener(destinationId, score);
    } catch (error) {
      console.error('❌ Erreur dans le listener:', error);
    }
  });
}

function storeLokascore(destinationId: string, score: number) {
  globalScoresCache.set(destinationId, score);
  scoreTimestamps.set(destinationId, Date.now());
  writeSessionCache(destinationId, score); // ← persistance cross-navigation
  notifyScoreUpdate(destinationId, score);
}

export function syncLokascore(destinationId: string, score: number) {
  if (!Number.isFinite(score)) return;
  storeLokascore(destinationId, Math.round(score));
}

function isScoreRecent(destinationId: string): boolean {
  const updatedAt = scoreTimestamps.get(destinationId);
  return updatedAt !== undefined && Date.now() - updatedAt < GLOBAL_CACHE_DURATION;
}

/**
 * Récupère toutes les IDs de destinations depuis la base de données
 */
function getAllDestinationIds(): string[] {
  const allIds = Object.keys(destinationsDatabase);
  console.log(`📋 ${allIds.length} destinations trouvées dans la base de données`);
  return allIds;
}

/**
 * Récupère le Lokascore + les 4 dimensions Lokascore depuis Numbeo.
 * - Déduplication : si le même ID est déjà en cours de fetch, on réutilise la même promesse
 * - Concurrence limitée : max MAX_CONCURRENT appels simultanés pour éviter de saturer l'API
 * - Effet de bord : remplit aussi `dimensionsCache` pour la modulation profil
 */
async function fetchLokascoreForDestination(destinationId: string): Promise<number | null> {
  // Déduplication : réutiliser la promesse en cours si elle existe
  const existing = loadingPromises.get(destinationId);
  if (existing) return existing;

  const promise = withConcurrencyLimit(async () => {
    try {
      let numbeoData: {
        safetyIndex?: number;
        healthCareIndex?: number;
        qualityOfLifeIndex?: number;
        pollutionIndex?: number;
      } = {};
      let numbeoOk = false;

      // ─── Étape 1 : tenter Numbeo (best-effort, on absorbe l'erreur) ───
      try {
        const safetyData = await fetchNumbeoSafety(destinationId);
        numbeoData = {
          safetyIndex: safetyData.safetyIndex,
          healthCareIndex: safetyData.healthCareIndex,
          qualityOfLifeIndex: safetyData.qualityOfLifeIndex,
          pollutionIndex: safetyData.pollutionIndex,
        };
        numbeoOk = true;
      } catch {
        console.warn(`⚠️ Numbeo indisponible pour ${destinationId}, fallback sur données officielles seules`);
      }

      // ─── Étape 2 : calculer les dimensions à partir des sources disponibles
      //              en intégrant les advisories LIVE (MAE/FCDO/US State/OMS via
      //              Edge Functions Supabase quand disponibles) ───
      const { dimensions: dims, trace, usedLiveAdvisories } = await computeDimensionsFromSourcesLive(
        destinationId,
        numbeoData
      );

      // ─── Étape 3 : vérifier qu'on a au moins UNE source utilisable ───
      const countryRisk = getCountryRiskForDestination(destinationId);
      const hasOfficial = trace.hasAnyOfficialSource || !!countryRisk;
      if (!numbeoOk && !hasOfficial) {
        console.error(`❌ Aucune source disponible pour ${destinationId} (ni Numbeo, ni dataset curé)`);
        return null;
      }

      // ─── Étape 4 : stocker et notifier ───
      storeDimensions(destinationId, dims);
      storeSourceTrace(destinationId, trace);
      const compositeScore = computeLokascore(dims, 'default');

      let badge: string;
      const live = usedLiveAdvisories ? ' + ⚡ live MAE/FCDO/US/OMS' : '';
      if (trace.hasAnyOfficialSource && numbeoOk) badge = `🟢 officielles + 🔵 Numbeo${live}`;
      else if (trace.hasAnyOfficialSource) badge = `🟢 officielles uniquement${live}`;
      else if (numbeoOk) badge = '🔵 Numbeo uniquement';
      else badge = '⚠️ fallback estimation';
      console.log(`✅ Lokascore ${destinationId} [${badge}]: ${compositeScore}/100`);

      return compositeScore;
    } catch (error) {
      console.error(`❌ Erreur fatale fetch ${destinationId}:`, error);
      return null;
    } finally {
      loadingPromises.delete(destinationId);
    }
  });

  loadingPromises.set(destinationId, promise);
  return promise;
}

/**
 * Récupère uniquement les 4 dimensions Lokascore (utilisé par useLokascore
 * quand on a besoin de moduler par profil voyage).
 */
async function fetchDimensionsForDestination(destinationId: string): Promise<LokascoreDimensions | null> {
  const existing = dimensionsLoadingPromises.get(destinationId);
  if (existing) return existing;

  const promise = (async () => {
    try {
      // fetchLokascoreForDestination remplit déjà dimensionsCache via storeDimensions
      await fetchLokascoreForDestination(destinationId);
      return dimensionsCache.get(destinationId) ?? null;
    } catch {
      return null;
    } finally {
      dimensionsLoadingPromises.delete(destinationId);
    }
  })();

  dimensionsLoadingPromises.set(destinationId, promise);
  return promise;
}

// ─── API publique : dimensions ──────────────────────────────────────────────

export function getDimensionsFromCache(destinationId: string): LokascoreDimensions | null {
  return dimensionsCache.get(destinationId) ?? null;
}

export function getStaleDimensionsFromCache(destinationId: string): LokascoreDimensions | null {
  return dimensionsCache.get(destinationId) ?? null;
}

export async function getDimensionsOnDemand(
  destinationId: string,
  forceRefresh: boolean = false
): Promise<LokascoreDimensions | null> {
  if (!forceRefresh) {
    const cached = getDimensionsFromCache(destinationId);
    if (cached !== null) return cached;
  } else {
    invalidateNumbeoCache(destinationId);
  }
  return fetchDimensionsForDestination(destinationId);
}

/**
 * Détermine le niveau de sécurité basé sur le score
 */
function getSafetyLevel(score: number): 'safe' | 'vigilance' | 'danger' {
  if (score >= 70) return 'safe';
  if (score >= 50) return 'vigilance';
  return 'danger';
}

/**
 * Met à jour tous les Lokascore depuis Numbeo
 * Retourne la liste des mises à jour effectuées
 */
export async function updateAllLokascores(forceRefresh: boolean = false): Promise<LokascoreUpdate[]> {
  // Vérifier si un rafraîchissement est nécessaire
  if (!forceRefresh && isCacheRecent()) {
    console.log('✅ Cache Lokascore encore valide, pas de rafraîchissement');
    return [];
  }

  if (forceRefresh) {
    invalidateNumbeoCache();
  }
  
  console.log('🔄 Mise à jour automatique de TOUS les Lokascore...');
  
  const updates: LokascoreUpdate[] = [];
  
  // Récupérer TOUTES les destinations depuis la base de données
  const allDestinationIds = getAllDestinationIds();
  console.log(`📊 Chargement complet de ${allDestinationIds.length} destinations en temps réel...`);
  
  // Charger TOUTES les destinations avec progression
  let completed = 0;
  let successful = 0;
  let failed = 0;
  
  // Traiter par batch de 5 pour ne pas surcharger l'API
  const BATCH_SIZE = 5;
  for (let i = 0; i < allDestinationIds.length; i += BATCH_SIZE) {
    const batch = allDestinationIds.slice(i, i + BATCH_SIZE);
    
    // Charger chaque batch en parallèle
    const batchPromises = batch.map(async (destinationId) => {
      try {
        const newScore = await fetchLokascoreForDestination(destinationId);
        
        if (newScore !== null) {
          storeLokascore(destinationId, newScore);
          
          const update: LokascoreUpdate = {
            destinationId,
            cityName: destinationId.split('-')[0],
            oldScore: 0,
            newScore,
            safetyLevel: getSafetyLevel(newScore),
            lastUpdate: new Date().toLocaleString('fr-FR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
          
          completed++;
          successful++;
          console.log(`✅ [${completed}/${allDestinationIds.length}] ${destinationId}: ${newScore} (${update.safetyLevel})`);
          return update;
        } else {
          completed++;
          failed++;
          console.log(`⚠️ [${completed}/${allDestinationIds.length}] ${destinationId}: Score non disponible`);
          return null;
        }
      } catch (error) {
        completed++;
        failed++;
        console.error(`❌ [${completed}/${allDestinationIds.length}] Erreur pour ${destinationId}:`, error);
        return null;
      }
    });
    
    // Attendre que le batch soit terminé avant de continuer
    const batchResults = await Promise.all(batchPromises);
    updates.push(...batchResults.filter((u): u is LokascoreUpdate => u !== null));
    
    // Afficher la progression du batch
    const progress = Math.round((completed / allDestinationIds.length) * 100);
    console.log(`📊 Progression: ${progress}% (${completed}/${allDestinationIds.length}) - Réussis: ${successful}, Échoués: ${failed}`);
  }
  
  // Mettre à jour le timestamp du cache
  cacheTimestamp.value = Date.now();
  
  console.log(`\n🎉 MISE À JOUR COMPLÈTE TERMINÉE !`);
  console.log(`✅ Total: ${allDestinationIds.length} destinations`);
  console.log(`✅ Réussis: ${successful} destinations`);
  console.log(`❌ Échoués: ${failed} destinations`);
  console.log(`📊 Cache mis à jour: ${globalScoresCache.size} scores disponibles\n`);
  
  return updates;
}

/**
 * Récupère le Lokascore depuis le cache (si disponible et récent)
 */
export function getLokascoreFromCache(destinationId: string): number | null {
  const score = globalScoresCache.get(destinationId);
  if (score === undefined) return null;
  if (!isScoreRecent(destinationId)) {
    console.log(`Score en cache expire pour ${destinationId}`);
    return null;
  }
  if (score) {
    console.log(`📊 Score en cache pour ${destinationId}:`, score);
  }
  return score;
}

export function getLokascoreLastUpdate(destinationId: string): number | null {
  return scoreTimestamps.get(destinationId) ?? null;
}

export function getStaleLokascoreFromCache(destinationId: string): number | null {
  const score = globalScoresCache.get(destinationId);
  return score ?? null;
}

/**
 * Force le rechargement du cache
 */
export async function refreshLokascoresCache(): Promise<void> {
  console.log('🔄 Rechargement forcé du cache Lokascore...');
  await updateAllLokascores(true);
}

/**
 * Vérifie si le cache est récent (moins de 30 minutes)
 */
export function isCacheRecent(): boolean {
  const isRecent = Date.now() - cacheTimestamp.value < GLOBAL_CACHE_DURATION;
  if (!isRecent && cacheTimestamp.value > 0) {
    console.log('⚠️ Cache expiré (> 30 min), rechargement nécessaire');
  }
  return isRecent;
}

/**
 * Récupère le Lokascore pour UNE destination (chargement à la demande)
 */
export async function getLokascoreOnDemand(destinationId: string, forceRefresh: boolean = false): Promise<number | null> {
  // Vérifier le cache d'abord
  const cached = getLokascoreFromCache(destinationId);
  if (!forceRefresh && cached !== null) return cached;

  if (forceRefresh) {
    invalidateNumbeoCache(destinationId);
  }

  const score = await fetchLokascoreForDestination(destinationId);
  if (score !== null) {
    storeLokascore(destinationId, score);
  }
  return score;
}

/**
 * Initialise le cache au démarrage de l'application.
 * Les scores déjà présents en sessionStorage sont hydratés à l'import du module ;
 * cette fonction ne fait que marquer le cache comme prêt.
 */
export async function initializeLokascoresCache(): Promise<void> {
  console.log('🚀 Cache Lokascore initialisé (chargement à la demande + sessionStorage)');
  console.log(`💾 ${globalScoresCache.size} scores restaurés depuis sessionStorage`);
  // cacheTimestamp = 0 → laisse chaque score utiliser son propre scoreTimestamp
  if (cacheTimestamp.value === 0) cacheTimestamp.value = 0; // no-op intentionnel
}
