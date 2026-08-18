/**
 * Nationalités proposées au voyageur, et autorité officielle qui publie
 * ses conditions d'entrée à l'étranger.
 *
 * Règle de constitution de cette liste : une nationalité n'y figure que si
 * l'adresse de son autorité consulaire a été **vérifiée** (`npm run
 * check:links`). Mieux vaut une liste courte et juste qu'une liste longue
 * dont la moitié des liens sont morts — les formalités d'entrée sont
 * exactement le sujet où un lien cassé coûte cher.
 *
 * Cette liste n'est pas un référentiel de nationalités : c'est la liste
 * des cas où Lokadia peut orienter vers une source fiable. Toute autre
 * nationalité passe par l'option « Autre », qui l'assume franchement.
 */

export interface NationalityRef {
  /** ISO 3166-1 alpha-2 du pays de nationalité */
  iso2: string;
  /** Libellé affiché dans le sélecteur */
  label: string;
  /** Autorité qui publie les conseils aux voyageurs / conditions d'entrée */
  authority: string;
  /** Page officielle vérifiée */
  url: string;
  /**
   * true si le serveur bloque les vérifications automatiques (protection
   * anti-robot). L'adresse est alors validée à la main, et le vérificateur
   * de liens ne la compte pas comme cassée.
   */
  botProtected?: boolean;
}

export const NATIONALITIES: NationalityRef[] = [
  {
    iso2: 'FR',
    label: 'France',
    authority: "Ministère de l'Europe et des Affaires étrangères",
    url: 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/',
  },
  {
    iso2: 'BE',
    label: 'Belgique',
    authority: 'SPF Affaires étrangères',
    url: 'https://diplomatie.belgium.be/fr/conseils-aux-voyageurs',
  },
  {
    iso2: 'CH',
    label: 'Suisse',
    authority: 'Département fédéral des affaires étrangères (DFAE)',
    url: 'https://www.eda.admin.ch/eda/fr/dfae/representations-et-conseils-aux-voyageurs.html',
    botProtected: true,
  },
  {
    iso2: 'LU',
    label: 'Luxembourg',
    authority: 'Ministère des Affaires étrangères et européennes',
    url: 'https://maee.gouvernement.lu/fr.html',
  },
  {
    iso2: 'CA',
    label: 'Canada',
    authority: 'Gouvernement du Canada',
    url: 'https://voyage.gc.ca/destinations',
  },
  {
    iso2: 'GB',
    label: 'Royaume-Uni',
    authority: 'Foreign, Commonwealth & Development Office',
    url: 'https://www.gov.uk/foreign-travel-advice',
  },
  {
    iso2: 'US',
    label: 'États-Unis',
    authority: 'U.S. Department of State',
    url: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html',
    botProtected: true,
  },
  {
    iso2: 'DE',
    label: 'Allemagne',
    authority: 'Auswärtiges Amt',
    url: 'https://www.auswaertiges-amt.de/de/ReiseUndSicherheit/reise-und-sicherheitshinweise',
  },
  {
    iso2: 'ES',
    label: 'Espagne',
    authority: 'Ministerio de Asuntos Exteriores',
    url: 'https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Recomendaciones-de-viaje.aspx',
  },
  {
    iso2: 'IT',
    label: 'Italie',
    authority: 'Ministero degli Affari Esteri — Viaggiare Sicuri',
    url: 'https://www.viaggiaresicuri.it/',
  },
  {
    iso2: 'NL',
    label: 'Pays-Bas',
    authority: 'Ministerie van Buitenlandse Zaken',
    url: 'https://www.nederlandwereldwijd.nl/reisadvies',
  },
  {
    iso2: 'PT',
    label: 'Portugal',
    authority: 'Ministério dos Negócios Estrangeiros',
    url: 'https://portaldascomunidades.mne.gov.pt/pt/conselhos-aos-viajantes',
  },
  {
    iso2: 'IE',
    label: 'Irlande',
    authority: 'Department of Foreign Affairs',
    url: 'https://www.ireland.ie/en/dfa/overseas-travel/',
  },
];

/** Valeur du sélecteur quand la nationalité n'est pas dans la liste. */
export const OTHER_NATIONALITY = 'OTHER';

export function findNationality(iso2: string | null): NationalityRef | null {
  if (!iso2 || iso2 === OTHER_NATIONALITY) return null;
  return NATIONALITIES.find((n) => n.iso2 === iso2) ?? null;
}
