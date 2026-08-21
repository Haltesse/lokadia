/**
 * Estimations budgétaires et liens de recherche partenaires.
 *
 * Ce module produisait auparavant de fausses offres : compagnie tirée au sort
 * dans une liste, horaires de vol inventés, prix dérivé de la somme des codes
 * de caractères du code IATA, et des hôtels nommés « ibis Budget Tokyo » avec
 * une note et un nombre d'avis fabriqués. Un voyageur pouvait donc lire
 * « Air France · 08h15 → 11h40 · 285 € » sur un écran de réservation, sans
 * qu'aucune de ces informations n'ait la moindre existence.
 *
 * Il n'y a plus ici que deux choses :
 *
 *   1. Des **fourchettes** budgétaires, calculées sur la distance réelle entre
 *      deux points et la saisonnalité de la réservation. Chacune expose la
 *      méthode qui l'a produite, affichée telle quelle à côté du montant. Une
 *      fourchette annoncée comme telle aide à préparer un voyage ; un prix
 *      unique inventé fait croire à une offre.
 *
 *   2. Des **liens de recherche** vers les partenaires (Skyscanner, Booking),
 *      pré-remplis avec la destination, les dates et le nombre de voyageurs.
 *      Le prix réel se lit chez eux, jamais ici.
 */

import { destinationCoordinates } from '../data/destinationCoordinates';

export const DEPARTURE_CITIES: Array<{ id: string; label: string; iata: string; lat: number; lon: number; country: string }> = [
  { id: 'paris', label: 'Paris', iata: 'PARI', lat: 48.8566, lon: 2.3522, country: 'France' },
  { id: 'lyon', label: 'Lyon', iata: 'LYS', lat: 45.7640, lon: 4.8357, country: 'France' },
  { id: 'marseille', label: 'Marseille', iata: 'MRS', lat: 43.2965, lon: 5.3698, country: 'France' },
  { id: 'toulouse', label: 'Toulouse', iata: 'TLS', lat: 43.6047, lon: 1.4442, country: 'France' },
  { id: 'nice', label: 'Nice', iata: 'NCE', lat: 43.7102, lon: 7.2620, country: 'France' },
  { id: 'bordeaux', label: 'Bordeaux', iata: 'BOD', lat: 44.8378, lon: -0.5792, country: 'France' },
  { id: 'nantes', label: 'Nantes', iata: 'NTE', lat: 47.2184, lon: -1.5536, country: 'France' },
  { id: 'strasbourg', label: 'Strasbourg', iata: 'SXB', lat: 48.5734, lon: 7.7521, country: 'France' },
  { id: 'london', label: 'Londres', iata: 'LOND', lat: 51.5074, lon: -0.1278, country: 'Royaume-Uni' },
  { id: 'brussels', label: 'Bruxelles', iata: 'BRU', lat: 50.8503, lon: 4.3517, country: 'Belgique' },
  { id: 'geneva', label: 'Genève', iata: 'GVA', lat: 46.2044, lon: 6.1432, country: 'Suisse' },
  { id: 'zurich', label: 'Zurich', iata: 'ZRH', lat: 47.3769, lon: 8.5417, country: 'Suisse' },
  { id: 'madrid', label: 'Madrid', iata: 'MAD', lat: 40.4168, lon: -3.7038, country: 'Espagne' },
  { id: 'barcelona', label: 'Barcelone', iata: 'BCN', lat: 41.3851, lon: 2.1734, country: 'Espagne' },
  { id: 'rome', label: 'Rome', iata: 'ROME', lat: 41.9028, lon: 12.4964, country: 'Italie' },
  { id: 'milan', label: 'Milan', iata: 'MIL', lat: 45.4642, lon: 9.1900, country: 'Italie' },
  { id: 'berlin', label: 'Berlin', iata: 'BER', lat: 52.5200, lon: 13.4050, country: 'Allemagne' },
  { id: 'amsterdam', label: 'Amsterdam', iata: 'AMS', lat: 52.3676, lon: 4.9041, country: 'Pays-Bas' },
  { id: 'lisbon', label: 'Lisbonne', iata: 'LIS', lat: 38.7223, lon: -9.1393, country: 'Portugal' },
  { id: 'new-york', label: 'New York', iata: 'NYCA', lat: 40.7128, lon: -74.0060, country: 'États-Unis' },
  { id: 'montreal', label: 'Montréal', iata: 'YMQ', lat: 45.5017, lon: -73.5673, country: 'Canada' },
  { id: 'dubai', label: 'Dubaï', iata: 'DXB', lat: 25.2048, lon: 55.2708, country: 'Émirats Arabes Unis' },
];

