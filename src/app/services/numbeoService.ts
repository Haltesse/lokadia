/**
 * Service Numbeo Safety Index API
 * Documentation: https://www.numbeo.com/api/doc.jsp
 * 
 * Numbeo fournit un Safety Index (0-100) basé sur des données crowdsourcées:
 * - Safety Index > 60: Sûr
 * - Safety Index 40-60: Modéré
 * - Safety Index < 40: Dangereux
 */

export interface NumbeoSafetyData {
  cityName: string;
  countryName: string;
  safetyIndex: number;
  crimeIndex: number;
  lastUpdate: string;
  // Détails supplémentaires
  safetyLevel: "safe" | "moderate" | "dangerous";
  crimeLevel: "low" | "moderate" | "high";
  qualityOfLifeIndex?: number;
  healthCareIndex?: number;
  pollutionIndex?: number;
}

interface NumbeoApiResponse {
  name: string;
  city_name?: string;
  country_name?: string;
  safety_scale?: number;
  safety_index?: number;
  crime_index?: number;
  quality_of_life_index?: number;
  health_care_index?: number;
  pollution_index?: number;
  source?: string;
}

// Mapping des noms de villes pour l'API Numbeo
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
  "bali-indonesia": { city: "Denpasar", country: "Indonesia" }, // Bali utilise Denpasar pour Numbeo
  "hanoi-vietnam": { city: "Hanoi", country: "Vietnam" },
  "ho-chi-minh-vietnam": { city: "Ho Chi Minh City", country: "Vietnam" },
  "manila-philippines": { city: "Manila", country: "Philippines" },
  "taipei-taiwan": { city: "Taipei", country: "Taiwan" },
  "osaka-japan": { city: "Osaka", country: "Japan" },
  "kyoto-japan": { city: "Kyoto", country: "Japan" },
  "delhi-india": { city: "New Delhi", country: "India" },
  "bangalore-india": { city: "Bangalore", country: "India" },
  
  // Destinations Amériques
  "mexico-city-mexico": { city: "Mexico City", country: "Mexico" },
  "buenos-aires-argentina": { city: "Buenos Aires", country: "Argentina" },
  "miami-usa": { city: "Miami", country: "United States" },
  "los-angeles-usa": { city: "Los Angeles", country: "United States" },
  "rio-de-janeiro-brazil": { city: "Rio de Janeiro", country: "Brazil" },
  "san-francisco-usa": { city: "San Francisco", country: "United States" },
  "vancouver-canada": { city: "Vancouver", country: "Canada" },
  "montreal-canada": { city: "Montreal", country: "Canada" },
  "sao-paulo-brazil": { city: "Sao Paulo", country: "Brazil" },
  "bogota-colombia": { city: "Bogota", country: "Colombia" },
  "lima-peru": { city: "Lima", country: "Peru" },
  "santiago-chile": { city: "Santiago", country: "Chile" },
  "chicago-usa": { city: "Chicago", country: "United States" },
  "boston-usa": { city: "Boston", country: "United States" },
  "las-vegas-usa": { city: "Las Vegas", country: "United States" },
  "seattle-usa": { city: "Seattle", country: "United States" },
  
  // Destinations Afrique & Moyen-Orient
  "cape-town-south-africa": { city: "Cape Town", country: "South Africa" },
  "tel-aviv-israel": { city: "Tel Aviv", country: "Israel" },
  "jerusalem-israel": { city: "Jerusalem", country: "Israel" },
  "casablanca-morocco": { city: "Casablanca", country: "Morocco" },
  "tunis-tunisia": { city: "Tunis", country: "Tunisia" },
  "nairobi-kenya": { city: "Nairobi", country: "Kenya" },
  "johannesburg-south-africa": { city: "Johannesburg", country: "South Africa" },
  "abu-dhabi-uae": { city: "Abu Dhabi", country: "United Arab Emirates" },
  "doha-qatar": { city: "Doha", country: "Qatar" },
  "riyadh-saudi-arabia": { city: "Riyadh", country: "Saudi Arabia" },
};

// ─── Traduction pays français → anglais (pour auto-mapping des nouvelles destinations) ──
const FRENCH_TO_ENGLISH_COUNTRY: Record<string, string> = {
  "France": "France", "Allemagne": "Germany", "Espagne": "Spain", "Italie": "Italy",
  "Royaume-Uni": "United Kingdom", "Portugal": "Portugal", "Pays-Bas": "Netherlands",
  "Belgique": "Belgium", "Suisse": "Switzerland", "Autriche": "Austria",
  "Grèce": "Greece", "Turquie": "Turkey", "Suède": "Sweden", "Norvège": "Norway",
  "Danemark": "Denmark", "Finlande": "Finland", "Islande": "Iceland", "Irlande": "Ireland",
  "Pologne": "Poland", "République tchèque": "Czech Republic", "Russie": "Russia",
  "Maroc": "Morocco", "Égypte": "Egypt", "Afrique du Sud": "South Africa",
  "Kenya": "Kenya", "Tunisie": "Tunisia", "Nigéria": "Nigeria",
  "Émirats arabes unis": "United Arab Emirates", "Qatar": "Qatar",
  "Arabie saoudite": "Saudi Arabia", "Israël": "Israel",
  "Japon": "Japan", "Chine": "China", "Corée du Sud": "South Korea",
  "Thaïlande": "Thailand", "Singapour": "Singapore", "Malaisie": "Malaysia",
  "Indonésie": "Indonesia", "Vietnam": "Vietnam", "Philippines": "Philippines",
  "Taïwan": "Taiwan", "Inde": "India", "Hong Kong": "Hong Kong",
  "Australie": "Australia", "Nouvelle-Zélande": "New Zealand",
  "États-Unis": "United States", "Canada": "Canada", "Mexique": "Mexico",
  "Brésil": "Brazil", "Argentine": "Argentina", "Chili": "Chile",
  "Colombie": "Colombia", "Pérou": "Peru",
};

