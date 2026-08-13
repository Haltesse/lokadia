/**
 * Edge Function : crisis-dispatch
 *
 * Déclenche l'envoi des notifications d'un check-in de sécurité (ou d'une
 * relance ciblée sur les non-répondants) vers les voyageurs abonnés.
 *
 * POST /functions/v1/crisis-dispatch
 *   headers: Authorization: Bearer <jwt utilisateur>
 *   body: { org_id, request_id, only_pending?: boolean }
 *   → { targeted, pushed, without_push, failed, removed }
 *
 * Le compte-rendu est volontairement détaillé et honnête : `without_push`
 * dit combien de personnes ne recevront PAS de notification faute
 * d'abonnement. C'est l'information dont a besoin la personne qui gère la
 * crise — lui laisser croire que tout le monde a été prévenu serait pire
 * que de ne rien envoyer.
 *
 * Déploiement : supabase functions deploy crisis-dispatch
 *   (JWT vérifié — l'appelant doit être admin ou gestionnaire de l'orga)
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import {
  CORS_HEADERS, UUID_RE, callerFromJwt, configured, db, dbSelect, json, roleInOrg,
} from '../_shared/db.ts';
import { sendPush } from '../_shared/webpush.ts';

interface TargetRow {
  id: string;
  traveler_id: string;
  status: string;
}

interface SubRow {
  id: string;
  traveler_id: string;
  endpoint: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);
  if (!configured()) return json({ error: 'Fonction mal configurée côté serveur.' }, 500);

  try {
    const caller = await callerFromJwt(req);
    if (!caller) return json({ error: 'Connexion requise.' }, 401);

    const body = (await req.json().catch(() => ({}))) as {
      org_id?: string;
      request_id?: string;
      only_pending?: boolean;
    };
    const orgId = body.org_id ?? '';
    const requestId = body.request_id ?? '';
    if (!UUID_RE.test(orgId) || !UUID_RE.test(requestId)) {
      return json({ error: 'Paramètres invalides.' }, 400);
    }

    const role = await roleInOrg(orgId, caller.id);
    if (role !== 'admin' && role !== 'manager') {
      return json({ error: "Seuls un administrateur ou un gestionnaire peuvent lancer un envoi." }, 403);
    }

    // Le check-in doit appartenir à l'organisation de l'appelant
    const requests = await dbSelect<{ id: string; is_exercise: boolean; event_id: string | null }>(
      `checkin_requests?id=eq.${requestId}&org_id=eq.${orgId}&select=id,is_exercise,event_id`,
    );
    if (requests.length === 0) return json({ error: 'Check-in introuvable.' }, 404);

    const statusFilter = body.only_pending ? '&status=eq.pending' : '';
    const targets = await dbSelect<TargetRow>(
      `checkin_responses?request_id=eq.${requestId}${statusFilter}&select=id,traveler_id,status`,
    );
    if (targets.length === 0) {
      return json({ targeted: 0, pushed: 0, without_push: 0, failed: 0, removed: 0 });
    }

    // Abonnements push des personnes visées
    const travelerIds = [...new Set(targets.map((t) => t.traveler_id))];
    const inList = `(${travelerIds.join(',')})`;
    const subs = await dbSelect<SubRow>(
      `push_subscriptions?traveler_id=in.${inList}&select=id,traveler_id,endpoint`,
    );

    const subscribedTravelers = new Set(subs.map((s) => s.traveler_id));
    const withoutPush = travelerIds.filter((id) => !subscribedTravelers.has(id)).length;

    let pushed = 0;
    let failed = 0;
    let removed = 0;

    // Envoi séquentiel par petits paquets : un service de push qui limite
    // le débit ne doit pas faire échouer toute la campagne.
    for (let i = 0; i < subs.length; i += 10) {
      const batch = subs.slice(i, i + 10);
      const outcomes = await Promise.all(batch.map((s) => sendPush({ endpoint: s.endpoint })));

      for (let j = 0; j < outcomes.length; j++) {
        const outcome = outcomes[j];
        const sub = batch[j];
        if (outcome.ok) {
          pushed++;
        } else if (outcome.gone) {
          // Abonnement mort (app désinstallée, permission révoquée)
          await db(`push_subscriptions?id=eq.${sub.id}`, { method: 'DELETE' });
          removed++;
        } else {
          failed++;
          await db(`push_subscriptions?id=eq.${sub.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ failure_count: 1 }),
          });
        }
      }
    }

    // Relance : on horodate pour pouvoir prouver qu'elle a eu lieu
    if (body.only_pending) {
      const ids = targets.map((t) => t.id);
      await db(`checkin_responses?id=in.(${ids.join(',')})`, {
        method: 'PATCH',
        body: JSON.stringify({ reminded_at: new Date().toISOString() }),
      });
    }

    const eventId = requests[0].event_id;
    if (eventId) {
      await db('crisis_log', {
        method: 'POST',
        body: JSON.stringify({
          org_id: orgId,
          event_id: eventId,
          actor_label: caller.email,
          kind: 'message',
          entry: body.only_pending
            ? `Relance envoyée à ${targets.length} personne(s) sans réponse — ${pushed} notification(s) délivrée(s), ${withoutPush} sans abonnement.`
            : `Check-in envoyé à ${targets.length} personne(s) — ${pushed} notification(s) délivrée(s), ${withoutPush} sans abonnement.`,
        }),
      });
    }

    await db('audit_log', {
      method: 'POST',
      body: JSON.stringify({
        org_id: orgId,
        actor: caller.id,
        actor_label: caller.email,
        action: body.only_pending ? 'checkin.remind' : 'checkin.dispatch',
        target_kind: 'checkin_request',
        target_id: requestId,
        detail: { targeted: targets.length, pushed, without_push: withoutPush, failed, removed },
      }),
    });

    return json({ targeted: targets.length, pushed, without_push: withoutPush, failed, removed });
  } catch (err) {
    console.error('[crisis-dispatch]', err);
    return json({ error: 'Erreur inattendue. Réessayez dans un instant.' }, 500);
  }
});
