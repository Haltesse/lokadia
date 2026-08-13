/**
 * CheckinScreen — page publique de réponse à un check-in (/checkin/:token).
 *
 * Conçue pour être utilisable en 5 secondes, sur un réseau dégradé, par
 * quelqu'un qui vient peut-être de vivre un événement : deux boutons,
 * gros, sans compte à créer.
 *
 * RGPD, visible à l'écran : la position est facultative et n'est envoyée
 * que si la personne appuie sur le bouton dédié ; l'abonnement aux
 * notifications est un opt-in explicite, expliqué et refusable.
 */
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, MapPin, Bell, AlertCircle, GraduationCap,
} from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface CheckinData {
  organization: string;
  traveler: { first_name: string; last_name: string } | null;
  request: {
    message: string;
    scope_label: string;
    is_exercise: boolean;
    ask_position: boolean;
    created_at: string;
  } | null;
  status: string;
  responded_at: string | null;
  note: string | null;
  vapid_public_key: string;
}

const FN_URL = `https://${projectId}.supabase.co/functions/v1/checkin-respond`;

/** Convertit la clé VAPID base64url en octets pour pushManager.subscribe. */
function vapidToBytes(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export default function CheckinScreen() {
  const { token = '' } = useParams<{ token: string }>();
  const [data, setData] = useState<CheckinData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [note, setNote] = useState('');
  const [position, setPosition] = useState<{ lat: number; lon: number; accuracy?: number } | null>(null);
  const [positionMsg, setPositionMsg] = useState<string | null>(null);
  const [wantNotifications, setWantNotifications] = useState(false);
  const [sending, setSending] = useState<'safe' | 'help' | null>(null);
  const [sendError, setSendError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    try {
      const res = await fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, {
        headers: { Authorization: `Bearer ${publicAnonKey}` },
      });
      const body = await res.json();
      if (!res.ok) {
        setErrorMsg(body?.error ?? "Ce lien n'est pas valide.");
        setState('error');
        return;
      }
      setData(body as CheckinData);
      setState('ready');
    } catch {
      setErrorMsg('Connexion impossible. Vérifiez votre réseau et rechargez la page.');
      setState('error');
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  /** Géolocalisation : demandée uniquement sur action explicite. */
  function attachPosition() {
    setPositionMsg(null);
    if (!('geolocation' in navigator)) {
      setPositionMsg("Votre appareil ne permet pas de partager la position.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setPositionMsg('Position jointe à votre réponse.');
      },
      (err) => {
        setPositionMsg(
          err.code === err.PERMISSION_DENIED
            ? "Position non partagée. Vous pouvez répondre sans."
            : "Position indisponible pour le moment. Vous pouvez répondre sans.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  /** Abonnement aux notifications — opt-in, uniquement si demandé. */
  async function buildSubscription(): Promise<{ endpoint: string; p256dh: string; auth: string } | null> {
    if (!wantNotifications || !data?.vapid_public_key) return null;
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub = existing ?? (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidToBytes(data.vapid_public_key) as BufferSource,
      }));

      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null;
      return { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth };
    } catch {
      // Notifications indisponibles : la réponse part quand même
      return null;
    }
  }

  async function respond(status: 'safe' | 'help') {
    setSending(status);
    setSendError('');
    try {
      const subscribe = await buildSubscription();
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ token, status, note: note.trim() || undefined, position, subscribe }),
      });
      const body = await res.json();
      if (!res.ok) {
        setSendError(body?.error ?? "Enregistrement impossible.");
        return;
      }
      setData(body as CheckinData);
    } catch {
      setSendError('Connexion impossible. Réessayez dans un instant.');
    } finally {
      setSending(null);
    }
  }

  if (state === 'loading') {
    return (
      <main className="min-h-screen px-5 py-10" style={{ background: 'var(--lokadia-background)' }} aria-busy="true">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="lk-skeleton h-24 w-full rounded-2xl" />
          <div className="lk-skeleton h-40 w-full rounded-2xl" />
        </div>
      </main>
    );
  }

  if (state === 'error' || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5" style={{ background: 'var(--lokadia-background)' }}>
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto mb-3" size={36} style={{ color: 'var(--lokadia-gray-300)' }} />
          <h1 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Ce lien n'est pas accessible</h1>
          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>{errorMsg}</p>
          <p className="mt-4 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            Contactez le service qui vous a transmis ce message.
          </p>
        </div>
      </main>
    );
  }

  const answered = data.status === 'safe' || data.status === 'help';
  const exercise = data.request?.is_exercise;

  return (
    <main className="min-h-screen px-5 py-8" style={{ background: 'var(--lokadia-background)' }}>
      <div className="mx-auto max-w-lg space-y-4">
        <header
          className="rounded-3xl p-6 text-white"
          style={{ background: exercise ? 'var(--lokadia-primary)' : '#B91C1C' }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur">
            {exercise ? <GraduationCap size={14} /> : <ShieldCheck size={14} />}
            <span className="text-[11px] font-bold uppercase tracking-wide">
              {exercise ? 'Exercice — ceci est un entraînement' : 'Message de sécurité'}
            </span>
          </div>
          <h1 className="text-xl font-bold leading-tight">
            {data.traveler ? `${data.traveler.first_name}, êtes-vous en sécurité ?` : 'Êtes-vous en sécurité ?'}
          </h1>
          <p className="mt-1.5 text-sm text-white/90">{data.organization}</p>
        </header>

        {data.request && (
          <section className="rounded-2xl bg-white p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
              {data.request.message}
            </p>
            <p className="mt-2 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
              Envoyé le {new Date(data.request.created_at).toLocaleString('fr-FR')}
            </p>
          </section>
        )}

        {answered ? (
          <section className="rounded-2xl bg-white p-6 text-center" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
            {data.status === 'safe' ? (
              <>
                <CheckCircle2 className="mx-auto mb-2" size={34} style={{ color: '#059669' }} />
                <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Merci, votre réponse est enregistrée</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                  Votre organisation sait que vous êtes en sécurité.
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="mx-auto mb-2" size={34} style={{ color: '#B91C1C' }} />
                <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Votre demande d'aide est transmise</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                  Votre organisation a été alertée et va vous contacter.
                  En cas de danger immédiat, appelez les secours locaux.
                </p>
              </>
            )}
            {data.responded_at && (
              <p className="mt-3 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                Réponse enregistrée le {new Date(data.responded_at).toLocaleString('fr-FR')}.
              </p>
            )}
          </section>
        ) : (
          <>
            <section className="space-y-3">
              <button
                onClick={() => respond('safe')}
                disabled={sending !== null}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-5 text-base font-bold text-white disabled:opacity-60"
                style={{ background: '#059669' }}
              >
                <CheckCircle2 size={22} />
                {sending === 'safe' ? 'Envoi…' : 'Je suis en sécurité'}
              </button>
              <button
                onClick={() => respond('help')}
                disabled={sending !== null}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 py-5 text-base font-bold disabled:opacity-60"
                style={{ borderColor: '#B91C1C', color: '#B91C1C', background: 'white' }}
              >
                <AlertTriangle size={22} />
                {sending === 'help' ? 'Envoi…' : "J'ai besoin d'aide"}
              </button>
              {sendError && <p className="text-center text-sm font-semibold text-red-600">{sendError}</p>}
            </section>

            <section className="rounded-2xl bg-white p-5 space-y-4" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
              <label className="block">
                <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>
                  Précision (facultative)
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="Où vous êtes, ce dont vous avez besoin…"
                  className="w-full rounded-xl border p-3 text-sm"
                  style={{ borderColor: 'var(--lokadia-gray-200)' }}
                />
              </label>

              {data.request?.ask_position && (
                <div>
                  <button
                    type="button"
                    onClick={attachPosition}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold"
                    style={{ borderColor: position ? '#059669' : 'var(--lokadia-gray-200)', color: position ? '#047857' : 'var(--lokadia-gray-700)' }}
                  >
                    <MapPin size={15} />
                    {position ? 'Position jointe' : 'Joindre ma position'}
                  </button>
                  <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--lokadia-gray-500)' }}>
                    Facultatif. Votre position n'est transmise qu'avec cette réponse, une seule
                    fois — Lokadia ne vous suit jamais en continu.
                  </p>
                  {positionMsg && (
                    <p className="mt-1 text-xs font-semibold" style={{ color: position ? '#047857' : '#B45309' }}>{positionMsg}</p>
                  )}
                </div>
              )}

              <label className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={wantNotifications}
                  onChange={(e) => setWantNotifications(e.target.checked)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                />
                <span className="text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
                  <Bell size={12} className="mr-1 inline" />
                  Recevoir les prochains messages de sécurité de {data.organization} par
                  notification. Vous pouvez les désactiver à tout moment dans votre navigateur.
                </span>
              </label>
            </section>
          </>
        )}

        <p className="pb-6 text-center text-[11px] leading-relaxed" style={{ color: 'var(--lokadia-gray-400)' }}>
          Lokadia Pro · En cas de danger immédiat, contactez d'abord les secours locaux.
        </p>
      </div>
    </main>
  );
}
