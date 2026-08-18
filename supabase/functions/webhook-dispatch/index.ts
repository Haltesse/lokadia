/**
 * Edge Function : webhook-dispatch
 *
 * Envoie un événement aux points de livraison d'une organisation, signé.
 *
 * Signature : en-tête `X-Lokadia-Signature: sha256=<hex>`, HMAC-SHA256 du
 * corps brut avec le secret du webhook, plus `X-Lokadia-Timestamp`. Le
 * destinataire doit recalculer le HMAC sur le corps **tel que reçu** —
 * c'est la seule façon de savoir que l'appel vient bien de nous et n'a pas
 * été rejoué.
 *
 * Chaque tentative est journalisée (`webhook_deliveries`), succès comme
 * échec : sans ce journal, « on ne reçoit rien » est indébogable, et le
 * support y passe des heures.
 *
 * POST /functions/v1/webhook-dispatch   (service_role uniquement)
 *   { org_id, event, payload }
 *
 * Déploiement : supabase functions deploy webhook-dispatch
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import { CORS_HEADERS, configured, db, dbSelect, json } from '../_shared/db.ts';

const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface WebhookRow {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  failure_count: number;
}

/** Au-delà, on cesse d'appeler : un point mort ne doit pas ralentir tout le monde. */
const MAX_FAILURES = 20;

async function sign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);
  if (!configured()) return json({ error: 'Fonction mal configurée.' }, 500);

  const auth = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (auth !== SERVICE_ROLE) return json({ error: 'Non autorisé.' }, 403);

  try {
    const body = (await req.json().catch(() => ({}))) as {
      org_id?: string;
      event?: string;
      payload?: Record<string, unknown>;
    };
    const orgId = body.org_id ?? '';
    const event = body.event ?? '';
    if (!orgId || !event) return json({ error: 'org_id et event requis.' }, 400);

    const hooks = await dbSelect<WebhookRow>(
      `webhooks?org_id=eq.${orgId}&active=is.true&select=id,url,secret,events,active,failure_count`,
    );
    const targets = hooks.filter(
      (hook) => hook.events.includes(event) && hook.failure_count < MAX_FAILURES,
    );

    const timestamp = new Date().toISOString();
    const rawBody = JSON.stringify({ event, sent_at: timestamp, data: body.payload ?? {} });

    let delivered = 0;
    for (const hook of targets) {
      let statusCode: number | null = null;
      let error: string | null = null;
      try {
        const response = await fetch(hook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Lokadia-Event': event,
            'X-Lokadia-Timestamp': timestamp,
            'X-Lokadia-Signature': `sha256=${await sign(hook.secret, rawBody)}`,
          },
          body: rawBody,
          signal: AbortSignal.timeout(10000),
        });
        statusCode = response.status;
        if (response.ok) delivered++;
        else error = `Réponse HTTP ${response.status}`;
      } catch (err) {
        error = err instanceof Error ? err.message : 'Envoi impossible';
      }

      await db('webhook_deliveries', {
        method: 'POST',
        body: JSON.stringify({
          webhook_id: hook.id,
          org_id: orgId,
          event,
          status_code: statusCode,
          error,
        }),
      });

      await db(`webhooks?id=eq.${hook.id}`, {
        method: 'PATCH',
        body: JSON.stringify(
          error
            ? { failure_count: hook.failure_count + 1 }
            : { last_success_at: timestamp, failure_count: 0 },
        ),
      });
    }

    return json({ event, targets: targets.length, delivered });
  } catch (err) {
    console.error('[webhook-dispatch]', err);
    return json({ error: 'Erreur inattendue.' }, 500);
  }
});
