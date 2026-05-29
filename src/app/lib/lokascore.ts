/**
 * Lokascore — métadonnées d'affichage (PUBLIC).
 *
 * ⚠️ Ce fichier ne contient QUE des données d'affichage publiques :
 * libellés, couleurs, niveaux, noms de catégories, noms de profils.
 *
 * La formule de calcul, les pondérations sectorielles et la matrice de
 * modulation par profil sont des SECRETS DE FABRIQUE. Ils vivent
 * exclusivement côté serveur (Edge Function `lokascore-compute`) et ne sont
 * jamais inclus dans le bundle JavaScript.
 */

// ─── Profils de voyage (identifiants + métadonnées d'affichage) ──────────────

export type TravelProfile =
  | 'default'
  | 'studies'
  | 'remote-work'
  | 'backpack'
  | 'family'
  | 'senior'
  | 'business'
  | 'humanitarian'
  | 'vacation';

export interface TravelProfileMeta {
  id: TravelProfile;
  label: string;
  emoji: string;
  description: string;
  /** Une phrase qui justifie la pondération utilisée */
  rationale: string;
}

export const PROFILE_META: Record<TravelProfile, TravelProfileMeta> = {
  default: {
    id: 'default',
    label: 'Par défaut',
    emoji: '🌍',
    description: 'Pondération équilibrée',
    rationale: 'Aucun profil sélectionné — calcul standard 40/25/20/15.',
  },
  studies: {
    id: 'studies',
    label: 'Études / Erasmus',
    emoji: '🎓',
    description: 'Séjour long, dépendance aux services publics',
    rationale: 'Surpondère sécurité et infrastructure (transports, état de droit) car le séjour long expose davantage aux conditions locales.',
  },
  'remote-work': {
    id: 'remote-work',
    label: 'Travail à distance',
    emoji: '💻',
    description: 'Connectivité prioritaire',
    rationale: 'Surpondère l\'infrastructure (connectivité indispensable) et sous-pondère la santé.',
  },
  backpack: {
    id: 'backpack',
    label: 'Backpack / Aventure',
    emoji: '🎒',
    description: 'Sécurité et santé renforcées',
    rationale: 'Surpondère la santé (sejours longs, alimentation locale, climat) tout en gardant un poids fort sur la sécurité.',
  },
  family: {
    id: 'family',
    label: 'Famille avec enfants',
    emoji: '👨‍👩‍👧',
    description: 'Santé prioritaire pour les enfants',
    rationale: 'Surpondère la santé (enfants vulnérables) et garde un poids significatif sur les catastrophes naturelles.',
  },
  senior: {
    id: 'senior',
    label: 'Voyage senior / santé',
    emoji: '🧓',
    description: 'Qualité des soins prioritaire',
    rationale: 'Surpondère fortement la santé (qualité des soins en cas d\'urgence) et réduit l\'infrastructure.',
  },
  business: {
    id: 'business',
    label: 'Voyage d\'affaires',
    emoji: '💼',
    description: 'Sécurité et fiabilité logistique',
    rationale: 'Surpondère sécurité et infrastructure (fiabilité logistique et stabilité).',
  },
  humanitarian: {
    id: 'humanitarian',
    label: 'Mission humanitaire',
    emoji: '🤝',
    description: 'Sécurité maximale',
    rationale: 'Poids très fort sur la sécurité, les autres dimensions étant secondaires car cette population est spécifiquement formée.',
  },
  vacation: {
    id: 'vacation',
    label: 'Vacances classiques',
    emoji: '🏖️',
    description: 'Pondération équilibrée',
    rationale: 'Pondération par défaut, valable pour la majorité des séjours touristiques de courte durée.',
  },
};

export const PROFILE_ORDER: TravelProfile[] = [
  'default',
  'vacation',
  'studies',
  'family',
  'backpack',
  'remote-work',
  'business',
  'senior',
  'humanitarian',
];

// ─── Dimensions du score ────────────────────────────────────────────────────

export interface LokascoreDimensions {
  /** Sécurité (S) — 0-100 */
  security: number;
  /** Santé (H) — 0-100 */
  health: number;
  /** Nature / catastrophes (N) — 0-100 */
  nature: number;
  /** Infrastructure & état de droit (I) — 0-100 */
  infrastructure: number;
}

export interface DimensionMeta {
  id: keyof LokascoreDimensions;
  label: string;
  short: string;
  emoji: string;
  /** Sources officielles cibles documentées */
  sources: string[];
  /** Couleur d'accent */
  color: string;
}

export const DIMENSION_META: Record<keyof LokascoreDimensions, DimensionMeta> = {
  security: {
    id: 'security',
    label: 'Sécurité',
    short: 'S',
    emoji: '🛡️',
    sources: ['MAE France', 'UK FCDO', 'US State Dept', 'AU DFAT'],
    color: '#1E40AF',
  },
  health: {
    id: 'health',
    label: 'Santé',
    short: 'H',
    emoji: '🏥',
    sources: ['OMS', 'ECDC', 'CDC USA', 'Lancet HAQ'],
    color: '#6D28D9',
  },
  nature: {
    id: 'nature',
    label: 'Nature & catastrophes',
    short: 'N',
    emoji: '🌪️',
    sources: ['GDACS', 'ReliefWeb', 'NASA EONET', 'EM-DAT'],
    color: '#92400E',
  },
  infrastructure: {
    id: 'infrastructure',
    label: 'Infrastructure & droit',
    short: 'I',
    emoji: '🏗️',
    sources: ['WJP', 'Transparency Int.', 'WHO Road', 'World Bank', 'GSMA'],
    color: '#047857',
  },
};

