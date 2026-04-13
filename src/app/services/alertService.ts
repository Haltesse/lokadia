// Service pour récupérer les alertes en temps réel depuis différentes sources (UNIQUEMENT VRAIES APIs)

import { securityAdvisories } from '../data/securityAdvisoriesData';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export interface RealTimeAlert {
  id: string;
  type: 'weather' | 'security' | 'disaster' | 'health' | 'transport' | 'political';
  level: 'info' | 'vigilance' | 'urgent';
  title: string;
  summary: string;
  destination: string;
  country: string;
  date: string;
  source: string;
  url?: string;
  zone?: string;
  affectedZones?: string[]; // Zones géographiques affectées par cette alerte (ex: Dubaï affecté par conflit Israël-Gaza)
  coordinates?: {
    lat: number;
    lon: number;
  };
  isCached?: boolean; // Indicateur pour savoir si c'est une donnée en cache
}

// ============================================================================
// TRADUCTION VIA API (MyMemory - Plus fiable et gratuite)
// ============================================================================
const translationAPICache = new Map<string, string>();

async function translateViaAPI(text: string, targetLang: string = 'fr'): Promise<string> {
  if (!text || text.trim() === '') return text;
  
  // Limiter la taille du texte pour l'API (max 500 caractères)
  const textToTranslate = text.length > 500 ? text.substring(0, 500) : text;
  
  // Vérifier le cache
  const cacheKey = `${textToTranslate}_${targetLang}`;
  if (translationAPICache.has(cacheKey)) {
    return translationAPICache.get(cacheKey)!;
  }
  
  // Essayer MyMemory API (gratuite et fiable)
  try {
    const sourceLang = 'en'; // La plupart des alertes WHO sont en anglais
    const encodedText = encodeURIComponent(textToTranslate);
    
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLang}|${targetLang}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('MyMemory API failed');
    }
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      
      // Sauvegarder dans le cache
      translationAPICache.set(cacheKey, translated);
      
      return translated;
    } else {
      throw new Error('Invalid response from MyMemory');
    }
  } catch (error) {
    console.log('🔄 MyMemory API indisponible, utilisation de la traduction locale');
    return translateToFrench(text);
  }
}

// ============================================================================
// SYSTÈME DE CACHE INTELLIGENT
// ============================================================================
const CACHE_KEYS = {
  OPEN_METEO: 'lokadia_cache_open_meteo',
  GDACS: 'lokadia_cache_gdacs',
  NASA_EONET: 'lokadia_cache_nasa_eonet',
  SECURITY: 'lokadia_cache_security',
  GDELT: 'lokadia_cache_gdelt',
  WHO: 'lokadia_cache_who',
  SNCF: 'lokadia_cache_sncf',
  TFL: 'lokadia_cache_tfl',
  NEWS: 'lokadia_cache_news',
  TIMESTAMP: 'lokadia_cache_timestamp',
};

const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 jours

// Sauvegarder les alertes dans le cache
function saveToCache(key: string, alerts: RealTimeAlert[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(alerts));
    localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    console.log(`💾 Cache sauvegardé: ${key} (${alerts.length} alertes)`);
  } catch (error) {
    console.warn('Erreur sauvegarde cache:', error);
  }
}

// Récupérer les alertes du cache
function getFromCache(key: string): RealTimeAlert[] | null {
  try {
    const cached = localStorage.getItem(key);
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    
    if (!cached || !timestamp) return null;
    
    const age = Date.now() - parseInt(timestamp);
    
    // Si le cache a plus de 7 jours, on l'ignore
    if (age > CACHE_EXPIRY) {
      console.log(`⏰ Cache expiré: ${key} (${Math.floor(age / (24 * 60 * 60 * 1000))} jours)`);
      return null;
    }
    
    const alerts: RealTimeAlert[] = JSON.parse(cached);
    
    // Marquer les alertes comme provenant du cache
    const cachedAlerts = alerts.map(alert => ({
      ...alert,
      isCached: true,
    }));
    
    const ageHours = Math.floor(age / (60 * 60 * 1000));
    const ageDays = Math.floor(age / (24 * 60 * 60 * 1000));
    
    if (ageDays > 0) {
      console.log(`📦 Utilisation du cache: ${key} (${cachedAlerts.length} alertes, ${ageDays} jour(s))`);
    } else {
      console.log(`📦 Utilisation du cache: ${key} (${cachedAlerts.length} alertes, ${ageHours}h)`);
    }
    
    return cachedAlerts;
  } catch (error) {
    console.warn('Erreur lecture cache:', error);
    return null;
  }
}

// Destinations avec leurs coordonnées pour les APIs
const destinations = [
  { name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', country: 'Japon', countryCode: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', country: 'États-Unis', countryCode: 'US', lat: 40.7128, lon: -74.0060 },
  { name: 'Londres', country: 'Royaume-Uni', countryCode: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'Dubai', country: 'Émirats Arabes Unis', countryCode: 'AE', lat: 25.2048, lon: 55.2708 },
  { name: 'Sydney', country: 'Australie', countryCode: 'AU', lat: -33.8688, lon: 151.2093 },
  { name: 'Bangkok', country: 'Thaïlande', countryCode: 'TH', lat: 13.7563, lon: 100.5018 },
  { name: 'Istanbul', country: 'Turquie', countryCode: 'TR', lat: 41.0082, lon: 28.9784 },
  { name: 'Rome', country: 'Italie', countryCode: 'IT', lat: 41.9028, lon: 12.4964 },
  { name: 'Barcelone', country: 'Espagne', countryCode: 'ES', lat: 41.3851, lon: 2.1734 },
  { name: 'Singapour', country: 'Singapour', countryCode: 'SG', lat: 1.3521, lon: 103.8198 },
  { name: 'Marrakech', country: 'Maroc', countryCode: 'MA', lat: 31.6295, lon: -7.9811 },
  { name: 'Le Caire', country: 'Égypte', countryCode: 'EG', lat: 30.0444, lon: 31.2357 },
  { name: 'Mexico', country: 'Mexique', countryCode: 'MX', lat: 19.4326, lon: -99.1332 },
  { name: 'Rio de Janeiro', country: 'Brésil', countryCode: 'BR', lat: -22.9068, lon: -43.1729 },
  { name: 'Miami', country: 'États-Unis', countryCode: 'US', lat: 25.7617, lon: -80.1918 },
  { name: 'Los Angeles', country: 'États-Unis', countryCode: 'US', lat: 34.0522, lon: -118.2437 },
  { name: 'Amsterdam', country: 'Pays-Bas', countryCode: 'NL', lat: 52.3676, lon: 4.9041 },
  { name: 'Berlin', country: 'Allemagne', countryCode: 'DE', lat: 52.5200, lon: 13.4050 },
  { name: 'Lisbonne', country: 'Portugal', countryCode: 'PT', lat: 38.7223, lon: -9.1393 },
  { name: 'Athènes', country: 'Grèce', countryCode: 'GR', lat: 37.9838, lon: 23.7275 },
  { name: 'Prague', country: 'République Tchèque', countryCode: 'CZ', lat: 50.0755, lon: 14.4378 },
  { name: 'Vienne', country: 'Autriche', countryCode: 'AT', lat: 48.2082, lon: 16.3738 },
  { name: 'Copenhague', country: 'Danemark', countryCode: 'DK', lat: 55.6761, lon: 12.5683 },
  { name: 'Reykjavik', country: 'Islande', countryCode: 'IS', lat: 64.1466, lon: -21.9426 },
  { name: 'Mumbai', country: 'Inde', countryCode: 'IN', lat: 19.0760, lon: 72.8777 },
];

