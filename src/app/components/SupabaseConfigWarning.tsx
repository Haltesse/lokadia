import { AlertTriangle, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { useState } from 'react';

export function SupabaseConfigWarning() {
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('supabase_warning_dismissed') === 'true';
  });

  if (isSupabaseConfigured || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    localStorage.setItem('supabase_warning_dismissed', 'true');
    setIsDismissed(true);
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] p-4"
      style={{ background: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-4 text-white">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
          
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              Supabase non configuré
            </h3>
            <p className="text-sm opacity-90 mb-3">
              L'application utilise actuellement un mode local. Pour déployer en ligne, 
              vous devez configurer Supabase.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-medium text-sm hover:bg-red-50 transition-colors"
              >
                <ExternalLink size={16} />
                Créer un projet Supabase
              </a>
              
              <button
                onClick={() => {
                  const guide = document.createElement('a');
                  guide.href = '/MIGRATION-GUIDE.md';
                  guide.download = 'MIGRATION-GUIDE.md';
                  guide.click();
                }}
                className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium text-sm hover:bg-white/30 transition-colors backdrop-blur-sm"
              >
                Télécharger le guide
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-transparent border border-white/50 text-white rounded-lg font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Masquer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
