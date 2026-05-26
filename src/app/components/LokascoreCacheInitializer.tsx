import { useEffect } from 'react';
import { useLokascoreCacheInitializer } from '../hooks/useLokascore';
import {
  startLiveAlertsPolling,
  subscribeToLiveAlerts,
} from '../lib/liveAlertsService';
import { invalidateAllDimensions } from '../services/lokascoreUpdateService';

/**
 * Initialise le cache Lokascore + démarre le polling des alertes live
 * (USGS earthquakes + ReliefWeb disasters).
 */
export function LokascoreCacheInitializer() {
  const { isReady } = useLokascoreCacheInitializer();

  useEffect(() => {
    if (!isReady) return;
    console.log('✅ Système Lokascore prêt (4 dimensions + sources officielles + alertes live)');

    // Démarre le polling des alertes live (USGS + ReliefWeb)
    startLiveAlertsPolling();

    // Quand de nouvelles alertes arrivent, on invalide les dimensions
    // cachées pour forcer un recalcul (avec la pénalité live appliquée).
    const unsub = subscribeToLiveAlerts((snap) => {
      if (snap.byCountry.size > 0) {
        console.log(`🔄 Live alerts mises à jour : invalidation des dimensions pour recalcul`);
        invalidateAllDimensions();
      }
    });

    return () => unsub();
  }, [isReady]);

  return null;
}
