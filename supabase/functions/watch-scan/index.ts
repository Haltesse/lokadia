/**
 * Edge Function : watch-scan
 *
 * Veille « zéro bruit » sur les pays suivis.
 *
 * Règle : une alerte n'est créée que si DEUX conditions sont réunies —
 *   1. l'état du pays a réellement CHANGÉ depuis le dernier passage ;
 *   2. l'organisation a des personnes sur place à cet instant.
 * Une notification qui n'appelle aucune décision est une notification qui
 * apprend à ignorer les suivantes. On préfère ne rien envoyer.
 *
 * POST /functions/v1/watch-scan          (JWT : membre de l'organisation)
 *   body: { org_id }
 *   → { scanned, changed, alerts_created, skipped_no_people }
 *
 * Peut aussi être appelée par un planificateur avec la clé service_role
 * (body: { all: true }) pour balayer toutes les organisations.
 *
 * Déploiement : supabase functions deploy watch-scan
 */
import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';
import {
  CORS_HEADERS, UUID_RE, callerFromJwt, configured, db, dbSelect, json, roleInOrg,
} from '../_shared/db.ts';
import { sendPush } from '../_shared/webpush.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

/** Écart de score en deçà duquel on considère qu'il ne s'est rien passé. */
const SIGNIFICANT_DROP = 5;

interface WatchedRow {
  country_iso: string;
  country_name: string;
}

interface MissionRow {
  traveler_id: string;
  destination_id: string | null;
  country_iso: string;
}

interface SnapshotRow {
  country_iso: string;
  score: number | null;
  level: string | null;
  advisory: string | null;
}

