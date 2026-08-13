/**
 * Edge Function : invite-member
 *
 * Invite un collègue dans l'espace Pro d'une organisation, avec un rôle
 * (admin, manager, viewer, dept_lead). Réservée aux administrateurs de
 * l'organisation concernée — la vérification se fait côté serveur à partir
 * du JWT de l'appelant, jamais sur la foi du client.
 *
 * POST /functions/v1/invite-member
 *   headers: Authorization: Bearer <jwt utilisateur>
 *   body: { org_id, email, role, department_id? }
 *   → { ok: true, status: 'invited' | 'added', action_link?: string }
 *
 * `action_link` n'est renvoyé que si l'envoi d'email échoue (SMTP non
 * configuré sur le projet) : l'admin peut alors transmettre le lien
 * lui-même plutôt que de rester bloqué. Aucun email n'est jamais inventé.
 *
 * Déploiement : supabase functions deploy invite-member
 *   (JWT vérifié — ne pas déployer avec --no-verify-jwt)
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const ROLES = new Set(['admin', 'manager', 'viewer', 'dept_lead']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

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

/** Identité de l'appelant à partir de son JWT (jamais depuis le body). */
async function callerFromJwt(jwt: string): Promise<{ id: string; email: string } | null> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string; email?: string };
  return user.id ? { id: user.id, email: user.email ?? '' } : null;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);

  if (!SUPABASE_URL || !SERVICE_ROLE || !ANON_KEY) {
    return json({ error: 'Fonction mal configurée côté serveur.' }, 500);
  }

  try {
    const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    const caller = jwt ? await callerFromJwt(jwt) : null;
    if (!caller) return json({ error: 'Connexion requise.' }, 401);

    const body = (await req.json().catch(() => ({}))) as {
      org_id?: string; email?: string; role?: string; department_id?: string | null;
    };
    const orgId = body.org_id ?? '';
    const email = (body.email ?? '').trim().toLowerCase();
    const role = body.role ?? 'viewer';
    const departmentId = body.department_id ?? null;

    if (!orgId) return json({ error: 'Organisation manquante.' }, 400);
    if (!EMAIL_RE.test(email)) return json({ error: 'Cette adresse email ne semble pas valide.' }, 400);
    if (!ROLES.has(role)) return json({ error: 'Rôle inconnu.' }, 400);

    // ─── L'appelant est-il admin de CETTE organisation ? ───
    const memRes = await db(
      `org_members?org_id=eq.${orgId}&user_id=eq.${caller.id}&select=role`,
    );
    const mem = memRes.ok ? ((await memRes.json()) as { role: string }[]) : [];
    if (mem[0]?.role !== 'admin') {
      return json({ error: 'Seul un administrateur de l\'organisation peut inviter des membres.' }, 403);
    }

    // ─── L'utilisateur existe-t-il déjà ? ───
    const listRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
      { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } },
    );
    const existing = listRes.ok
      ? (((await listRes.json()) as { users?: { id: string; email: string }[] }).users ?? [])
          .find((u) => (u.email ?? '').toLowerCase() === email)
      : undefined;

    let userId = existing?.id ?? '';
    let status: 'invited' | 'added' = 'added';
    let actionLink: string | undefined;

    if (!userId) {
      // Invitation par email (nécessite un SMTP configuré sur le projet)
      const invRes = await fetch(`${SUPABASE_URL}/auth/v1/invite`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (invRes.ok) {
        userId = ((await invRes.json()) as { id?: string }).id ?? '';
        status = 'invited';
      } else {
        // SMTP absent ou quota atteint : on crée le compte et on renvoie un
        // lien que l'admin transmettra lui-même. Pas de faux « email envoyé ».
        const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_ROLE,
            Authorization: `Bearer ${SERVICE_ROLE}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, email_confirm: true }),
        });
        if (!createRes.ok) {
          const detail = await createRes.text();
          console.error('[invite-member] création impossible:', detail);
          return json({ error: 'Impossible de créer cette invitation pour le moment.' }, 502);
        }
        userId = ((await createRes.json()) as { id?: string }).id ?? '';

        const linkRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/generate_link`, {
          method: 'POST',
          headers: {
            apikey: SERVICE_ROLE,
            Authorization: `Bearer ${SERVICE_ROLE}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'magiclink', email }),
        });
        if (linkRes.ok) {
          const link = (await linkRes.json()) as { action_link?: string; properties?: { action_link?: string } };
          actionLink = link.action_link ?? link.properties?.action_link;
        }
      }
    }

    if (!userId) return json({ error: 'Impossible de créer cette invitation pour le moment.' }, 502);

    // ─── Rattachement à l'organisation ───
    const linkMember = await db('org_members', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ org_id: orgId, user_id: userId, role, department_id: departmentId }),
    });
    if (!linkMember.ok) {
      const detail = await linkMember.text();
      console.error('[invite-member] rattachement impossible:', detail);
      return json({ error: 'Le compte existe mais son rattachement a échoué. Réessayez.' }, 502);
    }

    // ─── Journal d'audit ───
    await db('audit_log', {
      method: 'POST',
      body: JSON.stringify({
        org_id: orgId,
        actor: caller.id,
        actor_label: caller.email,
        action: 'member.invite',
        target_kind: 'user',
        target_id: userId,
        detail: { email, role, department_id: departmentId, delivery: actionLink ? 'link' : 'email' },
      }),
    });

    return json({ ok: true, status, action_link: actionLink });
  } catch (err) {
    console.error('[invite-member]', err);
    return json({ error: 'Erreur inattendue. Réessayez dans un instant.' }, 500);
  }
});