// ─── Niveaux et couleurs (5 niveaux officiels) ──────────────────────────────

export type LokascoreLevel =
  | 'safe'        // 80-100  vert
  | 'vigilance'   // 60-79   jaune
  | 'risk'        // 40-59   orange
  | 'high-risk'   // 20-39   rouge
  | 'forbidden'   // 0-19    noir
  | 'unknown';    // donnée indisponible

export interface LokascoreLevelConfig {
  level: LokascoreLevel;
  label: string;
  short: string;
  /** Couleur de l'accent (texte / icône) */
  color: string;
  /** Fond pastel pour les badges */
  bgColor: string;
  /** Couleur pleine pour les pills (texte blanc dessus) */
  fillColor: string;
  emoji: string;
  description: string;
  /** Plage min-max (incluse) */
  min: number;
  max: number;
}

export const LOKASCORE_LEVELS: Record<Exclude<LokascoreLevel, 'unknown'>, LokascoreLevelConfig> = {
  safe: {
    level: 'safe',
    label: 'Sécurisée',
    short: 'Vert',
    color: '#15803d',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    fillColor: '#22c55e',
    emoji: '🟢',
    description: 'Voyage standard, précautions habituelles. Pas d\'alerte spécifique.',
    min: 80,
    max: 100,
  },
  vigilance: {
    level: 'vigilance',
    label: 'Vigilance',
    short: 'Jaune',
    color: '#a16207',
    bgColor: 'rgba(234, 179, 8, 0.14)',
    fillColor: '#eab308',
    emoji: '🟡',
    description: 'Quelques précautions ciblées (quartiers, transports, horaires).',
    min: 60,
    max: 79,
  },
  risk: {
    level: 'risk',
    label: 'Risque élevé',
    short: 'Orange',
    color: '#c2410c',
    bgColor: 'rgba(249, 115, 22, 0.14)',
    fillColor: '#f97316',
    emoji: '🟠',
    description: 'Vigilance renforcée, certains déplacements déconseillés.',
    min: 40,
    max: 59,
  },
  'high-risk': {
    level: 'high-risk',
    label: 'Très risqué',
    short: 'Rouge',
    color: '#b91c1c',
    bgColor: 'rgba(239, 68, 68, 0.14)',
    fillColor: '#ef4444',
    emoji: '🔴',
    description: 'Voyage formellement déconseillé sauf raison impérative.',
    min: 20,
    max: 39,
  },
  forbidden: {
    level: 'forbidden',
    label: 'Interdit',
    short: 'Noir',
    color: '#111827',
    bgColor: 'rgba(17, 24, 39, 0.16)',
    fillColor: '#1f2937',
    emoji: '⚫',
    description: 'Pays en guerre ou crise extrême. Toute présence est dangereuse.',
    min: 0,
    max: 19,
  },
};

export const LOKASCORE_LEVELS_ORDER: LokascoreLevelConfig[] = [
  LOKASCORE_LEVELS.safe,
  LOKASCORE_LEVELS.vigilance,
  LOKASCORE_LEVELS.risk,
  LOKASCORE_LEVELS['high-risk'],
  LOKASCORE_LEVELS.forbidden,
];

/** Configuration retournée quand le score est null/indisponible. */
const UNKNOWN_LEVEL: LokascoreLevelConfig = {
  level: 'unknown' as any,
  label: 'Indisponible',
  short: 'N/A',
  color: '#6b7280',
  bgColor: 'rgba(107, 114, 128, 0.12)',
  fillColor: '#9ca3af',
  emoji: '⏳',
  description: 'Score en cours de chargement ou source momentanément indisponible.',
  min: 0,
  max: 0,
};

export function getLokascoreLevel(score: number | null | undefined): LokascoreLevelConfig {
  if (score === null || score === undefined || Number.isNaN(score)) return UNKNOWN_LEVEL;
  if (score >= 80) return LOKASCORE_LEVELS.safe;
  if (score >= 60) return LOKASCORE_LEVELS.vigilance;
  if (score >= 40) return LOKASCORE_LEVELS.risk;
  if (score >= 20) return LOKASCORE_LEVELS['high-risk'];
  return LOKASCORE_LEVELS.forbidden;
}

// ─── NOTE : le calcul du score (formule + pondérations + matrice profil)
//     n'est PAS dans le frontend. Il est exécuté côté serveur par l'Edge
//     Function `lokascore-compute`. Voir src/app/lib/lokascoreApi.ts.

// ─── Mapping niveau legacy (affichage uniquement) ────────────────────────────
// L'ancien type `safetyLevel` ('safe' | 'vigilance' | 'danger') reste exposé
// pour les composants qui n'ont pas encore migré vers les 5 niveaux.

export type LegacySafetyLevel = 'safe' | 'vigilance' | 'danger';

export function toLegacySafetyLevel(score: number | null | undefined): LegacySafetyLevel {
  if (score === null || score === undefined) return 'vigilance';
  if (score >= 70) return 'safe';
  if (score >= 50) return 'vigilance';
  return 'danger';
}
