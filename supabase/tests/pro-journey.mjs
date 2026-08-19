/**
 * Parcours Lokadia Pro de bout en bout, joué par le chemin réel du client.
 *
 *   node supabase/tests/pro-journey.mjs
 *
 * Tout passe par l'API REST avec un **JWT d'utilisateur**, jamais avec la
 * clé de service : ce qui est vérifié ici, c'est donc bien ce qu'un client
 * peut faire, RLS comprise. Un test qui contournerait la RLS ne prouverait
 * rien de ce qui compte.
 *
 * Le parcours : créer une organisation → importer une personne → créer une
 * mission (le déclencheur pose le dossier de conformité) → rédiger et
 * soumettre l'évaluation de risque → tenter de se valider soi-même (doit
 * échouer) → faire valider par quelqu'un d'autre → produire le rapport de
 * conformité et vérifier ses chiffres.
 *
 * Le script nettoie tout derrière lui : l'organisation est supprimée, et
 * les suppressions en cascade emportent le reste.
 *
 * Deuxième compte : créé à la volée par inscription, invité dans
 * l'organisation par la fonction `invite-member` (le chemin réel), puis
 * supprimé — la suppression du compte lui-même demande un accès
 * administrateur et est signalée en fin d'exécution si elle n'a pas pu se
 * faire.
 */
import { readFileSync } from 'node:fs';

const info = readFileSync(new URL('../../utils/supabase/info.tsx', import.meta.url), 'utf8');
const PROJECT = /"([a-z0-9]{20})"/.exec(info)?.[1] ?? 'yprdlcqwloydwzxihepw';
const ANON = /"(eyJ[A-Za-z0-9._-]+)"/.exec(info)[1];
const URL_BASE = `https://${PROJECT}.supabase.co`;

const DEMO = { email: 'demo@lokadia.com', password: 'demo123' };
const TESTER = {
  email: `parcours-pro-${Date.now()}@lokadia-test.invalid`,
  password: `Test-${Math.random().toString(36).slice(2)}!`,
};

