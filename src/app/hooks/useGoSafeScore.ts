import { useState, useEffect } from 'react';
import {
  getGoSafeScoreFromCache,
  getGoSafeScoreOnDemand,
  initializeGoSafeScoresCache,
  refreshGoSafeScoresCache,
  isCacheRecent,
  subscribeToScoreUpdates,
} from '../services/goSafeUpdateService';

interface UseGoSafeScoreResult {
  score: number | null;
  safetyLevel: 'safe' | 'vigilance' | 'danger';
  loading: boolean;
  lastUpdate: string;
  refresh: () => void;
}

// Variable globale pour éviter les initialisations multiples
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Hook pour récupérer le GoSafe Score en temps réel depuis Numbeo
 * Le score est mis en cache et partagé entre tous les composants
 * Se met à jour automatiquement quand de nouvelles données arrivent
 */
export function useGoSafeScore(destinationId: string | undefined): UseGoSafeScoreResult {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('Chargement...');

  // Déterminer le niveau de sécurité
  const getSafetyLevel = (s: number | null): 'safe' | 'vigilance' | 'danger' => {
    if (s === null) return 'vigilance';
    if (s >= 70) return 'safe';
    if (s >= 50) return 'vigilance';
    return 'danger';
  };

  const loadScore = async () => {
    if (!destinationId) {
      setLoading(false);
      return;
    }

    // Vérifier le cache d'abord
    const cachedScore = getGoSafeScoreFromCache(destinationId);
    if (cachedScore !== null) {
      setScore(cachedScore);
      setLastUpdate(
        new Date().toLocaleString('fr-FR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setLoading(false);
      return;
    }

    // Charger à la demande
    try {
      const newScore = await getGoSafeScoreOnDemand(destinationId);
      if (newScore !== null) {
        setScore(newScore);
        setLastUpdate(
          new Date().toLocaleString('fr-FR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    } catch (error) {
      console.error('❌ Erreur chargement score:', error);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadScore();
    
    // S'abonner aux mises à jour en temps réel
    if (destinationId) {
      const unsubscribe = subscribeToScoreUpdates((updatedDestinationId, updatedScore) => {
        // Si c'est notre destination, mettre à jour le state
        if (updatedDestinationId === destinationId) {
          console.log(`🔄 Mise à jour en temps réel pour ${destinationId}: ${updatedScore}`);
          setScore(updatedScore);
          setLastUpdate(
            new Date().toLocaleString('fr-FR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          );
          setLoading(false);
        }
      });
      
      return unsubscribe;
    }
  }, [destinationId]);

  const refresh = async () => {
    console.log('🔄 Rafraîchissement manuel du cache GoSafe...');
    setLoading(true);
    await refreshGoSafeScoresCache();
    await loadScore();
  };

  return {
    score,
    safetyLevel: getSafetyLevel(score),
    loading,
    lastUpdate,
    refresh,
  };
}

/**
 * Hook pour initialiser le cache au démarrage de l'application
 * À appeler une seule fois dans App.tsx
 * Force un rafraîchissement à chaque chargement de page
 */
export function useGoSafeCacheInitializer() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // TOUJOURS rafraîchir au démarrage
    console.log('🌟 Page ouverte - Rafraîchissement automatique du cache GoSafe...');
    
    const initialize = async () => {
      try {
        await initializeGoSafeScoresCache();
        isInitialized = true;
        setIsReady(true);
        console.log('✅ Cache GoSafe actualisé avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du cache:', error);
        setIsReady(true); // Continuer même en cas d'erreur
      }
    };
    
    initialize();
  }, []); // [] = une seule fois au montage

  return { isReady, isCacheRecent: isCacheRecent() };
}