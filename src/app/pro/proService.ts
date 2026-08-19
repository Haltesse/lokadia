/**
 * proService — accès données Lokadia Pro (multi-tenant).
 *
 * Toutes les requêtes passent par ici (pas de supabase.from() dispersé
 * dans les composants). La sécurité est portée par les policies RLS :
 * ce service ne reçoit que ce que l'organisation du membre courant
 * a le droit de voir.
 */
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Tables = Database['public']['Tables'];
export type Organization = Tables['organizations']['Row'];
export type OrgMember = Tables['org_members']['Row'];
export type Department = Tables['departments']['Row'];
export type Traveler = Tables['travelers']['Row'];
export type Mission = Tables['missions']['Row'];
export type ComplianceItem = Tables['compliance_items']['Row'];
export type Briefing = Tables['briefings']['Row'];
export type BriefingReceipt = Tables['briefing_receipts']['Row'];
export type AuditEntry = Tables['audit_log']['Row'];
export type CrisisEvent = Tables['crisis_events']['Row'];
export type CrisisLogEntry = Tables['crisis_log']['Row'];
export type CheckinRequest = Tables['checkin_requests']['Row'];
export type CheckinResponse = Tables['checkin_responses']['Row'];
export type EscalationContact = Tables['escalation_contacts']['Row'];
export type WatchedCountry = Tables['watched_countries']['Row'];
export type WatchAlert = Tables['watch_alerts']['Row'];

export type CheckinResponseWithTraveler = CheckinResponse & {
  travelers: Pick<Traveler, 'id' | 'first_name' | 'last_name' | 'phone' | 'email'> | null;
};

export type MissionWithCompliance = Mission & {
  travelers: Pick<Traveler, 'id' | 'first_name' | 'last_name' | 'department_id'> | null;
  compliance_items: Pick<ComplianceItem, 'id' | 'kind' | 'status' | 'completed_at'>[];
  /**
   * Relation 1-1 (contrainte `unique (mission_id)`) : PostgREST renvoie donc
   * un objet unique — un accusé au plus par mission, jamais un tableau.
   */
  briefing_receipts: Pick<BriefingReceipt, 'id' | 'token' | 'sent_at' | 'read_at' | 'read_name'> | null;
};

export interface TravelerImportRow {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  department?: string;
}

// ─── Organisations ───────────────────────────────────────────────────────

export async function fetchMyOrganizations(): Promise<Organization[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchMyMembership(orgId: string, userId: string): Promise<OrgMember | null> {
  const { data, error } = await supabase
    .from('org_members')
    .select('*')
    .eq('org_id', orgId)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createOrganization(name: string, tier: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_organization', {
    p_name: name,
    p_tier: tier,
  });
  if (error) throw error;
  return data as string;
}

export async function fetchMembers(orgId: string): Promise<OrgMember[]> {
  const { data, error } = await supabase
    .from('org_members')
    .select('*')
    .eq('org_id', orgId);
  if (error) throw error;
  return data ?? [];
}

// ─── Effectif ────────────────────────────────────────────────────────────