interface ScoreResult {
  score: number | null;
  level: string;
  label: string;
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

/** Sévérité déduite de l'ampleur du changement — jamais du hasard. */
function severityFor(kind: string, delta: number, level: string): 'info' | 'vigilance' | 'urgent' {
  if (kind === 'score_rise') return 'info';
  if (level === 'forbidden' || level === 'high-risk') return 'urgent';
  if (delta >= 15) return 'urgent';
  return 'vigilance';
}

async function scanOrg(orgId: string): Promise<{
  scanned: number; changed: number; alerts_created: number; skipped_no_people: number;
}> {
  const watched = await dbSelect<WatchedRow>(
    `watched_countries?org_id=eq.${orgId}&select=country_iso,country_name`,
  );
  if (watched.length === 0) {
    return { scanned: 0, changed: 0, alerts_created: 0, skipped_no_people: 0 };
  }

  const today = new Date().toISOString().slice(0, 10);
  const missions = await dbSelect<MissionRow>(
    `missions?org_id=eq.${orgId}&date_start=lte.${today}&date_end=gte.${today}` +
      `&status=in.(approved,active)&select=traveler_id,destination_id,country_iso`,
  );

  // Personnes présentes, par pays
  const peopleByCountry = new Map<string, Set<string>>();
  const destByCountry = new Map<string, string>();
  for (const m of missions) {
    const iso = m.country_iso.toUpperCase();
    if (!peopleByCountry.has(iso)) peopleByCountry.set(iso, new Set());
    peopleByCountry.get(iso)!.add(m.traveler_id);
    if (m.destination_id && !destByCountry.has(iso)) destByCountry.set(iso, m.destination_id);
  }

  let scanned = 0, changed = 0, created = 0, skipped = 0;
  const newAlerts: Record<string, unknown>[] = [];

  for (const w of watched) {
    const iso = w.country_iso.toUpperCase();
    const people = peopleByCountry.get(iso)?.size ?? 0;

    // Zéro bruit, condition 2 : pas de personnes sur place → on ne notifie pas
    if (people === 0) { skipped++; continue; }

    const destinationId = destByCountry.get(iso);
    if (!destinationId) { skipped++; continue; }

    const current = await fetchScore(destinationId);
    if (!current || current.score === null) continue;
    scanned++;

    const previous = (
      await dbSelect<SnapshotRow>(`country_snapshots?country_iso=eq.${iso}&select=*`)
    )[0];

    // Instantané mis à jour dans tous les cas : c'est la référence du
    // prochain passage, indépendamment de toute notification.
    await db('country_snapshots', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        country_iso: iso,
        score: current.score,
        level: current.level,
        advisory: null,
        sources: flatSources(current.sources),
        captured_at: new Date().toISOString(),
      }),
    });

    // Premier passage : on enregistre l'état, sans alerter (rien n'a « changé »)
    if (!previous || previous.score === null) continue;

    const delta = previous.score - current.score;
    const levelChanged = previous.level !== current.level;
    const meaningfulDrop = delta >= SIGNIFICANT_DROP;
    const meaningfulRise = -delta >= SIGNIFICANT_DROP * 2; // on remonte rarement l'info

    // Zéro bruit, condition 1 : rien de significatif → rien à signaler
    if (!levelChanged && !meaningfulDrop && !meaningfulRise) continue;
    changed++;

    const kind = levelChanged ? 'level_change' : meaningfulDrop ? 'score_drop' : 'score_rise';
    const summary = levelChanged
      ? `${w.country_name} passe de « ${previous.level} » à « ${current.level} » (${previous.score} → ${current.score}). ${people} personne(s) sur place.`
      : meaningfulDrop
        ? `Le Lokascore de ${w.country_name} baisse de ${delta} points (${previous.score} → ${current.score}). ${people} personne(s) sur place.`
        : `Le Lokascore de ${w.country_name} remonte (${previous.score} → ${current.score}).`;

    newAlerts.push({
      org_id: orgId,
      country_iso: iso,
      country_name: w.country_name,
      kind,
      previous_value: String(previous.score),
      current_value: String(current.score),
      people_count: people,
      severity: severityFor(kind, Math.abs(delta), current.level),
      summary,
      sources: flatSources(current.sources),
    });
  }

  if (newAlerts.length > 0) {
    const res = await db('watch_alerts', { method: 'POST', body: JSON.stringify(newAlerts) });
    if (res.ok) created = newAlerts.length;
  }

  return { scanned, changed, alerts_created: created, skipped_no_people: skipped };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405);
  if (!configured()) return json({ error: 'Fonction mal configurée côté serveur.' }, 500);

  try {
    const body = (await req.json().catch(() => ({}))) as { org_id?: string; all?: boolean };

    // Balayage global : réservé à un appel service_role (planificateur)
    if (body.all) {
      const auth = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
      if (auth !== SERVICE_ROLE) return json({ error: 'Non autorisé.' }, 403);

      const orgs = await dbSelect<{ id: string }>('organizations?select=id');
      const totals = { scanned: 0, changed: 0, alerts_created: 0, skipped_no_people: 0 };
      for (const o of orgs) {
        const r = await scanOrg(o.id);
        totals.scanned += r.scanned;
        totals.changed += r.changed;
        totals.alerts_created += r.alerts_created;
        totals.skipped_no_people += r.skipped_no_people;
      }
      return json({ organizations: orgs.length, ...totals });
    }

    // Balayage d'une organisation : appelé depuis le back-office
    const caller = await callerFromJwt(req);
    if (!caller) return json({ error: 'Connexion requise.' }, 401);

    const orgId = body.org_id ?? '';
    if (!UUID_RE.test(orgId)) return json({ error: 'Organisation invalide.' }, 400);

    const role = await roleInOrg(orgId, caller.id);
    if (!role) return json({ error: 'Vous ne faites pas partie de cette organisation.' }, 403);

    const result = await scanOrg(orgId);

    // Notification aux voyageurs abonnés uniquement si une alerte urgente
    // vient d'apparaître — sinon le back-office suffit.
    if (result.alerts_created > 0) {
      const urgent = await dbSelect<{ id: string }>(
        `watch_alerts?org_id=eq.${orgId}&severity=eq.urgent&status=eq.open&select=id&limit=1`,
      );
      if (urgent.length > 0) {
        const subs = await dbSelect<{ id: string; endpoint: string }>(
          `push_subscriptions?org_id=eq.${orgId}&select=id,endpoint`,
        );
        for (const s of subs) {
          const outcome = await sendPush({ endpoint: s.endpoint });
          if (outcome.gone) await db(`push_subscriptions?id=eq.${s.id}`, { method: 'DELETE' });
        }
      }
    }

    await db('audit_log', {
      method: 'POST',
      body: JSON.stringify({
        org_id: orgId,
        actor: caller.id,
        actor_label: caller.email,
        action: 'watch.scan',
        target_kind: 'watch',
        detail: result,
      }),
    });

    return json(result);
  } catch (err) {
    console.error('[watch-scan]', err);
    return json({ error: 'Erreur inattendue. Réessayez dans un instant.' }, 500);
  }
});
