/**
 * Country Risk Data — Phase 3 du Lokascore
 *
 * Base de données curée des indices officiels par pays, conformément au
 * mémoire méthodologique Lokascore v1.0. Permet de calculer les 4 dimensions
 * (S/H/N/I) à partir de sources réelles au lieu d'une simple approximation
 * Numbeo.
 *
 * Sources et formats officiels :
 *   - MAE France : Vert/Jaune/Orange/Rouge/Noir → 100/75/50/25/0
 *   - UK FCDO    : No advisory / Advisory / Essential / Do not travel → 100/60/30/0
 *   - US State   : Level 1/2/3/4 → 100/70/35/0
 *   - AU DFAT    : Normal / High caution / Reconsider / Do not travel → 100/65/30/0
 *   - WJP        : Rank /142 normalisé → 0-100
 *   - TI CPI     : 0-100 (déjà normalisé, plus haut = moins corrompu)
 *   - WB WGI     : Political Stability -2.5/+2.5 → 0-100 via (x+2.5)/5*100
 *   - EM-DAT     : Risque structurel 0-100 (100 = peu de catastrophes)
 *   - GDACS      : Boolean alerte active (modulation temporelle)
 *
 * Valeurs au 04/05/2026 (snapshot manuel). À rafraîchir trimestriellement
 * pour les advisories (MAE/FCDO/State/DFAT/GDACS) et annuellement pour les
 * indices structurels (WJP/CPI/WGI/EM-DAT).
 */

export type MaeLevel = 'vert' | 'jaune' | 'orange' | 'rouge' | 'noir';
export type FcdoLevel = 'none' | 'advisory' | 'essential' | 'donottravel';
export type UsStateLevel = 1 | 2 | 3 | 4;
export type DfatLevel = 'normal' | 'caution' | 'reconsider' | 'donottravel';

export interface CountryRisk {
  /** Code ISO 3166-1 alpha-2 du pays */
  iso: string;
  /** Nom anglais du pays (pour debug/traçabilité) */
  name: string;

  // ─── Indice S (Sécurité) — sources officielles ───
  mae?: MaeLevel;          // MAE France — w 45%
  fcdo?: FcdoLevel;        // UK FCDO   — w 25%
  usState?: UsStateLevel;  // US State  — w 20%
  dfat?: DfatLevel;        // AU DFAT   — w 10%

  // ─── Indice H (Santé) — sources officielles ───
  /** Nombre d'alertes OMS actives (Disease Outbreak News des 90 derniers jours) */
  whoActiveAlerts?: number;
  /** Présence d'une alerte ECDC en cours */
  ecdcAlert?: boolean;
  /** Présence d'une alerte CDC USA Yellow Book actuelle */
  cdcAlert?: boolean;
  /** Lancet HAQ Index (Healthcare Access & Quality) — 0-100 */
  lancetHaq?: number;

  // ─── Indice N (Nature) — risque structurel + actuel ───
  /** Risque structurel EM-DAT 0-100 (100 = très peu de catastrophes) */
  emdatStructural?: number;
  /** Alerte GDACS active (Orange/Rouge) — modulation temporelle */
  gdacsActive?: 'orange' | 'red' | null;

  // ─── Indice I (Infrastructure) — indicateurs annuels ───
  /** World Justice Project Rule of Law — score normalisé 0-100 */
  wjpRuleOfLaw?: number;
  /** Transparency International CPI 2024 — score 0-100 */
  cpiCorruption?: number;
  /** WHO Road Safety — score normalisé (100 = très peu de morts/100k) */
  whoRoadSafety?: number;
  /** World Bank Worldwide Governance Indicators — Political Stability normalisé 0-100 */
  wbStability?: number;
  /** GSMA Mobile Connectivity Index — score 0-100 */
  gsmaConnectivity?: number;
}

// ─── Tables de normalisation (cf. mémoire méthodologique §2) ──────────────
export const MAE_SCORE: Record<MaeLevel, number> = {
  vert: 100,
  jaune: 75,
  orange: 50,
  rouge: 25,
  noir: 0,
};

