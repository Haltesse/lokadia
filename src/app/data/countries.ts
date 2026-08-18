/**
 * Table pays canonique.
 *
 * Le jeu de données destinations nomme les pays en français (« Japon »,
 * « États-Unis »), alors que `officialSources.ts` les cherchait en anglais
 * (« Japan », « United States ») : la quasi-totalité des correspondances
 * tombaient à côté. Les liens vers les fiches OMS pointaient donc sur la
 * page d'accueil, et le lien France Diplomatie des États-Unis renvoyait une
 * 404 — le slug officiel est `etats-unis`, pas `etats-unis-d-amerique`.
 *
 * Ce module est la seule source de vérité : nom français → code ISO,
 * appartenance à la zone de libre circulation, et slug France Diplomatie
 * **vérifié** par `npm run check:links`.
 */

export interface CountryRef {
  /** ISO 3166-1 alpha-2 */
  iso2: string;
  /** Nom français canonique, tel qu'affiché */
  nameFr: string;
  /**
   * Préposition de lieu, pour écrire « au Maroc » et non « en Maroc ».
   * Détail d'apparence cosmétique, mais une interface qui écrit « en
   * Maroc » perd exactement la crédibilité dont une page de formalités a
   * besoin.
   */
  prep: 'en' | 'au' | 'aux' | 'à';
  /**
   * Slug de la fiche « Conseils aux voyageurs » du ministère français.
   * `null` = pas de fiche publiée (cas de la France elle-même) ou slug non
   * confirmé : on renvoie alors vers l'index, jamais vers une 404.
   */
  maeSlug: string | null;
}

/** Pays couverts par le jeu de données destinations. */
const COUNTRIES: CountryRef[] = [
  { iso2: 'ZA', nameFr: 'Afrique du Sud', prep: 'en', maeSlug: 'afrique-du-sud' },
  { iso2: 'DE', nameFr: 'Allemagne', prep: 'en', maeSlug: 'allemagne' },
  { iso2: 'AR', nameFr: 'Argentine', prep: 'en', maeSlug: 'argentine' },
  { iso2: 'AU', nameFr: 'Australie', prep: 'en', maeSlug: 'australie' },
  { iso2: 'AT', nameFr: 'Autriche', prep: 'en', maeSlug: 'autriche' },
  { iso2: 'BE', nameFr: 'Belgique', prep: 'en', maeSlug: 'belgique' },
  { iso2: 'BR', nameFr: 'Brésil', prep: 'au', maeSlug: 'bresil' },
  { iso2: 'CA', nameFr: 'Canada', prep: 'au', maeSlug: 'canada' },
  { iso2: 'CN', nameFr: 'Chine', prep: 'en', maeSlug: 'chine' },
  { iso2: 'KR', nameFr: 'Corée du Sud', prep: 'en', maeSlug: 'coree-du-sud' },
  { iso2: 'DK', nameFr: 'Danemark', prep: 'au', maeSlug: 'danemark' },
  { iso2: 'EG', nameFr: 'Égypte', prep: 'en', maeSlug: 'egypte' },
  { iso2: 'AE', nameFr: 'Émirats Arabes Unis', prep: 'aux', maeSlug: 'emirats-arabes-unis' },
  { iso2: 'ES', nameFr: 'Espagne', prep: 'en', maeSlug: 'espagne' },
  { iso2: 'US', nameFr: 'États-Unis', prep: 'aux', maeSlug: 'etats-unis' },
  { iso2: 'FI', nameFr: 'Finlande', prep: 'en', maeSlug: 'finlande' },
  { iso2: 'FR', nameFr: 'France', prep: 'en', maeSlug: null },
  { iso2: 'GR', nameFr: 'Grèce', prep: 'en', maeSlug: 'grece' },
  { iso2: 'HK', nameFr: 'Hong Kong', prep: 'à', maeSlug: 'hong-kong' },
  { iso2: 'IN', nameFr: 'Inde', prep: 'en', maeSlug: 'inde' },
  { iso2: 'ID', nameFr: 'Indonésie', prep: 'en', maeSlug: 'indonesie' },
  { iso2: 'IE', nameFr: 'Irlande', prep: 'en', maeSlug: 'irlande' },
  { iso2: 'IS', nameFr: 'Islande', prep: 'en', maeSlug: 'islande' },
  // Fiche MAE existante mais adresse non confirmée : repli sur l'index.
  { iso2: 'IL', nameFr: 'Israël', prep: 'en', maeSlug: null },
  { iso2: 'IT', nameFr: 'Italie', prep: 'en', maeSlug: 'italie' },
  { iso2: 'JP', nameFr: 'Japon', prep: 'au', maeSlug: 'japon' },
  { iso2: 'MY', nameFr: 'Malaisie', prep: 'en', maeSlug: 'malaisie' },
  { iso2: 'MA', nameFr: 'Maroc', prep: 'au', maeSlug: 'maroc' },
  { iso2: 'MX', nameFr: 'Mexique', prep: 'au', maeSlug: 'mexique' },
  { iso2: 'NO', nameFr: 'Norvège', prep: 'en', maeSlug: 'norvege' },
  { iso2: 'NL', nameFr: 'Pays-Bas', prep: 'aux', maeSlug: 'pays-bas' },
  { iso2: 'PL', nameFr: 'Pologne', prep: 'en', maeSlug: 'pologne' },
  { iso2: 'PT', nameFr: 'Portugal', prep: 'au', maeSlug: 'portugal' },
  { iso2: 'CZ', nameFr: 'République tchèque', prep: 'en', maeSlug: 'republique-tcheque' },
  { iso2: 'GB', nameFr: 'Royaume-Uni', prep: 'au', maeSlug: 'royaume-uni' },
  { iso2: 'RU', nameFr: 'Russie', prep: 'en', maeSlug: 'russie' },
  { iso2: 'SG', nameFr: 'Singapour', prep: 'à', maeSlug: 'singapour' },
  { iso2: 'CH', nameFr: 'Suisse', prep: 'en', maeSlug: 'suisse' },
  { iso2: 'SE', nameFr: 'Suède', prep: 'en', maeSlug: 'suede' },
  { iso2: 'TH', nameFr: 'Thaïlande', prep: 'en', maeSlug: 'thailande' },
  { iso2: 'TR', nameFr: 'Turquie', prep: 'en', maeSlug: 'turquie' },
];

