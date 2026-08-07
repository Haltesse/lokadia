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

export type MissionWithCompliance = Mission & {
  travelers: Pick<Traveler, 'id' | 'first_name' | 'last_name' | 'department_id'> | null;
  compliance_items: Pick<ComplianceItem, 'id' | 'kind' | 'status' | 'completed_at'>[];
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
export async function importTravelers(orgId: string, rows: TravelerImportRow[]): Promise<number> {
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
  return inserted;
}

// ─── Missions ────────────────────────────────────────────────────────────

export async function fetchMissions(orgId: string): Promise<MissionWithCompliance[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*, travelers ( id, first_name, last_name, department_id ), compliance_items ( id, kind, status, completed_at )')
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

export async function createMission(orgId: string, userId: string, m: NewMission): Promise<void> {
  const { error } = await supabase.from('missions').insert({
    org_id: orgId,
    created_by: userId,
    status: 'approved',
    ...m,
  });
  if (error) throw error;
}

export async function setComplianceStatus(itemId: string, done: boolean): Promise<void> {
  const { error } = await supabase
    .from('compliance_items')
    .update({ status: done ? 'done' : 'pending', completed_at: done ? new Date().toISOString() : null })
    .eq('id', itemId);
  if (error) throw error;
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
