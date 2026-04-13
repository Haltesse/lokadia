// Service de calcul de transport entre destinations
import type { TripStop, TripSegment } from './tripStopService';

export interface TransportOption {
  mode: 'train' | 'bus' | 'flight' | 'car' | 'ferry';
  duration: number; // minutes
  cost?: string;
  provider?: string;
  notes?: string;
  ranking: 'practical' | 'fast' | 'economic';
}

export interface TransportCalculation {
  distanceKm: number;
  recommendedMode: TripSegment['recommendedMode'];
  alternatives: TransportOption[];
  metadata?: TripSegment['metadata'];
}

/**
 * Calcule la distance entre deux points géographiques (formule Haversine)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Détermine le pays d'une destination depuis son ID
 */
function getCountryFromDestinationId(destinationId: string): string {
  // Format attendu: "tokyo-japan", "paris-france", etc.
  const parts = destinationId.split('-');
  return parts[parts.length - 1] || '';
}

/**
 * Vérifie si deux destinations sont dans le même pays
 */
function isSameCountry(destId1: string, destId2: string): boolean {
  return getCountryFromDestinationId(destId1) === getCountryFromDestinationId(destId2);
}

/**
 * Détermine si un pays a une excellente infrastructure ferroviaire
 */
function hasExcellentRailInfrastructure(country: string): boolean {
  const excellentRailCountries = ['japan', 'france', 'germany', 'switzerland', 'italy', 'spain', 'netherlands', 'belgium', 'austria', 'uk', 'southkorea'];
  return excellentRailCountries.includes(country.toLowerCase());
}

/**
 * Calcule les options de transport entre deux étapes
 */
export function calculateTransportOptions(
  fromStop: TripStop,
  toStop: TripStop,
  distanceKm: number
): TransportCalculation {
  const options: TransportOption[] = [];
  const country = getCountryFromDestinationId(fromStop.destinationId);
  const sameCountry = isSameCountry(fromStop.destinationId, toStop.destinationId);
  const hasGoodRail = hasExcellentRailInfrastructure(country);

  // === TRAIN ===
  if (sameCountry && distanceKm < 800) {
    const trainSpeed = hasGoodRail ? 180 : 100; // km/h (TGV/Shinkansen vs train classique)
    const penalty = 30; // minutes pour correspondances/gare
    const duration = Math.round((distanceKm / trainSpeed) * 60 + penalty);
    
    options.push({
      mode: 'train',
      duration,
      cost: distanceKm < 100 ? '€10-30' : distanceKm < 300 ? '€30-80' : '€80-150',
      ranking: hasGoodRail ? 'practical' : 'economic',
      notes: hasGoodRail ? 'Infrastructure ferroviaire excellente' : 'Train régional disponible',
    });
  }

  // === BUS ===
  if (distanceKm < 500) {
    const busSpeed = 60; // km/h moyenne
    const duration = Math.round((distanceKm / busSpeed) * 60 + 20);
    
    options.push({
      mode: 'bus',
      duration,
      cost: distanceKm < 100 ? '€5-15' : distanceKm < 300 ? '€15-40' : '€40-70',
      ranking: 'economic',
      notes: 'Option la plus économique',
    });
  }

  // === VOITURE ===
  if (distanceKm < 600) {
    const carSpeed = 90; // km/h moyenne
    const duration = Math.round((distanceKm / carSpeed) * 60);
    
    options.push({
      mode: 'car',
      duration,
      cost: `€${Math.round(distanceKm * 0.15)}-${Math.round(distanceKm * 0.30)}`,
      notes: 'Location + essence + péages',
      ranking: distanceKm < 200 ? 'practical' : 'fast',
    });
  }

  // === AVION ===
  if (distanceKm > 250) {
    const flightSpeed = 700; // km/h
    const flightTime = Math.round((distanceKm / flightSpeed) * 60);
    const airportTime = 180; // 3h pour check-in + transferts
    const duration = flightTime + airportTime;
    
    options.push({
      mode: 'flight',
      duration,
      cost: distanceKm < 500 ? '€50-150' : distanceKm < 1500 ? '€100-300' : '€200-600',
      ranking: distanceKm > 800 ? 'fast' : 'practical',
      notes: distanceKm > 800 ? 'Plus rapide pour longues distances' : 'Considérer temps aéroport',
    });
  }

  // === FERRY (si applicable) ===
  // Détecter les routes maritimes connues
  const maritimeRoutes = [
    { from: 'dover', to: 'calais' },
    { from: 'barcelona', to: 'mallorca' },
    { from: 'athens', to: 'santorini' },
  ];
  
  const fromCity = fromStop.destinationId.split('-')[0];
  const toCity = toStop.destinationId.split('-')[0];
  const hasFerrRoute = maritimeRoutes.some(
    route => (route.from === fromCity && route.to === toCity) || 
             (route.to === fromCity && route.from === toCity)
  );

  if (hasFerrRoute) {
    options.push({
      mode: 'ferry',
      duration: 120, // Variable selon route
      cost: '€40-100',
      ranking: 'practical',
      notes: 'Traversée maritime',
    });
  }

  // Déterminer le mode recommandé
  let recommendedMode: TripSegment['recommendedMode'] = 'train';
  
  if (distanceKm > 800) {
    recommendedMode = 'flight';
  } else if (hasGoodRail && distanceKm > 100 && distanceKm < 800) {
    recommendedMode = 'train';
  } else if (distanceKm < 100) {
    recommendedMode = 'car';
  } else if (!hasGoodRail && distanceKm < 400) {
    recommendedMode = 'bus';
  }

  // Générer métadonnées spécifiques
  const metadata: TripSegment['metadata'] = {};
  
  if (hasGoodRail && recommendedMode === 'train') {
    if (country === 'japan') {
      metadata.passRecommended = 'JR Pass (7/14/21 jours)';
      metadata.tips = ['Réservez vos sièges à l\'avance', 'Le Shinkansen nécessite un supplément'];
    } else if (country === 'france' || country === 'germany' || country === 'italy') {
      metadata.passRecommended = 'Interrail / Eurail Pass';
      metadata.tips = ['Réservations obligatoires pour TGV/ICE', 'Réservez 1-2 semaines à l\'avance'];
    }
  }

  if (recommendedMode === 'flight') {
    metadata.bookingAdvice = 'Réserver 2-3 mois à l\'avance pour meilleurs prix';
    metadata.luggageNotes = 'Vérifier franchise bagages';
  }

  if (distanceKm > 400) {
    metadata.tips = metadata.tips || [];
    metadata.tips.push('Prévoir rafraîchissements pour le trajet');
  }

  return {
    distanceKm: Math.round(distanceKm),
    recommendedMode,
    alternatives: options.sort((a, b) => {
      // Priorité: practical > fast > economic
      const rankOrder = { practical: 0, fast: 1, economic: 2 };
      return rankOrder[a.ranking] - rankOrder[b.ranking];
    }),
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
  };
}

