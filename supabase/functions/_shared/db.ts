/**
 * Accès REST à Postgres depuis les Edge Functions, en service_role.
 *
 * Les fonctions de crise écrivent des champs que le client n'a pas le
 * droit de toucher (statut d'un check-in, position consentie, horodatage
 * de réponse) : c'est précisément ce qui rend ces données opposables.
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

export function configured(): boolean {
  return !!SUPABASE_URL && !!SERVICE_ROLE;
}

export async function db(path: string, init: RequestInit = {}): Promise<Response> {
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

export async function dbSelect<T>(path: string): Promise<T[]> {
  const res = await db(path);
  if (!res.ok) return [];
  return (await res.json()) as T[];
}

/** Identité de l'appelant à partir de son JWT — jamais depuis le corps. */
export async function callerFromJwt(
  req: Request,
): Promise<{ id: string; email: string } | null> {
  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) return null;
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: `Bearer ${jwt}` },
  });
  if (!res.ok) return null;
  const user = (await res.json()) as { id?: string; email?: string };
  return user.id ? { id: user.id, email: user.email ?? '' } : null;
}

/** Rôle de l'appelant dans une organisation (null s'il n'en est pas membre). */
export async function roleInOrg(orgId: string, userId: string): Promise<string | null> {
  const rows = await dbSelect<{ role: string }>(
    `org_members?org_id=eq.${orgId}&user_id=eq.${userId}&select=role`,
  );
  return rows[0]?.role ?? null;
}

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
