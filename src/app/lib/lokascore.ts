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

import {
  Globe, GraduationCap, Laptop, Backpack, Users, HeartPulse, Briefcase, HeartHandshake, Palmtree,
  Shield, Stethoscope, Tornado, Building2,
  ShieldCheck, Lightbulb, ClipboardList, Compass, Landmark, Clock,
  type LucideIcon,
} from 'lucide-react';

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
  Icon: LucideIcon;
  description: string;
  /** Une phrase qui justifie la pondération utilisée */
  rationale: string;
}

export const PROFILE_META: Record<TravelProfile, TravelProfileMeta> = {
  default: {
    id: 'default',
    label: 'Par défaut',
    Icon: Globe,
    description: 'Pondération équilibrée',
    rationale: 'Aucun profil sélectionné — calcul standard 40/25/20/15.',
  },
  studies: {
    id: 'studies',
    label: 'Études / Erasmus',
    Icon: GraduationCap,
    description: 'Séjour long, dépendance aux services publics',
    rationale: 'Surpondère sécurité et infrastructure (transports, état de droit) car le séjour long expose davantage aux conditions locales.',
  },
  'remote-work': {
    id: 'remote-work',
    label: 'Travail à distance',
    Icon: Laptop,
    description: 'Connectivité prioritaire',
    rationale: 'Surpondère l\'infrastructure (connectivité indispensable) et sous-pondère la santé.',
  },
  backpack: {
    id: 'backpack',
    label: 'Backpack / Aventure',
    Icon: Backpack,
    description: 'Sécurité et santé renforcées',
    rationale: 'Surpondère la santé (sejours longs, alimentation locale, climat) tout en gardant un poids fort sur la sécurité.',
  },
  family: {
    id: 'family',
    label: 'Famille avec enfants',
    Icon: Users,
    description: 'Santé prioritaire pour les enfants',
    rationale: 'Surpondère la santé (enfants vulnérables) et garde un poids significatif sur les catastrophes naturelles.',
  },
  senior: {
    id: 'senior',
    label: 'Voyage senior / santé',
    Icon: HeartPulse,
    description: 'Qualité des soins prioritaire',
    rationale: 'Surpondère fortement la santé (qualité des soins en cas d\'urgence) et réduit l\'infrastructure.',
  },
  business: {
    id: 'business',
    label: 'Voyage d\'affaires',
    Icon: Briefcase,
    description: 'Sécurité et fiabilité logistique',
    rationale: 'Surpondère sécurité et infrastructure (fiabilité logistique et stabilité).',
  },
  humanitarian: {
    id: 'humanitarian',
    label: 'Mission humanitaire',
    Icon: HeartHandshake,
    description: 'Sécurité maximale',
    rationale: 'Poids très fort sur la sécurité, les autres dimensions étant secondaires car cette population est spécifiquement formée.',
  },
  vacation: {
    id: 'vacation',
    label: 'Vacances classiques',
    Icon: Palmtree,
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
  Icon: LucideIcon;
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
    Icon: Shield,
    sources: ['MAE France', 'UK FCDO', 'US State Dept', 'AU DFAT'],
    color: 'var(--lokadia-category-safety)',
  },
  health: {
    id: 'health',
    label: 'Santé',
    short: 'H',
    Icon: Stethoscope,
    sources: ['OMS', 'ECDC', 'CDC USA', 'Lancet HAQ'],
    color: 'var(--lokadia-category-transport)',
  },
  nature: {
    id: 'nature',
    label: 'Nature & catastrophes',
    short: 'N',
    Icon: Tornado,
    sources: ['GDACS', 'NASA EONET', 'EM-DAT', 'USGS'],
    color: 'var(--lokadia-category-culture)',
  },
  infrastructure: {
    id: 'infrastructure',
    label: 'Infrastructure & droit',
    short: 'I',
    Icon: Building2,
    sources: ['WJP', 'Transparency Int.', 'WHO Road', 'World Bank', 'GSMA'],
    color: 'var(--lokadia-success)',
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
  Icon: LucideIcon;
  description: string;
  /** Plage min-max (incluse) */
  min: number;
  max: number;
}

/**
 * Les cinq bandes du Lokascore.
 *
 * Elles disaient auparavant à quel point une destination était dangereuse :
 * « Risque élevé », « Très risqué », « Interdit », et pour la dernière
 * « Pays en guerre ou crise extrême. Toute présence est dangereuse. » Un
 * voyageur qui ouvre Lokadia pour préparer un départ n'a pas besoin d'un
 * verdict qui lui coupe l'envie ; il a besoin de savoir ce qu'il y a à
 * préparer.
 *
 * L'échelle mesure donc désormais l'effort de préparation, pas le danger.
 * Le fait ne bouge pas — c'est le même score, calculé sur les mêmes sources
 * officielles — mais Lokadia ne prononce plus l'interdiction : quand les
 * autorités déconseillent un voyage, on le dit comme ce que c'est, l'avis
 * d'un ministère, attribué et daté, et on renvoie à la source.
 *
 * Aucune bande n'est rouge. Le rouge est réservé aux interdictions, et
 * Lokadia n'en prononce pas. La gravité de la dernière bande passe par un
 * graphite sombre : elle se distingue sans alarmer.
 */
export const LOKASCORE_LEVELS: Record<Exclude<LokascoreLevel, 'unknown'>, LokascoreLevelConfig> = {
  safe: {
    level: 'safe',
    label: 'Sereine',
    short: 'Sereine',
    color: '#15803d',
    bgColor: 'rgba(34, 197, 94, 0.12)',
    fillColor: '#22c55e',
    Icon: ShieldCheck,
    description: 'Les précautions d\'un départ ordinaire, rien de plus.',
    min: 80,
    max: 100,
  },
  vigilance: {
    level: 'vigilance',
    label: 'Quelques réflexes',
    short: 'Réflexes',
    color: '#a16207',
    bgColor: 'rgba(234, 179, 8, 0.14)',
    fillColor: '#eab308',
    Icon: Lightbulb,
    description: 'Deux ou trois habitudes à prendre sur place : quartiers, transports, horaires.',
    min: 60,
    max: 79,
  },
  risk: {
    level: 'risk',
    label: 'À préparer',
    short: 'À préparer',
    color: '#c2410c',
    bgColor: 'rgba(249, 115, 22, 0.14)',
    fillColor: '#f97316',
    Icon: ClipboardList,
    description: 'Ça se prépare : lisez les formalités et les conseils avant de réserver.',
    min: 40,
    max: 59,
  },
  'high-risk': {
    level: 'high-risk',
    label: 'Voyageur averti',
    short: 'Averti',
    color: '#9a3412',
    bgColor: 'rgba(154, 52, 18, 0.12)',
    fillColor: '#c2410c',
    Icon: Compass,
    description: 'Destination exigeante. Les autorités émettent des recommandations fortes : à lire avant de décider.',
    min: 20,
    max: 39,
  },
  forbidden: {
    level: 'forbidden',
    label: 'Avis officiel à consulter',
    short: 'Avis officiel',
    color: '#334155',
    bgColor: 'rgba(51, 65, 85, 0.12)',
    fillColor: '#475569',
    Icon: Landmark,
    description: 'Les autorités déconseillent le voyage. Lokadia ne prépare pas de séjour ici — consultez leur avis à jour.',
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
  level: 'unknown',
  label: 'Indisponible',
  short: 'N/A',
  color: '#6b7280',
  bgColor: 'rgba(107, 114, 128, 0.12)',
  fillColor: '#9ca3af',
  Icon: Clock,
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
