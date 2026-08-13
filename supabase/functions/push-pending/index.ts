/**
 * Edge Function : push-pending
 *
 * Le service worker, réveillé par une notification sans charge utile,
 * appelle cette fonction pour savoir quoi afficher. Il s'identifie par son
 * propre endpoint d'abonnement — une valeur opaque générée par le
 * navigateur, jamais un identifiant de personne.
 *
 * Ne renvoie que le check-in en attente le plus récent pour ce voyageur.
 * Aucune donnée d'une autre personne ne peut être obtenue avec ce lien.
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
    if (!sub) return json({ error: 'Abonnement inconnu.' }, 404);

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
