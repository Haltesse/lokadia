/**
 * useLokascore — hook de score de sécurité.
 *
 * Le calcul (formule, pondérations, matrice profil, dataset curé) est
 * désormais ENTIÈREMENT côté serveur (Edge Function `lokascore-compute`).
 * Ce hook ne fait qu'appeler l'API et exposer le résultat à l'UI.
 * Aucune pondération ni formule ne réside dans le bundle JS.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getLokascoreLevel,
  toLegacySafetyLevel,
  type LokascoreDimensions,
  type LokascoreLevelConfig,
  type LegacySafetyLevel,
} from '../lib/lokascore';
import { fetchLokascore, getCachedLokascore } from '../lib/lokascoreApi';
import { getAlertsForCountry, type LiveAlert } from '../lib/liveAlertsService';
import { DESTINATION_TO_COUNTRY_ISO } from '../data/countryRiskData';
import { useTravelProfile } from '../context/TravelProfileContext';

/** Sources par dimension (noms uniquement — pas de valeurs/poids) */
export interface DimensionSources {
  security: string[];
  health: string[];
  nature: string[];
  infrastructure: string[];
}

interface UseLokascoreResult {
  score: number | null;
  safetyLevel: LegacySafetyLevel;
  level: LokascoreLevelConfig;
  dimensions: LokascoreDimensions | null;
  sources: DimensionSources | null;
  hasOfficialSource: boolean;
  usedLiveAdvisories: boolean;
  /** Alertes catastrophes live pour le pays (USGS/ReliefWeb, données publiques) */
  liveAlerts: LiveAlert[];
  loading: boolean;
  lastUpdate: string;
  refresh: () => void;
}

const REFRESH_INTERVAL = 10 * 60 * 1000;

function fmt(iso: string | undefined): string {
  if (!iso) return 'Actualisation...';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/**
 * @param destinationId
 * @param opts.live  true sur la fiche destination (advisories temps réel)
 */
export function useLokascore(
  destinationId: string | undefined,
  opts: { live?: boolean } = {}
): UseLokascoreResult {
  const live = opts.live ?? false;
  const { profile } = useTravelProfile();

  const [score, setScore] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState<LokascoreDimensions | null>(null);
  const [sources, setSources] = useState<DimensionSources | null>(null);
  const [hasOfficialSource, setHasOfficialSource] = useState(false);
  const [usedLiveAdvisories, setUsedLiveAdvisories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('Chargement...');

  const load = useCallback(async (forceRefresh = false) => {
    if (!destinationId) {
      setScore(null); setDimensions(null); setSources(null);
      setLastUpdate('Indisponible'); setLoading(false);
      return;
    }

    // 1. Cache synchrone (instantané)
    const cached = getCachedLokascore(destinationId, profile, live);
    if (cached && !forceRefresh) {
      setScore(cached.score);
      setDimensions(cached.dimensions);
      setSources(cached.sources);
      setHasOfficialSource(cached.hasOfficialSource);
      setUsedLiveAdvisories(cached.usedLiveAdvisories);
      setLastUpdate(fmt(cached.lastUpdate));
      setLoading(false);
      // On rafraîchit quand même en arrière-plan si live (advisories peuvent bouger)
      if (!live) return;
    } else {
      setLoading(true);
    }

    // 2. Fetch backend
    const result = await fetchLokascore(destinationId, profile, { live, forceRefresh });
    if (result && result.available) {
      setScore(result.score);
      setDimensions(result.dimensions);
      setSources(result.sources);
      setHasOfficialSource(result.hasOfficialSource);
      setUsedLiveAdvisories(result.usedLiveAdvisories);
      setLastUpdate(fmt(result.lastUpdate));
    } else if (!cached) {
      setScore(null);
      setDimensions(null);
      setSources(null);
      setLastUpdate('Indisponible');
    }
    setLoading(false);
  }, [destinationId, profile, live]);

  useEffect(() => {
    load();
  }, [load]);

  // Rafraîchissement périodique + au retour sur l'onglet
  useEffect(() => {
    if (!destinationId) return;
    const interval = window.setInterval(() => load(true), REFRESH_INTERVAL);
    const onVisible = () => { if (document.visibilityState === 'visible') load(false); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [destinationId, load]);

  const level = useMemo(() => getLokascoreLevel(score), [score]);
  const safetyLevel = useMemo<LegacySafetyLevel>(() => toLegacySafetyLevel(score), [score]);

  // Alertes live pour le pays (données publiques, côté client — pour l'UI détail)
  const liveAlerts = useMemo<LiveAlert[]>(() => {
    if (!destinationId) return [];
    const iso = DESTINATION_TO_COUNTRY_ISO[destinationId];
    return iso ? getAlertsForCountry(iso) : [];
  }, [destinationId, score]);

  const refresh = useCallback(() => {
    if (!destinationId) return;
    setLoading(true);
    load(true);
  }, [destinationId, load]);

  return {
    score, safetyLevel, level, dimensions, sources,
    hasOfficialSource, usedLiveAdvisories, liveAlerts,
    loading, lastUpdate, refresh,
  };
}

/**
 * Initialise les systèmes au démarrage de l'app (alertes live publiques).
 * Le calcul des scores est désormais entièrement côté serveur.
 */
export function useLokascoreCacheInitializer() {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    setIsReady(true);
  }, []);
  return { isReady, isCacheRecent: true };
}
