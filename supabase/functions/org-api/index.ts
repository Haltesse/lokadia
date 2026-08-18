/**
 * Edge Function : org-api
 *
 * API lecture seule d'une organisation, authentifiée par clé.
 *
 * Deux usages, deux chemins :
 *
 *   POST /org-api/keys        (JWT admin)  → crée une clé, la renvoie EN
 *                                            CLAIR une seule fois
 *   GET  /org-api/v1/<res>    (clé API)    → lecture des données
 *
 * Ressources exposées : `missions`, `travelers`, `alerts`, `risk`.
 * Volontairement en lecture seule : une API d'écriture sur des données de
 * sécurité demande une revue plus sérieuse que ce que ce lot permet, et
 * mieux vaut ne pas l'ouvrir que l'ouvrir à moitié.
 *
 * La clé n'est jamais stockée : seul son SHA-256 l'est. On la retrouve par
 * hachage de ce que le client présente. Perdre la clé oblige à en
 * régénérer une — c'est le comportement voulu.
 *
 * Déploiement : supabase functions deploy org-api --no-verify-jwt
 *   (--no-verify-jwt car l'authentification par clé se fait ici ; les
 *    routes d'administration vérifient le JWT explicitement.)
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import { CORS_HEADERS, callerFromJwt, configured, db, dbSelect, json } from '../_shared/db.ts';

const KEY_PREFIX = 'lok_live_';

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Clé aléatoire de 32 octets, encodée en base64url sans remplissage. */
function generateKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const base64 = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${KEY_PREFIX}${base64}`;
}

interface KeyRow {
  id: string;
  org_id: string;
  scopes: string[];
  revoked_at: string | null;
}

/** Identifie l'organisation à partir de l'en-tête `Authorization: Bearer`. */
async function orgFromApiKey(req: Request): Promise<KeyRow | null> {
  const presented = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!presented.startsWith(KEY_PREFIX)) return null;

  const rows = await dbSelect<KeyRow>(
    `api_keys?key_hash=eq.${await sha256(presented)}&select=id,org_id,scopes,revoked_at`,
  );
  const key = rows[0];
  if (!key || key.revoked_at) return null;

  // Trace d'usage : permet de repérer une clé oubliée dans un script.
  await db(`api_keys?id=eq.${key.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ last_used_at: new Date().toISOString() }),
  });
  return key;
}

/**
 * Ce que chaque ressource expose. Liste blanche stricte : on ne renvoie
 * jamais `*`, pour qu'une colonne ajoutée demain ne se retrouve pas
 * publiée par accident.
 */
const RESOURCES: Record<string, string> = {
  missions:
    'missions?select=id,country_iso,country_name,city,date_start,date_end,status,created_at',
  travelers: 'travelers?select=id,first_name,last_name,department_id,created_at',
  alerts:
    'watch_alerts?select=id,country_iso,country_name,kind,severity,summary,status,created_at&order=created_at.desc',
  risk:
    'mission_risk_assessments?select=id,mission_id,inherent_level,residual_level,status,decided_at,updated_at',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (!configured()) return json({ error: 'Fonction mal configurée.' }, 500);

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/org-api/, '');

  try {
    // ─── Administration des clés (JWT, rôle admin) ───
    if (path === '/keys' && req.method === 'POST') {
      const caller = await callerFromJwt(req);
      if (!caller) return json({ error: 'Connexion requise.' }, 401);

      const body = (await req.json().catch(() => ({}))) as { org_id?: string; label?: string };
      const orgId = body.org_id ?? '';
      const label = (body.label ?? '').trim();
      if (!orgId || label.length < 2) {
        return json({ error: 'Organisation et libellé requis.' }, 400);
      }

      const roles = await dbSelect<{ role: string }>(
        `org_members?org_id=eq.${orgId}&user_id=eq.${caller.id}&select=role`,
      );
      if (roles[0]?.role !== 'admin') {
        return json({ error: "Seul un administrateur peut créer une clé d'API." }, 403);
      }

      const key = generateKey();
      const res = await db('api_keys', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          org_id: orgId,
          label,
          prefix: key.slice(0, KEY_PREFIX.length + 6),
          key_hash: await sha256(key),
          created_by: caller.id,
        }),
      });
      if (!res.ok) return json({ error: "Création impossible." }, 500);

      await db('audit_log', {
        method: 'POST',
        body: JSON.stringify({
          org_id: orgId,
          actor: caller.id,
          actor_label: caller.email,
          action: 'api_key.create',
          target_kind: 'api_key',
          detail: { label },
        }),
      });

      // Seule et unique apparition de la clé en clair.
      return json({
        key,
        warning:
          "Copiez cette clé maintenant : elle n'est stockée que sous forme hachée et ne pourra plus être affichée.",
      });
    }

    // ─── Lecture des données (clé API) ───
    if (path.startsWith('/v1/') && req.method === 'GET') {
      const key = await orgFromApiKey(req);
      if (!key) {
        return json({ error: 'Clé absente, invalide ou révoquée.' }, 401);
      }

      const resource = path.slice('/v1/'.length).replace(/\/+$/, '');
      const query = RESOURCES[resource];
      if (!query) {
        return json(
          { error: 'Ressource inconnue.', available: Object.keys(RESOURCES) },
          404,
        );
      }

      const separator = query.includes('?') ? '&' : '?';
      const rows = await dbSelect<Record<string, unknown>>(
        `${query}${separator}org_id=eq.${key.org_id}&limit=500`,
      );
      return json({ resource, count: rows.length, data: rows });
    }

    return json(
      {
        error: 'Route inconnue.',
        routes: ['POST /keys', 'GET /v1/{missions|travelers|alerts|risk}'],
      },
      404,
    );
  } catch (err) {
    console.error('[org-api]', err);
    return json({ error: 'Erreur inattendue.' }, 500);
  }
});
