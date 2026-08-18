import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Loader2, MapPin, RefreshCw, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  listAlerts,
  listWatched,
  markAlertRead,
  scanNow,
  unwatchDestination,
  type TravelerAlert,
  type WatchedDestination,
} from '../lib/watchlist';

/**
 * Destinations suivies et alertes personnelles.
 *
 * Le premier passage sur une destination ne produit aucune alerte : il
 * pose la référence de comparaison. C'est écrit à l'écran, parce qu'une
 * liste vide après un « Vérifier maintenant » ressemble sinon à une panne
 * alors que c'est le fonctionnement normal — et attendu.
 */

const SEVERITY_STYLE = {
  urgent: { bg: 'var(--lokadia-danger-bg)', color: 'var(--lokadia-danger)', label: 'Urgent' },
  vigilance: { bg: 'var(--lokadia-warning-bg)', color: '#B45309', label: 'Vigilance' },
  info: { bg: 'var(--lokadia-info-bg)', color: 'var(--lokadia-primary)', label: 'Info' },
} as const;

export function WatchedDestinations() {
  const { user } = useAuth();
  const [watched, setWatched] = useState<WatchedDestination[]>([]);
  const [alerts, setAlerts] = useState<TravelerAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [list, alertList] = await Promise.all([listWatched(), listAlerts()]);
      setWatched(list);
      setAlerts(alertList);
    } catch {
      setMessage('Liste indisponible hors connexion.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleScan() {
    setScanning(true);
    setMessage(null);
    try {
      const result = await scanNow();
      setMessage(
        result.alerts_created > 0
          ? `${result.alerts_created} changement(s) détecté(s).`
          : `${result.destinations} destination(s) vérifiée(s) : rien de nouveau. Une première vérification enregistre l'état de référence sans alerter.`,
      );
      await refresh();
    } catch {
      setMessage('Vérification impossible pour le moment.');
    } finally {
      setScanning(false);
    }
  }

  async function handleUnwatch(destinationId: string) {
    await unwatchDestination(destinationId);
    setWatched((list) => list.filter((item) => item.destinationId !== destinationId));
  }

  async function handleRead(id: string) {
    await markAlertRead(id);
    setAlerts((list) => list.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }

  if (!user) {
    return (
      <section
        className="rounded-2xl p-5"
        style={{ background: 'var(--lokadia-info-bg)', border: '1px solid var(--lokadia-gray-100)' }}
      >
        <h2 className="flex items-center gap-2 font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          <Bell size={18} style={{ color: 'var(--lokadia-primary)' }} />
          Suivre une destination
        </h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
          Avec un compte, vous pouvez suivre des destinations et être prévenu·e
          uniquement lorsque leur niveau de sécurité change réellement.
        </p>
        <Link
          to="/login"
          className="lk-btn mt-3 inline-flex rounded-xl px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: 'var(--lokadia-primary)' }}
        >
          Se connecter
        </Link>
      </section>
    );
  }

  const unread = alerts.filter((a) => !a.read);

  return (
    <section
      className="rounded-2xl bg-white p-5"
      style={{ border: '1px solid var(--lokadia-gray-100)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          <Bell size={18} style={{ color: 'var(--lokadia-primary)' }} />
          Mes destinations suivies
          {unread.length > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ background: 'var(--lokadia-danger)' }}
            >
              {unread.length}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={() => void handleScan()}
          disabled={scanning || watched.length === 0}
          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50"
          style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}
        >
          {scanning ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Vérifier maintenant
        </button>
      </div>

      {loading ? (
        <p className="mt-3 text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
          Chargement…
        </p>
      ) : watched.length === 0 ? (
        <p className="mt-3 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
          Aucune destination suivie. Depuis une fiche destination, « Suivre cette
          destination » vous prévient si son niveau de sécurité change — et
          seulement dans ce cas.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {watched.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
              style={{ borderColor: 'var(--lokadia-gray-100)' }}
            >
              <Link
                to={`/destination/${item.destinationId}`}
                className="flex min-w-0 items-center gap-2 text-sm font-semibold"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                <MapPin size={15} style={{ color: 'var(--lokadia-primary)' }} />
                <span className="truncate">{item.label}</span>
              </Link>
              <button
                type="button"
                onClick={() => void handleUnwatch(item.destinationId)}
                aria-label={`Ne plus suivre ${item.label}`}
                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <Trash2 size={15} style={{ color: 'var(--lokadia-gray-500)' }} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {alerts.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            Changements signalés
          </h3>
          <ul className="mt-2 space-y-2">
            {alerts.map((alert) => {
              const style = SEVERITY_STYLE[alert.severity];
              return (
                <li
                  key={alert.id}
                  className="rounded-xl p-4"
                  style={{ background: style.bg, opacity: alert.read ? 0.65 : 1 }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: style.color }}>
                        {style.label} · {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="mt-1 text-sm leading-6" style={{ color: 'var(--lokadia-gray-700)' }}>
                        {alert.summary}
                      </p>
                      <Link
                        to={`/destination/${alert.destinationId}`}
                        className="mt-1 inline-block text-sm font-semibold underline"
                        style={{ color: 'var(--lokadia-primary)' }}
                      >
                        Voir la fiche et les sources
                      </Link>
                    </div>
                    {!alert.read && (
                      <button
                        type="button"
                        onClick={() => void handleRead(alert.id)}
                        aria-label="Marquer comme lu"
                        className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-white/60"
                      >
                        <Check size={16} style={{ color: style.color }} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {message && (
        <p className="mt-3 text-sm" role="status" style={{ color: 'var(--lokadia-gray-600)' }}>
          {message}
        </p>
      )}
    </section>
  );
}