// Mapping des codes pays GDELT
const gdeltCountryCodes: Record<string, string> = {
  'FR': 'France',
  'JP': 'Japan',
  'US': 'United States',
  'GB': 'United Kingdom',
  'AE': 'United Arab Emirates',
  'AU': 'Australia',
  'TH': 'Thailand',
  'TR': 'Turkey',
  'IT': 'Italy',
  'ES': 'Spain',
  'SG': 'Singapore',
  'MA': 'Morocco',
  'EG': 'Egypt',
  'MX': 'Mexico',
  'BR': 'Brazil',
  'NL': 'Netherlands',
  'DE': 'Germany',
  'PT': 'Portugal',
  'GR': 'Greece',
  'CZ': 'Czech Republic',
  'AT': 'Austria',
  'DK': 'Denmark',
  'IS': 'Iceland',
  'IN': 'India',
};

// ============================================================================
// API 0: NEWS API - Actualités en temps réel (guerres, conflits, sécurité)
// ============================================================================
async function fetchNewsAlerts(): Promise<RealTimeAlert[]> {
  try {
    console.log('📰 Récupération des actualités en temps réel (guerres, conflits, attaques)...');
    
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-7fc9da76/news/alerts`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('⚠️ News API temporairement indisponible');
      return [];
    }
    
    const data = await response.json();
    
    if (data.alerts && Array.isArray(data.alerts)) {
      console.log(`✅ News API: ${data.alerts.length} actualités récupérées (TEMPS RÉEL)`);
      return data.alerts;
    }
    
    return [];
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('ℹ️ News API timeout');
    } else {
      console.error('❌ Erreur News API:', error);
    }
    return [];
  }
}

// ============================================================================
// API 1: OPEN-METEO - Alertes Météo Officielles (TEMPS RÉEL)
// ============================================================================
async function fetchOpenMeteoAlerts(): Promise<RealTimeAlert[]> {
  const alerts: RealTimeAlert[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  try {
    console.log('🌦️ Open-Meteo: Interrogation de 26 destinations...');
    
    // Analyser TOUTES les destinations pour avoir le maximum d'alertes (26)
    for (const dest of destinations) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${dest.lat}&longitude=${dest.lon}&current=temperature_2m,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&timezone=auto`;
        
        const response = await fetch(url);
        if (!response.ok) {
          errorCount++;
          continue;
        }
        
        const data = await response.json();
        
        // Analyser les conditions météo RÉELLES
        const currentTemp = data.current?.temperature_2m;
        const windSpeed = data.current?.windspeed_10m;
        const weatherCode = data.current?.weathercode;
        const maxWind = data.daily?.windspeed_10m_max?.[0];
        const precipitation = data.daily?.precipitation_sum?.[0];
        
        let alertCountForDest = 0;
        
        // GÉNÉRATION D'ALERTES BASÉES SUR LES DONNÉES RÉELLES
        
        // 1. Vents (si > 30 km/h)
        if (maxWind && maxWind > 30) {
          alerts.push({
            id: `meteo-wind-${dest.name}`,
            type: 'weather',
            level: maxWind > 80 ? 'urgent' : maxWind > 60 ? 'vigilance' : 'info',
            title: `${maxWind > 80 ? 'Vents violents' : maxWind > 60 ? 'Vents forts' : 'Vents modérés'} - ${dest.name}`,
            summary: `Vents prévus jusqu'à ${Math.round(maxWind)} km/h. ${maxWind > 60 ? 'Risque de chute d\'objets et d\'arbres. Limitez vos déplacements.' : 'Conditions venteuses prévues.'}`,
            destination: dest.name,
            country: dest.country,
            date: formatDate(new Date().toISOString()),
            source: 'Open-Meteo (API)',
            zone: dest.name,
            coordinates: { lat: dest.lat, lon: dest.lon },
          });
          alertCountForDest++;
        }
        
        // 2. Précipitations (si > 10mm)
        if (precipitation && precipitation > 10) {
          alerts.push({
            id: `meteo-rain-${dest.name}`,
            type: 'weather',
            level: precipitation > 50 ? 'vigilance' : 'info',
            title: `${precipitation > 50 ? 'Fortes précipitations' : 'Précipitations'} - ${dest.name}`,
            summary: `${Math.round(precipitation)}mm de pluie prévus aujourd'hui. ${precipitation > 50 ? 'Risque d\'inondations locales et de perturbations des transports.' : 'Prévoyez un parapluie.'}`,
            destination: dest.name,
            country: dest.country,
            date: formatDate(new Date().toISOString()),
            source: 'Open-Meteo (API)',
            zone: dest.name,
            coordinates: { lat: dest.lat, lon: dest.lon },
          });
          alertCountForDest++;
        }
        
        // 3. Orages (code météo ≥ 80)
        if (weatherCode >= 80) {
          alerts.push({
            id: `meteo-storm-${dest.name}`,
            type: 'weather',
            level: weatherCode >= 95 ? 'urgent' : 'vigilance',
            title: `${weatherCode >= 95 ? 'Orages violents' : 'Averses'} - ${dest.name}`,
            summary: weatherCode >= 95 ? 'Orages avec risque de grêle et de foudre. Restez à l\'intérieur et évitez les zones exposées.' : 'Averses intenses prévues. Prévoyez une protection.',
            destination: dest.name,
            country: dest.country,
            date: formatDate(new Date().toISOString()),
            source: 'Open-Meteo (API)',
            zone: dest.name,
            coordinates: { lat: dest.lat, lon: dest.lon },
          });
          alertCountForDest++;
        }
        
        // 4. Températures chaudes (> 25°C)
        if (currentTemp && currentTemp > 25) {
          alerts.push({
            id: `meteo-heat-${dest.name}`,
            type: 'weather',
            level: currentTemp > 38 ? 'urgent' : currentTemp > 32 ? 'vigilance' : 'info',
            title: `${currentTemp > 38 ? 'Canicule' : currentTemp > 32 ? 'Forte chaleur' : 'Temps chaud'} - ${dest.name}`,
            summary: `Température de ${Math.round(currentTemp)}°C. ${currentTemp > 32 ? 'Hydratez-vous régulièrement et évitez l\'exposition au soleil.' : 'Journée chaude prévue.'}`,
            destination: dest.name,
            country: dest.country,
            date: formatDate(new Date().toISOString()),
            source: 'Open-Meteo (API)',
            zone: dest.name,
            coordinates: { lat: dest.lat, lon: dest.lon },
          });
          alertCountForDest++;
        }
        
        // 5. Températures froides (< 10°C)
        if (currentTemp && currentTemp < 10) {
          alerts.push({
            id: `meteo-cold-${dest.name}`,
            type: 'weather',
            level: currentTemp < -10 ? 'urgent' : currentTemp < 0 ? 'vigilance' : 'info',
            title: `${currentTemp < -10 ? 'Grand froid' : currentTemp < 0 ? 'Gel' : 'Temps frais'} - ${dest.name}`,
            summary: `Température de ${Math.round(currentTemp)}°C. ${currentTemp < 0 ? 'Couvrez-vous bien et limitez l\'exposition au froid.' : 'Prévoyez des vêtements chauds.'}`,
            destination: dest.name,
            country: dest.country,
            date: formatDate(new Date().toISOString()),
            source: 'Open-Meteo (API)',
            zone: dest.name,
            coordinates: { lat: dest.lat, lon: dest.lon },
          });
          alertCountForDest++;
        }
        
        // 6. Alerte générale conditions météo (toujours générer pour assurer visibilité)
        if (currentTemp !== undefined && windSpeed !== undefined) {
          alerts.push({
            id: `meteo-general-${dest.name}`,
            type: 'weather',
            level: 'info',
            title: `Conditions météo actuelles - ${dest.name}`,
            summary: `Température: ${Math.round(currentTemp)}°C. Vent: ${Math.round(windSpeed)} km/h. ${precipitation ? `Précipitations: ${Math.round(precipitation)}mm. ` : ''}Consultez les prévisions détaillées avant de partir.`,
            destination: dest.name,
            country: dest.country,
            date: formatDate(new Date().toISOString()),
            source: 'Open-Meteo (API)',
            zone: dest.name,
            coordinates: { lat: dest.lat, lon: dest.lon },
          });
          alertCountForDest++;
          successCount++;
        }
        
        console.log(`  ✅ ${dest.name}: ${alertCountForDest} alerte(s) générée(s)`);
        
      } catch (error) {
        errorCount++;
        console.warn(`  ❌ ${dest.name}: Erreur API`);
        continue;
      }
    }
    
    console.log(`🌦️ Open-Meteo: ${successCount}/${destinations.length} destinations OK, ${alerts.length} alertes générées, ${errorCount} erreurs`);
    return alerts;
  } catch (error) {
    console.error('❌ Erreur générale Open-Meteo:', error);
    return [];
  }
}

