import { useNavigate } from 'react-router';
import { Compass, Home, Search } from 'lucide-react';

/**
 * Écran 404 — affiché sur toute URL inconnue (route catch-all).
 */
export function NotFoundScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md lk-fade-in-up">
        <div
          className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: 'var(--lokadia-primary)', boxShadow: 'var(--shadow-lg)' }}
        >
          <Compass className="text-white" size={40} strokeWidth={1.8} />
        </div>

        <p
          className="text-sm font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--lokadia-primary)' }}
        >
          Erreur 404
        </p>
        <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--lokadia-gray-900)' }}>
          Cette page n'existe pas
        </h1>
        <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--lokadia-gray-600)' }}>
          L'adresse est peut-être erronée, ou la page a été déplacée.
          Reprenez votre route depuis l'accueil ou cherchez une destination.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate('/global-home')}
            className="lk-btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'var(--lokadia-primary)' }}
          >
            <Home size={18} />
            Retour à l'accueil
          </button>
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="lk-btn inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border"
            style={{
              color: 'var(--lokadia-primary)',
              borderColor: 'var(--lokadia-gray-200)',
              background: 'var(--lokadia-surface)',
            }}
          >
            <Search size={18} />
            Chercher une destination
          </button>
        </div>
      </div>
    </div>
  );
}