export async function fetchTravelers(orgId: string): Promise<Traveler[]> {
  const { data, error } = await supabase
    .from('travelers')
    .select('*')
    .eq('org_id', orgId)
    .order('last_name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchDepartments(orgId: string): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('org_id', orgId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

/**
 * Import d'effectif : crée les départements manquants puis insère les
 * voyageurs par lots. Retourne le nombre de lignes insérées.
 */
export async function importTravelers(
  orgId: string,
  actor: { id: string; email: string },
  rows: TravelerImportRow[],
): Promise<number> {
  if (rows.length === 0) return 0;

  // 1. Départements manquants
  const wanted = [...new Set(rows.map((r) => r.department?.trim()).filter((d): d is string => !!d))];
  const existing = await fetchDepartments(orgId);
  const byName = new Map(existing.map((d) => [d.name.toLowerCase(), d.id]));
  const missing = wanted.filter((n) => !byName.has(n.toLowerCase()));
  if (missing.length > 0) {
    const { data, error } = await supabase
      .from('departments')
      .insert(missing.map((name) => ({ org_id: orgId, name })))
      .select('id, name');
    if (error) throw error;
    for (const d of data ?? []) byName.set(d.name.toLowerCase(), d.id);
  }

  // 2. Voyageurs par lots de 200
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 200) {
    const batch = rows.slice(i, i + 200).map((r) => ({
      org_id: orgId,
      first_name: r.first_name.trim(),
      last_name: r.last_name.trim(),
      email: r.email?.trim() || null,
      phone: r.phone?.trim() || null,
      nationality: r.nationality?.trim().toUpperCase() || null,
      department_id: r.department ? byName.get(r.department.trim().toLowerCase()) ?? null : null,
    }));
    const { error, count } = await supabase
      .from('travelers')
      .insert(batch, { count: 'exact' });
    if (error) throw error;
    inserted += count ?? batch.length;
  }

  await logAudit(orgId, actor, {
    action: 'traveler.import',
    target_kind: 'travelers',
    detail: { count: inserted, departments_created: missing.length },
  });
  return inserted;
}

// ─── Missions ────────────────────────────────────────────────────────────

export async function fetchMissions(orgId: string): Promise<MissionWithCompliance[]> {
  const { data, error } = await supabase
    .from('missions')
    // Littéral d'une seule pièce : l'inférence de types Supabase ne sait pas
    // analyser une chaîne concaténée à l'exécution.
    .select('*, travelers ( id, first_name, last_name, department_id ), compliance_items ( id, kind, status, completed_at ), briefing_receipts ( id, token, sent_at, read_at, read_name )')
    .eq('org_id', orgId)
    .order('date_start', { ascending: false });
  if (error) throw error;
  return (data ?? []) as MissionWithCompliance[];
}

export interface NewMission {
  traveler_id: string;
  destination_id: string | null;
  country_iso: string;
  country_name: string;
  city: string | null;
  date_start: string; // YYYY-MM-DD
  date_end: string;
}

export async function createMission(
  orgId: string,
  actor: { id: string; email: string },
  m: NewMission,
): Promise<void> {
  const { data, error } = await supabase
    .from('missions')
    .insert({ org_id: orgId, created_by: actor.id, status: 'approved', ...m })
    .select('id')
    .single();
  if (error) throw error;

  await logAudit(orgId, actor, {
    action: 'mission.create',
    target_kind: 'mission',
    target_id: data.id,
    detail: {
      country: m.country_name,
      city: m.city,
      date_start: m.date_start,
      date_end: m.date_end,
      in_catalog: m.destination_id !== null,
    },
  });
}

export async function setComplianceStatus(
  orgId: string,
  actor: { id: string; email: string },
  itemId: string,
  kind: string,
  missionId: string,
  done: boolean,
): Promise<void> {
  const { error } = await supabase
    .from('compliance_items')
    .update({
      status: done ? 'done' : 'pending',
      completed_at: done ? new Date().toISOString() : null,
      evidence: done ? `Validé manuellement par ${actor.email}` : null,
    })
    .eq('id', itemId);
  if (error) throw error;

  await logAudit(orgId, actor, {
    action: done ? 'compliance.validate' : 'compliance.revoke',
    target_kind: 'mission',
    target_id: missionId,
    detail: { item: kind },
  });
}

// ─── Journal d'audit ─────────────────────────────────────────────────────

export interface AuditInput {
  action: string;
  target_kind?: string | null;
  target_id?: string | null;
  detail?: Record<string, unknown> | null;
}

/**
 * Écrit une entrée dans le registre horodaté. Table append-only : ni
 * modification ni suppression possible ensuite, y compris en service_role.
 *
 * L'échec d'écriture du journal ne doit jamais faire échouer l'action
 * métier de l'utilisateur — on le remonte en console, sans exception.
 */
export async function logAudit(
  orgId: string,
  actor: { id: string; email: string },
  entry: AuditInput,
): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    org_id: orgId,
    actor: actor.id,
    actor_label: actor.email,
    action: entry.action,
    target_kind: entry.target_kind ?? null,
    target_id: entry.target_id ?? null,
    detail: (entry.detail ?? null) as Database['public']['Tables']['audit_log']['Insert']['detail'],
  });
  if (error) console.warn('[audit]', error.message);
}

