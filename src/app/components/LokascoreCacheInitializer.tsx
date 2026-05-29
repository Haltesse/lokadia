import { useEffect } from 'react';
import { useLokascoreCacheInitializer } from '../hooks/useLokascore';
import { startLiveAlertsPolling } from '../lib/liveAlertsService';

/**
 * Démarre le polling des alertes live publiques (USGS earthquakes +
 * ReliefWeb disasters) utilisées par la carte mondiale et la bannière.
 * Le calcul des Lokascore est exécuté côté serveur (Edge Function).
 */
export function LokascoreCacheInitializer() {
  const { isReady } = useLokascoreCacheInitializer();

  useEffect(() => {
    if (!isReady) return;
    console.log('✅ Système Lokascore prêt (calcul serveur sécurisé)');
    startLiveAlertsPolling();
  }, [isReady]);

  return null;
}