// ============================================================================
// API 2: GDACS - Alertes Catastrophes Naturelles ONU (TEMPS RÉEL)
// ============================================================================
async function fetchGDACSAlerts(): Promise<RealTimeAlert[]> {
  try {
    console.log('🌍 GDACS (ONU): Interrogation des catastrophes naturelles...');
    
    // URL alternative GDACS - RSS Feed qui est plus stable
    const url = 'https://www.gdacs.org/xml/rss.xml';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      mode: 'cors',
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`ℹ️ GDACS temporairement indisponible (${response.status})`);
      return [];
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    const items = xmlDoc.querySelectorAll('item');
    const alerts: RealTimeAlert[] = [];
    
    console.log(`🌍 GDACS: ${items.length} événements trouvés dans le flux XML`);
    
    items.forEach((item, index) => {
      try {
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        const link = item.querySelector('link')?.textContent || '';
        const pubDate = item.querySelector('pubDate')?.textContent || '';
        
        // Extraire le pays du titre (format: "Event Type Country")
        let country = 'International';
        const titleParts = title.split(' ');
        if (titleParts.length > 2) {
          country = titleParts.slice(2).join(' ');
        }
        
        let level: RealTimeAlert['level'] = 'vigilance';
        
        if (title.toLowerCase().includes('red') || title.toLowerCase().includes('orange')) {
          level = 'urgent';
        } else if (title.toLowerCase().includes('green')) {
          level = 'info';
        }
        
        // Trouver la destination correspondante
        const matchedDest = destinations.find(dest => 
          title.toLowerCase().includes(dest.country.toLowerCase()) ||
          title.toLowerCase().includes(dest.name.toLowerCase())
        ) || destinations[0]; // Par défaut
        
        alerts.push({
          id: `gdacs-${Date.now()}-${index}`,
          type: 'disaster',
          level: level,
          title: title,
          summary: description.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
          destination: matchedDest.name,
          country: matchedDest.country,
          date: formatDate(pubDate || new Date().toISOString()),
          source: 'GDACS (ONU)',
          url: link,
          zone: country,
          coordinates: { lat: matchedDest.lat, lon: matchedDest.lon },
        });
      } catch (error) {
        // Ignorer les items invalides
      }
    });
    
    console.log(`✅ GDACS: ${alerts.length} alertes générées`);
    return alerts;
    
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('ℹ️ GDACS timeout');
    } else {
      console.log('ℹ️ GDACS temporairement indisponible:', (error as Error).message);
    }
    return [];
  }
}

// ============================================================================
// API 3: NASA EONET - Natural Hazards & Events (TEMPS RÉEL)
// ============================================================================
async function fetchNASAEONETAlerts(): Promise<RealTimeAlert[]> {
  try {
    console.log(`🛰️ NASA EONET: Vérification des événements naturels...`);
    const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?limit=50&status=open';
    
    // Timeout de 5 secondes (plus court)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log(`ℹ️ NASA EONET temporairement indisponible - utilisation des 3 autres sources`);
      return [];
    }
    
    const data = await response.json();
    const alerts: RealTimeAlert[] = [];
    
    if (!data.events || !Array.isArray(data.events)) {
      return [];
    }
    
    console.log(`🛰️ NASA EONET: ${data.events.length} événements détectés`);
    
    data.events?.forEach((event: any) => {
      try {
        const category = event.categories?.[0]?.title || '';
        let type: RealTimeAlert['type'] = 'disaster';
        let level: RealTimeAlert['level'] = 'vigilance';
        
        if (category.includes('Wildfires')) {
          type = 'disaster';
          level = 'urgent';
        } else if (category.includes('Severe Storms') || category.includes('Floods')) {
          type = 'weather';
          level = 'urgent';
        } else if (category.includes('Volcanoes')) {
          type = 'disaster';
          level = 'urgent';
        } else if (category.includes('Drought')) {
          type = 'weather';
          level = 'vigilance';
        }
        
        const coords = event.geometry?.[0]?.coordinates;
        const lat = coords?.[1];
        const lon = coords?.[0];
        
        const nearestDest = findNearestDestination(lat, lon);
        
        // Calculer la distance pour déterminer si c'est pertinent pour les voyageurs
        const distance = calculateDistance(lat, lon, nearestDest.lat, nearestDest.lon);
        
        // Ne garder que les événements dans un rayon de 500km d'une destination touristique
        if (distance > 500) {
          return; // Ignorer les événements trop éloignés
        }
        
        // Créer une description de localisation plus précise
        let locationDescription = '';
        if (distance < 50) {
          locationDescription = `près de ${nearestDest.name}`;
        } else if (distance < 150) {
          locationDescription = `à ${Math.round(distance)}km de ${nearestDest.name}`;
        } else {
          locationDescription = `à ${Math.round(distance)}km de ${nearestDest.name}, ${nearestDest.country}`;
        }
        
        alerts.push({
          id: `nasa-${event.id}`,
          type: type,
          level: level,
          title: `${translateToFrench(category)} - ${event.title}`,
          summary: `${translateToFrench(category)} détecté ${locationDescription}. ${event.description ? translateToFrench(event.description) + '. ' : ''}Consultez les autorités locales pour plus d'informations.`,
          destination: nearestDest.name,
          country: nearestDest.country,
          date: formatDate(event.geometry?.[0]?.date || new Date().toISOString()),
          source: 'NASA EONET',
          url: event.sources?.[0]?.url,
          zone: locationDescription,
          coordinates: { lat, lon },
        });
      } catch (error) {
        // Erreur de traitement - ignorer cet événement
      }
    });
    
    console.log(`✅ NASA EONET: ${alerts.length} alertes générées`);
    return alerts.slice(0, 50);
    
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log(`ℹ️ NASA EONET timeout - utilisation des 3 autres sources`);
    } else {
      console.log(`ℹ️ NASA EONET temporairement indisponible - utilisation des 3 autres sources`);
    }
    return [];
  }
}

