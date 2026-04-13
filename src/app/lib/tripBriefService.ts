// Service d'assemblage intelligent du contenu voyage
import type { Trip, TripStop } from './tripService';
import type { TripSegment } from './tripStopService';
import type { DestinationDetails } from '../data/types';
import { allDestinations } from '../data/allDestinations';
import { getTripStops, getTripSegments } from './tripStopService';
import { estimateTotalDuration, formatDuration, getTransportEmoji } from './transportService';

export interface ActionCard {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'document' | 'health' | 'booking' | 'download' | 'alert' | 'general';
  action?: string;
  link?: string;
  icon: string; // Nom de l'icône lucide-react
}

export interface PreparationSection {
  id: string;
  title: string;
  icon: string; // Nom de l'icône lucide-react
  summary: string[];
  canAddToChecklist: boolean;
  detailsLink?: string;
}

export interface OnLocationInfo {
  cityName: string;
  emergencyNumbers: Array<{ name: string; number: string; icon: string }>;
  safetyTips: string[];
  commonScams: Array<{ title: string; desc: string }>;
  dangerousAreas: string[];
  localTransport: string;
}

export interface TripDashboard {
  trip: Trip;
  stops: TripStop[];
  segments: TripSegment[];
  priorityActions: ActionCard[];
  alerts: Array<{ type: string; title: string; message: string }>;
  checklistProgress: { completed: number; total: number };
  transportSummary: {
    totalStops: number;
    totalDuration: string;
    recommendedPass?: string;
  };
  destination: DestinationDetails | null;
}

/**
 * Récupère une destination par ID
 */
function getDestination(destinationId: string): DestinationDetails | null {
  return allDestinations[destinationId] || null;
}

/**
 * Calcule le nombre de jours avant le départ
 */
function getDaysUntilDeparture(startDate: string): number {
  const now = new Date();
  const departure = new Date(startDate);
  const diff = departure.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Génère les actions prioritaires
 */
function generatePriorityActions(
  trip: Trip,
  destination: DestinationDetails | null,
  daysUntil: number
): ActionCard[] {
  const actions: ActionCard[] = [];

  // Vérifier passeport/visa
  if (destination?.visaRequired || destination?.visaInfo) {
    const visaPriority = daysUntil < 30 ? 'high' : 'medium';
    actions.push({
      id: 'visa-check',
      title: 'Vérifier visa et passeport',
      description: destination.visaInfo?.type || 'Vérifiez les conditions d\'entrée',
      priority: visaPriority,
      category: 'document',
      icon: 'FileCheck',
    });
  }

  // Vaccins
  if (destination?.healthRequirements && destination.healthRequirements.length > 0) {
    const hasRequired = destination.healthRequirements.some(v => v.required);
    actions.push({
      id: 'vaccines',
      title: hasRequired ? 'Vaccins obligatoires' : 'Vérifier vaccins recommandés',
      description: `${destination.healthRequirements.length} vaccin(s) à vérifier`,
      priority: hasRequired ? 'high' : 'medium',
      category: 'health',
      icon: 'Syringe',
    });
  }

  // Alertes sécurité
  if (destination?.alerts && destination.alerts.length > 0) {
    const hasDanger = destination.alerts.some(a => a.type === 'danger');
    actions.push({
      id: 'security-alerts',
      title: 'Consulter alertes sécurité',
      description: `${destination.alerts.length} alerte(s) active(s)`,
      priority: hasDanger ? 'high' : 'medium',
      category: 'alert',
      icon: 'AlertTriangle',
    });
  }

  // Assurance voyage
  if (daysUntil > 0 && daysUntil < 60) {
    actions.push({
      id: 'insurance',
      title: 'Souscrire assurance voyage',
      description: 'Protection santé, annulation, bagages',
      priority: daysUntil < 14 ? 'high' : 'medium',
      category: 'booking',
      icon: 'Shield',
    });
  }

  // eSIM / Télécom
  if (daysUntil < 30 && daysUntil > 0) {
    actions.push({
      id: 'esim',
      title: 'Activer eSIM ou forfait international',
      description: 'Restez connecté sur place',
      priority: 'medium',
      category: 'general',
      icon: 'Smartphone',
    });
  }

  // Télécharger données offline (si Premium)
  if (daysUntil < 7 && daysUntil > 0) {
    actions.push({
      id: 'offline-download',
      title: 'Télécharger données offline',
      description: 'Accédez aux infos sans connexion',
      priority: 'low',
      category: 'download',
      icon: 'Download',
    });
  }

  // Réserver transports
  if (daysUntil < 45 && daysUntil > 7) {
    actions.push({
      id: 'book-transport',
      title: 'Réserver vos transports',
      description: 'Trains, bus, vols intérieurs',
      priority: 'medium',
      category: 'booking',
      icon: 'Ticket',
    });
  }

  return actions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }).slice(0, 5); // Max 5 actions
}

