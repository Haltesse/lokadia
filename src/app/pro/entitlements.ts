/**
 * Gating par offre — SEULE couche autorisée à décider ce qu'une
 * organisation peut faire selon son offre (Starter / Pro / Enterprise).
 *
 * Règle produit : aucun composant ne teste `tier` directement — tout
 * passe par `hasFeature()` / `getEntitlements()`, pour que la matrice
 * commerciale vive à UN seul endroit.
 */

export type OrgTier = 'starter' | 'pro' | 'enterprise';

export type ProFeature =
  | 'dashboard'          // tableau de bord de pilotage
  | 'people'             // effectif + import CSV
  | 'missions'           // suivi des missions
  | 'compliance'         // dossiers de conformité (P2 : briefings, rapports)
  | 'crisis'             // check-in massif, messages groupés (P3)
  | 'watchlist'          // veille pays + carte (P4)
  | 'crisis-room'        // cellule de crise, ISO 31030 (P5)
  | 'sso'                // SSO SAML/OIDC (P6)
  | 'api'                // API + webhooks (P6)
  | 'scheduled-reports'; // rapports programmés (P6)

export interface Entitlements {
  tier: OrgTier;
  label: string;
  maxTravelers: number | null; // null = illimité
  features: ReadonlySet<ProFeature>;
}

const STARTER_FEATURES: ReadonlySet<ProFeature> = new Set<ProFeature>([
  'dashboard', 'people', 'missions', 'compliance',
]);

const PRO_FEATURES: ReadonlySet<ProFeature> = new Set<ProFeature>([
  ...STARTER_FEATURES, 'crisis', 'watchlist', 'crisis-room',
]);

const ENTERPRISE_FEATURES: ReadonlySet<ProFeature> = new Set<ProFeature>([
  ...PRO_FEATURES, 'sso', 'api', 'scheduled-reports',
]);

const MATRIX: Record<OrgTier, Entitlements> = {
  starter: { tier: 'starter', label: 'Starter', maxTravelers: 100, features: STARTER_FEATURES },
  pro: { tier: 'pro', label: 'Pro', maxTravelers: 600, features: PRO_FEATURES },
  enterprise: { tier: 'enterprise', label: 'Enterprise', maxTravelers: null, features: ENTERPRISE_FEATURES },
};

export function getEntitlements(tier: string | null | undefined): Entitlements {
  if (tier === 'pro' || tier === 'enterprise') return MATRIX[tier];
  return MATRIX.starter;
}

export function hasFeature(tier: string | null | undefined, feature: ProFeature): boolean {
  return getEntitlements(tier).features.has(feature);
}

/** Jours restants du pilote gratuit (null = pas de pilote en cours). */
export function pilotDaysLeft(pilotEndsAt: string | null | undefined): number | null {
  if (!pilotEndsAt) return null;
  const ms = new Date(pilotEndsAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** Tarifs affichés — source unique pour la page /pro et le back-office. */
export const TIER_PRICING: Record<OrgTier, { price: string; unit: string; scope: string }> = {
  starter: { price: '500 €', unit: '/an', scope: 'Jusqu\'à 100 personnes' },
  pro: { price: '1 500 €', unit: '/an', scope: 'Jusqu\'à 600 personnes' },
  enterprise: { price: '4 000 €+', unit: '/an', scope: 'Effectif illimité' },
};