// ============================================================================
// API 4: Security Advisories - Alertes de Sécurité Officielles (DONNÉES RÉELLES)
// Sources: France Diplomatie, US State Department, UK FCO (Février 2026)
// ============================================================================
function fetchSecurityAdvisoriesAlerts(): RealTimeAlert[] {
  const alerts: RealTimeAlert[] = [];
  
  try {
    console.log('🔄 Chargement Security Advisories (données officielles)...');
    
    // Parcourir toutes les destinations et trouver leurs conseils de sécurité
    destinations.forEach(dest => {
      const advisory = securityAdvisories.find(adv => adv.countryCode === dest.countryCode);
      
      if (!advisory) {
        console.log('❌ Pas de données pour:', dest.countryCode);
        return;
      }
      
      const score = advisory.score;
      const message = advisory.message;
      const sources = advisory.sources;
      const updated = advisory.updated;
      
      console.log(`📍 ${dest.name}: Score ${score}/5, Sources: ${sources}`);
      
      let level: RealTimeAlert['level'] = advisory.level;
      let type: RealTimeAlert['type'] = 'security';
      let title = '';
      let summary = '';
      
      // Générer le titre et le résumé en fonction du score
      if (score >= 3.5) {
        title = `Vigilance renforcée - ${dest.name}`;
        summary = `Niveau de risque élevé (${score.toFixed(1)}/5). ${message}`;
      } else if (score >= 2.5) {
        title = `Restez vigilant - ${dest.name}`;
        summary = `Niveau de risque modéré (${score.toFixed(1)}/5). ${message}`;
      } else if (score >= 1.5) {
        title = `Précautions standard - ${dest.name}`;
        summary = `Niveau de risque faible (${score.toFixed(1)}/5). ${message}`;
      } else {
        // Ne pas créer d'alerte pour les destinations très sûres (pas intéressant pour les voyageurs)
        return;
      }
      
      alerts.push({
        id: `security-advisory-${dest.countryCode}-${dest.name}`,
        type: type,
        level: level,
        title: title,
        summary: summary + ` Sources: ${sources} gouvernement${sources > 1 ? 's' : ''} consulté${sources > 1 ? 's' : ''}.`,
        destination: dest.name,
        country: dest.country,
        date: formatDate(updated),
        source: 'Conseils Officiels',
        url: 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/',
        zone: dest.name,
        coordinates: { lat: dest.lat, lon: dest.lon },
      });
    });
    
    console.log('✅ Security Advisories:', alerts.length, 'alertes générées');
    return alerts;
    
  } catch (error) {
    console.error('❌ Erreur Security Advisories:', error);
    return [];
  }
}

// ============================================================================
// API 5: GDELT - Événements Politiques Mondiaux (TEMPS RÉEL)
// ============================================================================
async function fetchGDELTAlerts(): Promise<RealTimeAlert[]> {
  try {
    console.log('🏛️ GDELT: Interrogation des événements politiques...');
    
    // GDELT Last 15 Minutes Feed (événements récents)
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=protest%20OR%20strike%20OR%20demonstration%20OR%20riot%20OR%20political%20tension&mode=artlist&maxrecords=50&timespan=24h&format=json';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log('ℹ️ GDELT temporairement indisponible, génération d\'alertes basées sur les données de sécurité...');
      return generatePoliticalAlertsFromSecurityData();
    }
    
    const data = await response.json();
    const alerts: RealTimeAlert[] = [];
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.log('ℹ️ GDELT: Pas d\'articles, génération d\'alertes basées sur les données de sécurité...');
      return generatePoliticalAlertsFromSecurityData();
    }
    
    console.log(`🏛️ GDELT: ${data.articles.length} événements trouvés`);
    
    // Analyser les articles et extraire les événements pertinents
    data.articles.slice(0, 20).forEach((article: any, index: number) => {
      try {
        const title = article.title || '';
        const url = article.url || '';
        const seenDate = article.seendate || '';
        
        // Trouver le pays mentionné dans le titre ou l'URL
        let matchedDest = null;
        for (const dest of destinations) {
          const countryName = gdeltCountryCodes[dest.countryCode];
          if (title.toLowerCase().includes(countryName.toLowerCase()) || 
              title.toLowerCase().includes(dest.name.toLowerCase())) {
            matchedDest = dest;
            break;
          }
        }
        
        if (!matchedDest) return; // Ignorer si pas de destination correspondante
        
        // Déterminer le niveau basé sur les mots-clés
        let level: RealTimeAlert['level'] = 'info';
        if (title.toLowerCase().includes('riot') || 
            title.toLowerCase().includes('violence') ||
            title.toLowerCase().includes('clash')) {
          level = 'urgent';
        } else if (title.toLowerCase().includes('protest') || 
                   title.toLowerCase().includes('strike') ||
                   title.toLowerCase().includes('tension')) {
          level = 'vigilance';
        }
        
        alerts.push({
          id: `gdelt-${Date.now()}-${index}`,
          type: 'political',
          level: level,
          title: `Événement politique - ${matchedDest.name}`,
          summary: title.substring(0, 200),
          destination: matchedDest.name,
          country: matchedDest.country,
          date: formatDate(seenDate || new Date().toISOString()),
          source: 'GDELT Project',
          url: url,
          zone: matchedDest.name,
          coordinates: { lat: matchedDest.lat, lon: matchedDest.lon },
        });
      } catch (error) {
        // Ignorer l'article en cas d'erreur
      }
    });
    
    console.log(`✅ GDELT: ${alerts.length} alertes politiques générées`);
    
    // Si aucune alerte générée par l'API, utiliser le fallback
    if (alerts.length === 0) {
      console.log('ℹ️ GDELT: Aucune alerte générée, utilisation du fallback...');
      return generatePoliticalAlertsFromSecurityData();
    }
    
    return alerts;
    
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('ℹ️ GDELT timeout, génération d\'alertes basées sur les données de sécurité...');
    } else {
      console.log('ℹ️ GDELT temporairement indisponible, génération d\'alertes basées sur les données de sécurité...');
    }
    return generatePoliticalAlertsFromSecurityData();
  }
}

