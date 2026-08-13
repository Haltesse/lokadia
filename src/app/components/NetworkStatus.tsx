import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { cacheLastUpdate, formatCaptureDate } from '../lib/offlineCache';

/**
 * NetworkStatus — état de connexion et fraîcheur des données.
 *
 * Contrainte produit : en mode hors-ligne, un indicateur « données du … »
 * est obligatoire. On ne se contente donc pas d'annoncer la coupure : on
 * dit de quand datent les informations que l'utilisateur a sous les yeux,
 * et on resynchronise à la reconnexion.
 */
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [showReconnected, setShowReconnected] = useState(false);
  const [dataDate, setDataDate] = useState<string | null>(null);

  useEffect(() => {
    function refreshDataDate() {
      const last = cacheLastUpdate('lokascore');
      setDataDate(last ? formatCaptureDate(last) : null);
    }

    function handleOnline() {
      setIsOnline(true);
      setShowReconnected(true);
      // Resynchronisation : les hooks refetchent au retour de visibilité,
      // on déclenche donc le même signal pour rafraîchir sans recharger.
      document.dispatchEvent(new Event('visibilitychange'));
    }

    function handleOffline() {
      setIsOnline(false);
      setShowReconnected(false);
      refreshDataDate();
    }

    refreshDataDate();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Le bandeau « connexion rétablie » s'efface tout seul
  useEffect(() => {
    if (!showReconnected) return;
    const timer = window.setTimeout(() => setShowReconnected(false), 3000);
    return () => window.clearTimeout(timer);
  }, [showReconnected]);

  if (isOnline && !showReconnected) return null;

  if (!isOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-50 px-4 py-2.5 text-white safe-top"
        style={{ background: '#B45309' }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 text-center">
          <WifiOff className="h-4 w-4 flex-shrink-0" aria-hidden />
          <p className="text-xs font-semibold leading-snug">
            Hors connexion.{' '}
            {dataDate
              ? `Vous consultez les données enregistrées ${dataDate}.`
              : 'Les destinations déjà consultées restent accessibles.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full px-5 py-2.5 text-white shadow-lg lk-fade-in"
      style={{ background: '#059669' }}
    >
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4" aria-hidden />
        <p className="text-xs font-semibold">Connexion rétablie</p>
        <RefreshCw className="h-3.5 w-3.5 animate-spin" aria-hidden />
      </div>
    </div>
  );
}
