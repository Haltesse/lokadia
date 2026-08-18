/**
 * Destinations suivies et alertes personnelles.
 *
 * Contrat produit : rien n'arrive sans opt-in. Suivre une destination est
 * un geste explicite, recevoir une notification en est un second, et les
 * deux se défont d'un clic. Le serveur ne crée d'alerte que lorsque
 * l'état d'une destination a réellement changé (voir la fonction
 * `watchlist-scan`) — une notification qui n'appelle aucune décision
 * apprend à ignorer les suivantes.
 *
 * Les alertes ne sont jamais écrites par le client : la table n'a aucune
 * policy d'insertion, seule la fonction de veille en produit.
 */
import { supabase } from './supabase';
import type { Database } from './database.types';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

type WatchRow = Database['public']['Tables']['traveler_watchlist']['Row'];
type AlertRow = Database['public']['Tables']['traveler_alerts']['Row'];

const SCAN_URL = `https://${projectId}.supabase.co/functions/v1/watchlist-scan`;

export interface WatchedDestination {
  id: string;
  destinationId: string;
  label: string;
  countryIso: string | null;
  createdAt: string;
}

export interface TravelerAlert {
  id: string;
  destinationId: string;
  label: string;
  kind: 'score_drop' | 'level_change';
  previousValue: string | null;
  currentValue: string | null;
  severity: 'info' | 'vigilance' | 'urgent';
  summary: string;
  sources: string[];
  read: boolean;
  createdAt: string;
}

function mapWatch(row: WatchRow): WatchedDestination {
  return {
    id: row.id,
    destinationId: row.destination_id,
    label: row.destination_label,
    countryIso: row.country_iso,
    createdAt: row.created_at,
  };
}

function mapAlert(row: AlertRow): TravelerAlert {
  return {
    id: row.id,
    destinationId: row.destination_id,
    label: row.destination_label,
    kind: row.kind as TravelerAlert['kind'],
    previousValue: row.previous_value,
    currentValue: row.current_value,
    severity: row.severity as TravelerAlert['severity'],
    summary: row.summary,
    sources: row.sources ?? [],
    read: row.status === 'read',
    createdAt: row.created_at,
  };
}

// ─── Destinations suivies ────────────────────────────────────────────────

export async function listWatched(): Promise<WatchedDestination[]> {
  const { data, error } = await supabase
    .from('traveler_watchlist')
    .select('id,user_id,destination_id,destination_label,country_iso,created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapWatch);
}

export async function watchDestination(input: {
  destinationId: string;
  label: string;
  countryIso?: string | null;
}): Promise<void> {
  const { data: session } = await supabase.auth.getUser();
  const userId = session.user?.id;
  if (!userId) throw new Error('Connexion requise pour suivre une destination.');

  const { error } = await supabase.from('traveler_watchlist').insert({
    user_id: userId,
    destination_id: input.destinationId,
    destination_label: input.label,
    country_iso: input.countryIso ?? null,
  });
  // 23505 = déjà suivi : ce n'est pas une erreur pour l'utilisateur.
  if (error && error.code !== '23505') throw error;
}

export async function unwatchDestination(destinationId: string): Promise<void> {
  const { error } = await supabase
    .from('traveler_watchlist')
    .delete()
    .eq('destination_id', destinationId);
  if (error) throw error;
}

// ─── Alertes ─────────────────────────────────────────────────────────────

export async function listAlerts(): Promise<TravelerAlert[]> {
  const { data, error } = await supabase
    .from('traveler_alerts')
    .select(
      'id,user_id,destination_id,destination_label,kind,previous_value,current_value,severity,summary,sources,status,created_at',
    )
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map(mapAlert);
}

export async function markAlertRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('traveler_alerts')
    .update({ status: 'read' })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Demande une vérification immédiate de ses propres destinations suivies.
 * Le premier passage sur une destination pose la référence sans alerter :
 * c'est voulu, on ne peut pas signaler un changement qu'on n'a pas vu.
 */
export async function scanNow(): Promise<{ destinations: number; alerts_created: number }> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Connexion requise.');

  const res = await fetch(SCAN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({}),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? 'Vérification impossible.');
  return body as { destinations: number; alerts_created: number };
}

// ─── Notifications ───────────────────────────────────────────────────────

/** Convertit la clé VAPID base64url en octets pour `pushManager.subscribe`. */
function vapidToBytes(base64: string): Uint8Array {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/** true si cet appareil est déjà abonné pour le compte connecté. */
export async function isPushEnabled(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return false;
    const { data, error } = await supabase
      .from('traveler_push_subscriptions')
      .select('id')
      .eq('endpoint', sub.endpoint)
      .limit(1);
    if (error) return false;
    return (data ?? []).length > 0;
  } catch {
    return false;
  }
}

/**
 * Abonne cet appareil. Demande la permission navigateur — donc un geste
 * explicite — puis enregistre l'abonnement pour le compte connecté.
 *
 * Les notifications envoyées ne portent aucune charge utile : elles
 * réveillent le service worker, qui vient chercher le message. Rien de
 * sensible ne transite par les serveurs de Google ou d'Apple.
 */
export async function enablePush(): Promise<'enabled' | 'denied' | 'unsupported'> {
  if (!pushSupported()) return 'unsupported';

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const userId = sessionData.session?.user?.id;
  if (!token || !userId) throw new Error('Connexion requise.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return 'denied';

  const keyRes = await fetch(SCAN_URL, {
    headers: { Authorization: `Bearer ${token}`, apikey: publicAnonKey },
  });
  const { vapid_public_key: vapidKey } = (await keyRes.json()) as {
    vapid_public_key?: string;
  };
  if (!vapidKey) return 'unsupported';

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidToBytes(vapidKey) as BufferSource,
    }));

  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return 'unsupported';

  const { error } = await supabase.from('traveler_push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    { onConflict: 'endpoint' },
  );
  if (error) throw error;
  return 'enabled';
}

/** Retire l'abonnement de cet appareil, côté serveur et côté navigateur. */
export async function disablePush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  await supabase.from('traveler_push_subscriptions').delete().eq('endpoint', sub.endpoint);
  await sub.unsubscribe();
}
