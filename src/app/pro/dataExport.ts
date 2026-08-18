/**
 * Export intégral des données d'une organisation (P7).
 *
 * Deux usages qui n'ont rien à voir, et que beaucoup d'outils confondent :
 *
 *  · **La portabilité RGPD** (article 20) : le client doit pouvoir partir
 *    avec ses données, dans un format lisible par une machine. C'est le
 *    JSON complet, tables et relations.
 *  · **Le travail quotidien** : ouvrir un tableau dans un tableur. C'est
 *    le CSV, une table à la fois.
 *
 * L'export se fait **côté client, avec la session de l'utilisateur** : la
 * RLS s'applique donc telle quelle, et personne n'exporte les données
 * d'une organisation dont il n'est pas membre. Pas de fonction serveur
 * privilégiée à sécuriser — le chemin le plus sûr est celui qu'on n'a pas
 * besoin de protéger.
 */
import { supabase } from '../lib/supabase';

/** Tables exportées, dans un ordre lisible pour un humain. */
const TABLES = [
  'travelers',
  'departments',
  'missions',
  'compliance_items',
  'briefings',
  'briefing_receipts',
  'mission_risk_assessments',
  'crisis_events',
  'crisis_log',
  'checkin_requests',
  'checkin_responses',
  'watched_countries',
  'watch_alerts',
  'escalation_contacts',
  'audit_log',
] as const;

export type ExportTable = (typeof TABLES)[number];

export interface OrgExport {
  generated_at: string;
  organization: Record<string, unknown> | null;
  members: Record<string, unknown>[];
  tables: Record<string, Record<string, unknown>[]>;
  /** Tables qui n'ont pas pu être lues, avec la raison — jamais masquées */
  incomplete: { table: string; reason: string }[];
}

/**
 * Récupère tout ce que l'utilisateur a le droit de lire pour cette
 * organisation. Une table refusée par la RLS est **signalée**, pas
 * silencieusement omise : un export qu'on croit complet et qui ne l'est
 * pas est pire qu'un export annoncé partiel.
 */
export async function buildOrgExport(orgId: string): Promise<OrgExport> {
  const result: OrgExport = {
    generated_at: new Date().toISOString(),
    organization: null,
    members: [],
    tables: {},
    incomplete: [],
  };

  const org = await supabase.from('organizations').select('*').eq('id', orgId).maybeSingle();
  result.organization = (org.data as Record<string, unknown> | null) ?? null;

  const members = await supabase.from('org_members').select('*').eq('org_id', orgId);
  result.members = (members.data ?? []) as Record<string, unknown>[];

  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*').eq('org_id', orgId);
    if (error) {
      result.incomplete.push({ table, reason: error.message });
      continue;
    }
    result.tables[table] = (data ?? []) as Record<string, unknown>[];
  }

  return result;
}

/**
 * Marque d'ordre des octets. Sans elle, Excel lit le fichier en ANSI et
 * affiche « Ã© » à la place des accents — le premier reproche fait à tout
 * export CSV français.
 */
const BOM = '\uFEFF';

/** Échappement CSV : guillemets doublés, champ cité dès qu'il le faut. */
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text =
    typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Convertit une table en CSV. Séparateur point-virgule : c'est ce
 * qu'attend Excel en configuration francophone, et l'export finit presque
 * toujours dans Excel.
 */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [columns.join(';')];
  for (const row of rows) {
    lines.push(columns.map((column) => csvCell(row[column])).join(';'));
  }
  return BOM + lines.join('\r\n') + '\r\n';
}

/** Déclenche un téléchargement local, sans passer par un serveur. */
export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportTables(): readonly ExportTable[] {
  return TABLES;
}
