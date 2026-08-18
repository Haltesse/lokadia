import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  disablePush,
  enablePush,
  isPushEnabled,
  listWatched,
  pushSupported,
  unwatchDestination,
  watchDestination,
} from '../lib/watchlist';

/**
 * Suivre une destination, et éventuellement être prévenu.
 *
 * Deux opt-in distincts, volontairement : suivre une destination
 * (bénéfique même sans notification, la liste est consultable) puis, si on
 * le souhaite, recevoir une alerte sur l'appareil. Grouper les deux
 * reviendrait à arracher une permission de notification en échange d'un
 * marque-page.
 */
export function WatchDestinationButton({
  destinationId,
  label,
  countryIso,
}: {
  destinationId: string;
  label: string;
  countryIso?: string | null;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [watched, setWatched] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const list = await listWatched();
      setWatched(list.some((item) => item.destinationId === destinationId));
      setPushOn(await isPushEnabled());
    } catch {
      // Hors connexion : on laisse l'état par défaut plutôt que d'afficher
      // une erreur pour un bouton secondaire.
    }
  }, [destinationId, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function toggleWatch() {
    if (!user) {
      navigate('/login');
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      if (watched) {
        await unwatchDestination(destinationId);
        setWatched(false);
      } else {
        await watchDestination({ destinationId, label, countryIso });
        setWatched(true);
        setMessage(
          "Destination suivie. Vous serez prévenu·e si son niveau de sécurité change — et seulement dans ce cas.",
        );
      }
    } catch {
      setMessage("Impossible d'enregistrer pour le moment. Réessayez dans un instant.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePush() {
    setBusy(true);
    setMessage(null);
    try {
      if (pushOn) {
        await disablePush();
        setPushOn(false);
        setMessage('Notifications désactivées sur cet appareil.');
        return;
      }
      const outcome = await enablePush();
      if (outcome === 'enabled') {
        setPushOn(true);
        setMessage('Notifications activées sur cet appareil.');
      } else if (outcome === 'denied') {
        setMessage(
          "Votre navigateur a refusé les notifications. Vos destinations suivies restent consultables dans l'application.",
        );
      } else {
        setMessage("Cet appareil ne prend pas en charge les notifications web.");
      }
    } catch {
      setMessage("Impossible de modifier les notifications pour le moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void toggleWatch()}
          disabled={busy}
          className="lk-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-60"
          style={
            watched
              ? { background: 'var(--lokadia-primary)', color: 'white' }
              : {
                  background: 'var(--lokadia-surface)',
                  color: 'var(--lokadia-primary)',
                  border: '1px solid var(--lokadia-gray-200)',
                }
          }
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
          {watched ? 'Destination suivie' : 'Suivre cette destination'}
        </button>

        {watched && pushSupported() && (
          <button
            type="button"
            onClick={() => void togglePush()}
            disabled={busy}
            className="lk-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            style={{
              background: 'var(--lokadia-surface)',
              color: 'var(--lokadia-gray-700)',
              border: '1px solid var(--lokadia-gray-200)',
            }}
          >
            {pushOn ? <BellRing size={16} /> : <BellOff size={16} />}
            {pushOn ? 'Notifications activées' : 'Recevoir une notification'}
          </button>
        )}
      </div>

      {message && (
        <p className="text-xs leading-5" role="status" style={{ color: 'var(--lokadia-gray-600)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
