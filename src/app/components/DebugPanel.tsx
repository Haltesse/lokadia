// Panneau de debug pour le développement (à retirer en production)

import { useState } from 'react';
import { Bug, ChevronDown, Database, Trash2, Download } from 'lucide-react';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Afficher uniquement en développement
  if (import.meta.env.PROD) {
    return null;
  }

  const handleCreateDemo = async () => {
    try {
      const { createDemoAccount } = await import('../lib/demo');
      await createDemoAccount();
      setMessage('Compte démo créé ! Rechargez la page et connectez-vous avec demo@lokadia.com / demo123');
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`);
    }
  };

  const handleGetStats = async () => {
    try {
      const { getDatabaseStats } = await import('../lib/demo');
      const dbStats = await getDatabaseStats();
      console.log('Stats:', dbStats);
      setMessage(`${dbStats.users} users, ${dbStats.trips} trips, ${dbStats.favorites} favs`);
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Supprimer TOUTES les données ? Action irréversible !')) {
      return;
    }

    try {
      const { clearDatabase } = await import('../lib/demo');
      await clearDatabase();
      setMessage('Base de données effacée ! Rechargez la page.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      setMessage(`Erreur: ${error.message}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
          title="Debug Panel"
        >
          <Bug className="size-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-80 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-purple-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="size-5" />
              <h3 className="font-bold">Debug Panel</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-purple-700 p-1 rounded transition-colors"
            >
              <ChevronDown className="size-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1">
            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleCreateDemo}
                className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Créer Compte Démo
              </button>

              <button
                onClick={handleGetStats}
                className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Database className="size-4" />
                Stats DB (Console)
              </button>

              <button
                onClick={handleClearAll}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="size-4" />
                Effacer Tout
              </button>
            </div>

            {/* Message */}
            {message && (
              <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-700 break-words">
                {message}
              </div>
            )}

            {/* Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Backend Local • IndexedDB
              </p>
              <p className="text-xs text-gray-400 text-center mt-1">
                Démo: demo@lokadia.com / demo123
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
