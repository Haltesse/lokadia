/**
 * Carte de voisinage géographique des pays présents dans la base de destinations.
 * Utilisée pour suggérer des étapes cohérentes lors de la planification de voyage.
 * Chaque pays mappe vers ses voisins directs (frontière terrestre ou proximité maritime ≤ 1 h de vol).
 */
export const COUNTRY_NEIGHBORS: Record<string, string[]> = {
  // Europe de l'Ouest
  'France': ['Espagne', 'Italie', 'Belgique', 'Allemagne', 'Suisse', 'Royaume-Uni', 'Pays-Bas', 'Irlande'],
  'Espagne': ['France', 'Portugal', 'Italie', 'Maroc', 'Allemagne'],
  'Portugal': ['Espagne', 'France', 'Maroc'],
  'Italie': ['France', 'Suisse', 'Autriche', 'Grèce', 'Espagne', 'Allemagne'],
  'Belgique': ['France', 'Allemagne', 'Pays-Bas', 'Royaume-Uni'],
  'Pays-Bas': ['Belgique', 'Allemagne', 'France', 'Royaume-Uni', 'Danemark'],
  'Allemagne': ['France', 'Belgique', 'Pays-Bas', 'Pologne', 'République tchèque', 'République Tchèque', 'Autriche', 'Suisse', 'Danemark', 'Italie'],
  'Suisse': ['France', 'Italie', 'Allemagne', 'Autriche'],
  'Autriche': ['Allemagne', 'Italie', 'Suisse', 'République tchèque', 'République Tchèque', 'Pologne'],
  'Royaume-Uni': ['France', 'Irlande', 'Belgique', 'Pays-Bas'],
  'Irlande': ['Royaume-Uni', 'France'],

  // Europe du Nord
  'Danemark': ['Allemagne', 'Suède', 'Norvège', 'Pays-Bas'],
  'Suède': ['Danemark', 'Norvège', 'Finlande'],
  'Norvège': ['Suède', 'Danemark', 'Finlande', 'Islande'],
  'Finlande': ['Suède', 'Norvège', 'Russie'],
  'Islande': ['Norvège', 'Danemark', 'Royaume-Uni'],

  // Europe de l'Est / Centrale
  'Pologne': ['Allemagne', 'République tchèque', 'République Tchèque', 'Autriche'],
  'République tchèque': ['Allemagne', 'Autriche', 'Pologne'],
  'République Tchèque': ['Allemagne', 'Autriche', 'Pologne'],
  'Russie': ['Finlande', 'Pologne', 'Turquie', 'Chine', 'Japon', 'Corée du Sud'],

  // Europe du Sud / Méditerranée
  'Grèce': ['Italie', 'Turquie', 'Égypte', 'Israël'],
  'Turquie': ['Grèce', 'Égypte', 'Israël', 'Émirats Arabes Unis', 'Russie'],

  // Afrique du Nord / Proche-Orient
  'Maroc': ['Espagne', 'Portugal', 'France', 'Égypte'],
  'Égypte': ['Maroc', 'Israël', 'Grèce', 'Turquie'],
  'Israël': ['Égypte', 'Turquie', 'Grèce', 'Émirats Arabes Unis'],

  // Afrique du Sud
  'Afrique du Sud': ['Égypte', 'Maroc'],

  // Moyen-Orient
  'Émirats Arabes Unis': ['Turquie', 'Inde', 'Égypte', 'Israël'],

  // Asie de l'Est
  'Japon': ['Corée du Sud', 'Chine', 'Chine (RAS)', 'Russie'],
  'Corée du Sud': ['Japon', 'Chine', 'Chine (RAS)'],
  'Chine': ['Japon', 'Corée du Sud', 'Chine (RAS)', 'Inde', 'Russie', 'Thaïlande'],
  'Chine (RAS)': ['Chine', 'Japon', 'Corée du Sud', 'Singapour', 'Thaïlande', 'Malaisie'],

  // Asie du Sud-Est
  'Thaïlande': ['Malaisie', 'Singapour', 'Indonésie', 'Vietnam', 'Chine', 'Chine (RAS)', 'Inde'],
  'Vietnam': ['Thaïlande', 'Chine', 'Malaisie', 'Singapour', 'Indonésie'],
  'Malaisie': ['Thaïlande', 'Singapour', 'Indonésie', 'Vietnam', 'Chine (RAS)'],
  'Singapour': ['Malaisie', 'Thaïlande', 'Indonésie', 'Vietnam', 'Chine (RAS)'],
  'Indonésie': ['Singapour', 'Malaisie', 'Thaïlande', 'Australie', 'Vietnam'],

  // Europe Centrale / Balkans
  'Hongrie': ['Autriche', 'Pologne', 'République tchèque', 'République Tchèque', 'Croatie'],
  'Croatie': ['Italie', 'Hongrie', 'Autriche', 'Grèce'],

  // Asie du Sud
  'Inde': ['Émirats Arabes Unis', 'Thaïlande', 'Chine', 'Singapour', 'Malaisie'],

  // Océanie
  'Australie': ['Indonésie', 'Singapour', 'Malaisie'],

  // Amériques du Nord
  'États-Unis': ['Canada', 'Mexique'],
  'Canada': ['États-Unis', 'Mexique'],
  'Mexique': ['États-Unis', 'Canada'],

  // Amériques du Sud
  'Argentine': ['Brésil', 'Chine'],
  'Brésil': ['Argentine', 'Mexique'],
};

/**
 * Renvoie l'ensemble des pays cohérents avec les pays d'un itinéraire :
 * - les pays eux-mêmes
 * - leurs voisins directs
 */
export function getCoherentCountries(itineraryCountries: string[]): Set<string> {
  const result = new Set<string>(itineraryCountries);
  for (const country of itineraryCountries) {
    const neighbors = COUNTRY_NEIGHBORS[country] || [];
    for (const n of neighbors) {
      result.add(n);
    }
  }
  return result;
}
