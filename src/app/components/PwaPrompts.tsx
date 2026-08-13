import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, X } from 'lucide-react';

/**
 * PwaPrompts — installation sur l'écran d'accueil et mise à jour de l'app.
 *
 * Deux invites discrètes, jamais intrusives :
 *  · Installation — proposée une seule fois, refusable définitivement.
 *  · Mise à jour — l'utilisateur décide quand recharger (registerType:
 *    'prompt'), pour ne jamais interrompre une préparation de voyage
 *    en cours.
 */

const DISMISS_KEY = 'lokadia_install_dismissed';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaPrompts() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      if (import.meta.env.DEV) console.warn('Service worker non enregistré:', error);
    },
  });

  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      // Stockage indisponible : on ne propose pas l'installation plutôt que
      // de risquer de la reproposer à chaque visite
      dismissed = true;
    }
    if (dismissed) return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function dismissInstall() {
    setInstallEvent(null);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Sans stockage, l'invite réapparaîtra : acceptable, elle reste discrète
    }
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    dismissInstall();
  }

  // ─── Mise à jour disponible ───
  if (needRefresh) {
    return (
      <div
        role="status"
        className="fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-2xl bg-white p-4 lk-fade-in-up md:bottom-6"
        style={{ boxShadow: 'var(--shadow-xl)', border: '1px solid var(--lokadia-gray-100)' }}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(15,76,129,0.08)' }}>
            <RefreshCw size={16} style={{ color: 'var(--lokadia-primary)' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              Nouvelle version disponible
            </p>
            <p className="mt-0.5 text-xs leading-snug" style={{ color: 'var(--lokadia-gray-600)' }}>
              Rechargez quand vous voulez : votre navigation en cours est conservée.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => updateServiceWorker(true)}
                className="rounded-xl px-3.5 py-2 text-xs font-bold text-white"
                style={{ background: 'var(--lokadia-primary)' }}
              >
                Mettre à jour
              </button>
              <button
                onClick={() => setNeedRefresh(false)}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold"
                style={{ color: 'var(--lokadia-gray-600)' }}
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Installation ───
  if (!installEvent) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md rounded-2xl bg-white p-4 lk-fade-in-up md:bottom-6"
      style={{ boxShadow: 'var(--shadow-xl)', border: '1px solid var(--lokadia-gray-100)' }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(15,76,129,0.08)' }}>
          <Download size={16} style={{ color: 'var(--lokadia-primary)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            Installer Lokadia
          </p>
          <p className="mt-0.5 text-xs leading-snug" style={{ color: 'var(--lokadia-gray-600)' }}>
            Accédez à vos voyages et aux informations de sécurité même sans réseau,
            depuis votre écran d'accueil.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={install}
              className="rounded-xl px-3.5 py-2 text-xs font-bold text-white"
              style={{ background: 'var(--lokadia-primary)' }}
            >
              Installer
            </button>
            <button
              onClick={dismissInstall}
              className="rounded-xl px-3.5 py-2 text-xs font-semibold"
              style={{ color: 'var(--lokadia-gray-600)' }}
            >
              Non merci
            </button>
          </div>
        </div>
        <button onClick={dismissInstall} aria-label="Fermer" className="rounded-lg p-1" style={{ color: 'var(--lokadia-gray-400)' }}>
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
