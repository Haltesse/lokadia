/**
 * Edge Function : briefing-ack
 *
 * Accusé de lecture du briefing pré-départ — LA preuve de conformité qui
 * manque aux organisations (devoir de protection, art. L4121-1 / ISO 31030).
 *
 * Le voyageur reçoit un lien tokenisé (aucun compte requis) :
 *   GET  /functions/v1/briefing-ack?token=<uuid>
 *        → { organization, briefing: { title, content, source, source_url,
 *            country_name, updated_at }, traveler: { first_name },
 *            mission: { country_name, date_start, date_end },
 *            read_at, read_name }
 *   POST /functions/v1/briefing-ack   body: { token, name }
 *        → pose read_at + read_name (idempotent : un accusé déjà signé
 *          n'est jamais réécrit), passe l'item de conformité « briefing »
 *          à done, et écrit une entrée dans le journal d'audit.
 *
 * Le client n'a AUCUN droit d'écriture sur read_at (RLS) : seule cette
 * fonction, via service_role, peut horodater un accusé. C'est ce qui rend
 * la preuve opposable.
 *
 * Déploiement : supabase functions deploy briefing-ack --no-verify-jwt
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

/** Appel REST direct (pas de dépendance supabase-js dans la fonction). */
async function db(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

interface ReceiptRow {
  id: string;
  org_id: string;
  briefing_id: string;
  mission_id: string;
  traveler_id: string;
  sent_at: string;
  read_at: string | null;
  read_name: string | null;
  briefings: {
    title: string; content: string; source: string;
    source_url: string | null; country_name: string; updated_at: string;
  } | null;
  travelers: { first_name: string; last_name: string } | null;
  missions: { country_name: string; city: string | null; date_start: string; date_end: string } | null;
  organizations: { name: string } | null;
}

const SELECT =
  'id,org_id,briefing_id,mission_id,traveler_id,sent_at,read_at,read_name,' +
  'briefings(title,content,source,source_url,country_name,updated_at),' +
  'travelers(first_name,last_name),' +
  'missions(country_name,city,date_start,date_end),' +
  'organizations(name)';

async function loadReceipt(token: string): Promise<ReceiptRow | null> {
  const res = await db(`briefing_receipts?token=eq.${token}&select=${SELECT}`);
  if (!res.ok) return null;
  const rows = (await res.json()) as ReceiptRow[];
  return rows[0] ?? null;
}

/** Vue publique : jamais d'identifiants internes ni de données d'autres voyageurs. */
function publicView(r: ReceiptRow) {
  return {
    organization: r.organizations?.name ?? 'Votre organisation',
    briefing: r.briefings
      ? {
          title: r.briefings.title,
          content: r.briefings.content,
          source: r.briefings.source,
          source_url: r.briefings.source_url,
          country_name: r.briefings.country_name,
          updated_at: r.briefings.updated_at,
        }
      : null,
    traveler: r.travelers ? { first_name: r.travelers.first_name, last_name: r.travelers.last_name } : null,
    mission: r.missions
      ? {
          country_name: r.missions.country_name,
          city: r.missions.city,
          date_start: r.missions.date_start,
          date_end: r.missions.date_end,
        }
      : null,
    sent_at: r.sent_at,
    read_at: r.read_at,
    read_name: r.read_name,
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json({ error: 'Fonction mal configurée côté serveur.' }, 500);
  }

  try {
    // ─── Lecture du briefing ───
    if (req.method === 'GET') {
      const token = new URL(req.url).searchParams.get('token') ?? '';
      if (!UUID_RE.test(token)) return json({ error: 'Lien invalide.' }, 400);

      const receipt = await loadReceipt(token);
      if (!receipt) return json({ error: 'Ce lien de briefing n\'existe pas ou a été révoqué.' }, 404);

      return json(publicView(receipt));
    }

    // ─── Accusé de lecture ───
    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as { token?: string; name?: string };
      const token = body.token ?? '';
      const name = (body.name ?? '').trim();

      if (!UUID_RE.test(token)) return json({ error: 'Lien invalide.' }, 400);
      if (name.length < 2 || name.length > 120) {
        return json({ error: 'Indiquez votre nom complet pour signer l\'accusé de lecture.' }, 400);
      }

      const receipt = await loadReceipt(token);
      if (!receipt) return json({ error: 'Ce lien de briefing n\'existe pas ou a été révoqué.' }, 404);

      // Idempotent : un accusé déjà signé n'est jamais réécrit (preuve stable)
      if (receipt.read_at) {
        return json({ ...publicView(receipt), already_signed: true });
      }

      const readAt = new Date().toISOString();
      const upd = await db(`briefing_receipts?id=eq.${receipt.id}&read_at=is.null`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ read_at: readAt, read_name: name }),
      });
      if (!upd.ok) {
        return json({ error: 'Enregistrement impossible pour le moment. Réessayez dans un instant.' }, 502);
      }

      // L'item de conformité « briefing » de cette mission passe à done
      await db(`compliance_items?mission_id=eq.${receipt.mission_id}&kind=eq.briefing`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'done', completed_at: readAt, evidence: `Accusé de lecture signé par ${name}` }),
      });

      // Journal d'audit — action côté voyageur (actor null, libellé nominatif)
      await db('audit_log', {
        method: 'POST',
        body: JSON.stringify({
          org_id: receipt.org_id,
          actor: null,
          actor_label: `${receipt.travelers?.first_name ?? ''} ${receipt.travelers?.last_name ?? ''}`.trim() || name,
          action: 'briefing.ack',
          target_kind: 'mission',
          target_id: receipt.mission_id,
          detail: { signed_name: name, briefing_id: receipt.briefing_id, source: receipt.briefings?.source ?? null },
        }),
      });

      const refreshed = await loadReceipt(token);
      return json(refreshed ? publicView(refreshed) : { ...publicView(receipt), read_at: readAt, read_name: name });
    }

    return json({ error: 'Méthode non autorisée.' }, 405);
  } catch (err) {
    console.error('[briefing-ack]', err);
    return json({ error: 'Erreur inattendue. Réessayez dans un instant.' }, 500);
  }
});
