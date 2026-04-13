import { CheckCircle2, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { projectId } from '../../../utils/supabase/info';

/**
 * Indicateur de statut Supabase (en bas à gauche)
 * Affiche si la connexion à Supabase est active
 */
export function SupabaseStatus() {
  if (!isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-50">
      <div 
        className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-md"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#06B6D4'
        }}
      >
        <div className="relative">
          <Database size={14} />
          <CheckCircle2 
            size={8} 
            className="absolute -top-1 -right-1 text-green-400" 
            fill="currentColor"
          />
        </div>
        <span className="hidden sm:inline">
          En ligne
        </span>
        <div 
          className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
          style={{ boxShadow: '0 0 8px rgba(74, 222, 128, 0.8)' }}
        />
      </div>
    </div>
  );
}
