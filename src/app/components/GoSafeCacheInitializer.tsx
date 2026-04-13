import { useEffect } from 'react';
import { useGoSafeCacheInitializer } from '../hooks/useGoSafeScore';

/**
 * Composant qui initialise le cache GoSafe au démarrage
 * Les scores sont maintenant chargés à la demande, pas au démarrage
 */
export function GoSafeCacheInitializer() {
  const { isReady } = useGoSafeCacheInitializer();

  useEffect(() => {
    if (isReady) {
      console.log('✅ Système GoSafe Index prêt (chargement à la demande)');
    }
  }, [isReady]);

  // Pas d'UI - les scores se chargent quand on ouvre une destination
  return null;
}
