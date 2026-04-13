import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { isAuthError, handleAuthError } from '../lib/authErrorHandler';
import { useGlobalAuthErrorHandler } from '../hooks/useGlobalAuthErrorHandler';

// Interface utilisateur simplifiée
interface User {
  id: string;
  email: string;
  name: string;
  photo?: string;
  isPremium: boolean;
  premiumExpiry: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Activer la gestion globale des erreurs d'auth
  useGlobalAuthErrorHandler();

  // Initialiser l'authentification au montage
  useEffect(() => {
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║       🔧 INIT AUTH CONTEXT                      ║');
    console.log('╚══════════════════════════════════════════════════╝');
    
    // Initialiser immédiatement
    initializeAuth();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log(`\n🔄 Auth State Change: ${event}`);
        
        // Gérer les erreurs de token
        if (event === 'TOKEN_REFRESHED' && !newSession) {
          console.log('⚠️  Token refresh failed, signing out...');
          setUser(null);
          setSession(null);
          return;
        }
        
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          console.log('✅ User signed in, fetching profile...');
          await fetchUserProfile(newSession);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          console.log('🔄 Token refreshed');
          // On garde le profil actuel, pas besoin de le recharger
        } else if (event === 'USER_UPDATED' && newSession?.user) {
          console.log('📝 User updated');
          await fetchUserProfile(newSession);
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  async function initializeAuth() {
    try {
      console.log('🔍 Checking for existing session...');
      
      const { data: { session: existingSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error.message);
        
        // Utiliser le gestionnaire d'erreurs centralisé
        if (isAuthError(error)) {
          await handleAuthError(error);
        }
        
        setIsLoading(false);
        return;
      }

      if (existingSession?.user) {
        console.log('✅ Found existing session for:', existingSession.user.email);
        setSession(existingSession);
        await fetchUserProfile(existingSession);
      } else {
        console.log('ℹ️  No existing session found');
      }
    } catch (error: any) {
      console.error('❌ Init auth error:', error.message);
      
      // Utiliser le gestionnaire d'erreurs centralisé
      if (isAuthError(error)) {
        await handleAuthError(error);
        setUser(null);
        setSession(null);
      }
    } finally {
      setIsLoading(false);
      console.log('✅ Auth initialization complete\n');
    }
  }

  // Récupérer le profil utilisateur depuis le backend KV store
  async function fetchUserProfile(session: Session) {
    try {
      console.log('📥 Fetching user profile from backend...');
      console.log('   User ID:', session.user.id);
      console.log('   Email:', session.user.email);
      
      // ⚠️ FALLBACK MODE: Backend non disponible, créer profil par défaut
      console.log('⚠️  Backend not available, creating default profile...');
      const defaultUser: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Utilisateur',
        photo: session.user.user_metadata?.avatar_url || undefined,
        isPremium: false,
        premiumExpiry: '',
      };
      setUser(defaultUser);
      console.log('✅ Default profile created:', defaultUser.name);
      return;
      
      /* CODE COMMENTÉ - Backend non disponible
      console.log('   Token (first 50 chars):', session.access_token.substring(0, 50) + '...');
      
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7fc9da76`;
      
      console.log('🔄 Calling:', `${serverUrl}/auth/me`);
      
      const response = await fetch(`${serverUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }).catch(error => {
        // Gérer les erreurs réseau
        console.error('❌ Network error fetching profile:', error);
        throw error;
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Si le profil n'existe pas, créer un profil par défaut (ne pas logger comme erreur)
        if (response.status === 401 || errorData.code === 'USER_NOT_FOUND') {
          console.log('⚠️  Profile not found, creating default profile for user...');
          const defaultUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Utilisateur',
            photo: session.user.user_metadata?.avatar_url || undefined,
            isPremium: false,
            premiumExpiry: '',
          };
          setUser(defaultUser);
          console.log('✅ Default profile created:', defaultUser.name);
          return;
        }
        
        // Si c'est une autre erreur, la logger et la throw
        console.error('❌ Failed to fetch profile:', response.status, errorData);
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      console.log('📦 Profile data received:', data);
      
      if (data.success && data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          photo: data.user.photo,
          isPremium: data.user.isPremium || false,
          premiumExpiry: data.user.premiumExpiry || '',
        };
        
        setUser(userData);
        console.log('✅ Profile loaded successfully:', userData.name);
      } else {
        console.error('❌ Invalid profile data:', data);
        throw new Error('Invalid profile data');
      }
      */
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error.message);
      
      // Créer un profil par défaut si erreur
      console.log('⚠️  Fallback: creating minimal profile...');
      const fallbackUser: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Utilisateur',
        photo: session.user.user_metadata?.avatar_url || undefined,
        isPremium: false,
        premiumExpiry: '',
      };
      setUser(fallbackUser);
      console.log('✅ Fallback profile created:', fallbackUser.name);
    }
  }

  // Inscription
  async function signUp(email: string, password: string, name: string) {
    try {
      console.log('\n╔══════════════════════════════════════════════════╗');
      console.log('║       📝 SIGN UP                                 ║');
      console.log('╚══════════════════════════════════════════════════╝');
      console.log('📧 Email:', email);
      console.log('👤 Name:', name);
      
      // ⚠️ MODE SIMPLIFIÉ: Créer le compte directement via Supabase Auth
      console.log('🔄 Creating user account via Supabase Auth...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      }).catch(err => {
        console.error('❌ Network error during sign up:', err);
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      });

      if (signUpError) {
        console.error('❌ Signup failed:', signUpError);
        
        // Gestion des erreurs spécifiques
        if (signUpError.message.includes('User already registered')) {
          throw new Error('Un compte existe déjà avec cet email');
        }
        
        throw new Error(signUpError.message || 'Erreur lors de l\'inscription');
      }

      if (!signUpData.user) {
        throw new Error('Erreur lors de la création du compte');
      }

      console.log('✅ User account created:', signUpData.user.email);

      // Étape 2: Se connecter immédiatement (auto-confirm activé)
      console.log('🔄 Signing in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Sign in after signup failed:', signInError);
        throw new Error('Compte créé mais erreur de connexion. Essayez de vous connecter.');
      }

      if (signInData.session) {
        console.log('✅ Signed in successfully');
        setSession(signInData.session);
        await fetchUserProfile(signInData.session);
      }

      console.log('✅ Sign up complete!\n');
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      
      // Gérer les erreurs de type "Failed to fetch"
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  }

  // Connexion
  async function signIn(email: string, password: string) {
    try {
      console.log('\n╔══════════════════════════════════════════════════╗');
      console.log('║       🔐 SIGN IN                                 ║');
      console.log('╚══════════════════════════════════════════════════╝');
      console.log('📧 Email:', email);
      console.log('🔑 Password length:', password.length);
      
      // Connexion via Supabase Auth
      console.log('🔄 Authenticating with Supabase...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }).catch(err => {
        console.error('❌ Network error during sign in:', err);
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      });

      if (error) {
        console.error('❌ Auth error:', error.message);
        console.error('   Status:', error.status);
        
        // Messages d'erreur personnalisés
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email non confirmé');
        }
        
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        console.error('❌ No session returned');
        throw new Error('Erreur de connexion');
      }

      console.log('✅ Authenticated successfully:', data.user.email);
      console.log('🎫 Access token:', data.session.access_token.substring(0, 20) + '...');
      
      // Récupérer le profil
      setSession(data.session);
      await fetchUserProfile(data.session);
      
      console.log('✅ Sign in complete!\n');
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      
      // Gérer les erreurs de type "Failed to fetch"
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
      }
      
      throw error;
    }
  }

  // Déconnexion
  async function signOut() {
    try {
      console.log('\n╔══════════════════════════════════════════════════╗');
      console.log('║       👋 SIGN OUT                                ║');
      console.log('╚══════════════════════════════════════════════════╝');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error.message);
        throw error;
      }

      setUser(null);
      setSession(null);
      console.log('✅ Signed out successfully\n');
    } catch (error: any) {
      console.error('❌ Sign out error:', error.message);
      throw error;
    }
  }

  // Rafraîchir l'utilisateur
  async function refreshUser() {
    if (!session) {
      console.warn('⚠️  Cannot refresh user: no session');
      return;
    }

    try {
      console.log('🔄 Refreshing user profile...');
      await fetchUserProfile(session);
    } catch (error: any) {
      console.error('❌ Refresh user error:', error.message);
    }
  }

  // Mettre à jour le profil
  async function updateProfile(updates: Partial<User>) {
    if (!user || !session) {
      throw new Error('Non authentifié');
    }

    try {
      console.log('📝 Updating profile locally...');
      
      // ⚠️ MODE SIMPLIFIÉ: Mettre à jour le profil localement uniquement
      // Note: Cette mise à jour ne persistera pas dans le backend
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      
      setUser(updatedUser);
      console.log('✅ Profile updated locally:', updatedUser.name);
      
      /* CODE COMMENTÉ - Backend non disponible
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7fc9da76`;
      
      const response = await fetch(`${serverUrl}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Update failed:', data);
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      if (data.success && data.profile) {
        setUser({
          id: user.id,
          email: user.email,
          name: data.profile.name || user.name,
          photo: data.profile.photo || user.photo,
          isPremium: data.profile.isPremium || user.isPremium,
          premiumExpiry: data.profile.premiumExpiry || user.premiumExpiry,
        });
        console.log('✅ Profile updated successfully');
      }
      */
    } catch (error: any) {
      console.error('❌ Update profile error:', error.message);
      throw error;
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !!session,
    session,
    signIn,
    signUp,
    signOut,
    refreshUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}