/**
 * Script utilitaire pour vérifier les mappings de destinations manquants
 */

import { destinationsDatabase } from '../data/destinationData';

// Mapping des noms de villes pour l'API Numbeo (copié depuis numbeoService.ts)
const CITY_NAME_MAPPING: Record<string, { city: string; country: string }> = {
  "paris-france": { city: "Paris", country: "France" },
  "tokyo-japan": { city: "Tokyo", country: "Japan" },
  "new-york-usa": { city: "New York", country: "United States" },
  "london-uk": { city: "London", country: "United Kingdom" },
  "barcelona-spain": { city: "Barcelona", country: "Spain" },
  "rome-italy": { city: "Rome", country: "Italy" },
  "dubai-uae": { city: "Dubai", country: "United Arab Emirates" },
  "singapore-singapore": { city: "Singapore", country: "Singapore" },
  "bangkok-thailand": { city: "Bangkok", country: "Thailand" },
  "sydney-australia": { city: "Sydney", country: "Australia" },
  "berlin-germany": { city: "Berlin", country: "Germany" },
  "amsterdam-netherlands": { city: "Amsterdam", country: "Netherlands" },
  "istanbul-turkey": { city: "Istanbul", country: "Turkey" },
  "beijing-china": { city: "Beijing", country: "China" },
  "mumbai-india": { city: "Mumbai", country: "India" },
  "cairo-egypt": { city: "Cairo", country: "Egypt" },
  "rio-brazil": { city: "Rio de Janeiro", country: "Brazil" },
  "moscow-russia": { city: "Moscow", country: "Russia" },
  "toronto-canada": { city: "Toronto", country: "Canada" },
  "marrakech-morocco": { city: "Marrakech", country: "Morocco" },
  
  // Destinations européennes
  "lisbon-portugal": { city: "Lisbon", country: "Portugal" },
  "prague-czechia": { city: "Prague", country: "Czech Republic" },
  "prague-czech": { city: "Prague", country: "Czech Republic" },
  "vienna-austria": { city: "Vienna", country: "Austria" },
  "athens-greece": { city: "Athens", country: "Greece" },
  "copenhagen-denmark": { city: "Copenhagen", country: "Denmark" },
  "stockholm-sweden": { city: "Stockholm", country: "Sweden" },
  "brussels-belgium": { city: "Brussels", country: "Belgium" },
  "reykjavik-iceland": { city: "Reykjavik", country: "Iceland" },
  "edinburgh-uk": { city: "Edinburgh", country: "United Kingdom" },
  "oslo-norway": { city: "Oslo", country: "Norway" },
  "zurich-switzerland": { city: "Zurich", country: "Switzerland" },
  "dublin-ireland": { city: "Dublin", country: "Ireland" },
  "helsinki-finland": { city: "Helsinki", country: "Finland" },
  "warsaw-poland": { city: "Warsaw", country: "Poland" },
  "seville-spain": { city: "Seville", country: "Spain" },
  "krakow-poland": { city: "Krakow", country: "Poland" },
  "florence-italy": { city: "Florence", country: "Italy" },
  "porto-portugal": { city: "Porto", country: "Portugal" },
  "nice-france": { city: "Nice", country: "France" },
  "milan-italy": { city: "Milan", country: "Italy" },
  "venice-italy": { city: "Venice", country: "Italy" },
  "madrid-spain": { city: "Madrid", country: "Spain" },
  
  // Destinations Asie-Pacifique
  "seoul-south-korea": { city: "Seoul", country: "South Korea" },
  "hong-kong-china": { city: "Hong Kong", country: "Hong Kong" },
  "shanghai-china": { city: "Shanghai", country: "China" },
  "kuala-lumpur-malaysia": { city: "Kuala Lumpur", country: "Malaysia" },
  "phuket-thailand": { city: "Phuket", country: "Thailand" },
  "bali-indonesia": { city: "Denpasar", country: "Indonesia" },
  
  // Destinations Amériques
  "mexico-city-mexico": { city: "Mexico City", country: "Mexico" },
  "buenos-aires-argentina": { city: "Buenos Aires", country: "Argentina" },
  "miami-usa": { city: "Miami", country: "United States" },
  "los-angeles-usa": { city: "Los Angeles", country: "United States" },
  "rio-de-janeiro-brazil": { city: "Rio de Janeiro", country: "Brazil" },
  "san-francisco-usa": { city: "San Francisco", country: "United States" },
  "vancouver-canada": { city: "Vancouver", country: "Canada" },
  "montreal-canada": { city: "Montreal", country: "Canada" },
  
  // Destinations Afrique & Moyen-Orient
  "cape-town-south-africa": { city: "Cape Town", country: "South Africa" },
  "tel-aviv-israel": { city: "Tel Aviv", country: "Israel" },
};

/**
 * Vérifie quelles destinations n'ont pas de mapping Numbeo
 */
export function checkMissingMappings() {
  const allDestinationIds = Object.keys(destinationsDatabase);
  const missingMappings: string[] = [];
  
  console.log('\n🔍 VÉRIFICATION DES MAPPINGS NUMBEO\n');
  console.log(`📊 Total destinations: ${allDestinationIds.length}`);
  console.log(`📊 Total mappings: ${Object.keys(CITY_NAME_MAPPING).length}\n`);
  
  for (const destId of allDestinationIds) {
    if (!CITY_NAME_MAPPING[destId]) {
      missingMappings.push(destId);
      const dest = destinationsDatabase[destId];
      console.log(`❌ MANQUANT: "${destId}": { city: "${dest.name}", country: "${dest.country}" },`);
    }
  }
  
  if (missingMappings.length === 0) {
    console.log('✅ Tous les mappings sont présents !');
  } else {
    console.log(`\n⚠️ ${missingMappings.length} destinations sans mapping Numbeo`);
    console.log('\n📝 Mappings à ajouter dans numbeoService.ts:\n');
    missingMappings.forEach(destId => {
      const dest = destinationsDatabase[destId];
      console.log(`  "${destId}": { city: "${dest.name}", country: "${dest.country}" },`);
    });
  }
  
  return missingMappings;
}

// Auto-exécution si lancé directement
if (typeof window !== 'undefined') {
  checkMissingMappings();
}
