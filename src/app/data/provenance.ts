/**
 * Provenance du contenu des fiches destination.
 *
 * L'audit reprochait à ces fiches d'être présentées comme actuelles sans
 * date ni source. Ce module répare ça, en distinguant deux natures de
 * contenu qui n'ont pas la même valeur et ne se vérifient pas pareil :
 *
 *  1. **Contenu éditorial** (meilleure période, coût moyen, quartiers,
 *     coutumes) — rédigé par Lokadia. Il porte une date de revue.
 *  2. **Données de sécurité et formalités** — elles ne valent que par
 *     leur source officielle, citée et consultable par l'utilisateur.
 *
 * Règle d'honnêteté : on n'invente aucune date de rédaction fiche par
 * fiche, parce qu'elle n'est pas connue. On expose la date de la dernière
 * consolidation du jeu de données, en disant exactement ce qu'elle
 * signifie. Une fiche réellement revue peut porter sa propre date via
 * `EDITORIAL_REVIEWS`.
 */
import { getOfficialSources, type OfficialSource } from '../lib/officialSources';

/**
 * Date de la dernière consolidation du jeu de données (dédoublonnage et
 * unification). Ce n'est PAS une vérification éditoriale du contenu :
 * l'interface le formule comme tel, sans laisser croire à une relecture
 * factuelle de chaque fiche.
 */
export const DATASET_CONSOLIDATED_ON = '2026-08-13';

/**
 * Dates de revue éditoriale réelle, par destination (ISO). À remplir au
 * fur et à mesure des relectures. Une entrée ici prime sur la date de
 * consolidation et change le libellé affiché.
 */
export const EDITORIAL_REVIEWS: Record<string, string> = {
  // 'paris-france': '2026-08-01',
};

export interface DestinationProvenance {
  /** true si la fiche a fait l'objet d'une relecture éditoriale datée */
  reviewed: boolean;
  /** Date ISO à afficher */
  date: string;
  /** Sources officielles consultables pour la sécurité et les formalités */
  officialSources: OfficialSource[];
}

export function getProvenance(
  destinationId: string,
  cityName: string,
  countryName: string,
): DestinationProvenance {
  const reviewedOn = EDITORIAL_REVIEWS[destinationId];
  return {
    reviewed: !!reviewedOn,
    date: reviewedOn ?? DATASET_CONSOLIDATED_ON,
    officialSources: getOfficialSources(cityName, countryName),
  };
}

/** Date lisible en français : « 13 août 2026 ». */
export function formatProvenanceDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
