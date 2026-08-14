/**
 * Recherche de destinations tolérante aux fautes de frappe.
 *
 * L'audit relevait qu'un simple `includes` ne trouvait rien sur « Japn ».
 * Ce moteur corrige ça sans ajouter de dépendance : normalisation des
 * accents et de la casse, puis quatre stratégies classées par confiance —
 * préfixe exact, sous-chaîne, initiales de mots, et distance d'édition
 * bornée. Le résultat est groupé (villes / pays) parce qu'une liste à
 * plat de 57 entrées ne se lit pas.
 *
 * Le jeu de données tient en mémoire (57 destinations) : un index inversé
 * serait de la sur-ingénierie ici.
 */
import { destinationsDatabase } from '../data/destinationData';
import type { DestinationDetails } from '../data/types';

export type SearchGroup = 'city' | 'country';

export interface SearchHit {
  destination: DestinationDetails;
  group: SearchGroup;
  /** Plus le score est haut, plus la correspondance est sûre */
  score: number;
  /** Ce qui a déclenché la correspondance, pour l'expliquer à l'écran */
  matchedOn: 'name' | 'country' | 'approx';
}

/** Minuscules, sans accents ni ponctuation : « Dubaï » → « dubai ». */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Distance de Levenshtein bornée : on abandonne dès que le seuil est
 * dépassé, ce qui évite de calculer une matrice complète pour des mots
 * sans rapport.
 */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  if (a === b) return 0;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        current[j - 1] + 1,      // insertion
        previous[j] + 1,          // suppression
        previous[j - 1] + cost,   // substitution
      );
      current.push(value);
      if (value < rowMin) rowMin = value;
    }
    // Toute la ligne dépasse le seuil : inutile de continuer
    if (rowMin > max) return max + 1;
    previous = current;
  }
  return previous[b.length];
}

/** Tolérance croissante avec la longueur : 1 faute sur 4-7 lettres, 2 au-delà. */
function toleranceFor(length: number): number {
  if (length <= 3) return 0;
  if (length <= 7) return 1;
  return 2;
}

/** Initiales des mots : « nyc » ne matche pas, mais « new y » oui. */
function initials(text: string): string {
  return text.split(' ').map((w) => w[0] ?? '').join('');
}

function scoreCandidate(query: string, target: string): { score: number; approx: boolean } | null {
  if (!target) return null;
  if (target === query) return { score: 100, approx: false };
  if (target.startsWith(query)) return { score: 90 - (target.length - query.length) * 0.1, approx: false };

  // Un mot du libellé commence par la requête : « york » dans « new york »
  const words = target.split(' ');
  if (words.some((w) => w.startsWith(query))) return { score: 80, approx: false };

  if (target.includes(query)) return { score: 65, approx: false };
  if (query.length >= 2 && initials(target).startsWith(query)) return { score: 60, approx: false };

  // Tolérance aux fautes, sur le libellé entier puis mot à mot
  const max = toleranceFor(query.length);
  if (max === 0) return null;

  const whole = editDistance(query, target, max);
  if (whole <= max) return { score: 55 - whole * 5, approx: true };

  for (const word of words) {
    if (Math.abs(word.length - query.length) > max) continue;
    const d = editDistance(query, word, max);
    if (d <= max) return { score: 50 - d * 5, approx: true };
  }
  return null;
}

export interface SearchResults {
  cities: SearchHit[];
  countries: SearchHit[];
  total: number;
  /** true si des résultats ne doivent qu'à la tolérance aux fautes */
  hasApproximate: boolean;
}

/**
 * Recherche à partir de 2 caractères. En deçà, on ne renvoie rien plutôt
 * que de proposer les 57 destinations, ce qui n'aide personne.
 */
export function searchDestinations(rawQuery: string, limit = 24): SearchResults {
  const query = normalize(rawQuery);
  const empty: SearchResults = { cities: [], countries: [], total: 0, hasApproximate: false };
  if (query.length < 2) return empty;

  const cities: SearchHit[] = [];
  const countryBest = new Map<string, SearchHit>();

  for (const destination of Object.values(destinationsDatabase)) {
    const byName = scoreCandidate(query, normalize(destination.name));
    if (byName) {
      cities.push({
        destination,
        group: 'city',
        score: byName.score,
        matchedOn: byName.approx ? 'approx' : 'name',
      });
      continue;
    }

    const byCountry = scoreCandidate(query, normalize(destination.country));
    if (byCountry) {
      // Une entrée par pays : la meilleure destination le représente
      const existing = countryBest.get(destination.country);
      if (!existing || existing.score < byCountry.score) {
        countryBest.set(destination.country, {
          destination,
          group: 'country',
          score: byCountry.score,
          matchedOn: byCountry.approx ? 'approx' : 'country',
        });
      }
    }
  }

  const sortByScore = (a: SearchHit, b: SearchHit) =>
    b.score - a.score || a.destination.name.localeCompare(b.destination.name);

  const sortedCities = cities.sort(sortByScore).slice(0, limit);
  const sortedCountries = [...countryBest.values()].sort(sortByScore).slice(0, limit);

  return {
    cities: sortedCities,
    countries: sortedCountries,
    total: sortedCities.length + sortedCountries.length,
    hasApproximate: [...sortedCities, ...sortedCountries].some((h) => h.matchedOn === 'approx'),
  };
}

/** Destinations proposées quand le champ est vide. */
export function popularDestinations(limit = 8): DestinationDetails[] {
  const preferred = [
    'paris-france', 'tokyo-japan', 'barcelona-spain', 'rome-italy',
    'lisbon-portugal', 'new-york-usa', 'london-uk', 'amsterdam-netherlands',
  ];
  const out: DestinationDetails[] = [];
  for (const id of preferred) {
    const d = destinationsDatabase[id];
    if (d) out.push(d);
    if (out.length >= limit) break;
  }
  return out;
}