export const CITY_IATA: Record<string, string> = {
  paris: 'PARI', london: 'LOND', 'new-york': 'NYCA', tokyo: 'TYOA',
  rome: 'ROME', madrid: 'MAD', barcelona: 'BCN', lisbon: 'LIS',
  amsterdam: 'AMS', berlin: 'BER', prague: 'PRG', vienna: 'VIE',
  istanbul: 'IST', dubai: 'DXB', bangkok: 'BKK', 'hong-kong': 'HKG',
  singapore: 'SIN', bali: 'DPS', seoul: 'SEL', osaka: 'OSA',
  mumbai: 'BOM', delhi: 'DEL', cairo: 'CAI', marrakech: 'RAK',
  'cape-town': 'CPT', nairobi: 'NBO', 'los-angeles': 'LAX',
  'san-francisco': 'SFO', chicago: 'CHI', miami: 'MIA',
  toronto: 'YTO', vancouver: 'YVR', mexico: 'MEX', havana: 'HAV',
  'rio-de-janeiro': 'RIO', 'buenos-aires': 'BUE', lima: 'LIM',
  sydney: 'SYD', melbourne: 'MEL', auckland: 'AKL',
  athens: 'ATH', stockholm: 'STO', copenhagen: 'CPH', oslo: 'OSL',
  helsinki: 'HEL', reykjavik: 'REK', dublin: 'DUB', edinburgh: 'EDI',
  zurich: 'ZRH', geneva: 'GVA', brussels: 'BRU', budapest: 'BUD',
  warsaw: 'WAW', moscow: 'MOW', 'st-petersburg': 'LED',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Fourchettes budgétaires
// ─────────────────────────────────────────────────────────────────────────────

export interface BudgetEstimate {
  /** Borne basse, en euros. */
  low: number;
  /** Borne haute, en euros. */
  high: number;
  /**
   * D'où sort la fourchette, en une phrase destinée à être affichée à côté du
   * montant. Une estimation sans sa méthode est indiscernable d'un prix inventé.
   */
  method: string;
  /** Recherche partenaire pré-remplie, pour obtenir le prix réel. */
  searchUrl: string;
  /** Partenaire vers lequel pointe `searchUrl`. */
  partner: string;
}

/** Amplitude de la fourchette autour de la valeur centrale du modèle. */
const SPREAD = 0.25;

function spread(center: number): { low: number; high: number } {
  const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);
  return { low: round5(center * (1 - SPREAD)), high: round5(center * (1 + SPREAD)) };
}

function daysBetween(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Math.max(1, Math.round((e - s) / 86400000));
}

function daysUntil(date: string): number {
  return Math.max(0, Math.round((new Date(date).getTime() - Date.now()) / 86400000));
}

/** Multiplicateur de saisonnalité : réserver tard coûte plus cher. */
function advanceFactor(startDate: string): { factor: number; label: string } {
  const days = daysUntil(startDate);
  if (days < 14) return { factor: 1.4, label: 'départ à moins de 2 semaines (+40 %)' };
  if (days < 45) return { factor: 1.1, label: 'départ dans moins de 45 jours (+10 %)' };
  return { factor: 0.9, label: 'réservation anticipée (−10 %)' };
}

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "2026-05-10" → "260510", format attendu par Skyscanner. */
function formatDateISO(d: string): string {
  const [y, m, day] = d.split('-');
  return y.slice(2) + m + day;
}

export function skyscannerSearchUrl(params: {
  originIata: string;
  destIata: string;
  startDate: string;
  endDate: string;
  travelers: number;
}): string {
  const { originIata, destIata, startDate, endDate, travelers } = params;
  return (
    `https://www.skyscanner.fr/transport/vols/${originIata.toLowerCase()}/${destIata.toLowerCase()}` +
    `/${formatDateISO(startDate)}/${formatDateISO(endDate)}/?adults=${travelers}`
  );
}

export function bookingSearchUrl(params: {
  destinationName: string;
  startDate: string;
  endDate: string;
  travelers: number;
}): string {
  const u = new URL('https://www.booking.com/searchresults.fr.html');
  u.searchParams.set('ss', params.destinationName);
  u.searchParams.set('checkin', params.startDate);
  u.searchParams.set('checkout', params.endDate);
  u.searchParams.set('group_adults', String(params.travelers));
  u.searchParams.set('group_children', '0');
  u.searchParams.set('no_rooms', '1');
  return u.toString();
}