/** Second compte, s'il a pu être créé — utilisé aussi au nettoyage. */
let validator = null;
let pass = 0;
let fail = 0;
function check(label, condition, detail = '') {
  if (condition) {
    pass++;
    console.log(`  OK   ${label}`);
  } else {
    fail++;
    console.log(`  ÉCHEC ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function signIn({ email, password }) {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`connexion ${email} : ${body.error_description ?? body.msg}`);
  return { token: body.access_token, userId: body.user.id };
}

async function signUp({ email, password }) {
  const res = await fetch(`${URL_BASE}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`inscription : ${body.error_description ?? body.msg}`);
  return body.access_token ? { token: body.access_token, userId: body.user.id } : null;
}

/** Appel REST authentifié en tant qu'utilisateur. */
async function api(token, path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  return { ok: res.ok, status: res.status, body };
}

async function rpc(token, name, args) {
  return api(token, `rpc/${name}`, { method: 'POST', body: JSON.stringify(args) });
}

console.log('\nParcours Lokadia Pro — chemin client réel (RLS active)\n');

const author = await signIn(DEMO);
console.log(`  Auteur   : ${DEMO.email}`);

// ─── 1. Organisation ─────────────────────────────────────────────────────
const orgRes = await rpc(author.token, 'create_organization', {
  p_name: `Parcours de test ${new Date().toISOString().slice(11, 19)}`,
  p_tier: 'enterprise',
});
check("création de l'organisation", orgRes.ok && typeof orgRes.body === 'string', JSON.stringify(orgRes.body));
const orgId = orgRes.body;

try {
  // ─── 2. Effectif ───────────────────────────────────────────────────────
  const traveler = await api(author.token, 'travelers', {
    method: 'POST',
    body: JSON.stringify({
      org_id: orgId,
      first_name: 'Camille',
      last_name: 'Test',
      email: 'camille.test@lokadia-test.invalid',
    }),
  });
  check("ajout d'une personne à l'effectif", traveler.ok, JSON.stringify(traveler.body));
  const travelerId = traveler.body?.[0]?.id;

  // ─── 3. Mission ────────────────────────────────────────────────────────
  const today = new Date();
  const start = new Date(today.getTime() + 5 * 86400000).toISOString().slice(0, 10);
  const end = new Date(today.getTime() + 12 * 86400000).toISOString().slice(0, 10);
  const mission = await api(author.token, 'missions', {
    method: 'POST',
    body: JSON.stringify({
      org_id: orgId,
      traveler_id: travelerId,
      destination_id: 'marrakech-morocco',
      country_iso: 'MA',
      country_name: 'Maroc',
      city: 'Marrakech',
      date_start: start,
      date_end: end,
      created_by: author.userId,
    }),
  });
  check('création de la mission', mission.ok, JSON.stringify(mission.body));
  const missionId = mission.body?.[0]?.id;

  const items = await api(author.token, `compliance_items?mission_id=eq.${missionId}&select=kind,status`);
  check(
    'dossier de conformité créé automatiquement (4 items)',
    items.ok && items.body.length === 4,
    `${items.body?.length ?? 0} item(s)`,
  );

  // ─── 4. Évaluation de risque ───────────────────────────────────────────
  const assessment = await api(author.token, 'mission_risk_assessments', {
    method: 'POST',
    body: JSON.stringify({
      org_id: orgId,
      mission_id: missionId,
      factors: [{ id: 'security', label: 'Contexte sécuritaire', level: 3 }],
      inherent_level: 3,
      mitigations: ['Briefing sécurité avant départ', 'Point de contact quotidien'],
      residual_level: 2,
      status: 'submitted',
      submitted_by: author.userId,
      submitted_at: new Date().toISOString(),
      created_by: author.userId,
    }),
  });
  check("soumission de l'évaluation de risque", assessment.ok, JSON.stringify(assessment.body));
  const assessmentId = assessment.body?.[0]?.id;

  // Auto-validation : doit être refusée par la contrainte de séparation
  const selfApprove = await api(author.token, `mission_risk_assessments?id=eq.${assessmentId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'approved',
      decided_by: author.userId,
      decided_at: new Date().toISOString(),
    }),
  });
  check(
    "auto-validation refusée (séparation des tâches)",
    !selfApprove.ok && String(selfApprove.body?.message ?? '').includes('risk_decider_is_not_submitter'),
    `statut ${selfApprove.status}`,
  );

  // ─── 5. Validation par une autre personne ──────────────────────────────
  try {
    validator = await signUp(TESTER);
  } catch (err) {
    console.log(`  (inscription du second compte impossible : ${err.message})`);
  }

  if (validator) {
    const invite = await fetch(`${URL_BASE}/functions/v1/invite-member`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${author.token}` },
      body: JSON.stringify({ org_id: orgId, email: TESTER.email, role: 'admin' }),
    });
    const inviteBody = await invite.json();
    check("invitation du second compte dans l'organisation", invite.ok, JSON.stringify(inviteBody));

    const approve = await api(validator.token, `mission_risk_assessments?id=eq.${assessmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'approved',
        decided_by: validator.userId,
        decided_at: new Date().toISOString(),
        decision_note: 'Mesures jugées suffisantes.',
      }),
    });
    check('validation par une autre personne acceptée', approve.ok && approve.body?.[0]?.status === 'approved',
      JSON.stringify(approve.body));

    const locked = await api(validator.token, `mission_risk_assessments?id=eq.${assessmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ residual_level: 1 }),
    });
    check(
      'évaluation décidée non modifiable',
      locked.ok && (locked.body?.length ?? 0) === 0,
      `${locked.body?.length ?? 0} ligne(s) modifiée(s)`,
    );
  }

  // ─── 6. Rapport de conformité ──────────────────────────────────────────
  const report = await rpc(author.token, 'generate_report_now', { p_org: orgId });
  check('génération du rapport de conformité', report.ok, JSON.stringify(report.body));

  const runs = await api(author.token, `report_runs?org_id=eq.${orgId}&select=payload,manual`);
  const payload = runs.body?.[0]?.payload ?? {};
  check('le rapport compte la personne ajoutée', payload.travelers === 1, `travelers=${payload.travelers}`);
  check('le rapport compte la mission à venir', payload.missions_upcoming_30d === 1,
    `missions_upcoming_30d=${payload.missions_upcoming_30d}`);
  check('le rapport signale le dossier incomplet', payload.compliance_incomplete === 1,
    `compliance_incomplete=${payload.compliance_incomplete}`);
  // Sans second compte, l'évaluation reste en attente — et le rapport doit
  // le dire. C'est la même vérification lue dans les deux sens.
  check(
    validator
      ? "le rapport ne signale plus d'évaluation en attente"
      : "le rapport signale l'évaluation en attente de validation",
    payload.risk_awaiting_decision === (validator ? 0 : 1),
    `risk_awaiting_decision=${payload.risk_awaiting_decision}`,
  );

  // ─── 7. Cloisonnement ──────────────────────────────────────────────────
  const anonRead = await fetch(`${URL_BASE}/rest/v1/missions?select=*`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  const anonBody = await anonRead.json();
  check('lecture anonyme des missions vide', Array.isArray(anonBody) && anonBody.length === 0,
    `${anonBody?.length ?? '?'} ligne(s)`);
} finally {
  // ─── Nettoyage ─────────────────────────────────────────────────────────
  const del = await api(author.token, `organizations?id=eq.${orgId}`, { method: 'DELETE' });
  check("suppression de l'organisation de test", del.ok, `statut ${del.status}`);
  if (validator) {
    console.log(
      `\n  Le compte ${TESTER.email} reste à supprimer côté authentification` +
        ' (cela demande un accès administrateur).',
    );
  }
}

console.log(`\n${pass} vérification(s) réussie(s), ${fail} échec(s).\n`);
process.exit(fail > 0 ? 1 : 0);
