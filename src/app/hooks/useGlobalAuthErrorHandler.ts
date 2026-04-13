// Hook pour gérer les erreurs d'authentification globalement
import { useEffect } from 'react';
import { handleAuthError, isAuthError } from '../lib/authErrorHandler';

export function useGlobalAuthErrorHandler() {
  useEffect(() => {
    // Gestionnaire global d'erreurs non capturées
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      
      if (isAuthError(error)) {
        console.log('🔴 Global auth error detected:', error.message);
        event.preventDefault(); // Empêcher le log d'erreur par défaut
        handleAuthError(error);
      }
    };

    // Gestionnaire pour les promesses rejetées non capturées
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      if (isAuthError(error)) {
        console.log('🔴 Global unhandled rejection (auth error):', error.message);
        event.preventDefault(); // Empêcher le log d'erreur par défaut
        handleAuthError(error);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}