export async function fetchAuditLog(orgId: string, limit = 200): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ─── Briefings pré-départ ────────────────────────────────────────────────

export async function fetchBriefings(orgId: string): Promise<Briefing[]> {
  const { data, error } = await supabase
    .from('briefings')
    .select('*')
    .eq('org_id', orgId)
    .order('country_name');
  if (error) throw error;
  return data ?? [];
}

export interface BriefingInput {
  country_iso: string;
  country_name: string;
  title: string;
  content: string;
  source: string;
  source_url: string | null;
}

export async function saveBriefing(
  orgId: string,
  actor: { id: string; email: string },
  input: BriefingInput,
  existingId?: string,
): Promise<string> {
  if (existingId) {
    const { error } = await supabase
      .from('briefings')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', existingId);
    if (error) throw error;
    await logAudit(orgId, actor, {
      action: 'briefing.update',
      target_kind: 'briefing',
      target_id: existingId,
      detail: { country: input.country_name, source: input.source },
    });
    return existingId;
  }

  const { data, error } = await supabase
    .from('briefings')
    .insert({ org_id: orgId, created_by: actor.id, ...input })
    .select('id')
    .single();
  if (error) throw error;
  await logAudit(orgId, actor, {
    action: 'briefing.create',
    target_kind: 'briefing',
    target_id: data.id,
    detail: { country: input.country_name, source: input.source },
  });
  return data.id;
}

export async function deleteBriefing(
  orgId: string,
  actor: { id: string; email: string },
  briefingId: string,
  countryName: string,
): Promise<void> {
  const { error } = await supabase.from('briefings').delete().eq('id', briefingId);
  if (error) throw error;
  await logAudit(orgId, actor, {
    action: 'briefing.delete',
    target_kind: 'briefing',
    target_id: briefingId,
    detail: { country: countryName },
  });
}

export interface SendBriefingResult {
  created: number;
  skippedNoBriefing: string[];   // pays sans briefing rédigé
  alreadySent: number;
}

/**
 * Génère les liens d'accusé de lecture pour une liste de missions.
 * Une mission déjà pourvue d'un accusé n'est jamais réinitialisée (la
 * preuve existante reste stable) ; les pays sans briefing sont signalés
 * plutôt qu'ignorés silencieusement.
 */
