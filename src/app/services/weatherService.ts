// Service météo utilisant l'API OpenWeatherMap
// Pour utiliser en production : 
// 1. Créez un compte gratuit sur https://openweathermap.org/api
// 2. Obtenez votre clé API
// 3. Remplacez 'YOUR_API_KEY_HERE' par votre vraie clé API

const OPENWEATHER_API_KEY = 'YOUR_API_KEY_HERE';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  sunrise: number;
  sunset: number;
}

// Données météo mock pour démonstration
const mockWeatherData: { [key: string]: WeatherData } = {
  'Paris': {
    temperature: 12,
    feelsLike: 10,
    condition: 'Clouds',
    description: 'Nuageux',
    humidity: 75,
    windSpeed: 15,
    icon: '04d',
    sunrise: 1740468000,
    sunset: 1740501600
  },
  'Tokyo': {
    temperature: 8,
    feelsLike: 6,
    condition: 'Clear',
    description: 'Dégagé',
    humidity: 45,
    windSpeed: 10,
    icon: '01d',
    sunrise: 1740422400,
    sunset: 1740459600
  },
  'New York': {
    temperature: 5,
    feelsLike: 2,
    condition: 'Snow',
    description: 'Neige légère',
    humidity: 85,
    windSpeed: 20,
    icon: '13d',
    sunrise: 1740481200,
    sunset: 1740517200
  },
  'Bangkok': {
    temperature: 32,
    feelsLike: 36,
    condition: 'Clear',
    description: 'Ensoleillé',
    humidity: 70,
    windSpeed: 8,
    icon: '01d',
    sunrise: 1740441600,
    sunset: 1740484800
  },
  'Londres': {
    temperature: 9,
    feelsLike: 7,
    condition: 'Rain',
    description: 'Pluie légère',
    humidity: 90,
    windSpeed: 18,
    icon: '10d',
    sunrise: 1740472800,
    sunset: 1740506400
  },
  'Dubai': {
    temperature: 25,
    feelsLike: 24,
    condition: 'Clear',
    description: 'Ensoleillé',
    humidity: 50,
    windSpeed: 12,
    icon: '01d',
    sunrise: 1740448800,
    sunset: 1740488400
  },
  'Sydney': {
    temperature: 28,
    feelsLike: 30,
    condition: 'Clear',
    description: 'Dégagé',
    humidity: 60,
    windSpeed: 15,
    icon: '01d',
    sunrise: 1740394800,
    sunset: 1740444000
  },
  'Rome': {
    temperature: 14,
    feelsLike: 13,
    condition: 'Clouds',
    description: 'Partiellement nuageux',
    humidity: 65,
    windSpeed: 10,
    icon: '03d',
    sunrise: 1740466800,
    sunset: 1740504000
  },
  'Barcelone': {
    temperature: 16,
    feelsLike: 15,
    condition: 'Clear',
    description: 'Ensoleillé',
    humidity: 55,
    windSpeed: 12,
    icon: '01d',
    sunrise: 1740469200,
    sunset: 1740507600
  },
  'Berlin': {
    temperature: 6,
    feelsLike: 3,
    condition: 'Clouds',
    description: 'Couvert',
    humidity: 80,
    windSpeed: 16,
    icon: '04d',
    sunrise: 1740466800,
    sunset: 1740500400
  },
  'Amsterdam': {
    temperature: 8,
    feelsLike: 5,
    condition: 'Rain',
    description: 'Bruine',
    humidity: 88,
    windSpeed: 20,
    icon: '09d',
    sunrise: 1740470400,
    sunset: 1740504000
  },
  'Lisbonne': {
    temperature: 17,
    feelsLike: 16,
    condition: 'Clear',
    description: 'Ensoleillé',
    humidity: 60,
    windSpeed: 14,
    icon: '01d',
    sunrise: 1740472800,
    sunset: 1740511200
  },
  'Prague': {
    temperature: 4,
    feelsLike: 1,
    condition: 'Snow',
    description: 'Neige',
    humidity: 85,
    windSpeed: 12,
    icon: '13d',
    sunrise: 1740465600,
    sunset: 1740499200
  },
  'Istanbul': {
    temperature: 11,
    feelsLike: 9,
    condition: 'Rain',
    description: 'Pluie',
    humidity: 75,
    windSpeed: 18,
    icon: '10d',
    sunrise: 1740456000,
    sunset: 1740493200
  },
  'Marrakech': {
    temperature: 20,
    feelsLike: 19,
    condition: 'Clear',
    description: 'Ensoleillé',
    humidity: 40,
    windSpeed: 8,
    icon: '01d',
    sunrise: 1740474000,
    sunset: 1740513600
  },
  'Bali': {
    temperature: 30,
    feelsLike: 34,
    condition: 'Rain',
    description: 'Averses tropicales',
    humidity: 80,
    windSpeed: 10,
    icon: '10d',
    sunrise: 1740441600,
    sunset: 1740484800
  },
  'Reykjavik': {
    temperature: -2,
    feelsLike: -6,
    condition: 'Snow',
    description: 'Neige',
    humidity: 90,
    windSpeed: 25,
    icon: '13d',
    sunrise: 1740488400,
    sunset: 1740513600
  },
  'Mexico': {
    temperature: 22,
    feelsLike: 21,
    condition: 'Clear',
    description: 'Ensoleillé',
    humidity: 45,
    windSpeed: 10,
    icon: '01d',
    sunrise: 1740488400,
    sunset: 1740531600
  },
  'Le Caire': {
    temperature: 18,
    feelsLike: 17,
    condition: 'Clear',
    description: 'Dégagé',
    humidity: 35,
    windSpeed: 15,
    icon: '01d',
    sunrise: 1740454800,
    sunset: 1740492000
  },
  'Buenos Aires': {
    temperature: 27,
    feelsLike: 29,
    condition: 'Clear',
    description: 'Ensoleillé',
    humidity: 65,
    windSpeed: 12,
    icon: '01d',
    sunrise: 1740373200,
    sunset: 1740426000
  },
  'Copenhague': {
    temperature: 5,
    feelsLike: 2,
    condition: 'Clouds',
    description: 'Nuageux',
    humidity: 82,
    windSpeed: 18,
    icon: '04d',
    sunrise: 1740474000,
    sunset: 1740502800
  },
  'Mexico City': {
    temperature: 22,
    feelsLike: 21,
    condition: 'Clear',
    description: 'Ensoleillé',
    humidity: 45,
    windSpeed: 10,
    icon: '01d',
    sunrise: 1740488400,
    sunset: 1740531600
  },
  'Zurich': {
    temperature: 7,
    feelsLike: 4,
    condition: 'Clouds',
    description: 'Nuageux',
    humidity: 70,
    windSpeed: 12,
    icon: '04d',
    sunrise: 1740466800,
    sunset: 1740503400
  },
  'Dublin': {
    temperature: 10,
    feelsLike: 8,
    condition: 'Rain',
    description: 'Pluie',
    humidity: 88,
    windSpeed: 22,
    icon: '10d',
    sunrise: 1740475200,
    sunset: 1740509400
  },
  'Séoul': {
    temperature: 3,
    feelsLike: -1,
    condition: 'Clear',
    description: 'Dégagé',
    humidity: 50,
    windSpeed: 14,
    icon: '01d',
    sunrise: 1740419400,
    sunset: 1740456600
  },
  'Singapour': {
    temperature: 31,
    feelsLike: 36,
    condition: 'Rain',
    description: 'Averses',
    humidity: 85,
    windSpeed: 8,
    icon: '10d',
    sunrise: 1740441600,
    sunset: 1740485400
  },
  'Athènes': {
    temperature: 15,
    feelsLike: 14,
    condition: 'Clear',
    description: 'Ensoleillé',
    humidity: 55,
    windSpeed: 12,
    icon: '01d',
    sunrise: 1740459600,
    sunset: 1740496800
  }
};

