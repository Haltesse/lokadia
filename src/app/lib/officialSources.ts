/**
 * Sources officielles de sécurité pour une destination.
 *
 * Génère des liens cliquables vers les vraies pages des organismes de
 * référence en sécurité voyage. Aucune donnée inventée — on pointe
 * directement vers les sites officiels que l'utilisateur peut consulter.
 *
 * Sources :
 *   - Numbeo Crime Index (source primaire du GoSafe Score)
 *   - France Diplomatie / MEAE (conseils aux voyageurs officiels)
 *   - GDACS (Global Disaster Alert and Coordination System, ONU)
 *   - WHO / OMS (alertes sanitaires)
 *   - OSAC (US Department of State, Overseas Security)
 *   - ECDC (Centre européen de prévention des maladies)
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

  // ─── 1. Numbeo (source primaire du GoSafe Score) ───
  sources.push({
    id: 'numbeo',
    name: 'Crime Index Numbeo',
    organization: 'Numbeo',
    description:
      'Indices Safety & Crime calculés à partir de plus de 600 000 contributeurs dans le monde. Source primaire du GoSafe Score.',
    url: `https://www.numbeo.com/crime/in/${encodeURIComponent(
      cityName.replace(/\s+/g, '-'),
    )}`,
    category: 'data',
    logoUrl: 'https://www.numbeo.com/common/img/logo_numbeo_small.png',
  });

  // ─── 2. France Diplomatie ───
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

  return sources;
}

/**
 * Métadonnées descriptives pour la page GoSafePage (vue marketing).
 */
export const GOSAFE_METHODOLOGY = {
  primarySource: {
    name: 'Numbeo',
    url: 'https://www.numbeo.com',
    description:
      "Plateforme leader de données urbaines crowdsourcées (600 000+ contributeurs, 9 000+ villes). Le Safety Index Numbeo est l'agrégateur le plus utilisé au monde pour mesurer la sécurité urbaine perçue.",
    methodology: 'https://www.numbeo.com/crime/methodology.jsp',
  },
  refreshInterval: '30 minutes',
  scoreRange: '0 à 100',
  thresholds: [
    { min: 70, max: 100, level: 'safe', label: 'Sûr', color: '#10B981' },
    {
      min: 50,
      max: 69,
      level: 'vigilance',
      label: 'Vigilance',
      color: '#F59E0B',
    },
    { min: 0, max: 49, level: 'danger', label: 'Risque élevé', color: '#EF4444' },
  ],
};
