/**
 * Évaluation de risque de déplacement — catalogue de facteurs et règles.
 *
 * Inspiré de l'ISO 31030 (management du risque voyage), sans prétendre
 * « certifier » quoi que ce soit : la norme demande une démarche
 * documentée, pas un label. Ce module fournit la démarche.
 *
 * Deux principes tenus ici :
 *
 *  1. **Le niveau brut est calculé, le niveau résiduel est déclaré.**
 *     Le premier découle mécaniquement des facteurs cotés ; le second
 *     engage l'organisation, qui juge de l'effet réel de ses mesures.
 *     Calculer le résiduel à sa place reviendrait à décider pour elle.
 *
 *  2. **Le Lokascore alimente une suggestion, jamais une conclusion.**
 *     Il pré-remplit le facteur « contexte sécuritaire » avec sa date et
 *     sa nature indicative ; l'évaluateur reste libre de le corriger, et
 *     c'est sa cotation qui est enregistrée.
 */

export type RiskLevel = 1 | 2 | 3 | 4;

export const RISK_LEVELS: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  1: { label: 'Faible', color: 'var(--lokadia-success)', bg: 'var(--lokadia-success-bg)' },
  2: { label: 'Modéré', color: 'var(--lokadia-warning)', bg: 'var(--lokadia-warning-bg)' },
  3: { label: 'Élevé', color: 'var(--lokadia-danger)', bg: 'var(--lokadia-danger-bg)' },
  4: { label: 'Critique', color: 'var(--lokadia-danger)', bg: 'var(--lokadia-danger-bg)' },
};

export interface RiskFactorDefinition {
  id: string;
  label: string;
  help: string;
}

/**
 * Les six familles retenues. Volontairement peu nombreuses : une grille de
 * trente lignes ne se remplit pas, et une grille qu'on ne remplit pas ne
 * protège personne.
 */
export const RISK_FACTORS: RiskFactorDefinition[] = [
  {
    id: 'security',
    label: 'Contexte sécuritaire',
    help: "Situation du pays et de la zone visitée : criminalité, troubles, conflit. Pré-cotée d'après le Lokascore, à corriger si vous en savez plus.",
  },
  {
    id: 'health',
    label: 'Santé et accès aux soins',
    help: "Épidémies, vaccins requis, qualité et distance des structures de soins, état de santé de la personne si elle l'a signalé.",
  },
  {
    id: 'transport',
    label: 'Transports et déplacements',
    help: 'Trajets internes, transport routier, vols intérieurs, déplacements de nuit.',
  },
  {
    id: 'profile',
    label: 'Profil de la personne',
    help: "Expérience du terrain, isolement, première mission, ou toute caractéristique exposant davantage la personne dans le pays visité.",
  },
  {
    id: 'environment',
    label: 'Environnement et climat',
    help: 'Saison cyclonique, sismicité, chaleur extrême, altitude.',
  },
  {
    id: 'legal',
    label: 'Cadre juridique et local',
    help: "Législation locale, formalités, activités sensibles sur place, risque de contentieux ou de rétention.",
  },
];

export interface RiskFactorValue {
  id: string;
  label: string;
  level: RiskLevel;
  note?: string;
}

/**
 * Niveau brut : le **maximum** des facteurs, pas leur moyenne.
 *
 * Une moyenne dilue : cinq facteurs faibles et un critique donneraient
 * « modéré », et on enverrait quelqu'un dans une zone critique avec un
 * feu orange. En sécurité, c'est le point le plus exposé qui commande.
 */
export function inherentLevel(factors: RiskFactorValue[]): RiskLevel {
  if (factors.length === 0) return 1;
  return factors.reduce<RiskLevel>((max, factor) => (factor.level > max ? factor.level : max), 1);
}

/**
 * Cotation suggérée à partir du Lokascore (0–100).
 * Les bornes reprennent l'échelle de lecture publique du score.
 */
export function suggestLevelFromScore(score: number | null): RiskLevel {
  if (score === null) return 2;
  if (score >= 80) return 1;
  if (score >= 60) return 2;
  if (score >= 40) return 3;
  return 4;
}

/**
 * Une mission peut-elle partir en l'état ? Réponse volontairement
 * conservatrice : au-delà de « modéré », une validation hiérarchique est
 * attendue, et un résiduel critique appelle un arbitrage explicite.
 */
export function residualGuidance(residual: RiskLevel): string {
  switch (residual) {
    case 1:
      return "Risque résiduel faible : la mission peut suivre le circuit habituel.";
    case 2:
      return "Risque résiduel modéré : validation hiérarchique attendue avant le départ.";
    case 3:
      return "Risque résiduel élevé : validation hiérarchique obligatoire, et mesures d'atténuation à confirmer avant l'émission des billets.";
    case 4:
      return "Risque résiduel critique : le départ doit faire l'objet d'un arbitrage explicite au niveau de la direction, ou être reporté.";
  }
}

export type RiskStatus = 'draft' | 'submitted' | 'approved' | 'refused';

export const RISK_STATUS_LABEL: Record<RiskStatus, string> = {
  draft: 'Brouillon',
  submitted: 'En attente de validation',
  approved: 'Validée',
  refused: 'Refusée',
};
