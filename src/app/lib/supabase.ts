// Client Supabase pour Lokadia
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

// Variables d'environnement Supabase (avec fallback sur les valeurs auto-configurées)
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Vérifier que les variables d'environnement Supabase sont configurées
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key');

// Custom storage adapter sécurisé qui évite les problèmes de concurrence
const customStorage = {
  getItem: (key: string): string | null => {
    if (!isSupabaseConfigured) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Erreur lors de la lecture du localStorage:', error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isSupabaseConfigured) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Erreur lors de l\'écriture dans le localStorage:', error);
    }
  },
  removeItem: (key: string): void => {
    if (!isSupabaseConfigured) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Erreur lors de la suppression du localStorage:', error);
    }
  },
};

// Créer le client Supabase avec des valeurs par défaut si non configuré
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'lokadia-auth',
      flowType: 'pkce',
      storage: customStorage,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'lokadia-mobile',
      },
    },
  }
);

// Le type Database est généré depuis le schéma réel :
// npm run gen:types  →  src/app/lib/database.types.ts
export type { Database } from './database.types';