/**
 * Crée un segment de trajet entre deux étapes
 */
export function createTripSegment(
  tripId: string,
  fromStop: TripStop,
  toStop: TripStop
): Omit<TripSegment, 'id' | 'createdAt' | 'updatedAt'> {
  // Calculer la distance
  const fromLat = fromStop.latitude || 0;
  const fromLon = fromStop.longitude || 0;
  const toLat = toStop.latitude || 0;
  const toLon = toStop.longitude || 0;

  let distanceKm = 0;
  if (fromLat && fromLon && toLat && toLon) {
    distanceKm = calculateDistance(fromLat, fromLon, toLat, toLon);
  } else {
    // Fallback: estimation basée sur les noms si pas de coordonnées
    distanceKm = 200; // Distance par défaut
  }

  const transportCalc = calculateTransportOptions(fromStop, toStop, distanceKm);

  return {
    tripId,
    fromStopId: fromStop.id,
    toStopId: toStop.id,
    distanceKm: transportCalc.distanceKm,
    recommendedMode: transportCalc.recommendedMode,
    alternatives: transportCalc.alternatives,
    durationMinEstimated: transportCalc.alternatives.find(
      alt => alt.mode === transportCalc.recommendedMode
    )?.duration || 180,
    metadata: transportCalc.metadata,
    source: 'internal',
  };
}

/**
 * Estime la durée totale d'un itinéraire
 */
export function estimateTotalDuration(segments: TripSegment[]): number {
  return segments.reduce((total, segment) => total + segment.durationMinEstimated, 0);
}

/**
 * Formate une durée en heures et minutes
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

/**
 * Obtient l'emoji pour un mode de transport
 */
export function getTransportEmoji(mode: TripSegment['recommendedMode']): string {
  const emojis = {
    train: 'Train',
    bus: 'Bus',
    flight: 'Flight',
    car: 'Car',
    ferry: 'Ferry',
  };
  return emojis[mode] || 'Car';
}