export const FCDO_SCORE: Record<FcdoLevel, number> = {
  none: 100,
  advisory: 60,
  essential: 30,
  donottravel: 0,
};

export const US_STATE_SCORE: Record<UsStateLevel, number> = {
  1: 100,
  2: 70,
  3: 35,
  4: 0,
};

export const DFAT_SCORE: Record<DfatLevel, number> = {
  normal: 100,
  caution: 65,
  reconsider: 30,
  donottravel: 0,
};

// ─── Dataset par pays (~60 pays couverts par les destinations Lokadia) ────
// Curé sur la base des advisories réels publiés au Q2 2026.
// Sources :
//   - https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/
//   - https://www.gov.uk/foreign-travel-advice
//   - https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html
//   - https://www.smartraveller.gov.au/destinations
//   - https://worldjusticeproject.org/rule-of-law-index/global
//   - https://www.transparency.org/en/cpi/2024
//   - https://databank.worldbank.org/source/worldwide-governance-indicators

export const COUNTRY_RISK_DATA: Record<string, CountryRisk> = {
  // ─── Europe occidentale ───
  FR: { iso: 'FR', name: 'France',         mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     whoActiveAlerts: 0, lancetHaq: 88, emdatStructural: 80, wjpRuleOfLaw: 73, cpiCorruption: 71, whoRoadSafety: 80, wbStability: 65, gsmaConnectivity: 81 },
  DE: { iso: 'DE', name: 'Germany',        mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 90, emdatStructural: 85, wjpRuleOfLaw: 84, cpiCorruption: 75, whoRoadSafety: 88, wbStability: 70, gsmaConnectivity: 84 },
  GB: { iso: 'GB', name: 'United Kingdom', mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 89, emdatStructural: 90, wjpRuleOfLaw: 78, cpiCorruption: 71, whoRoadSafety: 85, wbStability: 60, gsmaConnectivity: 86 },
  ES: { iso: 'ES', name: 'Spain',          mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 89, emdatStructural: 80, wjpRuleOfLaw: 71, cpiCorruption: 60, whoRoadSafety: 84, wbStability: 65, gsmaConnectivity: 78 },
  IT: { iso: 'IT', name: 'Italy',          mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 88, emdatStructural: 75, wjpRuleOfLaw: 68, cpiCorruption: 56, whoRoadSafety: 75, wbStability: 60, gsmaConnectivity: 75 },
  PT: { iso: 'PT', name: 'Portugal',       mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 86, emdatStructural: 85, wjpRuleOfLaw: 75, cpiCorruption: 61, whoRoadSafety: 78, wbStability: 75, gsmaConnectivity: 76 },
  NL: { iso: 'NL', name: 'Netherlands',    mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 92, emdatStructural: 85, wjpRuleOfLaw: 88, cpiCorruption: 78, whoRoadSafety: 92, wbStability: 80, gsmaConnectivity: 86 },
  BE: { iso: 'BE', name: 'Belgium',        mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 89, emdatStructural: 90, wjpRuleOfLaw: 79, cpiCorruption: 69, whoRoadSafety: 80, wbStability: 65, gsmaConnectivity: 80 },
  CH: { iso: 'CH', name: 'Switzerland',    mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 95, emdatStructural: 80, wjpRuleOfLaw: 88, cpiCorruption: 81, whoRoadSafety: 95, wbStability: 90, gsmaConnectivity: 87 },
  AT: { iso: 'AT', name: 'Austria',        mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 91, emdatStructural: 80, wjpRuleOfLaw: 81, cpiCorruption: 71, whoRoadSafety: 88, wbStability: 78, gsmaConnectivity: 83 },
  IE: { iso: 'IE', name: 'Ireland',        mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 88, emdatStructural: 92, wjpRuleOfLaw: 80, cpiCorruption: 77, whoRoadSafety: 87, wbStability: 80, gsmaConnectivity: 82 },

  // ─── Europe du Nord ───
  SE: { iso: 'SE', name: 'Sweden',         mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 92, emdatStructural: 90, wjpRuleOfLaw: 86, cpiCorruption: 80, whoRoadSafety: 92, wbStability: 82, gsmaConnectivity: 88 },
  NO: { iso: 'NO', name: 'Norway',         mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 95, emdatStructural: 92, wjpRuleOfLaw: 89, cpiCorruption: 84, whoRoadSafety: 95, wbStability: 88, gsmaConnectivity: 89 },
  DK: { iso: 'DK', name: 'Denmark',        mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 94, emdatStructural: 92, wjpRuleOfLaw: 91, cpiCorruption: 90, whoRoadSafety: 92, wbStability: 87, gsmaConnectivity: 90 },
  FI: { iso: 'FI', name: 'Finland',        mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 94, emdatStructural: 92, wjpRuleOfLaw: 92, cpiCorruption: 88, whoRoadSafety: 90, wbStability: 88, gsmaConnectivity: 87 },
  IS: { iso: 'IS', name: 'Iceland',        mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 95, emdatStructural: 75, wjpRuleOfLaw: 90, cpiCorruption: 79, whoRoadSafety: 90, wbStability: 95, gsmaConnectivity: 88 },

  // ─── Europe centrale & de l'Est ───
  PL: { iso: 'PL', name: 'Poland',         mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 80, emdatStructural: 85, wjpRuleOfLaw: 56, cpiCorruption: 53, whoRoadSafety: 70, wbStability: 50, gsmaConnectivity: 74 },
  CZ: { iso: 'CZ', name: 'Czech Republic', mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 85, emdatStructural: 88, wjpRuleOfLaw: 71, cpiCorruption: 56, whoRoadSafety: 80, wbStability: 70, gsmaConnectivity: 79 },
  GR: { iso: 'GR', name: 'Greece',         mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 86, emdatStructural: 65, wjpRuleOfLaw: 60, cpiCorruption: 49, whoRoadSafety: 70, wbStability: 50, gsmaConnectivity: 73 },
  RU: { iso: 'RU', name: 'Russia',         mae: 'rouge',  fcdo: 'donottravel', usState: 4, dfat: 'donottravel', whoActiveAlerts: 0, lancetHaq: 65, emdatStructural: 75, wjpRuleOfLaw: 28, cpiCorruption: 22, whoRoadSafety: 50, wbStability: 20, gsmaConnectivity: 73 },
  TR: { iso: 'TR', name: 'Turkey',         mae: 'jaune',  fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 70, emdatStructural: 55, wjpRuleOfLaw: 38, cpiCorruption: 34, whoRoadSafety: 55, wbStability: 25, gsmaConnectivity: 71 },

  // ─── Amérique du Nord ───
  US: { iso: 'US', name: 'United States',  mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'normal',     lancetHaq: 88, emdatStructural: 60, wjpRuleOfLaw: 70, cpiCorruption: 65, whoRoadSafety: 50, wbStability: 50, gsmaConnectivity: 85 },
  CA: { iso: 'CA', name: 'Canada',         mae: 'vert',   fcdo: 'none',     usState: 2, dfat: 'normal',     lancetHaq: 91, emdatStructural: 78, wjpRuleOfLaw: 80, cpiCorruption: 75, whoRoadSafety: 85, wbStability: 85, gsmaConnectivity: 84 },
  MX: { iso: 'MX', name: 'Mexico',         mae: 'orange', fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 70, emdatStructural: 50, wjpRuleOfLaw: 42, cpiCorruption: 26, whoRoadSafety: 50, wbStability: 25, gsmaConnectivity: 70 },

  // ─── Amérique du Sud ───
  BR: { iso: 'BR', name: 'Brazil',         mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 73, emdatStructural: 70, wjpRuleOfLaw: 48, cpiCorruption: 34, whoRoadSafety: 50, wbStability: 35, gsmaConnectivity: 71 },
  AR: { iso: 'AR', name: 'Argentina',      mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 75, emdatStructural: 80, wjpRuleOfLaw: 55, cpiCorruption: 37, whoRoadSafety: 60, wbStability: 50, gsmaConnectivity: 74 },

  // ─── Afrique du Nord & Moyen-Orient ───
  MA: { iso: 'MA', name: 'Morocco',        mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 65, emdatStructural: 70, wjpRuleOfLaw: 50, cpiCorruption: 38, whoRoadSafety: 50, wbStability: 50, gsmaConnectivity: 67 },
  EG: { iso: 'EG', name: 'Egypt',          mae: 'jaune',  fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 60, emdatStructural: 75, wjpRuleOfLaw: 35, cpiCorruption: 30, whoRoadSafety: 35, wbStability: 25, gsmaConnectivity: 66 },
  AE: { iso: 'AE', name: 'United Arab Emirates', mae: 'vert', fcdo: 'none', usState: 2, dfat: 'normal',     lancetHaq: 75, emdatStructural: 92, wjpRuleOfLaw: 68, cpiCorruption: 68, whoRoadSafety: 65, wbStability: 70, gsmaConnectivity: 82 },
  IL: { iso: 'IL', name: 'Israel',         mae: 'orange', fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 85, emdatStructural: 70, wjpRuleOfLaw: 65, cpiCorruption: 58, whoRoadSafety: 70, wbStability: 20, gsmaConnectivity: 81 },
  ZA: { iso: 'ZA', name: 'South Africa',   mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 60, emdatStructural: 80, wjpRuleOfLaw: 58, cpiCorruption: 41, whoRoadSafety: 25, wbStability: 35, gsmaConnectivity: 65 },

  // ─── Asie ───
  JP: { iso: 'JP', name: 'Japan',          mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 96, emdatStructural: 45, wjpRuleOfLaw: 79, cpiCorruption: 71, whoRoadSafety: 88, wbStability: 80, gsmaConnectivity: 84 },
  CN: { iso: 'CN', name: 'China',          mae: 'jaune',  fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 78, emdatStructural: 55, wjpRuleOfLaw: 47, cpiCorruption: 43, whoRoadSafety: 50, wbStability: 40, gsmaConnectivity: 80 },
  HK: { iso: 'HK', name: 'Hong Kong',      mae: 'vert',   fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 92, emdatStructural: 70, wjpRuleOfLaw: 70, cpiCorruption: 74, whoRoadSafety: 85, wbStability: 55, gsmaConnectivity: 88 },
  KR: { iso: 'KR', name: 'South Korea',    mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 93, emdatStructural: 75, wjpRuleOfLaw: 73, cpiCorruption: 64, whoRoadSafety: 75, wbStability: 60, gsmaConnectivity: 88 },
  TH: { iso: 'TH', name: 'Thailand',       mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 72, emdatStructural: 70, wjpRuleOfLaw: 49, cpiCorruption: 35, whoRoadSafety: 25, wbStability: 30, gsmaConnectivity: 73 },
  SG: { iso: 'SG', name: 'Singapore',      mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 95, emdatStructural: 95, wjpRuleOfLaw: 82, cpiCorruption: 84, whoRoadSafety: 92, wbStability: 92, gsmaConnectivity: 89 },
  MY: { iso: 'MY', name: 'Malaysia',       mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 73, emdatStructural: 78, wjpRuleOfLaw: 55, cpiCorruption: 50, whoRoadSafety: 60, wbStability: 55, gsmaConnectivity: 78 },
  ID: { iso: 'ID', name: 'Indonesia',      mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 65, emdatStructural: 45, wjpRuleOfLaw: 51, cpiCorruption: 37, whoRoadSafety: 50, wbStability: 40, gsmaConnectivity: 67 },
  IN: { iso: 'IN', name: 'India',          mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 55, emdatStructural: 60, wjpRuleOfLaw: 50, cpiCorruption: 39, whoRoadSafety: 35, wbStability: 40, gsmaConnectivity: 60 },

  // ─── Océanie ───
  AU: { iso: 'AU', name: 'Australia',      mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 92, emdatStructural: 75, wjpRuleOfLaw: 80, cpiCorruption: 75, whoRoadSafety: 87, wbStability: 80, gsmaConnectivity: 85 },
  NZ: { iso: 'NZ', name: 'New Zealand',    mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 89, emdatStructural: 65, wjpRuleOfLaw: 83, cpiCorruption: 83, whoRoadSafety: 80, wbStability: 90, gsmaConnectivity: 85 },

  // ─── Europe centrale & balkans (extension future-proof) ───
  HU: { iso: 'HU', name: 'Hungary',        mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 78, emdatStructural: 88, wjpRuleOfLaw: 51, cpiCorruption: 41, whoRoadSafety: 70, wbStability: 60, gsmaConnectivity: 76 },
  RO: { iso: 'RO', name: 'Romania',        mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 73, emdatStructural: 75, wjpRuleOfLaw: 55, cpiCorruption: 46, whoRoadSafety: 50, wbStability: 50, gsmaConnectivity: 72 },
  HR: { iso: 'HR', name: 'Croatia',        mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 80, emdatStructural: 70, wjpRuleOfLaw: 62, cpiCorruption: 47, whoRoadSafety: 70, wbStability: 60, gsmaConnectivity: 75 },
  SI: { iso: 'SI', name: 'Slovenia',       mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 86, emdatStructural: 85, wjpRuleOfLaw: 75, cpiCorruption: 60, whoRoadSafety: 85, wbStability: 75, gsmaConnectivity: 80 },
  SK: { iso: 'SK', name: 'Slovakia',       mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 80, emdatStructural: 88, wjpRuleOfLaw: 64, cpiCorruption: 49, whoRoadSafety: 75, wbStability: 65, gsmaConnectivity: 78 },
  EE: { iso: 'EE', name: 'Estonia',        mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 80, emdatStructural: 92, wjpRuleOfLaw: 78, cpiCorruption: 76, whoRoadSafety: 80, wbStability: 70, gsmaConnectivity: 85 },

  // ─── Asie (extension) ───
  VN: { iso: 'VN', name: 'Vietnam',        mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 65, emdatStructural: 50, wjpRuleOfLaw: 47, cpiCorruption: 40, whoRoadSafety: 35, wbStability: 60, gsmaConnectivity: 70 },
  PH: { iso: 'PH', name: 'Philippines',    mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 60, emdatStructural: 35, wjpRuleOfLaw: 47, cpiCorruption: 34, whoRoadSafety: 30, wbStability: 30, gsmaConnectivity: 64 },
  TW: { iso: 'TW', name: 'Taiwan',         mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 90, emdatStructural: 55, wjpRuleOfLaw: 75, cpiCorruption: 67, whoRoadSafety: 70, wbStability: 65, gsmaConnectivity: 85 },

  // ─── Amériques (extension) ───
  CL: { iso: 'CL', name: 'Chile',          mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 78, emdatStructural: 55, wjpRuleOfLaw: 70, cpiCorruption: 63, whoRoadSafety: 60, wbStability: 60, gsmaConnectivity: 75 },
  CO: { iso: 'CO', name: 'Colombia',       mae: 'orange', fcdo: 'advisory', usState: 3, dfat: 'reconsider', whoActiveAlerts: 0, lancetHaq: 70, emdatStructural: 60, wjpRuleOfLaw: 45, cpiCorruption: 39, whoRoadSafety: 45, wbStability: 30, gsmaConnectivity: 68 },
  PE: { iso: 'PE', name: 'Peru',           mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 65, emdatStructural: 50, wjpRuleOfLaw: 50, cpiCorruption: 33, whoRoadSafety: 45, wbStability: 30, gsmaConnectivity: 65 },
  UY: { iso: 'UY', name: 'Uruguay',        mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 75, emdatStructural: 90, wjpRuleOfLaw: 75, cpiCorruption: 76, whoRoadSafety: 70, wbStability: 75, gsmaConnectivity: 72 },

  // ─── Afrique & Moyen-Orient (extension) ───
  KE: { iso: 'KE', name: 'Kenya',          mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 50, emdatStructural: 70, wjpRuleOfLaw: 45, cpiCorruption: 31, whoRoadSafety: 30, wbStability: 30, gsmaConnectivity: 55 },
  TN: { iso: 'TN', name: 'Tunisia',        mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 65, emdatStructural: 85, wjpRuleOfLaw: 50, cpiCorruption: 39, whoRoadSafety: 50, wbStability: 40, gsmaConnectivity: 67 },
  JO: { iso: 'JO', name: 'Jordan',         mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 70, emdatStructural: 88, wjpRuleOfLaw: 55, cpiCorruption: 46, whoRoadSafety: 50, wbStability: 35, gsmaConnectivity: 72 },
  SA: { iso: 'SA', name: 'Saudi Arabia',   mae: 'jaune',  fcdo: 'advisory', usState: 2, dfat: 'caution',    lancetHaq: 70, emdatStructural: 92, wjpRuleOfLaw: 50, cpiCorruption: 53, whoRoadSafety: 35, wbStability: 50, gsmaConnectivity: 78 },
  QA: { iso: 'QA', name: 'Qatar',          mae: 'vert',   fcdo: 'none',     usState: 1, dfat: 'normal',     lancetHaq: 78, emdatStructural: 95, wjpRuleOfLaw: 65, cpiCorruption: 58, whoRoadSafety: 60, wbStability: 70, gsmaConnectivity: 84 },
};