/**
 * Génère les sections de préparation
 */
export function generatePreparationSections(
  trip: Trip,
  destination: DestinationDetails | null
): PreparationSection[] {
  if (!destination) return [];

  const sections: PreparationSection[] = [];

  // Entrée / Visa / Passeport
  sections.push({
    id: 'entry-visa',
    title: 'Entrée, Visa & Passeport',
    icon: 'ShieldCheck',
    summary: [
      destination.visaDetails || 'Aucun visa requis',
      destination.entryDocuments || 'Documents à vérifier',
    ],
    canAddToChecklist: true,
  });

  // Santé
  if (destination.healthRequirements && destination.healthRequirements.length > 0) {
    sections.push({
      id: 'health',
      title: 'Santé & Vaccins',
      icon: 'Pill',
      summary: destination.healthRequirements.map(v => 
        `${v.vaccine} - ${v.required ? 'Obligatoire' : 'Recommandé'}`
      ),
      canAddToChecklist: true,
    });
  }

  // Assurance
  sections.push({
    id: 'insurance',
    title: 'Assurance Voyage',
    icon: 'Shield',
    summary: [
      'Assurance santé internationale recommandée',
      'Couverture annulation et bagages',
      destination.healthSystem || '',
    ],
    canAddToChecklist: true,
  });

  // Argent
  sections.push({
    id: 'money',
    title: 'Argent & Paiements',
    icon: 'Wallet',
    summary: [
      `Devise locale: ${destination.currency}`,
      'Prévoir carte bancaire internationale',
      'Vérifier frais bancaires à l\'étranger',
    ],
    canAddToChecklist: true,
  });

  // Télécom
  sections.push({
    id: 'telecom',
    title: 'Télécommunications',
    icon: 'Smartphone',
    summary: [
      'eSIM recommandée pour données mobiles',
      'Vérifier couverture de votre opérateur',
      'Applications offline utiles',
    ],
    canAddToChecklist: true,
  });

  // Sécurité
  if (destination.securitySummary) {
    sections.push({
      id: 'security',
      title: 'Sécurité',
      icon: 'Lock',
      summary: [destination.securitySummary],
      canAddToChecklist: false,
      detailsLink: `/destination/${destination.id}`,
    });
  }

  // Culture
  if (destination.localCustoms && destination.localCustoms.length > 0) {
    sections.push({
      id: 'culture',
      title: 'Culture & Usages Locaux',
      icon: 'Heart',
      summary: destination.localCustoms.slice(0, 3),
      canAddToChecklist: false,
    });
  }

  return sections;
}

/**
 * Génère les informations pour "Pendant le voyage"
 */
export function generateOnLocationInfo(
  activeStopId: string | null,
  stops: TripStop[]
): OnLocationInfo | null {
  const activeStop = stops.find(s => activeStopId ? s.id === activeStopId : false) || stops[0];
  if (!activeStop) return null;

  const destination = getDestination(activeStop.destinationId);
  if (!destination) return null;

  return {
    cityName: destination.name,
    emergencyNumbers: destination.emergencyNumbers || [],
    safetyTips: destination.safetyTips || [],
    commonScams: destination.commonScams || [],
    dangerousAreas: destination.dangerousAreas || [],
    localTransport: destination.localTransport || 'Informations non disponibles',
  };
}

/**
 * Génère le dashboard complet du voyage
 */
