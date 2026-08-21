/**
 * Postes de budget d'un voyage, et où obtenir le prix réel.
 *
 * Ce fichier produisait auparavant un catalogue d'offres fabriquées : des
 * « Studio cosy centre-ville » et des « Visite guidée à pied » avec des prix
 * tirés d'un générateur pseudo-aléatoire seedé sur l'identifiant de la
 * destination. Le commentaire d'en-tête reconnaissait des « estimations
 * réalistes », mais l'interface les présentait comme des offres ajoutables au
 * panier, badge « Best-seller » compris.
 *
 * Ne restent que des **ordres de grandeur** assumés, chacun accompagné de sa
 * méthode et des liens de recherche partenaires où lire le prix réel. Aucune
 * offre nommée, aucun prix unitaire présenté comme ferme.
 */
import type { CartCategory } from './cart';
import {
  getStayOptions, getEsimOptions, getActivityOptions, chapkaLink, omioLink,
  type PartnerOption,
} from './partnerLinks';
import { estimateAccommodationBudget, formatRange } from './travelOffers';

export interface CategoryEstimate {
  category: CartCategory;
  /** Intitulé du poste, ex. « Hébergement ». */
  label: string;
  low: number;
  high: number;
  /** Comment la fourchette est obtenue — affiché avec le montant. */
  method: string;
  /** Où obtenir le prix réel. */
  partners: PartnerOption[];
}

/** Pays atteignables en train depuis la France (rail pertinent). */
const RAIL_COUNTRIES = new Set([
  'France', 'Belgique', 'Pays-Bas', 'Allemagne', 'Suisse', 'Italie',
  'Espagne', 'Royaume-Uni', 'Luxembourg', 'Autriche',
]);

const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

function nightsBetween(start: string, end: string): number {
  const d = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
  return Number.isFinite(d) && d > 0 ? d : 7;
}

/**
 * e-SIM.
 *
 * Les forfaits data prépayés vont d'environ 4 € (1 Go, 7 jours) à 40 € (20 Go,
 * 30 jours) selon la zone. On annonce cet ordre de grandeur sans prétendre
 * connaître le catalogue du jour d'un opérateur donné.
 */
export function estimateEsim(country: string): CategoryEstimate {
  return {
    category: 'esim',
    label: 'e-SIM data',
    low: 5,
    high: 40,
    method:
      'Ordre de grandeur des forfaits data prépayés, de 1 Go sur 7 jours à ' +
      '20 Go sur 30 jours. Le prix du jour se lit chez l\'opérateur.',
    partners: getEsimOptions(country),
  };
}

/**
 * Assurance voyage.
 *
 * Les contrats voyage courants se situent entre 2 € et 6 € par jour et par
 * personne selon le niveau de garantie ; le tarif exact dépend de l'âge, de la
 * destination et des options, qui ne sont pas connus ici.
 */
export function estimateInsurance(
  startDate: string,
  endDate: string,
  travelers: number
): CategoryEstimate {
  const days = nightsBetween(startDate, endDate);
  return {
    category: 'insurance',
    label: 'Assurance voyage',
    low: round5(2 * days * travelers),
    high: round5(6 * days * travelers),
    method:
      `2 à 6 €/jour/personne selon le niveau de garantie, sur ${days} jour${days > 1 ? 's' : ''} ` +
      `et ${travelers} voyageur${travelers > 1 ? 's' : ''}. Le tarif dépend de l'âge et des options.`,
    partners: [
      {
        id: 'chapka',
        name: 'Chapka Assurances',
        description: 'Devis assurance voyage et expatriation',
        brandColor: '#0F4C81',
        href: chapkaLink(),
      },
    ],
  };
}

/**
 * Hébergement — délègue à `estimateAccommodationBudget`, qui pondère par
 * l'indice de coût de la vie du pays.
 */
export function estimateLodging(params: {
  destinationName: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
}): CategoryEstimate {
  const estimate = estimateAccommodationBudget(params);
  return {
    category: 'hotel',
    label: 'Hébergement',
    low: estimate.low,
    high: estimate.high,
    method: estimate.method,
    partners: getStayOptions({
      city: params.destinationName,
      country: params.country,
      checkIn: params.startDate,
      checkOut: params.endDate,
      adults: params.travelers,
    }),
  };
}

/**
 * Activités et visites — 15 à 35 € par jour et par personne, ce qui couvre
 * aussi bien une entrée de musée qu'une excursion ponctuelle.
 */
export function estimateActivities(
  destinationName: string,
  startDate: string,
  endDate: string,
  travelers: number
): CategoryEstimate {
  const days = nightsBetween(startDate, endDate);
  return {
    category: 'activity',
    label: 'Visites et activités',
    low: round5(15 * days * travelers),
    high: round5(35 * days * travelers),
    method:
      `15 à 35 €/jour/personne — d'une entrée de musée à une excursion — sur ` +
      `${days} jour${days > 1 ? 's' : ''} et ${travelers} voyageur${travelers > 1 ? 's' : ''}.`,
    partners: getActivityOptions(destinationName),
  };
}

/**
 * Train, uniquement pour les pays réellement desservis depuis la France.
 * Renvoie `null` ailleurs plutôt qu'une offre ferroviaire sans réseau.
 */
export function estimateTrain(params: {
  destinationName: string;
  country: string;
  startDate: string;
  travelers: number;
}): CategoryEstimate | null {
  const { destinationName, country, startDate, travelers } = params;
  if (!RAIL_COUNTRIES.has(country)) return null;

  return {
    category: 'train',
    label: 'Train',
    low: round5(40 * travelers),
    high: round5(190 * travelers),
    method:
      `40 à 190 € par personne selon l'anticipation et la classe, pour un trajet ` +
      `au départ de France vers ${country}. Les tarifs les plus bas exigent une ` +
      `réservation plusieurs semaines à l'avance.`,
    partners: [
      {
        id: 'omio',
        name: 'Omio',
        description: `Trains et bus vers ${destinationName}`,
        brandColor: '#F4364C',
        href: omioLink({ toCity: destinationName, depart: startDate }),
      },
    ],
  };
}

/** Somme des fourchettes de plusieurs postes. */
export function sumEstimates(estimates: CategoryEstimate[]): { low: number; high: number } {
  return estimates.reduce(
    (acc, e) => ({ low: acc.low + e.low, high: acc.high + e.high }),
    { low: 0, high: 0 }
  );
}

export { formatRange };