// Cache pour éviter trop d'appels API
const cache = new Map<string, { data: NumbeoSafetyData; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 heure

function getSafetyLevel(safetyIndex: number): "safe" | "moderate" | "dangerous" {
  if (safetyIndex >= 60) return "safe";
  if (safetyIndex >= 40) return "moderate";
  return "dangerous";
}

function getCrimeLevel(crimeIndex: number): "low" | "moderate" | "high" {
  if (crimeIndex <= 40) return "low";
  if (crimeIndex <= 60) return "moderate";
  return "high";
}

/**
 * Récupère les données de sécurité Numbeo pour une ville
 */
export async function fetchNumbeoSafety(destinationId: string): Promise<NumbeoSafetyData> {
  // Vérifier le cache
  const cached = cache.get(destinationId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("📊 Numbeo - Données en cache pour", destinationId);
    return cached.data;
  }

  let cityData = CITY_NAME_MAPPING[destinationId];

  // Auto-mapping : si la destination n'est pas dans le mapping explicite,
  // on tente de la résoudre depuis la base de données (couvre les nouvelles destinations)
  if (!cityData) {
    try {
      const { getDestinationData } = await import('../data/destinationData');
      const dest = getDestinationData(destinationId);
      if (dest) {
        const englishCountry = FRENCH_TO_ENGLISH_COUNTRY[dest.country] ?? dest.country;
        cityData = { city: dest.name, country: englishCountry };
        console.log(`🗺️ Auto-mapping pour ${destinationId}: ${dest.name}, ${englishCountry}`);
      }
    } catch {
      // Ignore les erreurs d'import circulaire
    }
  }

  if (!cityData) {
    throw new Error(`Ville non supportée par Numbeo: ${destinationId}`);
  }

  try {
    console.log("📊 Numbeo - Récupération des données pour", cityData.city);

    // Import pour obtenir projectId et publicAnonKey
    const { projectId, publicAnonKey } = await import('../../../utils/supabase/info');

    const url = `https://${projectId}.supabase.co/functions/v1/make-server-7fc9da76/api/numbeo?city=${encodeURIComponent(cityData.city)}&country=${encodeURIComponent(cityData.country)}`;
    console.log("🌐 URL appelée:", url);

    // Appel à l'API Numbeo via notre serveur backend
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });

    console.log("📡 Réponse reçue - Status:", response.status, "OK:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur HTTP:", response.status, errorText);
      throw new Error(`Erreur API Numbeo: ${response.status}`);
    }

    const data: NumbeoApiResponse = await response.json();
    // (log JSON brut retiré pour ne pas exposer les indices en console publique)

    // Transformer les données Numbeo en format interne
    const safetyIndex = data.safety_index ?? data.safety_scale;
    if (typeof safetyIndex !== 'number') {
      throw new Error(`Score Numbeo absent pour ${cityData.city}`);
    }

    const crimeIndex = data.crime_index ?? (100 - safetyIndex);

    // Logs détaillés retirés en production pour ne pas exposer les indices
    // bruts source qui font partie de la méthodologie propriétaire.

    const safetyData: NumbeoSafetyData = {
      cityName: cityData.city,
      countryName: cityData.country,
      safetyIndex: Math.round(safetyIndex * 10) / 10,
      crimeIndex: Math.round(crimeIndex * 10) / 10,
      lastUpdate: new Date().toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      safetyLevel: getSafetyLevel(safetyIndex),
      crimeLevel: getCrimeLevel(crimeIndex),
      qualityOfLifeIndex: data.quality_of_life_index,
      healthCareIndex: data.health_care_index,
      pollutionIndex: data.pollution_index,
    };

    // Mettre en cache
    cache.set(destinationId, { data: safetyData, timestamp: Date.now() });

    console.log("✅ Numbeo - Données récupérées et mises en cache:", safetyData);
    return safetyData;

  } catch (error) {
    console.error("❌ ERREUR CRITIQUE lors de la récupération des données Numbeo:", error);
    console.error("Stack trace:", (error as Error).stack);
    
    // Ne PAS utiliser de fallback local, re-throw l'erreur
    throw error;
  }
}

/**
 * Invalider le cache pour forcer une mise à jour
 */
export function invalidateNumbeoCache(destinationId?: string) {
  if (destinationId) {
    cache.delete(destinationId);
    console.log("🗑️ Cache Numbeo invalidé pour", destinationId);
  } else {
    cache.clear();
    console.log("🗑️ Cache Numbeo entièrement vidé");
  }
}

/**
 * Vérifie si les données en cache sont récentes
 */
export function isCacheRecent(destinationId: string): boolean {
  const cached = cache.get(destinationId);
  return !!(cached && Date.now() - cached.timestamp < CACHE_DURATION);
}
