/**
 * Edge Function : watchlist-scan
 *
 * Veille « zéro bruit » sur les destinations suivies par les voyageurs.
 *
 * Deux conditions, comme côté Pro :
 *   1. l'état de la destination a réellement CHANGÉ depuis le dernier
 *      passage — le premier passage pose la référence et n'alerte jamais ;
 *   2. la destination est suivie **explicitement** par la personne. Côté
 *      grand public, c'est l'équivalent du « des personnes sur place » de
 *      la veille entreprise : personne n'est inscrit par défaut.
 *
 * Une remontée de score ne déclenche rien : c'est une bonne nouvelle, pas
 * une décision à prendre. Notifier dessus apprendrait à ignorer le reste.
 *
 * POST /functions/v1/watchlist-scan
 *   { all: true }   avec la clé service_role → balaie tous les suivis
 *   {}              avec un JWT utilisateur  → balaie ses propres suivis
 *
 * Déploiement : supabase functions deploy watchlist-scan
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import { CORS_HEADERS, callerFromJwt, configured, db, dbSelect, json } from '../_shared/db.ts';
import { sendPush, vapidPublicKey } from '../_shared/webpush.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

/** En deçà, on considère qu'il ne s'est rien passé. */
const SIGNIFICANT_DROP = 5;

interface WatchRow {
  user_id: string;
  destination_id: string;
  destination_label: string;
}

interface SnapshotRow {
  destination_id: string;
  score: number | null;
  level: string | null;
}

interface ScoreResult {
  score: number | null;
  level: string;
  sources: Record<string, string[]>;
  available: boolean;
}

async function fetchScore(destinationId: string): Promise<ScoreResult | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/lokascore-compute?destination=${encodeURIComponent(destinationId)}&profile=default&live=1`,
      { headers: { Authorization: `Bearer ${SERVICE_ROLE}` }, signal: AbortSignal.timeout(15000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as ScoreResult;
    return data.available ? data : null;
  } catch {
    return null;
  }
}

function flatSources(sources: Record<string, string[]> | undefined): string[] {
  if (!sources) return [];
  return [...new Set(Object.values(sources).flat())];
}

/** Sévérité déduite de l'ampleur du changement, jamais du hasard. */
function severityFor(level: string, drop: number): 'info' | 'vigilance' | 'urgent' {
  if (level === 'forbidden' || level === 'high-risk') return 'urgent';
  if (drop >= 15) return 'urgent';
  if (drop >= SIGNIFICANT_DROP) return 'vigilance';
  return 'info';
}

/**
 * Réveille les appareils d'un utilisateur. La notification ne transporte
 * aucune donnée : le service worker vient chercher le message via
 * `push-pending`. Rien de sensible ne passe par Google ou Apple.
 */
async function notify(userId: string): Promise<void> {
  const subs = await dbSelect<{ id: string; endpoint: string }>(
    `traveler_push_subscriptions?user_id=eq.${userId}&select=id,endpoint`,
  );
  for (const sub of subs) {
    const outcome = await sendPush({ endpoint: sub.endpoint });
    // Abonnement révoqué côté navigateur : on nettoie plutôt que de
    // réessayer indéfiniment.
    if (outcome.gone) {
      await db(`traveler_push_subscriptions?id=eq.${sub.id}`, { method: 'DELETE' });
    }
  }
}

async function scan(userId: string | null): Promise<{
  destinations: number;
  changed: number;
  alerts_created: number;
  notified: number;
}> {
  const filter = userId ? `user_id=eq.${userId}&` : '';
  const watched = await dbSelect<WatchRow>(
    `traveler_watchlist?${filter}select=user_id,destination_id,destination_label`,
  );
  if (watched.length === 0) {
    return { destinations: 0, changed: 0, alerts_created: 0, notified: 0 };
  }

  // Un seul calcul par destination, quel que soit le nombre d'abonnés.
  const watchersByDestination = new Map<string, WatchRow[]>();
  for (const row of watched) {
    const list = watchersByDestination.get(row.destination_id) ?? [];
    list.push(row);
    watchersByDestination.set(row.destination_id, list);
  }

  let changed = 0;
  let created = 0;
  const usersToNotify = new Set<string>();

  for (const [destinationId, watchers] of watchersByDestination) {
    const current = await fetchScore(destinationId);
    if (!current || current.score === null) continue;

    const previous = (
      await dbSelect<SnapshotRow>(
        `destination_snapshots?destination_id=eq.${encodeURIComponent(destinationId)}&select=*`,
      )
    )[0];

    // L'instantané est mis à jour dans tous les cas : c'est la référence
    // du prochain passage, indépendamment de toute notification.
    await db('destination_snapshots', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        destination_id: destinationId,
        score: current.score,
        level: current.level,
        sources: flatSources(current.sources),
        captured_at: new Date().toISOString(),
      }),
    });

    // Premier passage : rien n'a « changé », on pose la référence.
    if (!previous || previous.score === null) continue;

    const drop = previous.score - current.score;
    const levelChanged = previous.level !== current.level;
    if (!levelChanged && drop < SIGNIFICANT_DROP) continue;
    changed++;

    const label = watchers[0].destination_label;
    const summary = levelChanged
      ? `${label} passe de « ${previous.level} » à « ${current.level} » (${previous.score} → ${current.score} sur 100).`
      : `Le Lokascore de ${label} baisse de ${drop} points (${previous.score} → ${current.score} sur 100).`;

    const rows = watchers.map((watcher) => ({
      user_id: watcher.user_id,
      destination_id: destinationId,
      destination_label: watcher.destination_label,
      kind: levelChanged ? 'level_change' : 'score_drop',
      previous_value: String(previous.score),
      current_value: String(current.score),
      severity: severityFor(current.level, drop),
      summary,
      sources: flatSources(current.sources),
    }));

    const res = await db('traveler_alerts', { method: 'POST', body: JSON.stringify(rows) });
    if (res.ok) {
      created += rows.length;
      for (const watcher of watchers) usersToNotify.add(watcher.user_id);
    }
  }

  for (const id of usersToNotify) await notify(id);

  return {
    destinations: watchersByDestination.size,
    changed,
    alerts_created: created,
    notified: usersToNotify.size,
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (!configured()) return json({ error: 'Fonction mal configurée côté serveur.' }, 500);

  // GET : clé publique VAPID, nécessaire au navigateur pour s'abonner.
  // Elle est publique par conception — c'est la clé privée, restée en
  // secret Supabase, qui signe les envois.
  if (req.method === 'GET') {
    return json({ vapid_public_key: vapidPublicKey() });
  }

  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as { all?: boolean };

    // Balayage global : réservé à un appel service_role (planificateur).
    if (body.all) {
      const auth = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
      if (auth !== SERVICE_ROLE) return json({ error: 'Non autorisé.' }, 403);
      return json(await scan(null));
    }

    // Sinon : la personne ne peut balayer que ses propres suivis.
    const caller = await callerFromJwt(req);
    if (!caller) return json({ error: 'Connexion requise.' }, 401);
    return json(await scan(caller.id));
  } catch (err) {
    console.error('[watchlist-scan]', err);
    return json({ error: 'Erreur inattendue. Réessayez dans un instant.' }, 500);
  }
});
