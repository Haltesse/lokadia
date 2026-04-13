/**
 * Service de mise à jour automatique des GoSafe Index
 * Met à jour tous les scores de sécurité avec les données Numbeo en temps réel
 */

import { fetchNumbeoSafety } from './numbeoService';
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
const cacheTimestamp = { value: 0 };
const GLOBAL_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const loadingPromises = new Map<string, Promise<number | null>>();

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

/**
 * Récupère toutes les IDs de destinations depuis la base de données
 */
function getAllDestinationIds(): string[] {
  const allIds = Object.keys(destinationsDatabase);
  console.log(`📋 ${allIds.length} destinations trouvées dans la base de données`);
  return allIds;
}

/**
 * Récupère le GoSafe Score depuis Numbeo pour une destination (avec déduplication)
 */
async function fetchGoSafeScoreForDestination(destinationId: string): Promise<number | null> {
  // Si déjà en cours de chargement, réutiliser la promesse
  const existing = loadingPromises.get(destinationId);
  if (existing) return existing;

  const promise = (async () => {
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
  })();

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
          globalScoresCache.set(destinationId, newScore);
          
          // Notifier les composants de la mise à jour
          notifyScoreUpdate(destinationId, newScore);
          
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
  if (score) {
    console.log(`📊 Score en cache pour ${destinationId}:`, score);
  }
  return score || null;
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
export async function getGoSafeScoreOnDemand(destinationId: string): Promise<number | null> {
  // Vérifier le cache d'abord
  const cached = globalScoresCache.get(destinationId);
  if (cached !== undefined) return cached;

  const score = await fetchGoSafeScoreForDestination(destinationId);
  if (score !== null) {
    globalScoresCache.set(destinationId, score);
    notifyScoreUpdate(destinationId, score);
  }
  return score;
}

/**
 * Initialise le cache au démarrage de l'application
 * Version légère: ne charge PAS toutes les destinations, juste prépare le cache
 */
export async function initializeGoSafeScoresCache(): Promise<void> {
  console.log('🚀 Cache GoSafe Index initialisé (chargement à la demande)');
  // On ne charge plus tout au démarrage, les scores se chargent quand on ouvre une destination
  cacheTimestamp.value = Date.now();
}