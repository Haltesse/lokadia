/**
 * useGoSafeScore (Lokascore) — hook unifié de score de sécurité
 *
 * Retourne le Lokascore composite [0;100] modulé par le profil de voyage
 * sélectionné dans l'app (via TravelProfileContext). Le calcul agrège les
 * 4 dimensions Sécurité / Santé / Nature / Infrastructure selon la matrice
 * de pondération officielle (cf. lib/lokascore.ts).
 *
 * Pendant le MVP, les 4 dimensions sont approximées à partir des sous-indices
 * Numbeo (safetyIndex, healthCareIndex, pollutionIndex, qualityOfLifeIndex).
 *
 * Le hook reste rétro-compatible : la prop `score` continue d'exposer un seul
 * nombre 0-100 utilisable directement par tous les composants existants.
 * Les nouvelles props (`dimensions`, `rawSecurityScore`, `level`) sont disponibles
 * pour les composants qui veulent afficher le détail (breakdown 4 dimensions,
 * niveau 5-tiers Lokascore, etc.).
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getGoSafeScoreFromCache,
  getGoSafeScoreLastUpdate,
  getGoSafeScoreOnDemand,
  getStaleGoSafeScoreFromCache,
  getDimensionsFromCache,
  getStaleDimensionsFromCache,
  getDimensionsOnDemand,
  initializeGoSafeScoresCache,
  isCacheRecent,
  subscribeToScoreUpdates,
  subscribeToDimensionsUpdate,
} from '../services/goSafeUpdateService';
import {
  computeLokascore,
  getLokascoreLevel,
  toLegacySafetyLevel,
  type LokascoreDimensions,
  type LokascoreLevelConfig,
  type LegacySafetyLevel,
} from '../lib/lokascore';
import { useTravelProfile } from '../context/TravelProfileContext';

interface UseGoSafeScoreResult {
  /** Lokascore composite modulé par profil (rétro-compat avec ancien GoSafe Score) */
  score: number | null;
  /** Mapping legacy 3-niveaux (rétro-compat) */
  safetyLevel: LegacySafetyLevel;
  /** Niveau Lokascore officiel 5-tiers (couleur, label, description, plage) */
  level: LokascoreLevelConfig;
  loading: boolean;
  lastUpdate: string;
  refresh: () => void;
  /** Détail des 4 dimensions agrégées (null tant que pas chargé) */
  dimensions: LokascoreDimensions | null;
  /** Score brut Sécurité (Numbeo Safety Index) — utile pour comparaison */
  rawSecurityScore: number | null;
}

// Anti-double-init au sein de la session
let isInitialized = false;
const SCORE_REFRESH_INTERVAL = 5 * 60 * 1000;

