// Gestionnaire global d'erreurs d'authentification
import { supabase } from './supabase';

export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Message lisible d'une erreur de forme inconnue.
 *
 * Sous `strict`, la liaison d'un `catch` est typée `unknown` : on ne peut pas
 * y lire `.message` sans vérifier. Ce point d'entrée unique évite d'éparpiller
 * ces vérifications, et de retomber sur `any` pour s'en dispenser.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const shape = error as { message?: unknown; error?: unknown };
    if (typeof shape.message === 'string') return shape.message;
    if (typeof shape.error === 'string') return shape.error;
  }
  return '';
}

// Détecter si une erreur est liée à l'authentification
export function isAuthError(error: unknown): boolean {
  if (!error) return false;

  const errorString = errorMessage(error).toLowerCase();
  
  // Liste des messages d'erreur liés à l'authentification
  const authErrorPatterns = [
    'refresh_token_not_found',
    'invalid refresh token',
    'refresh token not found',
    'jwt expired',
    'token expired',
    'invalid jwt',
    'unauthorized',
    'not authenticated',
    'session not found',
    'invalid session',
  ];
  
  return authErrorPatterns.some(pattern => errorString.includes(pattern));
}

// Gérer une erreur d'authentification
export async function handleAuthError(error: unknown) {
  console.error('🚨 Auth error detected:', errorMessage(error) || error);
  
  if (isAuthError(error)) {
    console.log('🧹 Clearing invalid session...');
    
    try {
      // Forcer la déconnexion
      await supabase.auth.signOut();
      
      // Nettoyer le localStorage manuellement si nécessaire
      try {
        localStorage.removeItem('lokadia-auth');
      } catch (e) {
        console.warn('Could not clear localStorage:', e);
      }
      
      console.log('✅ Session cleared, user should be signed out');
      
      // Rediriger vers la page de connexion si on est pas déjà dessus
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } catch (signOutError) {
      console.error('❌ Error during sign out:', signOutError);
    }
  }
}

// Wrapper pour les appels API qui gère automatiquement les erreurs d'auth
export async function withAuthErrorHandling<T>(
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    if (isAuthError(error)) {
      await handleAuthError(error);
      throw new AuthError('Session expired. Please sign in again.', 'SESSION_EXPIRED');
    }
    throw error;
  }
}
