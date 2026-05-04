/**
 * Service de mise à jour automatique des GoSafe Index
 * Met à jour tous les scores de sécurité avec les données Numbeo en temps réel
 */

import { fetchNumbeoSafety, invalidateNumbeoCache } from './numbeoService';
import { destinationsDatabase } from '../data/destinationData';

interface GoSafeScoreUpdate {
  destinationId: string;
  cityName: string;
  oldScore: number;
  newScore: number;
  safetyLevel: 'safe' | 'vigilance' | 'danger';
  lastUpdate: string;
}

// Cache global pour les scores Numbeo
const globalScoresCache = new Map<string, number>();
const scoreTimestamps = new Map<string, number>();
const cacheTimestamp = { value: 0 };
const GLOBAL_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const loadingPromises = new Map<string, Promise<number | null>>();

// ─── Persistance sessionStorage ──────────────────────────────────────────────
// Partage les scores au sein de la même session (entre navigations).
// Garantit que la liste et la fiche affichent toujours le même score Numbeo.
// IMPORTANT : la version dans la clé invalide automatiquement les anciens caches
// quand on change la logique des scores. Bumper si les scores statiques apparaissent.
const SESSION_KEY = 'lokadia_gosafe_scores_v3';

// Anciennes clés à nettoyer au démarrage (évite la pollution par d'anciens scores statiques)
const LEGACY_SESSION_KEYS = ['lokadia_gosafe_scores', 'lokadia_gosafe_scores_v1', 'lokadia_gosafe_scores_v2'];

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
  if (hydratedCount > 0) {
    console.log(`💾 GoSafe v3: ${hydratedCount} scores Numbeo restaurés depuis sessionStorage`);
  } else {
    console.log(`🆕 GoSafe v3: cache vide, fetch Numbeo à la demande`);
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

function storeGoSafeScore(destinationId: string, score: number) {
  globalScoresCache.set(destinationId, score);
  scoreTimestamps.set(destinationId, Date.now());
  writeSessionCache(destinationId, score); // ← persistance cross-navigation
  notifyScoreUpdate(destinationId, score);
}

export function syncGoSafeScore(destinationId: string, score: number) {
  if (!Number.isFinite(score)) return;
  storeGoSafeScore(destinationId, Math.round(score));
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
 * Récupère le GoSafe Score depuis Numbeo pour une destination.
 * - Déduplication : si le même ID est déjà en cours de fetch, on réutilise la même promesse
 * - Concurrence limitée : max MAX_CONCURRENT appels simultanés pour éviter de saturer l'API
 */
async function fetchGoSafeScoreForDestination(destinationId: string): Promise<number | null> {
  // Déduplication : réutiliser la promesse en cours si elle existe
  const existing = loadingPromises.get(destinationId);
  if (existing) return existing;

  const promise = withConcurrencyLimit(async () => {
    try {
      const safetyData = await fetchNumbeoSafety(destinationId);
      const score = Math.round(safetyData.safetyIndex);
      console.log(`✅ GoSafe Score pour ${destinationId}: ${score}`);
      return score;
    } catch (error) {
      console.error(`❌ Erreur score ${destinationId}:`, error);
      return null;
    } finally {
      loadingPromises.delete(destinationId);
    }
  });

  loadingPromises.set(destinationId, promise);
  return promise;
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
 * Met à jour tous les GoSafe Index depuis Numbeo
 * Retourne la liste des mises à jour effectuées
 */
export async function updateAllGoSafeScores(forceRefresh: boolean = false): Promise<GoSafeScoreUpdate[]> {
  // Vérifier si un rafraîchissement est nécessaire
  if (!forceRefresh && isCacheRecent()) {
    console.log('✅ Cache GoSafe encore valide, pas de rafraîchissement');
    return [];
  }

  if (forceRefresh) {
    invalidateNumbeoCache();
  }
  
  console.log('🔄 Mise à jour automatique de TOUS les GoSafe Index...');
  
  const updates: GoSafeScoreUpdate[] = [];
  
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
        const newScore = await fetchGoSafeScoreForDestination(destinationId);
        
        if (newScore !== null) {
          storeGoSafeScore(destinationId, newScore);
          
          const update: GoSafeScoreUpdate = {
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
    updates.push(...batchResults.filter((u): u is GoSafeScoreUpdate => u !== null));
    
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
 * Récupère le GoSafe Score depuis le cache (si disponible et récent)
 */
export function getGoSafeScoreFromCache(destinationId: string): number | null {
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

export function getGoSafeScoreLastUpdate(destinationId: string): number | null {
  return scoreTimestamps.get(destinationId) ?? null;
}

export function getStaleGoSafeScoreFromCache(destinationId: string): number | null {
  const score = globalScoresCache.get(destinationId);
  return score ?? null;
}

/**
 * Force le rechargement du cache
 */
export async function refreshGoSafeScoresCache(): Promise<void> {
  console.log('🔄 Rechargement forcé du cache GoSafe...');
  await updateAllGoSafeScores(true);
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
 * Récupère le GoSafe Score pour UNE destination (chargement à la demande)
 */
export async function getGoSafeScoreOnDemand(destinationId: string, forceRefresh: boolean = false): Promise<number | null> {
  // Vérifier le cache d'abord
  const cached = getGoSafeScoreFromCache(destinationId);
  if (!forceRefresh && cached !== null) return cached;

  if (forceRefresh) {
    invalidateNumbeoCache(destinationId);
  }

  const score = await fetchGoSafeScoreForDestination(destinationId);
  if (score !== null) {
    storeGoSafeScore(destinationId, score);
  }
  return score;
}

/**
 * Initialise le cache au démarrage de l'application.
 * Les scores déjà présents en sessionStorage sont hydratés à l'import du module ;
 * cette fonction ne fait que marquer le cache comme prêt.
 */
export async function initializeGoSafeScoresCache(): Promise<void> {
  console.log('🚀 Cache GoSafe Index initialisé (chargement à la demande + sessionStorage)');
  console.log(`💾 ${globalScoresCache.size} scores restaurés depuis sessionStorage`);
  // cacheTimestamp = 0 → laisse chaque score utiliser son propre scoreTimestamp
  if (cacheTimestamp.value === 0) cacheTimestamp.value = 0; // no-op intentionnel
}