function formatLastUpdate(timestamp: number | null): string {
  if (!timestamp) return 'Actualisation...';
  return new Date(timestamp).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function useGoSafeScore(destinationId: string | undefined): UseGoSafeScoreResult {
  const { profile } = useTravelProfile();
  const [rawSecurityScore, setRawSecurityScore] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<LokascoreDimensions | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('Chargement...');

  const loadScore = useCallback(async (forceRefresh: boolean = false) => {
    if (!destinationId) {
      setRawSecurityScore(null);
      setDimensions(null);
      setLastUpdate('Indisponible');
      setLoading(false);
      return;
    }

    // 1. Cache lookup ultra-rapide (mémoire + sessionStorage hydraté)
    const cachedDims = forceRefresh ? null : getDimensionsFromCache(destinationId);
    const cachedScore = forceRefresh ? null : getGoSafeScoreFromCache(destinationId);
    if (cachedDims !== null) {
      setDimensions(cachedDims);
      setRawSecurityScore(cachedScore ?? Math.round(cachedDims.security));
      setLastUpdate(formatLastUpdate(getGoSafeScoreLastUpdate(destinationId)));
      setLoading(false);
      return;
    }
    if (cachedScore !== null) {
      setRawSecurityScore(cachedScore);
      setLastUpdate(formatLastUpdate(getGoSafeScoreLastUpdate(destinationId)));
      setLoading(false);
      return;
    }

    // 2. Stale data en attendant le fetch frais
    const staleDims = getStaleDimensionsFromCache(destinationId);
    const staleScore = getStaleGoSafeScoreFromCache(destinationId);
    if (staleDims !== null) {
      setDimensions(staleDims);
      setRawSecurityScore(staleScore ?? Math.round(staleDims.security));
      setLastUpdate(formatLastUpdate(getGoSafeScoreLastUpdate(destinationId)));
    } else if (staleScore !== null) {
      setRawSecurityScore(staleScore);
      setLastUpdate(formatLastUpdate(getGoSafeScoreLastUpdate(destinationId)));
    } else {
      setRawSecurityScore(null);
      setDimensions(null);
      setLastUpdate('Actualisation...');
      setLoading(true);
    }

    // 3. Fetch frais
    try {
      const newScore = await getGoSafeScoreOnDemand(destinationId, forceRefresh);
      const newDims = await getDimensionsOnDemand(destinationId, false);
      if (newDims !== null) setDimensions(newDims);
      if (newScore !== null) {
        setRawSecurityScore(newScore);
        setLastUpdate(formatLastUpdate(getGoSafeScoreLastUpdate(destinationId)));
      } else if (staleScore === null && staleDims === null) {
        setRawSecurityScore(null);
        setLastUpdate('Indisponible');
      }
    } catch (error) {
      console.error('❌ Erreur chargement score:', error);
      if (staleScore === null && staleDims === null) {
        setRawSecurityScore(null);
        setLastUpdate('Indisponible');
      }
    }
    setLoading(false);
  }, [destinationId]);

  useEffect(() => {
    loadScore();
    if (!destinationId) return;
    const unsubScore = subscribeToScoreUpdates((id, score) => {
      if (id === destinationId) {
        setRawSecurityScore(score);
        setLastUpdate(formatLastUpdate(getGoSafeScoreLastUpdate(destinationId)));
        setLoading(false);
      }
    });
    const unsubDims = subscribeToDimensionsUpdate((id, dims) => {
      if (id === destinationId) {
        setDimensions(dims);
      }
    });
    return () => {
      unsubScore();
      unsubDims();
    };
  }, [destinationId, loadScore]);

  useEffect(() => {
    if (!destinationId) return;
    const interval = window.setInterval(() => loadScore(true), SCORE_REFRESH_INTERVAL);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadScore(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [destinationId, loadScore]);

  // ─── Calcul du Lokascore modulé par profil ───
  // Si on a les 4 dimensions → on applique la matrice de pondération profil.
  // Sinon (fallback MVP) → on retourne juste le security score brut.
  const score = useMemo<number | null>(() => {
    if (dimensions) return computeLokascore(dimensions, profile);
    return rawSecurityScore;
  }, [dimensions, rawSecurityScore, profile]);

  const level = useMemo(() => getLokascoreLevel(score), [score]);
  const safetyLevel = useMemo<LegacySafetyLevel>(() => toLegacySafetyLevel(score), [score]);

  const refresh = useCallback(async () => {
    console.log('🔄 Rafraîchissement manuel du Lokascore...');
    if (!destinationId) return;
    setLoading(true);
    await loadScore(true);
  }, [destinationId, loadScore]);

  return {
    score,
    safetyLevel,
    level,
    loading,
    lastUpdate,
    refresh,
    dimensions,
    rawSecurityScore,
  };
}

/**
 * Hook pour initialiser le cache au démarrage de l'application
 * À appeler une seule fois dans App.tsx
 */
export function useGoSafeCacheInitializer() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      setIsReady(true);
      return;
    }
    console.log('🌟 Page ouverte - Initialisation du cache Lokascore...');
    const initialize = async () => {
      try {
        await initializeGoSafeScoresCache();
        isInitialized = true;
        setIsReady(true);
        console.log('✅ Cache Lokascore actualisé avec succès');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du cache:', error);
        setIsReady(true);
      }
    };
    initialize();
  }, []);

  return { isReady, isCacheRecent: isCacheRecent() };
}