export async function sendBriefings(
  orgId: string,
  actor: { id: string; email: string },
  missions: MissionWithCompliance[],
): Promise<SendBriefingResult> {
  const briefings = await fetchBriefings(orgId);
  const byIso = new Map(briefings.map((b) => [b.country_iso.toUpperCase(), b]));

  const rows: Tables['briefing_receipts']['Insert'][] = [];
  const skipped = new Set<string>();
  let alreadySent = 0;

  for (const m of missions) {
    if (m.briefing_receipts) { alreadySent++; continue; }
    const briefing = byIso.get(m.country_iso.toUpperCase());
    if (!briefing) { skipped.add(m.country_name); continue; }
    rows.push({
      org_id: orgId,
      briefing_id: briefing.id,
      mission_id: m.id,
      traveler_id: m.traveler_id,
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase.from('briefing_receipts').insert(rows);
    if (error) throw error;
    await logAudit(orgId, actor, {
      action: 'briefing.send',
      target_kind: 'mission',
      target_id: null,
      detail: { count: rows.length, missions: rows.map((r) => r.mission_id) },
    });
  }

  return { created: rows.length, skippedNoBriefing: [...skipped], alreadySent };
}

/** URL publique d'accusé de lecture à transmettre au voyageur. */
export function briefingAckUrl(token: string): string {
  return `${window.location.origin}/briefing/${token}`;
}

// ─── Invitations d'équipe (Edge Function invite-member) ──────────────────

export interface InviteResult {
  status: 'invited' | 'added';
  /** Renseigné quand l'email n'a pas pu partir : lien à transmettre soi-même */
  actionLink?: string;
}

export async function inviteMember(
  orgId: string,
  email: string,
  role: string,
  departmentId: string | null,
): Promise<InviteResult> {
  const { data, error } = await supabase.functions.invoke('invite-member', {
    body: { org_id: orgId, email, role, department_id: departmentId },
  });
  if (error) {
    // L'Edge Function renvoie un message lisible dans le corps de la réponse
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      const body = await ctx.json().catch(() => null) as { error?: string } | null;
      if (body?.error) throw new Error(body.error);
    }
    throw error;
  }
  const res = data as { status?: 'invited' | 'added'; action_link?: string };
  return { status: res.status ?? 'added', actionLink: res.action_link };
}

// ─── Gestion de crise ────────────────────────────────────────────────────

export async function fetchCrisisEvents(orgId: string): Promise<CrisisEvent[]> {
  const { data, error } = await supabase
    .from('crisis_events')
    .select('*')
    .eq('org_id', orgId)
    .order('opened_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchCrisisLog(eventId: string): Promise<CrisisLogEntry[]> {
  const { data, error } = await supabase
    .from('crisis_log')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function openCrisisEvent(
  orgId: string,
  actor: { id: string; email: string },
  input: {
    title: string; description: string | null; country_iso: string | null;
    city: string | null; severity: string; is_exercise: boolean;
  },
): Promise<string> {
  const { data, error } = await supabase
    .from('crisis_events')
    .insert({ org_id: orgId, opened_by: actor.id, ...input })
    .select('id')
    .single();
  if (error) throw error;

  await supabase.from('crisis_log').insert({
    org_id: orgId, event_id: data.id, actor_label: actor.email, kind: 'status',
    entry: input.is_exercise
      ? `Exercice ouvert : ${input.title}.`
      : `Événement ouvert : ${input.title} (sévérité ${input.severity}).`,
  });

  await logAudit(orgId, actor, {
    action: input.is_exercise ? 'crisis.exercise.open' : 'crisis.open',
    target_kind: 'crisis_event', target_id: data.id,
    detail: { title: input.title, severity: input.severity },
  });
  return data.id;
}

export async function closeCrisisEvent(
  orgId: string,
  actor: { id: string; email: string },
  eventId: string,
): Promise<void> {
  const { error } = await supabase
    .from('crisis_events')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', eventId);
  if (error) throw error;

  await supabase.from('crisis_log').insert({
    org_id: orgId, event_id: eventId, actor_label: actor.email,
    kind: 'status', entry: 'Événement clos.',
  });
  await logAudit(orgId, actor, {
    action: 'crisis.close', target_kind: 'crisis_event', target_id: eventId,
  });
}

export async function addCrisisLogEntry(
  orgId: string,
  actor: { id: string; email: string },
  eventId: string,
  entry: string,
  kind: 'note' | 'decision',
): Promise<void> {
  const { error } = await supabase.from('crisis_log').insert({
    org_id: orgId, event_id: eventId, actor_label: actor.email, kind, entry,
  });
  if (error) throw error;
}

/** Personnes concernées par un ciblage — sert aussi à l'aperçu avant envoi. */
export function targetsForScope(
  missions: MissionWithCompliance[],
  scope: { countryIso: string | null; missionsOnly: boolean },
): { travelerId: string; missionId: string; countryName: string }[] {
  const active = missions.filter((m) => isMissionActiveToday(m));
  const pool = scope.missionsOnly ? active : missions.filter((m) => isMissionActiveToday(m) || isMissionUpcoming(m));
  const filtered = scope.countryIso
    ? pool.filter((m) => m.country_iso.toUpperCase() === scope.countryIso!.toUpperCase())
    : pool;

  // Une seule ligne par personne, même si elle a plusieurs missions
  const byTraveler = new Map<string, { travelerId: string; missionId: string; countryName: string }>();
  for (const m of filtered) {
    if (!byTraveler.has(m.traveler_id)) {
      byTraveler.set(m.traveler_id, {
        travelerId: m.traveler_id, missionId: m.id, countryName: m.country_name,
      });
    }
  }
  return [...byTraveler.values()];
}

export interface NewCheckin {
  eventId: string | null;
  message: string;
  scopeLabel: string;
  isExercise: boolean;
  askPosition: boolean;
  targets: { travelerId: string; missionId: string }[];
}

export async function createCheckin(
  orgId: string,
  actor: { id: string; email: string },
  input: NewCheckin,
): Promise<string> {
  const { data, error } = await supabase
    .from('checkin_requests')
    .insert({
      org_id: orgId, event_id: input.eventId, message: input.message,
      scope_label: input.scopeLabel, is_exercise: input.isExercise,
      ask_position: input.askPosition, created_by: actor.id,
    })
    .select('id')
    .single();
  if (error) throw error;

  const { error: rowsError } = await supabase.from('checkin_responses').insert(
    input.targets.map((t) => ({
      org_id: orgId, request_id: data.id,
      traveler_id: t.travelerId, mission_id: t.missionId,
    })),
  );
  if (rowsError) throw rowsError;

  await logAudit(orgId, actor, {
    action: input.isExercise ? 'checkin.exercise.create' : 'checkin.create',
    target_kind: 'checkin_request', target_id: data.id,
    detail: { cible: input.targets.length, scope: input.scopeLabel },
  });
  return data.id;
}

export async function fetchCheckins(orgId: string): Promise<CheckinRequest[]> {
  const { data, error } = await supabase
    .from('checkin_requests')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function fetchCheckinResponses(requestId: string): Promise<CheckinResponseWithTraveler[]> {
  const { data, error } = await supabase
    .from('checkin_responses')
    .select('*, travelers ( id, first_name, last_name, phone, email )')
    .eq('request_id', requestId);
  if (error) throw error;
  return (data ?? []) as CheckinResponseWithTraveler[];
}

export interface DispatchResult {
  targeted: number;
  pushed: number;
  without_push: number;
  failed: number;
  removed: number;
}

/** Déclenche l'envoi (ou la relance) via l'Edge Function crisis-dispatch. */
export async function dispatchCheckin(
  orgId: string,
  requestId: string,
  onlyPending = false,
): Promise<DispatchResult> {
  const { data, error } = await supabase.functions.invoke('crisis-dispatch', {
    body: { org_id: orgId, request_id: requestId, only_pending: onlyPending },
  });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      const body = (await ctx.json().catch(() => null)) as { error?: string } | null;
      if (body?.error) throw new Error(body.error);
    }
    throw error;
  }
  return data as DispatchResult;
}

/** URL personnelle de réponse, à transmettre si la personne n'a pas le push. */
export function checkinUrl(token: string): string {
  return `${window.location.origin}/checkin/${token}`;
}

// ─── Veille par pays suivi ───────────────────────────────────────────────

export async function fetchWatchedCountries(orgId: string): Promise<WatchedCountry[]> {
  const { data, error } = await supabase
    .from('watched_countries')
    .select('*')
    .eq('org_id', orgId)
    .order('country_name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchWatchAlerts(orgId: string, openOnly = false): Promise<WatchAlert[]> {
  let query = supabase
    .from('watch_alerts')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (openOnly) query = query.eq('status', 'open');
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function watchCountry(
  orgId: string,
  actor: { id: string; email: string },
  countryIso: string,
  countryName: string,
  auto = false,
): Promise<void> {
  const { error } = await supabase.from('watched_countries').insert({
    org_id: orgId, country_iso: countryIso.toUpperCase(),
    country_name: countryName, auto, added_by: actor.id,
  });
  if (error) throw error;
  if (!auto) {
    await logAudit(orgId, actor, {
      action: 'watch.add', target_kind: 'country', target_id: countryIso,
      detail: { pays: countryName },
    });
  }
}

export async function unwatchCountry(
  orgId: string,
  actor: { id: string; email: string },
  id: string,
  countryName: string,
): Promise<void> {
  const { error } = await supabase.from('watched_countries').delete().eq('id', id);
  if (error) throw error;
  await logAudit(orgId, actor, {
    action: 'watch.remove', target_kind: 'country', detail: { pays: countryName },
  });
}

export async function acknowledgeWatchAlert(
  orgId: string,
  actor: { id: string; email: string },
  alertId: string,
  countryName: string,
): Promise<void> {
  const { error } = await supabase
    .from('watch_alerts')
    .update({
      status: 'acknowledged',
      acknowledged_by: actor.id,
      acknowledged_at: new Date().toISOString(),
    })
    .eq('id', alertId);
  if (error) throw error;
  await logAudit(orgId, actor, {
    action: 'watch.acknowledge', target_kind: 'watch_alert', target_id: alertId,
    detail: { pays: countryName },
  });
}

export interface ScanResult {
  scanned: number;
  changed: number;
  alerts_created: number;
  skipped_no_people: number;
}

/** Déclenche un balayage de veille via l'Edge Function watch-scan. */
export async function runWatchScan(orgId: string): Promise<ScanResult> {
  const { data, error } = await supabase.functions.invoke('watch-scan', {
    body: { org_id: orgId },
  });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      const body = (await ctx.json().catch(() => null)) as { error?: string } | null;
      if (body?.error) throw new Error(body.error);
    }
    throw error;
  }
  return data as ScanResult;
}

// ─── Contacts d'escalade ─────────────────────────────────────────────────

export async function fetchEscalationContacts(orgId: string): Promise<EscalationContact[]> {
  const { data, error } = await supabase
    .from('escalation_contacts')
    .select('*')
    .eq('org_id', orgId)
    .order('rank');
  if (error) throw error;
  return data ?? [];
}

export async function saveEscalationContact(
  orgId: string,
  actor: { id: string; email: string },
  input: { rank: number; name: string; role: string | null; phone: string | null; email: string | null; delay_min: number },
): Promise<void> {
  const { error } = await supabase.from('escalation_contacts').insert({ org_id: orgId, ...input });
  if (error) throw error;
  await logAudit(orgId, actor, {
    action: 'escalation.add', target_kind: 'escalation', detail: { name: input.name, rank: input.rank },
  });
}

export async function deleteEscalationContact(
  orgId: string,
  actor: { id: string; email: string },
  id: string,
  name: string,
): Promise<void> {
  const { error } = await supabase.from('escalation_contacts').delete().eq('id', id);
  if (error) throw error;
  await logAudit(orgId, actor, { action: 'escalation.remove', target_kind: 'escalation', detail: { name } });
}

// ─── Agrégats dashboard ──────────────────────────────────────────────────

export function isMissionActiveToday(m: Mission, today = new Date()): boolean {
  if (m.status === 'refused' || m.status === 'draft' || m.status === 'done') return false;
  const d = today.toISOString().slice(0, 10);
  return m.date_start <= d && m.date_end >= d;
}

export function isMissionUpcoming(m: Mission, today = new Date()): boolean {
  if (m.status === 'refused' || m.status === 'done') return false;
  return m.date_start > today.toISOString().slice(0, 10);
}

export function complianceComplete(m: MissionWithCompliance): boolean {
  return m.compliance_items.length >= 4 && m.compliance_items.every((c) => c.status === 'done');
}

// ─── Évaluation de risque par mission (P5, ISO 31030) ────────────────────

export type RiskAssessment =
  Database['public']['Tables']['mission_risk_assessments']['Row'];

export async function fetchRiskAssessments(orgId: string): Promise<RiskAssessment[]> {
  const { data, error } = await supabase
    .from('mission_risk_assessments')
    .select('*')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export interface RiskDraft {
  mission_id: string;
  factors: { id: string; label: string; level: number; note?: string }[];
  inherent_level: number;
  mitigations: string[];
  residual_level: number;
  /** true = soumettre à validation, false = garder en brouillon */
  submit: boolean;
}

/**
 * Crée ou met à jour l'évaluation d'une mission.
 *
 * `upsert` sur `mission_id` : une mission n'a qu'une évaluation courante.
 * La base refusera la modification si une décision a déjà été prise — la
 * trace ne se réécrit pas après coup.
 */
export async function saveRiskAssessment(
  orgId: string,
  actor: { id: string; email: string },
  draft: RiskDraft,
): Promise<void> {
  const { error } = await supabase.from('mission_risk_assessments').upsert(
    {
      org_id: orgId,
      mission_id: draft.mission_id,
      factors: draft.factors,
      inherent_level: draft.inherent_level,
      mitigations: draft.mitigations,
      residual_level: draft.residual_level,
      status: draft.submit ? 'submitted' : 'draft',
      submitted_by: draft.submit ? actor.id : null,
      submitted_at: draft.submit ? new Date().toISOString() : null,
      created_by: actor.id,
    },
    { onConflict: 'mission_id' },
  );
  if (error) throw error;

  await logAudit(orgId, actor, {
    action: draft.submit ? 'risk.submit' : 'risk.draft',
    target_kind: 'mission',
    target_id: draft.mission_id,
    detail: {
      inherent_level: draft.inherent_level,
      residual_level: draft.residual_level,
      mitigations: draft.mitigations.length,
    },
  });
}

/**
 * Décision hiérarchique. La séparation des tâches (le validateur n'est pas
 * l'auteur) est garantie par une contrainte SQL : si elle est violée, la
 * base refuse, et le message le dit franchement plutôt que de laisser
 * croire à un bug.
 */
export async function decideRiskAssessment(
  orgId: string,
  actor: { id: string; email: string },
  assessment: RiskAssessment,
  decision: 'approved' | 'refused',
  note: string,
): Promise<void> {
  const { error } = await supabase
    .from('mission_risk_assessments')
    .update({
      status: decision,
      decided_by: actor.id,
      decided_at: new Date().toISOString(),
      decision_note: note.trim() || null,
    })
    .eq('id', assessment.id);

  if (error) {
    if (error.message.includes('risk_decider_is_not_submitter')) {
      throw new Error(
        "Vous avez rédigé cette évaluation : la validation doit venir d'une autre personne. C'est ce qui lui donne sa valeur.",
      );
    }
    throw error;
  }

  await logAudit(orgId, actor, {
    action: decision === 'approved' ? 'risk.approve' : 'risk.refuse',
    target_kind: 'mission',
    target_id: assessment.mission_id,
    detail: {
      residual_level: assessment.residual_level,
      note: note.trim() || null,
    },
  });
}

// ─── Rapports programmés (P6, complément) ────────────────────────────────

export type ScheduledReport = Database['public']['Tables']['scheduled_reports']['Row'];
export type ReportRun = Database['public']['Tables']['report_runs']['Row'];

export async function fetchScheduledReport(orgId: string): Promise<ScheduledReport | null> {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .select('*')
    .eq('org_id', orgId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchReportRuns(orgId: string, limit = 12): Promise<ReportRun[]> {
  const { data, error } = await supabase
    .from('report_runs')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Active ou modifie l'abonnement. La première échéance est posée à la
 * fréquence choisie : programmer un rapport ne doit pas en produire un
 * immédiatement, sinon le premier envoi arrive avant que quiconque ait
 * saisi la moindre mission.
 */
export async function saveScheduledReport(
  orgId: string,
  actor: { id: string; email: string },
  frequency: 'weekly' | 'monthly',
  active: boolean,
): Promise<void> {
  const days = frequency === 'monthly' ? 30 : 7;
  const { error } = await supabase.from('scheduled_reports').upsert(
    {
      org_id: orgId,
      kind: 'compliance',
      frequency,
      active,
      next_run_at: new Date(Date.now() + days * 86_400_000).toISOString(),
      created_by: actor.id,
    },
    { onConflict: 'org_id,kind' },
  );
  if (error) throw error;

  await logAudit(orgId, actor, {
    action: active ? 'report.schedule' : 'report.unschedule',
    target_kind: 'report',
    detail: { frequency },
  });
}

/** Génération immédiate — même rapport que le passage programmé. */
export async function generateReportNow(
  orgId: string,
  actor: { id: string; email: string },
): Promise<void> {
  const { error } = await supabase.rpc('generate_report_now', { p_org: orgId });
  if (error) throw error;
  await logAudit(orgId, actor, { action: 'report.generate', target_kind: 'report' });
}