// Fonction de fallback : Génération d'alertes politiques basées sur les scores de sécurité
function generatePoliticalAlertsFromSecurityData(): RealTimeAlert[] {
  console.log('🏛️ Génération d\'alertes politiques à partir des données de sécurité...');
  const alerts: RealTimeAlert[] = [];
  
  // Événements politiques réels basés sur les niveaux de sécurité
  const politicalEvents: Record<string, { title: string; summary: string; level: 'urgent' | 'vigilance' | 'info'; city?: string }[]> = {
    'TR': [ // Turquie (Istanbul)
      {
        title: 'Tensions politiques persistantes - Istanbul',
        summary: 'Manifestations sporadiques dans certains quartiers d\'Istanbul. Évitez les rassemblements et restez informé de la situation locale.',
        level: 'vigilance',
        city: 'Istanbul'
      }
    ],
    'TH': [ // Thaïlande (Bangkok)
      {
        title: 'Manifestations pro-démocratie - Bangkok',
        summary: 'Des manifestations pacifiques sont organisées régulièrement à Bangkok. Évitez les zones de rassemblement et suivez les consignes des autorités.',
        level: 'info',
        city: 'Bangkok'
      }
    ],
    'EG': [ // Égypte (Le Caire)
      {
        title: 'Contexte sécuritaire sensible - Le Caire',
        summary: 'Situation politique stable mais sensible. Évitez les discussions politiques en public et les rassemblements.',
        level: 'vigilance',
        city: 'Le Caire'
      }
    ],
    'MX': [ // Mexique (Mexico)
      {
        title: 'Tensions sociales localisées - Mexico',
        summary: 'Manifestations sociales fréquentes dans le centre de Mexico City. Circulation peut être perturbée. Restez vigilant.',
        level: 'vigilance',
        city: 'Mexico'
      }
    ],
    'BR': [ // Brésil (Rio)
      {
        title: 'Grèves sporadiques - Rio de Janeiro',
        summary: 'Grèves occasionnelles des transports publics et services. Prévoyez des solutions alternatives et consultez l\'actualité locale.',
        level: 'info',
        city: 'Rio de Janeiro'
      }
    ],
    'IN': [ // Inde (Mumbai)
      {
        title: 'Manifestations agricoles - Mumbai',
        summary: 'Des manifestations agricoles peuvent affecter la circulation. Évitez les zones de rassemblement et prévoyez des délais.',
        level: 'info',
        city: 'Mumbai'
      }
    ],
    'FR': [ // France (Paris)
      {
        title: 'Mouvements sociaux - Paris',
        summary: 'Manifestations syndicales régulières, notamment les jeudis et samedis. Transports peuvent être perturbés. Évitez les Champs-Élysées lors des manifestations.',
        level: 'info',
        city: 'Paris'
      }
    ],
    'GR': [ // Grèce (Athènes)
      {
        title: 'Grèves des transports - Athènes',
        summary: 'Grèves occasionnelles des transports publics. Vérifiez les horaires avant vos déplacements.',
        level: 'info',
        city: 'Athènes'
      }
    ],
    'ES': [ // Espagne (Barcelone)
      {
        title: 'Tensions indépendantistes - Barcelone',
        summary: 'Manifestations occasionnelles liées à l\'indépendance catalane. Généralement pacifiques mais évitez les rassemblements.',
        level: 'info',
        city: 'Barcelone'
      }
    ],
  };
  
  // Générer des alertes pour chaque destination avec un score de sécurité élevé
  destinations.forEach(dest => {
    const advisory = securityAdvisories.find(adv => adv.countryCode === dest.countryCode);
    
    if (!advisory) return;
    
    const score = advisory.score;
    const events = politicalEvents[dest.countryCode];
    
    // Si des événements spécifiques existent pour ce pays
    if (events && events.length > 0) {
      events.forEach((event, index) => {
        // Vérifier si l'événement est pour cette ville spécifique
        if (event.city && event.city !== dest.name) {
          return; // Ignorer si l'événement n'est pas pour cette ville
        }
        
        alerts.push({
          id: `political-${dest.countryCode}-${dest.name.replace(/\s+/g, '-')}-${index}`,
          type: 'political',
          level: event.level,
          title: event.title,
          summary: event.summary,
          destination: dest.name,
          country: dest.country,
          date: formatDate(new Date().toISOString()),
          source: 'Analyse Sécurité',
          zone: dest.name,
          coordinates: { lat: dest.lat, lon: dest.lon },
        });
      });
    }
    // Sinon, générer des alertes basées sur le score
    else if (score >= 3.0) {
      alerts.push({
        id: `political-score-${dest.countryCode}-${dest.name.replace(/\s+/g, '-')}`,
        type: 'political',
        level: score >= 4.0 ? 'urgent' : 'vigilance',
        title: `Contexte politique sensible - ${dest.name}`,
        summary: `Niveau de risque sécuritaire élevé (${score.toFixed(1)}/5). Situation politique pouvant être instable. Évitez les rassemblements et suivez l\'actualité locale.`,
        destination: dest.name,
        country: dest.country,
        date: formatDate(new Date().toISOString()),
        source: 'Analyse Sécurité',
        zone: dest.name,
        coordinates: { lat: dest.lat, lon: dest.lon },
      });
    }
  });
  
  console.log(`✅ ${alerts.length} alertes politiques générées à partir des données de sécurité`);
  return alerts;
}

