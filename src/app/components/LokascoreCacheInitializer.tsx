import { useEffect } from 'react';
import { useLokascoreCacheInitializer } from '../hooks/useLokascore';

/**
 * Initialise le cache Lokascore au démarrage de l'application.
 * Les scores sont chargés à la demande (lazy) et persistés en sessionStorage.
 */
export function LokascoreCacheInitializer() {
  const { isReady } = useLokascoreCacheInitializer();

  useEffect(() => {
    if (isReady) {
      console.log('✅ Système Lokascore prêt (chargement à la demande, 4 dimensions + modulation profil)');
    }
  }, [isReady]);

  return null;
}
