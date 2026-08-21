/**
 * Météo des destinations — Open-Meteo.
 *
 * Ce service renvoyait auparavant un jeu de données écrit en dur : la clé
 * OpenWeatherMap valait `YOUR_API_KEY_HERE`, le bloc qui aurait fait le vrai
 * appel était en commentaire, et chaque fiche affichait donc une température
 * inventée sans le dire. Sur un produit qui met en avant des sources datées,
 * c'était intenable.
 *
 * Open-Meteo (open-meteo.com) est interrogé sans clé d'API, autorise l'usage
 * non commercial et commercial sous conditions, et publie ses sources : les
 * modèles nationaux (Météo-France, DWD, NOAA…). L'origine `api.open-meteo.com`
 * est déjà autorisée par la directive `connect-src` de `vercel.json`.
 *
 * Aucune valeur de repli : si l'appel échoue, la fonction renvoie `null` et
 * l'interface affiche une météo indisponible. Mieux vaut un trou assumé qu'un
 * chiffre inventé.
 */

import { destinationCoordinates } from '../data/destinationCoordinates';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  /** Libellé court et stable, utilisé pour choisir l'icône. */
  condition: WeatherCondition;
  /** Phrase lisible en français. */
  description: string;
  humidity: number;
  /** Vitesse du vent en km/h. */
  windSpeed: number;
  /** Heure locale de la destination, déjà formatée ("06:12"). */
  sunrise: string;
  sunset: string;
  /** Horodatage de l'observation, en heure locale de la destination. */
  observedAt: string;
  /** Source à citer dans l'interface. */
  source: string;
}

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

/**
 * Codes météo WMO 4677 tels que publiés par Open-Meteo.
 * https://open-meteo.com/en/docs — section « Weather variable documentation »
 */
const WMO_CODES: Record<number, { condition: WeatherCondition; description: string }> = {
  0: { condition: 'clear', description: 'Ciel dégagé' },
  1: { condition: 'clear', description: 'Globalement dégagé' },
  2: { condition: 'partly-cloudy', description: 'Partiellement nuageux' },
  3: { condition: 'cloudy', description: 'Couvert' },
  45: { condition: 'fog', description: 'Brouillard' },
  48: { condition: 'fog', description: 'Brouillard givrant' },
  51: { condition: 'drizzle', description: 'Bruine faible' },
  53: { condition: 'drizzle', description: 'Bruine' },
  55: { condition: 'drizzle', description: 'Bruine dense' },
  56: { condition: 'drizzle', description: 'Bruine verglaçante' },
  57: { condition: 'drizzle', description: 'Bruine verglaçante dense' },
  61: { condition: 'rain', description: 'Pluie faible' },
  63: { condition: 'rain', description: 'Pluie' },
  65: { condition: 'rain', description: 'Forte pluie' },
  66: { condition: 'rain', description: 'Pluie verglaçante' },
  67: { condition: 'rain', description: 'Pluie verglaçante forte' },
  71: { condition: 'snow', description: 'Neige faible' },
  73: { condition: 'snow', description: 'Neige' },
  75: { condition: 'snow', description: 'Fortes chutes de neige' },
  77: { condition: 'snow', description: 'Grains de neige' },
  80: { condition: 'rain', description: 'Averses faibles' },
  81: { condition: 'rain', description: 'Averses' },
  82: { condition: 'rain', description: 'Averses violentes' },
  85: { condition: 'snow', description: 'Averses de neige' },
  86: { condition: 'snow', description: 'Fortes averses de neige' },
  95: { condition: 'thunderstorm', description: 'Orage' },
  96: { condition: 'thunderstorm', description: 'Orage avec grêle' },
  99: { condition: 'thunderstorm', description: 'Orage avec forte grêle' },
};

export const WEATHER_SOURCE = 'Open-Meteo';

interface OpenMeteoResponse {
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
  };
}

/** "2026-08-21T06:12" → "06:12". Open-Meteo renvoie déjà l'heure locale. */
function localTime(isoLocal: string | undefined): string {
  if (!isoLocal) return '—';
  const time = isoLocal.split('T')[1];
  return time ? time.slice(0, 5) : '—';
}

/**
 * Météo courante d'une destination, ou `null` si elle est indisponible
 * (destination sans coordonnées connues, réseau coupé, service en erreur).
 */
export async function fetchWeatherData(destinationId: string): Promise<WeatherData | null> {
  const coords = destinationCoordinates[destinationId];
  if (!coords) {
    console.warn(`Météo : aucune coordonnée connue pour « ${destinationId} »`);
    return null;
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(coords.lat));
  url.searchParams.set('longitude', String(coords.lon));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code'
  );
  url.searchParams.set('daily', 'sunrise,sunset');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('forecast_days', '1');
  url.searchParams.set('wind_speed_unit', 'kmh');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    if (!response.ok) {
      console.warn(`Météo : Open-Meteo a répondu ${response.status}`);
      return null;
    }

    const data: OpenMeteoResponse = await response.json();
    const current = data.current;
    if (!current || typeof current.temperature_2m !== 'number') {
      console.warn('Météo : réponse Open-Meteo sans relevé courant');
      return null;
    }

    const wmo = WMO_CODES[current.weather_code ?? 0] ?? {
      condition: 'cloudy' as WeatherCondition,
      description: 'Conditions inconnues',
    };

    return {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature ?? current.temperature_2m),
      condition: wmo.condition,
      description: wmo.description,
      humidity: Math.round(current.relative_humidity_2m ?? 0),
      windSpeed: Math.round(current.wind_speed_10m ?? 0),
      sunrise: localTime(data.daily?.sunrise?.[0]),
      sunset: localTime(data.daily?.sunset?.[0]),
      observedAt: localTime(current.time),
      source: WEATHER_SOURCE,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Météo : délai dépassé côté Open-Meteo');
    } else {
      console.warn('Météo : Open-Meteo injoignable', error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Nom d'icône lucide-react correspondant à une condition. */
export function getWeatherIconName(condition: WeatherCondition): string {
  const icons: Record<WeatherCondition, string> = {
    clear: 'Sun',
    'partly-cloudy': 'CloudSun',
    cloudy: 'Cloud',
    fog: 'CloudFog',
    drizzle: 'CloudDrizzle',
    rain: 'CloudRain',
    snow: 'Snowflake',
    thunderstorm: 'CloudLightning',
  };
  return icons[condition];
}

/**
 * Dégradé de fond selon la température.
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