export async function generateTripDashboard(
  trip: Trip,
  checklistCompleted: number = 0,
  checklistTotal: number = 0
): Promise<TripDashboard> {
  const stops = await getTripStops(trip.id);
  const segments = await getTripSegments(trip.id);
  
  // Destination principale (pays)
  const destination = getDestination(trip.countryDestinationId || trip.destinationId);
  
  // Calculer jours avant départ
  const daysUntil = getDaysUntilDeparture(trip.startDate);
  
  // Générer actions prioritaires
  const priorityActions = generatePriorityActions(trip, destination, daysUntil);
  
  // Collecter les alertes de toutes les destinations de l'itinéraire
  const alerts: Array<{ type: string; title: string; message: string }> = [];
  
  if (destination?.alerts) {
    destination.alerts.forEach(alert => {
      alerts.push({
        type: alert.type,
        title: alert.title,
        message: alert.message || alert.summary || '',
      });
    });
  }
  
  // Ajouter alertes des villes
  for (const stop of stops) {
    const cityDest = getDestination(stop.destinationId);
    if (cityDest?.alerts) {
      cityDest.alerts.forEach(alert => {
        alerts.push({
          type: alert.type,
          title: `${cityDest.name}: ${alert.title}`,
          message: alert.message || alert.summary || '',
        });
      });
    }
  }
  
  // Résumé transport
  const totalDuration = estimateTotalDuration(segments);
  const transportSummary = {
    totalStops: stops.length,
    totalDuration: formatDuration(totalDuration),
    recommendedPass: segments[0]?.metadata?.passRecommended,
  };
  
  return {
    trip,
    stops,
    segments,
    priorityActions,
    alerts: alerts.slice(0, 5), // Max 5 alertes
    checklistProgress: { completed: checklistCompleted, total: checklistTotal },
    transportSummary,
    destination,
  };
}

/**
 * Génère des suggestions d'étapes supplémentaires
 */
export function generateStopSuggestions(
  stops: TripStop[],
  tripDuration: number,
  interests: string[] = []
): Array<{ destinationId: string; destinationName: string; reason: string; dayTripFrom?: string }> {
  if (stops.length === 0) return [];

  const suggestions: Array<{ destinationId: string; destinationName: string; reason: string; dayTripFrom?: string }> = [];
  
  // Suggestions basées sur proximité géographique
  // (Simplifié - dans une vraie app, utiliser une base de données de proximité)
  
  const stopIds = stops.map(s => s.destinationId);
  
  // Japon
  if (stopIds.some(id => id.includes('tokyo'))) {
    if (!stopIds.some(id => id.includes('hakone'))) {
      suggestions.push({
        destinationId: 'hakone-japan',
        destinationName: 'Hakone',
        reason: 'Day trip populaire depuis Tokyo - Onsen et vue sur le Mont Fuji',
        dayTripFrom: 'Tokyo',
      });
    }
    if (!stopIds.some(id => id.includes('nikko'))) {
      suggestions.push({
        destinationId: 'nikko-japan',
        destinationName: 'Nikko',
        reason: 'Temples UNESCO et nature - 2h de Tokyo',
        dayTripFrom: 'Tokyo',
      });
    }
  }
  
  if (stopIds.some(id => id.includes('kyoto')) || stopIds.some(id => id.includes('osaka'))) {
    if (!stopIds.some(id => id.includes('nara'))) {
      suggestions.push({
        destinationId: 'nara-japan',
        destinationName: 'Nara',
        reason: 'Day trip incontournable - Daims et temples historiques',
        dayTripFrom: 'Kyoto ou Osaka',
      });
    }
    if (!stopIds.some(id => id.includes('hiroshima'))) {
      suggestions.push({
        destinationId: 'hiroshima-japan',
        destinationName: 'Hiroshima',
        reason: 'Histoire importante et île de Miyajima',
      });
    }
  }
  
  // France
  if (stopIds.some(id => id.includes('paris'))) {
    if (!stopIds.some(id => id.includes('versailles'))) {
      suggestions.push({
        destinationId: 'versailles-france',
        destinationName: 'Versailles',
        reason: 'Château historique incontournable - 30min de Paris',
        dayTripFrom: 'Paris',
      });
    }
  }
  
  // Italie
  if (stopIds.some(id => id.includes('rome'))) {
    if (!stopIds.some(id => id.includes('florence'))) {
      suggestions.push({
        destinationId: 'florence-italy',
        destinationName: 'Florence',
        reason: 'Renaissance et art - 1h30 en train',
      });
    }
  }
  
  // Filtrer selon intérêts si fournis
  if (interests.includes('nature') && tripDuration > 7) {
    // Ajouter destinations nature
  }
  
  return suggestions.slice(0, 4); // Max 4 suggestions
}