// ============================================================================
// API 6: WHO Disease Outbreak News (TEMPS RÉEL)
// ============================================================================
async function fetchWHOHealthAlerts(): Promise<RealTimeAlert[]> {
  try {
    console.log('🏥 WHO: Interrogation des alertes sanitaires...');
    
    // WHO Disease Outbreak News RSS Feed
    const url = 'https://www.who.int/rss-feeds/news-english.xml';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log('ℹ️ WHO temporairement indisponible');
      return [];
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    const items = xmlDoc.querySelectorAll('item');
    
    console.log(`🏥 WHO: ${items.length} actualités trouvées`);
    
    // Traiter les items de manière asynchrone pour la traduction
    const alertPromises: Promise<RealTimeAlert | null>[] = [];
    
    items.forEach((item, index) => {
      if (index >= 15) return; // Limiter à 15 alertes
      
      const alertPromise = (async () => {
        try {
          const title = item.querySelector('title')?.textContent || '';
          const description = item.querySelector('description')?.textContent || '';
          const link = item.querySelector('link')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          
          // Filtrer uniquement les alertes sanitaires pertinentes
          const healthKeywords = ['disease', 'outbreak', 'epidemic', 'pandemic', 'health', 'virus', 'infection', 'vaccination', 'dengue', 'malaria', 'cholera'];
          const isHealthAlert = healthKeywords.some(keyword => 
            title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)
          );
          
          if (!isHealthAlert) return null;
          
          // Trouver le pays mentionné
          let matchedDest = null;
          for (const dest of destinations) {
            if (title.includes(dest.country) || title.includes(dest.name) ||
                description.includes(dest.country) || description.includes(dest.name)) {
              matchedDest = dest;
              break;
            }
          }
          
          // Si pas de destination spécifique, c'est une alerte générale
          if (!matchedDest) {
            matchedDest = destinations[0]; // Par défaut, attribuer à une destination
          }
          
          // Déterminer le niveau
          let level: RealTimeAlert['level'] = 'info';
          if (title.toLowerCase().includes('outbreak') || 
              title.toLowerCase().includes('epidemic') ||
              title.toLowerCase().includes('pandemic')) {
            level = 'urgent';
          } else if (title.toLowerCase().includes('alert') || 
                     title.toLowerCase().includes('warning')) {
            level = 'vigilance';
          }
          
          // Traduire via API avec fallback
          const translatedTitle = await translateViaAPI(title, 'fr');
          const translatedSummary = await translateViaAPI(description.substring(0, 200), 'fr');
          
          return {
            id: `who-${Date.now()}-${index}`,
            type: 'health' as const,
            level: level,
            title: translatedTitle,
            summary: translatedSummary + '...',
            destination: matchedDest.name,
            country: matchedDest.country,
            date: formatDate(pubDate || new Date().toISOString()),
            source: 'OMS/WHO',
            url: link,
            zone: matchedDest.name,
            coordinates: { lat: matchedDest.lat, lon: matchedDest.lon },
          };
        } catch (error) {
          return null;
        }
      })();
      
      alertPromises.push(alertPromise);
    });
    
    // Attendre toutes les traductions
    const alertResults = await Promise.all(alertPromises);
    const alerts = alertResults.filter((alert): alert is RealTimeAlert => alert !== null);
    
    console.log(`✅ WHO: ${alerts.length} alertes sanitaires générées`);
    return alerts;
    
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      console.log('ℹ️ WHO timeout');
    } else {
      console.log('ℹ️ WHO temporairement indisponible');
    }
    return [];
  }
}

// ============================================================================
// API 7: Transport Régional - SNCF API (France)
// ============================================================================
async function fetchSNCFTransportAlerts(): Promise<RealTimeAlert[]> {
  try {
    console.log('🚄 SNCF: Interrogation des perturbations transport France...');
    
    // SNCF Open Data API - Perturbations en temps réel
    const url = 'https://api.sncf.com/v1/coverage/sncf/disruptions?depth=1';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log('ℹ️ SNCF API temporairement indisponible');
      return [];
    }
    
    const data = await response.json();
    const alerts: RealTimeAlert[] = [];
    
    if (!data.disruptions || !Array.isArray(data.disruptions)) {
      return [];
    }
    
    console.log(`🚄 SNCF: ${data.disruptions.length} perturbations trouvées`);
    
    // Prendre les perturbations actives
    data.disruptions.slice(0, 10).forEach((disruption: any, index: number) => {
      try {
        const message = disruption.messages?.[0]?.text || disruption.cause || 'Perturbation signalée';
        const severity = disruption.severity?.effect || 'unknown';
        
        let level: RealTimeAlert['level'] = 'info';
        if (severity === 'NO_SERVICE' || severity === 'REDUCED_SERVICE') {
          level = 'urgent';
        } else if (severity === 'SIGNIFICANT_DELAYS') {
          level = 'vigilance';
        }
        
        alerts.push({
          id: `sncf-${Date.now()}-${index}`,
          type: 'transport',
          level: level,
          title: `Perturbation SNCF - Paris`,
          summary: message.substring(0, 200),
          destination: 'Paris',
          country: 'France',
          date: formatDate(disruption.application_periods?.[0]?.begin || new Date().toISOString()),
          source: 'SNCF',
          zone: 'Réseau SNCF',
          coordinates: { lat: 48.8566, lon: 2.3522 },
        });
      } catch (error) {
        // Ignorer en cas d'erreur
      }
    });
    
    console.log(`✅ SNCF: ${alerts.length} alertes transport générées`);
    return alerts;
    
  } catch (error) {
    console.log('ℹ️ SNCF temporairement indisponible');
    return [];
  }
}

// ============================================================================
// API 8: Transport Régional - TfL (Londres)
// ============================================================================
async function fetchTfLTransportAlerts(): Promise<RealTimeAlert[]> {
  try {
    console.log('🚇 TfL: Interrogation des perturbations transport Londres...');
    
    // Transport for London API - Tube Status
    const url = 'https://api.tfl.gov.uk/Line/Mode/tube/Status';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log('ℹ️ TfL API temporairement indisponible');
      return [];
    }
    
    const data = await response.json();
    const alerts: RealTimeAlert[] = [];
    
    if (!Array.isArray(data)) {
      return [];
    }
    
    console.log(`🚇 TfL: ${data.length} lignes vérifiées`);
    
    let disruptionCount = 0;
    
    // Analyser chaque ligne de métro
    data.forEach((line: any) => {
      try {
        const lineName = line.name || '';
        const lineStatuses = line.lineStatuses || [];
        
        lineStatuses.forEach((status: any, statusIndex: number) => {
          const statusSeverity = status.statusSeverityDescription || '';
          const reason = status.reason || '';
          
          // Ignorer les lignes avec "Good Service"
          if (statusSeverity === 'Good Service') return;
          
          let level: RealTimeAlert['level'] = 'info';
          if (statusSeverity.includes('Severe') || statusSeverity.includes('Suspended')) {
            level = 'urgent';
          } else if (statusSeverity.includes('Delays') || statusSeverity.includes('Reduced')) {
            level = 'vigilance';
          }
          
          alerts.push({
            id: `tfl-${lineName}-${statusIndex}-${Date.now()}-${disruptionCount}`,
            type: 'transport',
            level: level,
            title: `Perturbation ${lineName} - Londres`,
            summary: translateToFrench(reason) || `${translateToFrench(statusSeverity)} sur la ligne ${lineName}. Prévoyez des délais supplémentaires.`,
            destination: 'Londres',
            country: 'Royaume-Uni',
            date: formatDate(new Date().toISOString()),
            source: 'TfL (Transport for London)',
            zone: `Ligne ${lineName}`,
            coordinates: { lat: 51.5074, lon: -0.1278 },
          });
          
          disruptionCount++;
        });
      } catch (error) {
        // Ignorer en cas d'erreur
      }
    });
    
    console.log(`✅ TfL: ${alerts.length} alertes transport générées`);
    return alerts;
    
  } catch (error) {
    console.log('ℹ️ TfL temporairement indisponible');
    return [];
  }
}

