import { useState, useEffect } from 'react';
import { Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface DatabaseStatusProps {
  show?: boolean;
}

export function DatabaseStatus({ show = false }: DatabaseStatusProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbType, setDbType] = useState<string>('');
  const [responseTime, setResponseTime] = useState<number>(0);

  useEffect(() => {
    if (show) {
      checkDatabaseConnection();
    }
  }, [show]);

  const checkDatabaseConnection = async () => {
    try {
      const startTime = Date.now();
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-7fc9da76`;
      
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const endTime = Date.now();
      
      if (response.ok && data.status === 'ok') {
        setStatus('connected');
        setDbType(data.database || 'PostgreSQL');
        setResponseTime(endTime - startTime);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Database health check failed:', error);
      setStatus('error');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white rounded-2xl shadow-lg border border-gray-200 p-4 min-w-[280px]">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${
          status === 'connected' ? 'bg-emerald-50' :
          status === 'error' ? 'bg-red-50' :
          'bg-blue-50'
        }`}>
          {status === 'checking' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          {status === 'connected' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-[#0F4C81]" />
            <span className="font-semibold text-sm text-gray-900">
              {status === 'checking' && 'Connexion...'}
              {status === 'connected' && 'Base de données'}
              {status === 'error' && 'Erreur connexion'}
            </span>
          </div>
          
          {status === 'connected' && (
            <div className="space-y-1">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Type:</span> {dbType}
              </div>
              <div className="text-xs text-gray-600">
                <span className="font-medium">Ping:</span> {responseTime}ms
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-2">
                ✓ PostgreSQL actif
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-xs text-red-600">
              Impossible de se connecter à la base de données
            </div>
          )}
          
          {status === 'checking' && (
            <div className="text-xs text-gray-500">
              Vérification du serveur...
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={checkDatabaseConnection}
        disabled={status === 'checking'}
        className="mt-3 w-full py-1.5 px-3 text-xs font-medium text-[#0F4C81] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Rafraîchir
      </button>
    </div>
  );
}