// ─── Mapping destinationId → ISO pays ──────────────────────────────────────
// Permet de retrouver les données pays à partir d'un destinationId Lokadia
export const DESTINATION_TO_COUNTRY_ISO: Record<string, string> = {
  'paris-france': 'FR', 'nice-france': 'FR',
  'london-uk': 'GB', 'edinburgh-uk': 'GB',
  'berlin-germany': 'DE',
  'barcelona-spain': 'ES', 'madrid-spain': 'ES', 'seville-spain': 'ES',
  'rome-italy': 'IT', 'milan-italy': 'IT', 'venice-italy': 'IT', 'florence-italy': 'IT',
  'lisbon-portugal': 'PT', 'porto-portugal': 'PT',
  'amsterdam-netherlands': 'NL',
  'brussels-belgium': 'BE',
  'zurich-switzerland': 'CH',
  'vienna-austria': 'AT',
  'dublin-ireland': 'IE',
  'stockholm-sweden': 'SE',
  'oslo-norway': 'NO',
  'copenhagen-denmark': 'DK',
  'helsinki-finland': 'FI',
  'reykjavik-iceland': 'IS',
  'warsaw-poland': 'PL', 'krakow-poland': 'PL',
  'prague-czech': 'CZ', 'prague-czechia': 'CZ',
  'athens-greece': 'GR',
  'moscow-russia': 'RU',
  'istanbul-turkey': 'TR',
  'new-york-usa': 'US', 'miami-usa': 'US', 'los-angeles-usa': 'US', 'san-francisco-usa': 'US',
  'toronto-canada': 'CA', 'vancouver-canada': 'CA', 'montreal-canada': 'CA',
  'mexico-city-mexico': 'MX',
  'rio-de-janeiro-brazil': 'BR',
  'buenos-aires-argentina': 'AR',
  'marrakech-morocco': 'MA',
  'cairo-egypt': 'EG',
  'dubai-uae': 'AE',
  'tel-aviv-israel': 'IL',
  'cape-town-south-africa': 'ZA',
  'tokyo-japan': 'JP',
  'shanghai-china': 'CN',
  'hong-kong-china': 'HK',
  'seoul-south-korea': 'KR',
  'bangkok-thailand': 'TH', 'phuket-thailand': 'TH',
  'singapore-singapore': 'SG',
  'kuala-lumpur-malaysia': 'MY',
  'bali-indonesia': 'ID',
  'mumbai-india': 'IN',
  'sydney-australia': 'AU',
};

/** Récupère les données pays officielles pour un destinationId */
export function getCountryRiskForDestination(destinationId: string): CountryRisk | null {
  const iso = DESTINATION_TO_COUNTRY_ISO[destinationId];
  if (!iso) return null;
  return COUNTRY_RISK_DATA[iso] ?? null;
}
