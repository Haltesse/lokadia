/**
 * Edge Function : push-pending
 *
 * Le service worker, réveillé par une notification sans charge utile,
 * appelle cette fonction pour savoir quoi afficher. Il s'identifie par son
 * propre endpoint d'abonnement — une valeur opaque générée par le
 * navigateur, jamais un identifiant de personne.
 *
 * Ne renvoie que le message en attente le plus récent pour cet abonnement.
 * Aucune donnée d'une autre personne ne peut être obtenue avec ce lien.
 *
 * Deux familles d'abonnements coexistent :
 *   · `push_subscriptions`          — voyageur d'une organisation (check-in)
 *   · `traveler_push_subscriptions` — compte grand public (destination suivie)
 * L'endpoint étant unique, il désigne sans ambiguïté l'un ou l'autre.
 *
 * Déploiement : supabase functions deploy push-pending --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import { CORS_HEADERS, configured, db, dbSelect, json } from '../_shared/db.ts';

interface SubRow {
  id: string;
  traveler_id: string;
  org_id: string;
}

interface PendingRow {
  token: string;
  status: string;
  checkin_requests: {
    message: string;
    is_exercise: boolean;
    created_at: string;
  } | null;
  organizations: { name: string } | null;
}

interface TravelerAlertRow {
  id: string;
  destination_id: string;
  destination_label: string;
  summary: string;
  severity: string;
}

/**
 * Message en attente pour un compte grand public : l'alerte non lue la
 * plus récente parmi ses destinations suivies. Rien d'autre n'est
 * accessible depuis cet endpoint.
 */
async function travelerPending(endpoint: string): Promise<Response> {
  const subs = await dbSelect<{ id: string; user_id: string }>(
    `traveler_push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}&select=id,user_id`,
  );
  const sub = subs[0];
  if (!sub) return json({ error: 'Abonnement inconnu.' }, 404);

  await db(`traveler_push_subscriptions?id=eq.${sub.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ last_used_at: new Date().toISOString() }),
  });

  const pending = await dbSelect<TravelerAlertRow>(
    `traveler_alerts?user_id=eq.${sub.user_id}&status=eq.unread` +
      '&select=id,destination_id,destination_label,summary,severity' +
      '&order=created_at.desc&limit=1',
  );
  const alert = pending[0];

  if (!alert) {
    return json({
      title: 'Lokadia',
      body: 'Ouvrez Lokadia pour consulter vos destinations suivies.',
      url: '/alerts',
    });
  }

  return json({
    title: `${alert.destination_label} — la situation a changé`,
    body: alert.summary,
    url: `/destination/${alert.destination_id}`,
    tag: `watch-${alert.id}`,
    urgent: alert.severity === 'urgent',
  });
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (!configured()) return json({ error: 'Fonction mal configurée.' }, 500);

  try {
    const endpoint = new URL(req.url).searchParams.get('endpoint') ?? '';
    if (!endpoint.startsWith('https://')) return json({ error: 'Abonnement invalide.' }, 400);

    const subs = await dbSelect<SubRow>(
      `push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}&select=id,traveler_id,org_id`,
    );
    const sub = subs[0];

    // Abonnement grand public : alerte sur une destination suivie.
    if (!sub) return await travelerPending(endpoint);

    // Trace d'usage : permet de repérer les abonnements dormants
    await db(`push_subscriptions?id=eq.${sub.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ last_used_at: new Date().toISOString() }),
    });

    const pending = await dbSelect<PendingRow>(
      `checkin_responses?traveler_id=eq.${sub.traveler_id}&status=eq.pending` +
        '&select=token,status,checkin_requests(message,is_exercise,created_at),organizations(name)' +
        '&order=id.desc&limit=1',
    );
    const row = pending[0];

    if (!row) {
      return json({
        title: 'Lokadia',
        body: 'Ouvrez Lokadia pour consulter les informations de votre organisation.',
        url: '/',
      });
    }

    const exercise = row.checkin_requests?.is_exercise;
    return json({
      title: exercise
        ? 'Exercice — êtes-vous en sécurité ?'
        : `${row.organizations?.name ?? 'Votre organisation'} — êtes-vous en sécurité ?`,
      body: row.checkin_requests?.message ?? 'Merci de confirmer votre situation.',
      url: `/checkin/${row.token}`,
      tag: `checkin-${row.token}`,
      urgent: !exercise,
    });
  } catch (err) {
    console.error('[push-pending]', err);
    return json({ error: 'Erreur inattendue.' }, 500);
  }
});