/**
 * Récupère les données météo pour une ville donnée
 * En mode production avec vraie clé API, cette fonction fera un vrai appel HTTP
 */
export async function fetchWeatherData(cityName: string): Promise<WeatherData | null> {
  try {
    // Mode MOCK - Retourne des données simulées
    if (OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
      // Simulation d'un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Retourne les données mock si disponibles
      return mockWeatherData[cityName] || mockWeatherData['Paris'];
    }

    // Mode PRODUCTION - Appel réel à l'API (décommentez quand vous avez une vraie clé)
    /*
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}?q=${encodeURIComponent(cityName)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données météo');
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Conversion m/s en km/h
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset
    };
    */

    return mockWeatherData[cityName] || mockWeatherData['Paris'];
  } catch (error) {
    console.error('Erreur météo:', error);
    return null;
  }
}

/**
 * Retourne l'icône emoji appropriée selon la condition météo
 */
export function getWeatherEmoji(condition: string): string {
  const emojiMap: { [key: string]: string } = {
    'Clear': 'Sun',
    'Clouds': 'Cloud',
    'Rain': 'CloudRain',
    'Drizzle': 'CloudDrizzle',
    'Thunderstorm': 'CloudLightning',
    'Snow': 'Snowflake',
    'Mist': 'CloudFog',
    'Fog': 'CloudFog',
    'Haze': 'CloudFog',
    'Dust': 'Wind',
    'Sand': 'Wind',
    'Ash': 'Mountain',
    'Squall': 'Wind',
    'Tornado': 'Wind'
  };

  return emojiMap[condition] || 'Sun';
}

/**
 * Retourne la couleur de fond appropriée selon la température
 */
export function getTemperatureColor(temp: number): string {
  if (temp >= 30) return 'from-red-500 to-orange-500';
  if (temp >= 25) return 'from-orange-400 to-yellow-400';
  if (temp >= 20) return 'from-yellow-400 to-green-400';
  if (temp >= 15) return 'from-green-400 to-teal-400';
  if (temp >= 10) return 'from-teal-400 to-blue-400';
  if (temp >= 5) return 'from-blue-400 to-indigo-400';
  if (temp >= 0) return 'from-indigo-400 to-blue-500';
  return 'from-blue-600 to-indigo-700';
}
