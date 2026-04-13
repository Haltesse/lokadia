import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Network connection restored');
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      console.log('⚠️ Network connection lost');
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setShowOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show reconnection message briefly
  useEffect(() => {
    if (isOnline && showOffline === false) {
      const timer = setTimeout(() => {
        setShowOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOffline]);

  if (!showOffline && isOnline) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-5 w-5" />
            <p className="text-sm font-medium">
              Pas de connexion Internet. Vérifiez votre réseau.
            </p>
          </div>
        </div>
      )}

      {/* Reconnection Toast */}
      {isOnline && showOffline && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg animate-slide-down">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            <p className="text-sm font-medium">Connexion rétablie</p>
          </div>
        </div>
      )}
    </>
  );
}
