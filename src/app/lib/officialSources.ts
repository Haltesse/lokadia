/**
 * Sources officielles de sécurité pour une destination.
 *
 * Génère des liens cliquables vers les vraies pages des organismes de
 * référence en sécurité voyage. Aucune donnée inventée — on pointe
 * directement vers les sites officiels que l'utilisateur peut consulter.
 *
 * Sources :
 *   - France Diplomatie / MEAE (conseils aux voyageurs officiels)
 *   - OSAC (US Department of State, Overseas Security)
 *   - GDACS (Global Disaster Alert and Coordination System, ONU)
 *   - WHO / OMS (alertes sanitaires)
 *   - CDC (avis sanitaires par destination)
 *   - Numbeo (donnée complémentaire consultable — utilisée uniquement en
 *     repli par le calcul serveur pour les destinations non couvertes)
 */

export type SourceCategory = 'data' | 'security' | 'health' | 'disaster';

export interface OfficialSource {
  id: string;
  name: string;
  organization: string;
  description: string;
  url: string;
  category: SourceCategory;
  /** Logo / favicon utilisé pour la carte (URL absolue) */
  logoUrl?: string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// ─── Mapping pays → slug France Diplomatie ───
// La structure d'URL est :
// https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/<slug>/
// Le slug n'est pas standardisé — on mappe les principaux ; sinon fallback à la liste pays.
const FRANCE_DIPLOMATIE_SLUGS: Record<string, string> = {
  France: 'france',
  Japan: 'japon',
  'United States': 'etats-unis-d-amerique',
  USA: 'etats-unis-d-amerique',
  'United Kingdom': 'royaume-uni',
  UK: 'royaume-uni',
  Spain: 'espagne',
  Italy: 'italie',
  'United Arab Emirates': 'emirats-arabes-unis',
  UAE: 'emirats-arabes-unis',
  Singapore: 'singapour',
  Thailand: 'thailande',
  Australia: 'australie',
  Germany: 'allemagne',
  Netherlands: 'pays-bas',
  Turkey: 'turquie',
  China: 'chine',
  India: 'inde',
  Egypt: 'egypte',
  Brazil: 'bresil',
  Russia: 'russie',
  Canada: 'canada',
  Morocco: 'maroc',
  Portugal: 'portugal',
  'Czech Republic': 'republique-tcheque',
  Czechia: 'republique-tcheque',
  Austria: 'autriche',
  Greece: 'grece',
  Denmark: 'danemark',
  Sweden: 'suede',
  Belgium: 'belgique',
  Iceland: 'islande',
  Norway: 'norvege',
  Switzerland: 'suisse',
  Ireland: 'irlande',
  Finland: 'finlande',
  Poland: 'pologne',
  'South Korea': 'coree-du-sud',
  'Hong Kong': 'hong-kong',
  Malaysia: 'malaisie',
  Indonesia: 'indonesie',
  Vietnam: 'vietnam',
  Philippines: 'philippines',
  Taiwan: 'taiwan',
  Mexico: 'mexique',
  Argentina: 'argentine',
  Colombia: 'colombie',
  Peru: 'perou',
  Chile: 'chili',
  'South Africa': 'afrique-du-sud',
  Israel: 'israel-territoires-palestiniens',
  Tunisia: 'tunisie',
  Kenya: 'kenya',
  Qatar: 'qatar',
  'Saudi Arabia': 'arabie-saoudite',
};

// ─── Codes ISO pour WHO ───
const WHO_COUNTRY_CODES: Record<string, string> = {
  France: 'fr',
  Japan: 'jp',
  'United States': 'us',
  USA: 'us',
  'United Kingdom': 'gb',
  UK: 'gb',
  Spain: 'es',
  Italy: 'it',
  'United Arab Emirates': 'ae',
  UAE: 'ae',
  Singapore: 'sg',
  Thailand: 'th',
  Australia: 'au',
  Germany: 'de',
  Netherlands: 'nl',
  Turkey: 'tr',
  China: 'cn',
  India: 'in',
  Egypt: 'eg',
  Brazil: 'br',
  Russia: 'ru',
  Canada: 'ca',
  Morocco: 'ma',
  Portugal: 'pt',
  'Czech Republic': 'cz',
  Czechia: 'cz',
  Austria: 'at',
  Greece: 'gr',
  Denmark: 'dk',
  Sweden: 'se',
  Belgium: 'be',
  Iceland: 'is',
  Norway: 'no',
  Switzerland: 'ch',
  Ireland: 'ie',
  Finland: 'fi',
  Poland: 'pl',
  'South Korea': 'kr',
  Mexico: 'mx',
  Argentina: 'ar',
  Colombia: 'co',
  Peru: 'pe',
  Chile: 'cl',
  'South Africa': 'za',
  Israel: 'il',
  Tunisia: 'tn',
  Kenya: 'ke',
  Qatar: 'qa',
  'Saudi Arabia': 'sa',
};

// ─── URLs des sites officiels (constantes) ───
export const SOURCE_HOMEPAGES = {
  numbeo: 'https://www.numbeo.com/crime/',
  franceDiplomatie:
    'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/',
  gdacs: 'https://www.gdacs.org/',
  who: 'https://www.who.int/countries',
  osac: 'https://www.osac.gov/',
  ecdc: 'https://www.ecdc.europa.eu/en/threats-and-outbreaks',
  reliefWeb: 'https://reliefweb.int/countries',
  cdc: 'https://wwwnc.cdc.gov/travel/destinations/list',
};

/**
 * Génère la liste des sources officielles consultables pour
 * une destination (ville + pays).
 */
export function getOfficialSources(
  cityName: string,
  countryName: string,
): OfficialSource[] {
  const sources: OfficialSource[] = [];

  // ─── 1. France Diplomatie ───
  const fdSlug = FRANCE_DIPLOMATIE_SLUGS[countryName] || slug(countryName);
  sources.push({
    id: 'france-diplomatie',
    name: 'Conseils aux voyageurs',
    organization: 'France Diplomatie (MEAE)',
    description:
      "Recommandations officielles du Ministère de l'Europe et des Affaires Étrangères : sécurité, santé, formalités d'entrée, zones à éviter.",
    url: `${SOURCE_HOMEPAGES.franceDiplomatie}${fdSlug}/`,
    category: 'security',
  });

  // ─── 3. GDACS (catastrophes en cours) ───
  sources.push({
    id: 'gdacs',
    name: 'Alertes catastrophes',
    organization: 'GDACS · ONU',
    description:
      "Système mondial d'alerte multilatéral des Nations Unies : séismes, cyclones, tsunamis, inondations actifs.",
    url: SOURCE_HOMEPAGES.gdacs,
    category: 'disaster',
  });

  // ─── 4. WHO / OMS ───
  const whoCode = WHO_COUNTRY_CODES[countryName];
  sources.push({
    id: 'who',
    name: 'Recommandations sanitaires',
    organization: 'OMS · Organisation Mondiale de la Santé',
    description:
      "Vaccins recommandés, épidémies actives, situation sanitaire — fiche officielle pays de l'OMS.",
    url: whoCode
      ? `https://www.who.int/countries/${whoCode}/`
      : SOURCE_HOMEPAGES.who,
    category: 'health',
  });

  // ─── 5. CDC Travel (US Centers for Disease Control) ───
  sources.push({
    id: 'cdc',
    name: 'CDC Travel Health',
    organization: 'CDC · États-Unis',
    description:
      'Avis sanitaires officiels américains par destination : vaccins requis, prévention, alertes en temps réel.',
    url: SOURCE_HOMEPAGES.cdc,
    category: 'health',
  });

  // ─── 6. OSAC (US State Department, sécurité voyage) ───
  sources.push({
    id: 'osac',
    name: 'Security Reports',
    organization: 'OSAC · US Department of State',
    description:
      "Rapports de sécurité par pays produits par le Bureau de la Sécurité Diplomatique des États-Unis.",
    url: SOURCE_HOMEPAGES.osac,
    category: 'security',
  });

  // ─── 7. Numbeo (donnée complémentaire consultable) ───
  sources.push({
    id: 'numbeo',
    name: 'Indices urbains Numbeo',
    organization: 'Numbeo (collaboratif)',
    description:
      'Donnée collaborative complémentaire (criminalité perçue par ville). Utilisée uniquement en repli pour les destinations non couvertes par les sources officielles.',
    url: `https://www.numbeo.com/crime/in/${encodeURIComponent(
      cityName.replace(/\s+/g, '-'),
    )}`,
    category: 'data',
    logoUrl: 'https://www.numbeo.com/common/img/logo_numbeo_small.png',
  });

  return sources;
}

/**
 * Métadonnées descriptives de la méthodologie Lokascore.
 *
 * Le calcul (formule, pondérations) vit côté serveur (`lokascore-compute`).
 * Ici : uniquement ce qui est public — les 4 dimensions, les familles de
 * sources officielles, l'échelle de lecture (alignée sur les 5 niveaux
 * de `lib/lokascore.ts`).
 */
export const LOKASCORE_METHODOLOGY = {
  refreshInterval: '30 minutes',
  scoreRange: '0 à 100',
  dimensions: [
    { id: 'security', label: 'Sécurité', sources: 'MAE, FCDO, US State Department, DFAT' },
    { id: 'health', label: 'Santé', sources: 'OMS, Lancet HAQ' },
    { id: 'nature', label: 'Nature & catastrophes', sources: 'GDACS, EM-DAT, USGS' },
    { id: 'infrastructure', label: 'Infrastructure & droit', sources: 'WJP, Transparency International, Banque mondiale, GSMA' },
  ],
  /** Échelle de lecture — mêmes bornes que LOKASCORE_LEVELS (lib/lokascore.ts) */
  thresholds: [
    { min: 80, max: 100, level: 'safe', label: 'Sécurisée', color: '#15803d' },
    { min: 60, max: 79, level: 'vigilance', label: 'Vigilance', color: '#a16207' },
    { min: 40, max: 59, level: 'risk', label: 'Risque élevé', color: '#c2410c' },
    { min: 20, max: 39, level: 'high-risk', label: 'Très risqué', color: '#b91c1c' },
    { min: 0, max: 19, level: 'forbidden', label: 'Interdit', color: '#111827' },
  ],
};