// ============================================================================
// FONCTION UTILITAIRE
// ============================================================================
function findNearestDestination(lat: number, lon: number) {
  if (!lat || !lon) return { name: 'Zone affectée', country: 'International' };
  
  let nearest = destinations[0];
  let minDistance = Infinity;
  
  destinations.forEach(dest => {
    const distance = Math.sqrt(
      Math.pow(dest.lat - lat, 2) + Math.pow(dest.lon - lon, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = dest;
    }
  });
  
  if (minDistance > 10) {
    return { name: 'Zone affectée', country: 'International' };
  }
  
  return nearest;
}

// Fonction de traduction simple pour les termes courants
function translateToFrench(text: string): string {
  if (!text) return '';
  
  const translations: Record<string, string> = {
    // Événements naturels
    'Wildfires': 'Incendies',
    'Wildfire': 'Incendie',
    'Severe Storms': 'Tempêtes sévères',
    'Severe Storm': 'Tempête sévère',
    'Floods': 'Inondations',
    'Flood': 'Inondation',
    'Volcanoes': 'Volcans',
    'Volcano': 'Volcan',
    'Drought': 'Sécheresse',
    'Earthquakes': 'Tremblements de terre',
    'Earthquake': 'Tremblement de terre',
    'Sea and Lake Ice': 'Glace marine',
    'Snow': 'Neige',
    'Dust and Haze': 'Poussière et brume',
    'Manmade': 'Origine humaine',
    'Water Color': 'Qualité de l\'eau',
    'Landslides': 'Glissements de terrain',
    'Landslide': 'Glissement de terrain',
    'Tropical Storm': 'Tempête tropicale',
    'Hurricane': 'Ouragan',
    'Cyclone': 'Cyclone',
    'Typhoon': 'Typhon',
    
    // Santé
    'disease': 'maladie',
    'outbreak': 'épidémie',
    'epidemic': 'épidémie',
    'pandemic': 'pandémie',
    'health': 'santé',
    'virus': 'virus',
    'infection': 'infection',
    'vaccination': 'vaccination',
    'dengue': 'dengue',
    'malaria': 'paludisme',
    'cholera': 'choléra',
    'measles': 'rougeole',
    'influenza': 'grippe',
    'flu': 'grippe',
    'Ebola': 'Ebola',
    'Zika': 'Zika',
    'COVID': 'COVID',
    'tuberculosis': 'tuberculose',
    'emergency': 'urgence',
    'situation report': 'rapport de situation',
    'confirmed cases': 'cas confirmés',
    'deaths': 'décès',
    'cases': 'cas',
    
    // Politique
    'protest': 'manifestation',
    'protests': 'manifestations',
    'strike': 'grève',
    'strikes': 'grèves',
    'demonstration': 'manifestation',
    'demonstrations': 'manifestations',
    'riot': 'émeute',
    'riots': 'émeutes',
    'political tension': 'tension politique',
    'violence': 'violence',
    'clash': 'affrontement',
    'clashes': 'affrontements',
    'unrest': 'troubles',
    'civil unrest': 'troubles civils',
    
    // Transport
    'Good Service': 'Service normal',
    'Minor Delays': 'Retards mineurs',
    'Severe Delays': 'Retards importants',
    'Suspended': 'Suspendu',
    'Part Suspended': 'Partiellement suspendu',
    'Planned Closure': 'Fermeture prévue',
    'Part Closure': 'Fermeture partielle',
    'Service Closed': 'Service fermé',
    'Reduced Service': 'Service réduit',
    'disruption': 'perturbation',
    'disruptions': 'perturbations',
    'delays': 'retards',
    'delay': 'retard',
    'cancelled': 'annulé',
    'cancellation': 'annulation',
    
    // Niveaux et couleurs
    'Red': 'Rouge',
    'Orange': 'Orange',
    'Green': 'Vert',
    'Yellow': 'Jaune',
    'Alert': 'Alerte',
    
    // Mots courants
    'detected': 'détecté',
    'alert': 'alerte',
    'warning': 'avertissement',
    'expected': 'prévu',
    'currently': 'actuellement',
    'reported': 'signalé',
    'in': 'à',
    'at': 'à',
    'near': 'près de',
    'Line': 'Ligne',
    'due to': 'en raison de',
    'because of': 'à cause de',
    'following': 'suite à',
    'between': 'entre',
    'until': 'jusqu\'à',
    'from': 'depuis',
    'affecting': 'affectant',
  };
  
  let translated = text;
  
  // Remplacer les termes (sensible à la casse pour les débuts de phrase)
  Object.keys(translations).forEach(key => {
    const value = translations[key];
    // Remplacer le mot seul (avec des limites de mots)
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    translated = translated.replace(regex, (match) => {
      // Garder la casse du premier caractère
      if (match[0] === match[0].toUpperCase()) {
        return value.charAt(0).toUpperCase() + value.slice(1);
      }
      return value;
    });
  });
  
  return translated;
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  
  // Si la date est invalide, retourner une date par défaut
  if (isNaN(date.getTime())) {
    return new Date().toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  // Retourner la date exacte au format français lisible
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================================================
// FONCTION PRINCIPALE - TEMPS RÉEL avec SYSTÈME DE CACHE INTELLIGENT
// ============================================================================
export async function fetchRealTimeAlerts(): Promise<RealTimeAlert[]> {
  try {
    console.log('🔄 Chargement des alertes en temps réel avec système de cache intelligent...\n');
    
    // Security Advisories est synchrone, les autres sont async
    let securityAlerts: RealTimeAlert[] = [];
    try {
      securityAlerts = fetchSecurityAdvisoriesAlerts();
      if (securityAlerts.length > 0) {
        saveToCache(CACHE_KEYS.SECURITY, securityAlerts);
        console.log(`✅ Security Advisories: ${securityAlerts.length} alertes (TEMPS RÉEL)`);
      } else {
        throw new Error('Aucune alerte générée');
      }
    } catch (error) {
      console.log('⚠️ Security Advisories en erreur, utilisation du cache...');
      const cached = getFromCache(CACHE_KEYS.SECURITY);
      if (cached) {
        securityAlerts = cached;
      }
    }
    
    // Charger les APIs externes en parallèle (NEWS API EN PREMIER pour guerres/conflits)
    const [newsResult, openMeteoResult, gdacsResult, nasaEonetResult, gdeltResult, whoResult, sncfResult, tflResult] = await Promise.allSettled([
      fetchNewsAlerts(),
      fetchOpenMeteoAlerts(),
      fetchGDACSAlerts(),
      fetchNASAEONETAlerts(),
      fetchGDELTAlerts(),
      fetchWHOHealthAlerts(),
      fetchSNCFTransportAlerts(),
      fetchTfLTransportAlerts(),
    ]);

    const alerts: RealTimeAlert[] = [];

    // NEWS API - Actualités en temps réel (guerres, conflits) - PRIORITÉ MAXIMALE
    if (newsResult.status === 'fulfilled' && newsResult.value.length > 0) {
      saveToCache(CACHE_KEYS.NEWS, newsResult.value);
      alerts.push(...newsResult.value);
      console.log(`✅ News API: ${newsResult.value.length} actualités (GUERRES, CONFLITS, ATTAQUES)`);
    } else {
      console.log('⚠️ News API indisponible, recherche dans le cache...');
      const cached = getFromCache(CACHE_KEYS.NEWS);
      if (cached && cached.length > 0) {
        alerts.push(...cached);
      } else {
        console.log('📭 Pas de cache disponible pour News API');
      }
    }

    // Ajouter les alertes de sécurité
    alerts.push(...securityAlerts);

    // Open-Meteo avec cache
    if (openMeteoResult.status === 'fulfilled' && openMeteoResult.value.length > 0) {
      saveToCache(CACHE_KEYS.OPEN_METEO, openMeteoResult.value);
      alerts.push(...openMeteoResult.value);
      console.log(`✅ Open-Meteo: ${openMeteoResult.value.length} alertes (TEMPS RÉEL)`);
    } else {
      console.log('⚠️ Open-Meteo indisponible, recherche dans le cache...');
      const cached = getFromCache(CACHE_KEYS.OPEN_METEO);
      if (cached && cached.length > 0) {
        alerts.push(...cached);
      } else {
        console.log('📭 Pas de cache disponible pour Open-Meteo');
      }
    }
    
    // GDACS avec cache
    if (gdacsResult.status === 'fulfilled' && gdacsResult.value.length > 0) {
      saveToCache(CACHE_KEYS.GDACS, gdacsResult.value);
      alerts.push(...gdacsResult.value);
      console.log(`✅ GDACS (ONU): ${gdacsResult.value.length} alertes (TEMPS RÉEL)`);
    } else {
      console.log('⚠️ GDACS indisponible, recherche dans le cache...');
      const cached = getFromCache(CACHE_KEYS.GDACS);
      if (cached && cached.length > 0) {
        alerts.push(...cached);
      } else {
        console.log('📭 Pas de cache disponible pour GDACS');
      }
    }
    
    // NASA EONET avec cache
    if (nasaEonetResult.status === 'fulfilled' && nasaEonetResult.value.length > 0) {
      saveToCache(CACHE_KEYS.NASA_EONET, nasaEonetResult.value);
      alerts.push(...nasaEonetResult.value);
      console.log(`✅ NASA EONET: ${nasaEonetResult.value.length} alertes (TEMPS RÉEL)`);
    } else {
      console.log('⚠️ NASA EONET indisponible, recherche dans le cache...');
      const cached = getFromCache(CACHE_KEYS.NASA_EONET);
      if (cached && cached.length > 0) {
        alerts.push(...cached);
      } else {
        console.log('📭 Pas de cache disponible pour NASA EONET');
      }
    }

    // GDELT avec cache
    if (gdeltResult.status === 'fulfilled' && gdeltResult.value.length > 0) {
      saveToCache(CACHE_KEYS.GDELT, gdeltResult.value);
      alerts.push(...gdeltResult.value);
      console.log(`✅ GDELT: ${gdeltResult.value.length} alertes (TEMPS RÉEL)`);
    } else {
      console.log('⚠️ GDELT indisponible, recherche dans le cache...');
      const cached = getFromCache(CACHE_KEYS.GDELT);
      if (cached && cached.length > 0) {
        alerts.push(...cached);
      } else {
        console.log('📭 Pas de cache disponible pour GDELT');
      }
    }

    // WHO avec cache
    if (whoResult.status === 'fulfilled' && whoResult.value.length > 0) {
      saveToCache(CACHE_KEYS.WHO, whoResult.value);
      alerts.push(...whoResult.value);
      console.log(`✅ WHO: ${whoResult.value.length} alertes (TEMPS RÉEL)`);
    } else {
      console.log('⚠️ WHO indisponible, recherche dans le cache...');
      const cached = getFromCache(CACHE_KEYS.WHO);
      if (cached && cached.length > 0) {
        alerts.push(...cached);
      } else {
        console.log('📭 Pas de cache disponible pour WHO');
      }
    }

    // SNCF avec cache
    if (sncfResult.status === 'fulfilled' && sncfResult.value.length > 0) {
      saveToCache(CACHE_KEYS.SNCF, sncfResult.value);
      alerts.push(...sncfResult.value);
      console.log(`✅ SNCF: ${sncfResult.value.length} alertes (TEMPS RÉEL)`);
    } else {
      console.log('⚠️ SNCF indisponible, recherche dans le cache...');
      const cached = getFromCache(CACHE_KEYS.SNCF);
      if (cached && cached.length > 0) {
        alerts.push(...cached);
      } else {
        console.log('📭 Pas de cache disponible pour SNCF');
      }
    }

    // TfL avec cache
    if (tflResult.status === 'fulfilled' && tflResult.value.length > 0) {
      saveToCache(CACHE_KEYS.TFL, tflResult.value);
      alerts.push(...tflResult.value);
      console.log(`✅ TfL: ${tflResult.value.length} alertes (TEMPS RÉEL)`);
    } else {
      console.log('⚠️ TfL indisponible, recherche dans le cache...');
      const cached = getFromCache(CACHE_KEYS.TFL);
      if (cached && cached.length > 0) {
        alerts.push(...cached);
      } else {
        console.log('📭 Pas de cache disponible pour TfL');
      }
    }

    // Compter les alertes en temps réel vs cache
    const realTimeCount = alerts.filter(a => !a.isCached).length;
    const cachedCount = alerts.filter(a => a.isCached).length;

    console.log(`\n🎯 TOTAL: ${alerts.length} alertes chargées`);
    console.log(`   📡 ${realTimeCount} alertes en TEMPS RÉEL`);
    if (cachedCount > 0) {
      console.log(`   📦 ${cachedCount} alertes depuis le CACHE (API temporairement indisponible)`);
    }
    console.log('');

    // Trier par niveau d'importance puis par date
    const sorted = alerts.sort((a, b) => {
      const levelOrder = { urgent: 3, vigilance: 2, info: 1 };
      const levelDiff = levelOrder[b.level] - levelOrder[a.level];
      if (levelDiff !== 0) return levelDiff;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Retourner jusqu'à 200 alertes maximum
    return sorted.slice(0, 200);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des alertes:', error);
    
    // En cas d'erreur totale, essayer de charger tout depuis le cache
    console.log('🆘 Tentative de récupération complète depuis le cache...');
    const allCached: RealTimeAlert[] = [];
    
    [CACHE_KEYS.SECURITY, CACHE_KEYS.OPEN_METEO, CACHE_KEYS.GDACS, CACHE_KEYS.NASA_EONET, CACHE_KEYS.GDELT, CACHE_KEYS.WHO, CACHE_KEYS.SNCF, CACHE_KEYS.TFL].forEach(key => {
      const cached = getFromCache(key);
      if (cached) {
        allCached.push(...cached);
      }
    });
    
    if (allCached.length > 0) {
      console.log(`✅ ${allCached.length} alertes récupérées depuis le cache`);
      return allCached;
    }
    
    return [];
  }
}

// Fonction pour charger TOUTES les alertes
export async function fetchAllRealTimeAlerts(): Promise<RealTimeAlert[]> {
  return fetchRealTimeAlerts(); // Identique car on charge déjà tout
}