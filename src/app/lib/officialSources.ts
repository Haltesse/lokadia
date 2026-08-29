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

import { ISO3_TO_ISO2 } from './countryIsoMapping';
import { findCountry } from '../data/countries';

/** Base des fiches pays « Conseils aux voyageurs » du MAE. */
const MAE_COUNTRY_BASE =
  'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination';

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

/**
 * Les deux tables qui vivaient ici (slugs France Diplomatie et codes OMS)
 * étaient indexées sur des noms de pays ANGLAIS alors que le jeu de
 * données les nomme en français (« Japon », « États-Unis ») : elles ne
 * servaient donc quasiment jamais, et l'OMS recevait tout le monde sur sa
 * page d'accueil. La résolution passe désormais par la table pays
 * canonique (`data/countries.ts`), dont les slugs sont vérifiés par
 * `npm run check:links`.
 */

/**
 * Territoires sans fiche pays à l'OMS parce qu'ils n'en sont pas membres —
 * Hong Kong est une région administrative spéciale, pas un État membre.
 */
const WITHOUT_WHO_PROFILE = new Set(['HK']);

/** ISO2 → ISO3, pour les fiches pays de l'OMS (indexées en alpha-3). */
const ISO2_TO_ISO3: Record<string, string> = Object.fromEntries(
  Object.entries(ISO3_TO_ISO2).map(([iso3, iso2]) => [iso2, iso3]),
);

// ─── URLs des sites officiels (constantes) ───
export const SOURCE_HOMEPAGES = {
  numbeo: 'https://www.numbeo.com/crime/',
  // L'index des fiches pays du MAE : `.../conseils-par-pays-destination/`
  // seul renvoie une 404, c'est bien la racine « conseils-aux-voyageurs ».
  franceDiplomatie: 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/',
  gdacs: 'https://www.gdacs.org/',
  who: 'https://www.who.int/countries',
  osac: 'https://www.osac.gov/',
  ecdc: 'https://www.ecdc.europa.eu/en/threats-and-outbreaks',
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
  const country = findCountry(countryName);

  // ─── 1. France Diplomatie ───
  // Slug inconnu ou pays sans fiche (la France) → index, jamais une 404.
  sources.push({
    id: 'france-diplomatie',
    name: 'Conseils aux voyageurs',
    organization: 'France Diplomatie (MEAE)',
    description:
      "Recommandations officielles du Ministère de l'Europe et des Affaires Étrangères : sécurité, santé, formalités d'entrée, zones à éviter.",
    url: country?.maeSlug
      ? `${MAE_COUNTRY_BASE}/${country.maeSlug}/`
      : SOURCE_HOMEPAGES.franceDiplomatie,
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
  // Les fiches pays de l'OMS sont indexées en ISO alpha-3, sans slash
  // final : /countries/jpn répond, /countries/jp/ renvoie une 404.
  // Les territoires qui ne sont pas États membres n'ont pas de fiche.
  const whoCode =
    country && !WITHOUT_WHO_PROFILE.has(country.iso2)
      ? ISO2_TO_ISO3[country.iso2]
      : undefined;
  sources.push({
    id: 'who',
    name: 'Recommandations sanitaires',
    organization: 'OMS · Organisation Mondiale de la Santé',
    description:
      "Vaccins recommandés, épidémies actives, situation sanitaire — fiche officielle pays de l'OMS.",
    url: whoCode
      ? `https://www.who.int/countries/${whoCode.toLowerCase()}`
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
