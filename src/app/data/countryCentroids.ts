/**
 * Coordonnées des centroïdes (capitale ou centre géographique approx.) pour
 * tous les pays couverts par le dataset Lokascore. Utilisé pour placer les
 * marqueurs sur la carte mondiale des alertes.
 *
 * Source : Wikipédia (centroïde géographique ou capitale).
 */

export interface CountryCentroid {
  lat: number;
  lon: number;
  name: string;
}

export const COUNTRY_CENTROIDS: Record<string, CountryCentroid> = {
  // ─── Europe ───
  FR: { lat: 46.6, lon: 2.21, name: 'France' },
  GB: { lat: 55.3, lon: -3.43, name: 'United Kingdom' },
  DE: { lat: 51.16, lon: 10.45, name: 'Germany' },
  ES: { lat: 40.46, lon: -3.74, name: 'Spain' },
  IT: { lat: 41.87, lon: 12.56, name: 'Italy' },
  PT: { lat: 39.39, lon: -8.22, name: 'Portugal' },
  NL: { lat: 52.13, lon: 5.29, name: 'Netherlands' },
  BE: { lat: 50.5, lon: 4.46, name: 'Belgium' },
  CH: { lat: 46.82, lon: 8.23, name: 'Switzerland' },
  AT: { lat: 47.5, lon: 14.55, name: 'Austria' },
  IE: { lat: 53.41, lon: -8.24, name: 'Ireland' },
  SE: { lat: 60.13, lon: 18.64, name: 'Sweden' },
  NO: { lat: 60.47, lon: 8.47, name: 'Norway' },
  DK: { lat: 56.26, lon: 9.5, name: 'Denmark' },
  FI: { lat: 61.92, lon: 25.75, name: 'Finland' },
  IS: { lat: 64.96, lon: -19.02, name: 'Iceland' },
  PL: { lat: 51.92, lon: 19.13, name: 'Poland' },
  CZ: { lat: 49.81, lon: 15.47, name: 'Czech Republic' },
  GR: { lat: 39.07, lon: 21.82, name: 'Greece' },
  RU: { lat: 61.52, lon: 105.32, name: 'Russia' },
  TR: { lat: 38.96, lon: 35.24, name: 'Turkey' },
  HU: { lat: 47.16, lon: 19.5, name: 'Hungary' },
  RO: { lat: 45.94, lon: 24.97, name: 'Romania' },
  HR: { lat: 45.1, lon: 15.2, name: 'Croatia' },
  SI: { lat: 46.15, lon: 14.99, name: 'Slovenia' },
  SK: { lat: 48.67, lon: 19.7, name: 'Slovakia' },
  EE: { lat: 58.6, lon: 25.01, name: 'Estonia' },

  // ─── Amériques ───
  US: { lat: 37.09, lon: -95.71, name: 'United States' },
  CA: { lat: 56.13, lon: -106.35, name: 'Canada' },
  MX: { lat: 23.63, lon: -102.55, name: 'Mexico' },
  BR: { lat: -14.24, lon: -51.93, name: 'Brazil' },
  AR: { lat: -38.42, lon: -63.62, name: 'Argentina' },
  CL: { lat: -35.68, lon: -71.54, name: 'Chile' },
  CO: { lat: 4.57, lon: -74.3, name: 'Colombia' },
  PE: { lat: -9.19, lon: -75.02, name: 'Peru' },
  UY: { lat: -32.52, lon: -55.77, name: 'Uruguay' },

  // ─── Afrique & Moyen-Orient ───
  MA: { lat: 31.79, lon: -7.09, name: 'Morocco' },
  EG: { lat: 26.82, lon: 30.8, name: 'Egypt' },
  AE: { lat: 23.42, lon: 53.85, name: 'United Arab Emirates' },
  IL: { lat: 31.05, lon: 34.85, name: 'Israel' },
  ZA: { lat: -30.56, lon: 22.94, name: 'South Africa' },
  KE: { lat: -0.02, lon: 37.91, name: 'Kenya' },
  TN: { lat: 33.89, lon: 9.54, name: 'Tunisia' },
  JO: { lat: 30.59, lon: 36.24, name: 'Jordan' },
  SA: { lat: 23.89, lon: 45.08, name: 'Saudi Arabia' },
  QA: { lat: 25.35, lon: 51.18, name: 'Qatar' },
  NG: { lat: 9.08, lon: 8.68, name: 'Nigeria' },

  // ─── Asie ───
  JP: { lat: 36.2, lon: 138.25, name: 'Japan' },
  CN: { lat: 35.86, lon: 104.2, name: 'China' },
  HK: { lat: 22.32, lon: 114.17, name: 'Hong Kong' },
  KR: { lat: 35.91, lon: 127.77, name: 'South Korea' },
  TH: { lat: 15.87, lon: 100.99, name: 'Thailand' },
  SG: { lat: 1.35, lon: 103.82, name: 'Singapore' },
  MY: { lat: 4.21, lon: 101.98, name: 'Malaysia' },
  ID: { lat: -0.79, lon: 113.92, name: 'Indonesia' },
  IN: { lat: 20.59, lon: 78.96, name: 'India' },
  VN: { lat: 14.06, lon: 108.28, name: 'Vietnam' },
  PH: { lat: 12.88, lon: 121.77, name: 'Philippines' },
  TW: { lat: 23.7, lon: 120.96, name: 'Taiwan' },
  PK: { lat: 30.38, lon: 69.35, name: 'Pakistan' },
  BD: { lat: 23.68, lon: 90.36, name: 'Bangladesh' },
  NP: { lat: 28.39, lon: 84.12, name: 'Nepal' },
  PG: { lat: -6.31, lon: 143.95, name: 'Papua New Guinea' },

  // ─── Océanie ───
  AU: { lat: -25.27, lon: 133.78, name: 'Australia' },
  NZ: { lat: -40.9, lon: 174.89, name: 'New Zealand' },
};