/**
 * Fourchette pour un aller-retour, **par personne**.
 *
 * Modèle : forfait de 55 € (taxes et frais fixes) + 0,06 €/km sur la distance
 * orthodromique aller-retour réelle entre la ville de départ et la destination,
 * ajusté de la saisonnalité. La distance vient de coordonnées réelles, pas
 * d'un code de ville.
 */
export function estimateFlightBudget(params: {
  destinationId: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  travelers: number;
  originIata?: string;
  originCoord?: { lat: number; lon: number };
}): BudgetEstimate | null {
  const { destinationId, startDate, endDate, travelers, originIata = 'PARI' } = params;

  const destCoord = destinationCoordinates[destinationId];
  const originCoord =
    params.originCoord ??
    DEPARTURE_CITIES.find((c) => c.iata === originIata) ??
    DEPARTURE_CITIES[0];

  const destIata = CITY_IATA[destinationId.split('-')[0]] ?? destinationId.slice(0, 3).toUpperCase();
  const searchUrl = skyscannerSearchUrl({ originIata, destIata, startDate, endDate, travelers });

  // Sans coordonnées, aucune estimation défendable : on renvoie la recherche
  // partenaire seule plutôt qu'un chiffre sorti de nulle part.
  if (!destCoord) return null;

  const oneWayKm = Math.round(haversine(originCoord, destCoord));
  const { factor, label } = advanceFactor(startDate);
  const center = (55 + oneWayKm * 2 * 0.06) * factor;
  const { low, high } = spread(center);

  return {
    low,
    high,
    method:
      `Forfait 55 € + 0,06 €/km sur ${(oneWayKm * 2).toLocaleString('fr-FR')} km aller-retour, ` +
      `${label}. Fourchette ±25 %.`,
    searchUrl,
    partner: 'Skyscanner',
  };
}

/** Coût de la vie relatif, appliqué à l'hébergement et aux repas. */
const COST_INDEX: Record<string, number> = {
  Suisse: 1.5, Norvège: 1.5, Islande: 1.45, Danemark: 1.35, Singapour: 1.35,
  'États-Unis': 1.3, Australie: 1.25, Japon: 1.15, 'Royaume-Uni': 1.2,
  France: 1, Allemagne: 1, Italie: 0.95, Espagne: 0.9, Portugal: 0.85,
  Grèce: 0.85, 'République Tchèque': 0.75, Pologne: 0.7, Turquie: 0.6,
  Maroc: 0.55, Égypte: 0.5, Thaïlande: 0.55, Vietnam: 0.45, Inde: 0.4,
  Mexique: 0.6, Brésil: 0.6, Argentine: 0.55, Indonésie: 0.5,
};

function costIndex(country: string): { index: number; known: boolean } {
  const index = COST_INDEX[country];
  return index === undefined ? { index: 1, known: false } : { index, known: true };
}

/**
 * Fourchette d'hébergement pour tout le séjour, chambre double.
 *
 * Modèle : 95 €/nuit pour un établissement de milieu de gamme en France,
 * pondéré par l'indice de coût de la vie du pays et le nombre de chambres.
 */
