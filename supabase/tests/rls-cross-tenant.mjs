/**
 * Test d'isolation multi-tenant (RLS) — Lokadia Pro.
 *
 * Prouve qu'une organisation ne peut JAMAIS lire ni écrire les données
 * d'une autre : deux utilisateurs de test, deux organisations, tentatives
 * de lecture/écriture croisées → 0 ligne et erreurs attendues.
 *
 * Exécution (nécessite la clé service_role, JAMAIS commitée) :
 *   LOKADIA_SUPABASE_URL=https://<ref>.supabase.co \
 *   LOKADIA_SUPABASE_ANON_KEY=<anon> \
 *   LOKADIA_SERVICE_ROLE_KEY=<service_role> \
 *   node supabase/tests/rls-cross-tenant.mjs
 *
 * Sortie : code 0 si l'isolation est prouvée, 1 sinon.
 */
import { createClient } from '@supabase/supabase-js';

const URL = process.env.LOKADIA_SUPABASE_URL;
const ANON = process.env.LOKADIA_SUPABASE_ANON_KEY;
const SERVICE = process.env.LOKADIA_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  console.error('Variables requises : LOKADIA_SUPABASE_URL, LOKADIA_SUPABASE_ANON_KEY, LOKADIA_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

const USERS = [
  { email: 'rls-test-a@lokadia.test', password: 'RlsTest-A-2026!' },
  { email: 'rls-test-b@lokadia.test', password: 'RlsTest-B-2026!' },
];

let failures = 0;
function check(label, ok, detail = '') {
  if (ok) {
    console.log(`  ✔ ${label}`);
  } else {
    failures++;
    console.error(`  ✘ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function ensureUser({ email, password }) {
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  });
  if (!error) return created.user.id;
  // Déjà existant → on le retrouve
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw listErr;
  const found = list.users.find((u) => u.email === email);
  if (!found) throw new Error(`Impossible de créer ou retrouver ${email}: ${error.message}`);
  return found.id;
}

async function signIn({ email, password }) {
  const client = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Connexion ${email}: ${error.message}`);
  return client;
}

async function cleanup(orgIds, userIds) {
  for (const org of orgIds.filter(Boolean)) {
    await admin.from('organizations').delete().eq('id', org);
  }
  for (const uid of userIds.filter(Boolean)) {
    await admin.auth.admin.deleteUser(uid);
  }
}

const orgIds = [];
const userIds = [];

try {
  console.log('1. Préparation des deux utilisateurs de test…');
  for (const u of USERS) userIds.push(await ensureUser(u));

  const [clientA, clientB] = await Promise.all(USERS.map(signIn));

  console.log('2. Création des deux organisations…');
  for (const [i, client] of [clientA, clientB].entries()) {
    const { data, error } = await client.rpc('create_organization', {
      p_name: `RLS Test Org ${i === 0 ? 'A' : 'B'}`,
      p_tier: 'starter',
    });
    if (error) throw new Error(`create_organization: ${error.message}`);
    orgIds.push(data);
  }
  const [orgA, orgB] = orgIds;

  console.log('3. Données dans chaque organisation…');
  const { data: travA, error: insAErr } = await clientA
    .from('travelers')
    .insert({ org_id: orgA, first_name: 'Alice', last_name: 'Testeuse' })
    .select('id').single();
  check('A insère un voyageur chez A', !insAErr, insAErr?.message);

  const { error: insBErr } = await clientB
    .from('travelers')
    .insert({ org_id: orgB, first_name: 'Bob', last_name: 'Testeur' });
  check('B insère un voyageur chez B', !insBErr, insBErr?.message);

  console.log('4. Tentatives croisées (tout doit échouer ou renvoyer 0 ligne)…');

  const { data: crossOrgs } = await clientB.from('organizations').select('id').eq('id', orgA);
  check('B ne voit pas l\'organisation A', (crossOrgs ?? []).length === 0);

  const { data: crossTrav } = await clientB.from('travelers').select('id').eq('org_id', orgA);
  check('B ne lit aucun voyageur de A', (crossTrav ?? []).length === 0);

  const { data: crossMembers } = await clientB.from('org_members').select('user_id').eq('org_id', orgA);
  check('B ne lit pas les membres de A', (crossMembers ?? []).length === 0);

  const { error: crossInsert } = await clientB
    .from('travelers')
    .insert({ org_id: orgA, first_name: 'Intrus', last_name: 'Refusé' });
  check('B ne peut pas écrire chez A', !!crossInsert);

  const { error: crossMission } = await clientB.from('missions').insert({
    org_id: orgA, traveler_id: travA?.id, country_iso: 'FR',
    country_name: 'France', date_start: '2026-09-01', date_end: '2026-09-10',
    created_by: userIds[1],
  });
  check('B ne peut pas créer de mission chez A', !!crossMission);

  const { error: crossUpdate } = await clientB
    .from('organizations').update({ name: 'Piraté' }).eq('id', orgA);
  const { data: orgACheck } = await admin.from('organizations').select('name').eq('id', orgA).single();
  check('B ne peut pas renommer A', !!crossUpdate || orgACheck?.name === 'RLS Test Org A');

  console.log('5. Contrôle positif (chacun voit bien SES données)…');
  const { data: ownTrav } = await clientA.from('travelers').select('id').eq('org_id', orgA);
  check('A lit bien son propre voyageur', (ownTrav ?? []).length === 1);

  const { data: ownCompliance } = await clientA.from('compliance_items').select('id').eq('org_id', orgA);
  check('A lit ses compliance_items (trigger mission non testé ici = 0 attendu)', (ownCompliance ?? []).length === 0);
} catch (err) {
  failures++;
  console.error(`Erreur d'exécution : ${err.message}`);
} finally {
  console.log('6. Nettoyage…');
  await cleanup(orgIds, userIds);
}

if (failures > 0) {
  console.error(`\n✘ ISOLATION NON PROUVÉE — ${failures} échec(s).`);
  process.exit(1);
}
console.log('\n✔ Isolation cross-tenant prouvée.');
process.exit(0);
