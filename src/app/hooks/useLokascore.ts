/**
 * useLokascore (Lokascore) — hook unifié de score de sécurité
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
  getLokascoreFromCache,
  getLokascoreLastUpdate,
  getLokascoreOnDemand,
  getStaleLokascoreFromCache,
  getDimensionsFromCache,
  getStaleDimensionsFromCache,
  getDimensionsOnDemand,
  getSourceTraceFromCache,
  initializeLokascoresCache,
  isCacheRecent,
  subscribeToScoreUpdates,
  subscribeToDimensionsUpdate,
} from '../services/lokascoreUpdateService';
import {
  computeLokascore,
  getLokascoreLevel,
  toLegacySafetyLevel,
  type LokascoreDimensions,
  type LokascoreLevelConfig,
  type LegacySafetyLevel,
} from '../lib/lokascore';
import type { LokascoreSourceTrace } from '../lib/lokascoreSources';
import { useTravelProfile } from '../context/TravelProfileContext';

interface UseLokascoreResult {
  /** Lokascore composite modulé par profil (rétro-compat avec ancien Lokascore) */
  score: number | null;
  /** Mapping legacy 3-niveaux (rétro-compat) */
  safetyLevel: LegacySafetyLevel;
  /** Niveau Lokascore officiel 5-tiers (couleur, label, description, plage) */
  level: LokascoreLevelConfig;
  /** Trace des sources officielles utilisées (Phase 3) — null tant que pas chargé */
  sourceTrace: LokascoreSourceTrace | null;
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

export function useLokascore(destinationId: string | undefined): UseLokascoreResult {
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
    const cachedScore = forceRefresh ? null : getLokascoreFromCache(destinationId);
    if (cachedDims !== null) {
      setDimensions(cachedDims);
      setRawSecurityScore(cachedScore ?? Math.round(cachedDims.security));
      setLastUpdate(formatLastUpdate(getLokascoreLastUpdate(destinationId)));
      setLoading(false);
      return;
    }
    if (cachedScore !== null) {
      setRawSecurityScore(cachedScore);
      setLastUpdate(formatLastUpdate(getLokascoreLastUpdate(destinationId)));
      setLoading(false);
      return;
    }

    // 2. Stale data en attendant le fetch frais
    const staleDims = getStaleDimensionsFromCache(destinationId);
    const staleScore = getStaleLokascoreFromCache(destinationId);
    if (staleDims !== null) {
      setDimensions(staleDims);
      setRawSecurityScore(staleScore ?? Math.round(staleDims.security));
      setLastUpdate(formatLastUpdate(getLokascoreLastUpdate(destinationId)));
    } else if (staleScore !== null) {
      setRawSecurityScore(staleScore);
      setLastUpdate(formatLastUpdate(getLokascoreLastUpdate(destinationId)));
    } else {
      setRawSecurityScore(null);
      setDimensions(null);
      setLastUpdate('Actualisation...');
      setLoading(true);
    }

    // 3. Fetch frais — un seul appel, qui remplit dimensionsCache (effet de bord
    // de fetchLokascoreForDestination). getDimensionsOnDemand lit le cache et
    // déclenche un re-fetch seulement si nécessaire.
    try {
      const newScore = await getLokascoreOnDemand(destinationId, forceRefresh);
      const newDims = await getDimensionsOnDemand(destinationId, false);
      if (newDims !== null) setDimensions(newDims);
      if (newScore !== null) {
        setRawSecurityScore(newScore);
        setLastUpdate(formatLastUpdate(getLokascoreLastUpdate(destinationId) ?? Date.now()));
      } else if (newDims !== null) {
        // Pas de score Numbeo mais on a les dimensions officielles : OK, affichage live
        setLastUpdate(formatLastUpdate(Date.now()));
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
        setLastUpdate(formatLastUpdate(getLokascoreLastUpdate(destinationId)));
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

  // Trace des sources officielles (Phase 3) — re-lu à chaque update du score
  const sourceTrace = useMemo<LokascoreSourceTrace | null>(
    () => (destinationId ? getSourceTraceFromCache(destinationId) : null),
    // dimensions sert de signal de changement (la trace est stockée en même temps)
    [destinationId, dimensions]
  );

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
    sourceTrace,
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
export function useLokascoreCacheInitializer() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      setIsReady(true);
      return;
    }
    console.log('🌟 Page ouverte - Initialisation du cache Lokascore...');
    const initialize = async () => {
      try {
        await initializeLokascoresCache();
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