/** Variantes rencontrées dans les données → nom canonique. */
const ALIASES: Record<string, string> = {
  'chine (ras)': 'Hong Kong',
  'united states': 'États-Unis',
  usa: 'États-Unis',
  'united kingdom': 'Royaume-Uni',
  uk: 'Royaume-Uni',
  japan: 'Japon',
  germany: 'Allemagne',
  spain: 'Espagne',
  italy: 'Italie',
  netherlands: 'Pays-Bas',
  greece: 'Grèce',
  turkey: 'Turquie',
  china: 'Chine',
  india: 'Inde',
  egypt: 'Égypte',
  brazil: 'Brésil',
  russia: 'Russie',
  morocco: 'Maroc',
  switzerland: 'Suisse',
  sweden: 'Suède',
  norway: 'Norvège',
  iceland: 'Islande',
  ireland: 'Irlande',
  finland: 'Finlande',
  poland: 'Pologne',
  austria: 'Autriche',
  belgium: 'Belgique',
  denmark: 'Danemark',
  mexico: 'Mexique',
  argentina: 'Argentine',
  singapore: 'Singapour',
  thailand: 'Thaïlande',
  malaysia: 'Malaisie',
  indonesia: 'Indonésie',
  'south korea': 'Corée du Sud',
  'south africa': 'Afrique du Sud',
  'czech republic': 'République tchèque',
  czechia: 'République tchèque',
  israel: 'Israël',
  australia: 'Australie',
  'united arab emirates': 'Émirats Arabes Unis',
  uae: 'Émirats Arabes Unis',
};

/** Clé de comparaison : sans accents, sans casse, espaces normalisés. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    // NFD sépare la lettre de son accent, la classe Unicode retire l'accent.
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const BY_NAME = new Map<string, CountryRef>();
const BY_ISO2 = new Map<string, CountryRef>();
for (const country of COUNTRIES) {
  BY_NAME.set(normalize(country.nameFr), country);
  BY_ISO2.set(country.iso2, country);
}
for (const [alias, canonical] of Object.entries(ALIASES)) {
  const country = BY_NAME.get(normalize(canonical));
  if (country) BY_NAME.set(normalize(alias), country);
}

/** Résout un nom de pays (français, anglais ou variante) en référence. */
export function findCountry(name: string): CountryRef | null {
  if (!name) return null;
  return BY_NAME.get(normalize(name)) ?? null;
}

export function findCountryByIso2(iso2: string): CountryRef | null {
  return BY_ISO2.get(iso2.toUpperCase()) ?? null;
}

export function allCountries(): CountryRef[] {
  return [...COUNTRIES];
}

/** « au Maroc », « en France », « aux États-Unis », « à Singapour ». */
export function inCountry(country: CountryRef | null, fallbackName?: string): string {
  if (!country) return fallbackName ? `en ${fallbackName}` : 'dans ce pays';
  return `${country.prep} ${country.nameFr}`;
}

// ─── Appartenances : faits juridiques, pas estimations ───

/** Union européenne — 27 États membres. */
export const EU_MEMBERS = new Set([
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR',
  'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO',
  'SE', 'SI', 'SK',
]);

/** Espace économique européen = UE + Islande, Liechtenstein, Norvège. */
export const EEA_MEMBERS = new Set([...EU_MEMBERS, 'IS', 'LI', 'NO']);

/**
 * Zone de libre circulation des personnes : EEE + Suisse (accord bilatéral).
 *
 * C'est cet ensemble — et non l'euro ni l'espace Schengen — qui fonde le
 * droit d'entrée sans visa : l'Irlande n'est pas dans Schengen mais reste
 * dans l'UE, la Norvège n'est pas dans l'UE mais est dans l'EEE.
 */
export const FREE_MOVEMENT_AREA = new Set([...EEA_MEMBERS, 'CH']);

export function hasFreeMovement(iso2: string): boolean {
  return FREE_MOVEMENT_AREA.has(iso2.toUpperCase());
}

/**
 * Espace Schengen — à ne pas confondre avec l'UE : l'Irlande en est
 * absente, la Norvège, l'Islande, le Liechtenstein et la Suisse en font
 * partie sans être dans l'UE. Chypre n'y est pas encore.
 *
 * Sert uniquement à signaler la règle des 90 jours par période de 180
 * jours comme un point à vérifier — jamais à conclure quoi que ce soit.
 */
export const SCHENGEN_MEMBERS = new Set([
  'AT', 'BE', 'BG', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR',
  'HR', 'HU', 'IS', 'IT', 'LI', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL',
  'PT', 'RO', 'SE', 'SI', 'SK',
]);

export function isSchengen(iso2: string): boolean {
  return SCHENGEN_MEMBERS.has(iso2.toUpperCase());
}
