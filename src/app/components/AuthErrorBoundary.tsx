// Boundary qui capture les erreurs d'authentification
import { Component, ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { handleAuthError, isAuthError } from '../lib/authErrorHandler';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Mettre à jour l'état pour afficher l'UI de secours au prochain rendu
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ Error caught by AuthErrorBoundary:', error, errorInfo);
    
    // Si c'est une erreur d'authentification, la gérer
    if (isAuthError(error)) {
      handleAuthError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
            <div className="mb-4"><Lock className="w-16 h-16 mx-auto text-gray-400" /></div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--lokadia-deep-blue)' }}>
              Session expirée
            </h1>
            <p className="text-gray-600 mb-6">
              Votre session a expiré. Veuillez vous reconnecter pour continuer.
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full py-3 px-6 rounded-xl font-semibold text-white"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Se reconnecter
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