export function estimateAccommodationBudget(params: {
  destinationName: string;
  country: string;
  startDate: string;
  endDate: string;
  travelers: number;
}): BudgetEstimate {
  const { destinationName, country, startDate, endDate, travelers } = params;
  const nights = daysBetween(startDate, endDate);
  const rooms = Math.ceil(travelers / 2);
  const { index, known } = costIndex(country);
  const center = 95 * index * nights * rooms;
  const { low, high } = spread(center);

  return {
    low,
    high,
    method:
      `95 €/nuit en milieu de gamme × ${nights} nuit${nights > 1 ? 's' : ''} × ` +
      `${rooms} chambre${rooms > 1 ? 's' : ''}` +
      (known
        ? `, indice de coût de la vie ${country} ×${index}`
        : `, indice de coût de la vie inconnu pour ${country} (base France)`) +
      '. Fourchette ±25 %.',
    searchUrl: bookingSearchUrl({ destinationName, startDate, endDate, travelers }),
    partner: 'Booking.com',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Étapes d'un itinéraire multi-villes
// ─────────────────────────────────────────────────────────────────────────────

export interface LegEstimate {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  distanceKm: number;
  mode: 'plane' | 'train' | 'bus';
  /** Fourchette par personne. */
  low: number;
  high: number;
  method: string;
  durationLabel: string;
}

/**
 * Fourchette et mode de transport pour un tronçon, à partir de la distance
 * réelle entre les deux villes. Aucune part d'aléatoire : deux itinéraires
 * identiques donnent la même estimation, et la méthode est affichable.
 */
export function estimateLeg(params: {
  fromId: string;
  fromName: string;
  fromCoord: { lat: number; lon: number };
  toId: string;
  toName: string;
  toCoord: { lat: number; lon: number };
  startDate: string;
  sameCountry?: boolean;
}): LegEstimate {
  const { fromId, fromName, toId, toName, fromCoord, toCoord, startDate, sameCountry } = params;
  const distanceKm = Math.round(haversine(fromCoord, toCoord));

  let mode: LegEstimate['mode'];
  let center: number;
  let durationLabel: string;
  let method: string;

  if (distanceKm < 120) {
    mode = 'bus';
    center = 15 + distanceKm * 0.08;
    durationLabel = `${Math.max(1, Math.round(distanceKm / 75))} h en bus`;
    method = `15 € + 0,08 €/km sur ${distanceKm} km. Fourchette ±25 %.`;
  } else if (distanceKm < (sameCountry ? 800 : 500)) {
    mode = 'train';
    center = 25 + distanceKm * 0.12;
    durationLabel = `${Math.max(1, Math.round(distanceKm / 150))} h en train`;
    method = `25 € + 0,12 €/km sur ${distanceKm} km. Fourchette ±25 %.`;
  } else {
    mode = 'plane';
    const { factor, label } = advanceFactor(startDate);
    center = (55 + distanceKm * 0.06) * factor;
    durationLabel = `${Math.max(1, Math.round(distanceKm / 750))} h de vol`;
    method = `Forfait 55 € + 0,06 €/km sur ${distanceKm} km, ${label}. Fourchette ±25 %.`;
  }

  const { low, high } = spread(center);
  return { fromId, fromName, toId, toName, distanceKm, mode, low, high, method, durationLabel };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Budget global d'un voyage
// ─────────────────────────────────────────────────────────────────────────────

export interface TripBudgetEstimate {
  transport: { low: number; high: number };
  accommodation: { low: number; high: number };
  food: { low: number; high: number };
  activities: { low: number; high: number };
  total: { low: number; high: number };
  /** Méthode de la partie repas et activités, la seule qui ne vient pas d'ailleurs. */
  method: string;
}

/**
 * Additionne les postes d'un voyage en conservant les fourchettes.
 *
 * Repas et activités : 30 €/jour/personne pour les repas et 20 €/jour/personne
 * pour les visites, en base France, pondérés par l'indice de coût de la vie.
 */
export function computeBudgetEstimate(params: {
  /** Fourchettes par personne de chaque tronçon. */
  legs: Array<{ low: number; high: number }>;
  accommodation: { low: number; high: number };
  travelers: number;
  nights: number;
  country: string;
}): TripBudgetEstimate {
  const { legs, accommodation, travelers, nights, country } = params;
  const { index, known } = costIndex(country);

  const transport = legs.reduce(
    (acc, leg) => ({ low: acc.low + leg.low * travelers, high: acc.high + leg.high * travelers }),
    { low: 0, high: 0 }
  );

  const foodCenter = 30 * index * travelers * nights;
  const activitiesCenter = 20 * index * travelers * nights;
  const food = spread(foodCenter);
  const activities = spread(activitiesCenter);

  return {
    transport,
    accommodation,
    food,
    activities,
    total: {
      low: transport.low + accommodation.low + food.low + activities.low,
      high: transport.high + accommodation.high + food.high + activities.high,
    },
    method:
      `Repas 30 €/jour/personne et visites 20 €/jour/personne en base France` +
      (known ? `, indice ${country} ×${index}` : `, indice inconnu pour ${country} (base France)`) +
      `, sur ${nights} jour${nights > 1 ? 's' : ''} et ${travelers} voyageur${travelers > 1 ? 's' : ''}.`,
  };
}

/** Formatage court d'une fourchette : « 320 – 480 € ». */
export function formatRange(range: { low: number; high: number }): string {
  return `${range.low.toLocaleString('fr-FR')} – ${range.high.toLocaleString('fr-FR')} €`;
}
