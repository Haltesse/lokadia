/**
 * Edge Function : checkin-respond
 *
 * Page de réponse du voyageur à un check-in de sécurité, par lien
 * personnel tokenisé — aucun compte requis, parce qu'une friction de
 * connexion en pleine crise coûte des réponses.
 *
 *   GET  ?token=<uuid>            → contexte du check-in (message, orga,
 *                                   statut déjà répondu, clé VAPID publique)
 *   POST { token, status, note?, position?, subscribe? }
 *        → enregistre « je suis en sécurité » ou « j'ai besoin d'aide »,
 *          horodaté côté serveur ; position facultative consentie à
 *          l'instant ; abonnement push optionnel.
 *
 * RGPD : la position n'est jamais demandée en continu ni déduite de l'IP.
 * Elle n'est enregistrée que si le voyageur l'a explicitement jointe.
 *
 * Déploiement : supabase functions deploy checkin-respond --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import { CORS_HEADERS, UUID_RE, configured, db, dbSelect, json } from '../_shared/db.ts';
import { vapidPublicKey } from '../_shared/webpush.ts';

interface ResponseRow {
  id: string;
  org_id: string;
  request_id: string;
  traveler_id: string;
  status: string;
  responded_at: string | null;
  note: string | null;
  checkin_requests: {
    message: string;
    scope_label: string;
    is_exercise: boolean;
    ask_position: boolean;
    created_at: string;
  } | null;
  travelers: { first_name: string; last_name: string } | null;
  organizations: { name: string } | null;
}

const SELECT =
  'id,org_id,request_id,traveler_id,status,responded_at,note,' +
  'checkin_requests(message,scope_label,is_exercise,ask_position,created_at),' +
  'travelers(first_name,last_name),organizations(name)';

async function loadByToken(token: string): Promise<ResponseRow | null> {
  const rows = await dbSelect<ResponseRow>(
    `checkin_responses?token=eq.${token}&select=${SELECT}`,
  );
  return rows[0] ?? null;
}

function publicView(r: ResponseRow) {
  return {
    organization: r.organizations?.name ?? 'Votre organisation',
    traveler: r.travelers
      ? { first_name: r.travelers.first_name, last_name: r.travelers.last_name }
      : null,
    request: r.checkin_requests
      ? {
          message: r.checkin_requests.message,
          scope_label: r.checkin_requests.scope_label,
          is_exercise: r.checkin_requests.is_exercise,
          ask_position: r.checkin_requests.ask_position,
          created_at: r.checkin_requests.created_at,
        }
      : null,
    status: r.status,
    responded_at: r.responded_at,
    note: r.note,
    vapid_public_key: vapidPublicKey(),
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (!configured()) return json({ error: 'Fonction mal configurée côté serveur.' }, 500);

  try {
    // ─── Contexte du check-in ───
    if (req.method === 'GET') {
      const token = new URL(req.url).searchParams.get('token') ?? '';
      if (!UUID_RE.test(token)) return json({ error: 'Lien invalide.' }, 400);

      const row = await loadByToken(token);
      if (!row) return json({ error: "Ce lien n'existe pas ou a été révoqué." }, 404);
      return json(publicView(row));
    }

    // ─── Réponse ───
    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as {
        token?: string;
        status?: string;
        note?: string;
        position?: { lat: number; lon: number; accuracy?: number } | null;
        subscribe?: { endpoint: string; p256dh: string; auth: string } | null;
      };

      const token = body.token ?? '';
      if (!UUID_RE.test(token)) return json({ error: 'Lien invalide.' }, 400);
      if (body.status !== 'safe' && body.status !== 'help') {
        return json({ error: 'Réponse inconnue.' }, 400);
      }

      const row = await loadByToken(token);
      if (!row) return json({ error: "Ce lien n'existe pas ou a été révoqué." }, 404);

      const now = new Date().toISOString();
      const patch: Record<string, unknown> = {
        status: body.status,
        responded_at: now,
        note: (body.note ?? '').trim().slice(0, 500) || null,
      };

      // Position : uniquement si le voyageur l'a jointe volontairement
      if (body.position && Number.isFinite(body.position.lat) && Number.isFinite(body.position.lon)) {
        patch.position_lat = body.position.lat;
        patch.position_lon = body.position.lon;
        patch.position_accuracy_m = Math.round(body.position.accuracy ?? 0) || null;
      }

      const upd = await db(`checkin_responses?id=eq.${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      if (!upd.ok) {
        return json({ error: 'Enregistrement impossible. Réessayez dans un instant.' }, 502);
      }

      // Abonnement aux notifications — opt-in explicite côté voyageur
      if (body.subscribe?.endpoint && body.subscribe.p256dh && body.subscribe.auth) {
        await db('push_subscriptions', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify({
            org_id: row.org_id,
            traveler_id: row.traveler_id,
            endpoint: body.subscribe.endpoint,
            p256dh: body.subscribe.p256dh,
            auth: body.subscribe.auth,
          }),
        });
      }

      const who = row.travelers
        ? `${row.travelers.first_name} ${row.travelers.last_name}`
        : 'Un voyageur';

      // Main courante : la réponse est un fait horodaté de la crise
      const request = await dbSelect<{ event_id: string | null }>(
        `checkin_requests?id=eq.${row.request_id}&select=event_id`,
      );
      const eventId = request[0]?.event_id;
      if (eventId) {
        await db('crisis_log', {
          method: 'POST',
          body: JSON.stringify({
            org_id: row.org_id,
            event_id: eventId,
            actor_label: who,
            kind: 'checkin',
            entry:
              body.status === 'safe'
                ? `${who} s'est déclaré·e en sécurité.`
                : `${who} a signalé avoir besoin d'aide.` +
                  (patch.note ? ` Message : ${patch.note}` : ''),
          }),
        });
      }

      await db('audit_log', {
        method: 'POST',
        body: JSON.stringify({
          org_id: row.org_id,
          actor: null,
          actor_label: who,
          action: 'checkin.respond',
          target_kind: 'checkin_request',
          target_id: row.request_id,
          detail: { status: body.status, position_jointe: !!patch.position_lat },
        }),
      });

      const refreshed = await loadByToken(token);
      return json(refreshed ? publicView(refreshed) : { ...publicView(row), status: body.status });
    }

    return json({ error: 'Méthode non autorisée.' }, 405);
  } catch (err) {
    console.error('[checkin-respond]', err);
    return json({ error: 'Erreur inattendue. Réessayez dans un instant.' }, 500);
  }
});
