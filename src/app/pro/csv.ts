/**
 * Parseur CSV minimal pour l'import d'effectif — sans dépendance.
 *
 * Gère : séparateur `,` ou `;` (détecté), guillemets doubles avec
 * échappement `""`, retours ligne \r\n ou \n, en-têtes insensibles à la
 * casse et aux accents. Colonnes reconnues : prénom, nom, email,
 * téléphone, nationalité, département (alias FR/EN acceptés).
 */
import type { TravelerImportRow } from './proService';

const HEADER_ALIASES: Record<keyof TravelerImportRow, string[]> = {
  first_name: ['prenom', 'first name', 'firstname', 'first_name', 'given name'],
  last_name: ['nom', 'last name', 'lastname', 'last_name', 'name', 'family name'],
  email: ['email', 'e-mail', 'mail', 'courriel'],
  phone: ['telephone', 'phone', 'tel', 'mobile', 'portable'],
  nationality: ['nationalite', 'nationality', 'pays', 'country'],
  department: ['departement', 'department', 'dept', 'service', 'promo', 'filiere', 'equipe'],
};

function normalize(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Découpe une ligne CSV en champs (guillemets gérés). */
function splitLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === sep) {
      out.push(cur); cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export interface CsvParseResult {
  rows: TravelerImportRow[];
  /** Lignes ignorées (prénom ou nom manquant) — index 1-based fichier */
  skipped: number[];
  /** Erreur bloquante (en-têtes introuvables) */
  error: string | null;
}

export function parseTravelersCsv(text: string): CsvParseResult {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { rows: [], skipped: [], error: 'Le fichier doit contenir une ligne d\'en-têtes et au moins une personne.' };
  }

  const sep = (lines[0].match(/;/g)?.length ?? 0) > (lines[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const headers = splitLine(lines[0], sep).map(normalize);

  const colIndex: Partial<Record<keyof TravelerImportRow, number>> = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [keyof TravelerImportRow, string[]][]) {
    const idx = headers.findIndex((h) => aliases.includes(h));
    if (idx !== -1) colIndex[field] = idx;
  }

  if (colIndex.first_name === undefined || colIndex.last_name === undefined) {
    return {
      rows: [],
      skipped: [],
      error: 'Colonnes « Prénom » et « Nom » introuvables. En-têtes reconnus : ' +
        'Prénom, Nom, Email, Téléphone, Nationalité, Département.',
    };
  }

  const rows: TravelerImportRow[] = [];
  const skipped: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i], sep);
    const pick = (f: keyof TravelerImportRow) =>
      colIndex[f] !== undefined ? cells[colIndex[f]!] ?? '' : '';
    const row: TravelerImportRow = {
      first_name: pick('first_name'),
      last_name: pick('last_name'),
      email: pick('email') || undefined,
      phone: pick('phone') || undefined,
      nationality: pick('nationality') || undefined,
      department: pick('department') || undefined,
    };
    if (!row.first_name || !row.last_name) {
      skipped.push(i + 1);
      continue;
    }
    rows.push(row);
  }

  return { rows, skipped, error: null };
}

export const CSV_TEMPLATE =
  'Prénom;Nom;Email;Téléphone;Nationalité;Département\n' +
  'Marie;Dupont;marie.dupont@exemple.fr;+33612345678;FR;LEA Anglais\n' +
  'Lucas;Martin;lucas.martin@exemple.fr;;FR;Erasmus Espagne\n';
