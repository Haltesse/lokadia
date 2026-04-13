// Client Supabase pour Lokadia
import { createClient } from '@supabase/supabase-js';
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
export const supabase = createClient(
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
      // Augmenter le timeout de lock pour éviter les warnings en développement
      lockOptions: {
        acquireTimeout: 10000, // 10 secondes au lieu de 5
        retryInterval: 100,
      },
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

// Types de base de données
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          photo: string | null;
          is_premium: boolean;
          premium_expiry: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          photo?: string | null;
          is_premium?: boolean;
          premium_expiry?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          photo?: string | null;
          is_premium?: boolean;
          premium_expiry?: string;
          updated_at?: string;
        };
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          destination_id: string;
          destination_name: string;
          country_destination_id: string;
          start_date: string;
          end_date: string;
          travelers: number;
          traveler_profile: any | null;
          active_city_destination_id: string | null;
          notes: string | null;
          status: 'planned' | 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          destination_id: string;
          destination_name: string;
          country_destination_id: string;
          start_date: string;
          end_date: string;
          travelers?: number;
          traveler_profile?: any | null;
          active_city_destination_id?: string | null;
          notes?: string | null;
          status?: 'planned' | 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          destination_id?: string;
          destination_name?: string;
          country_destination_id?: string;
          start_date?: string;
          end_date?: string;
          travelers?: number;
          traveler_profile?: any | null;
          active_city_destination_id?: string | null;
          notes?: string | null;
          status?: 'planned' | 'active' | 'completed' | 'cancelled';
          updated_at?: string;
        };
      };
      trip_stops: {
        Row: {
          id: string;
          trip_id: string;
          destination_id: string;
          destination_name: string;
          order_index: number;
          start_date: string | null;
          end_date: string | null;
          notes: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          destination_id: string;
          destination_name: string;
          order_index: number;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          destination_id?: string;
          destination_name?: string;
          order_index?: number;
          start_date?: string | null;
          end_date?: string | null;
          notes?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          updated_at?: string;
        };
      };
      trip_segments: {
        Row: {
          id: string;
          trip_id: string;
          from_stop_id: string;
          to_stop_id: string;
          recommended_mode: string;
          alternatives: any;
          distance_km: number;
          duration_min_estimated: number;
          metadata: any | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          from_stop_id: string;
          to_stop_id: string;
          recommended_mode: string;
          alternatives: any;
          distance_km: number;
          duration_min_estimated: number;
          metadata?: any | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          recommended_mode?: string;
          alternatives?: any;
          distance_km?: number;
          duration_min_estimated?: number;
          metadata?: any | null;
          source?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          destination_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          destination_id: string;
          created_at?: string;
        };
        Update: {};
      };
      followed_tips: {
        Row: {
          id: string;
          user_id: string;
          tip_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tip_id: string;
          created_at?: string;
        };
        Update: {};
      };
      checklist_items: {
        Row: {
          id: string;
          user_id: string;
          trip_id: string | null;
          title: string;
          category: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trip_id?: string | null;
          title: string;
          category: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          category?: string;
          completed?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}