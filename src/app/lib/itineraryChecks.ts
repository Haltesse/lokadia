/**
 * Détection d'incohérences dans un itinéraire.
 *
 * C'est le différenciant du planner : Wanderlog et consorts laissent
 * construire des journées matériellement impossibles sans rien dire. Ici,
 * chaque règle s'appuie uniquement sur des données que l'on possède
 * réellement — coordonnées, dates, temps de trajet calculés.
 *
 * Ce qu'on ne fait PAS, faute de données : vérifier qu'un musée est fermé
 * le lundi ou qu'une correspondance est trop serrée. Ces contrôles
 * demandent des horaires d'ouverture et des horaires de transport que le
 * produit n'a pas. Les inventer donnerait de fausses alertes, ce qui est
 * pire que pas d'alerte du tout.
 *
 * Fonctions pures, sans dépendance au rendu : directement testables.
 */
import { calculateDistance } from './transportService';

/**
 * Forme minimale attendue d'une étape. Volontairement structurelle plutôt
 * que liée au type Supabase : le planner manipule ses propres objets, et
 * ces règles doivent rester utilisables des deux côtés.
 */
export interface CheckableStop {
  id: string;
  destinationName: string;
  orderIndex: number;
  startDate?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type CheckSeverity = 'blocking' | 'warning' | 'info';

export interface ItineraryIssue {
  id: string;
  severity: CheckSeverity;
  /** Étapes concernées, pour pouvoir les mettre en évidence */
  stopIds: string[];
  title: string;
  detail: string;
  /** Ce que l'utilisateur peut faire — jamais un simple constat */
  suggestion: string;
}

export interface TripWindow {
  startDate: string; // YYYY-MM-DD
  endDate: string;
}

/** Vitesse moyenne porte-à-porte, tous modes confondus (km/h). */
const AVERAGE_SPEED_KMH = 70;
/** Au-delà, une journée de voyage devient éprouvante. */
const LONG_TRAVEL_MINUTES = 5 * 60;
/** Au-delà, la journée est matériellement intenable. */
const EXCESSIVE_TRAVEL_MINUTES = 9 * 60;
/** Deux étapes plus éloignées que ça le même jour : à vérifier. */
const SAME_DAY_DISTANCE_KM = 300;

function toDay(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

/** Durée de trajet estimée entre deux étapes, en minutes. */
export function estimateTravelMinutes(a: CheckableStop, b: CheckableStop): number | null {
  if (a.latitude == null || a.longitude == null || b.latitude == null || b.longitude == null) {
    return null;
  }
  const km = calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude);
  return Math.round((km / AVERAGE_SPEED_KMH) * 60);
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}

/**
 * Analyse un itinéraire ordonné et renvoie les incohérences détectées,
 * les plus graves d'abord.
 */
export function checkItinerary(stops: CheckableStop[], trip?: TripWindow): ItineraryIssue[] {
  const issues: ItineraryIssue[] = [];
  const ordered = [...stops].sort((a, b) => a.orderIndex - b.orderIndex);

  // ─── 1. Étapes sans date : on ne peut rien vérifier d'autre pour elles ───
  const undated = ordered.filter((s) => !s.startDate);
  if (undated.length > 0) {
    issues.push({
      id: 'undated-stops',
      severity: 'info',
      stopIds: undated.map((s) => s.id),
      title: `${undated.length} étape${undated.length > 1 ? 's' : ''} sans date`,
      detail:
        'Sans date, ces étapes ne peuvent pas être vérifiées (durée de trajet, chevauchements, cohérence avec les dates du voyage).',
      suggestion: 'Renseignez une date pour chacune afin d\'activer les contrôles.',
    });
  }

  // ─── 2. Étapes hors des dates du voyage ───
  if (trip) {
    const outside = ordered.filter((s) => {
      const day = toDay(s.startDate);
      return day !== null && (day < trip.startDate || day > trip.endDate);
    });
    if (outside.length > 0) {
      issues.push({
        id: 'outside-trip-window',
        severity: 'blocking',
        stopIds: outside.map((s) => s.id),
        title: `${outside.length} étape${outside.length > 1 ? 's' : ''} hors des dates du voyage`,
        detail: `Le voyage court du ${trip.startDate} au ${trip.endDate}, mais ${
          outside.length > 1 ? 'ces étapes sont datées' : 'cette étape est datée'
        } en dehors.`,
        suggestion: 'Corrigez la date de l\'étape ou étendez les dates du voyage.',
      });
    }
  }

  // ─── 3. Journées trop chargées en trajet ───
  const byDay = new Map<string, CheckableStop[]>();
  for (const stop of ordered) {
    const day = toDay(stop.startDate);
    if (!day) continue;
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(stop);
  }

  for (const [day, dayStops] of byDay) {
    if (dayStops.length < 2) continue;

    let totalMinutes = 0;
    let maxLegKm = 0;
    let measurable = false;

    for (let i = 0; i < dayStops.length - 1; i++) {
      const minutes = estimateTravelMinutes(dayStops[i], dayStops[i + 1]);
      if (minutes === null) continue;
      measurable = true;
      totalMinutes += minutes;
      const a = dayStops[i];
      const b = dayStops[i + 1];
      if (a.latitude != null && a.longitude != null && b.latitude != null && b.longitude != null) {
        maxLegKm = Math.max(maxLegKm, calculateDistance(a.latitude, a.longitude, b.latitude, b.longitude));
      }
    }
    if (!measurable) continue;

    if (totalMinutes >= EXCESSIVE_TRAVEL_MINUTES) {
      issues.push({
        id: `day-excessive-${day}`,
        severity: 'blocking',
        stopIds: dayStops.map((s) => s.id),
        title: `Journée du ${day} matériellement intenable`,
        detail: `Environ ${formatMinutes(totalMinutes)} de trajet estimé pour ${dayStops.length} étapes, sans compter les visites.`,
        suggestion: 'Étalez ces étapes sur plusieurs jours ou retirez-en une.',
      });
    } else if (totalMinutes >= LONG_TRAVEL_MINUTES) {
      issues.push({
        id: `day-heavy-${day}`,
        severity: 'warning',
        stopIds: dayStops.map((s) => s.id),
        title: `Journée du ${day} très chargée`,
        detail: `Environ ${formatMinutes(totalMinutes)} de trajet estimé. Il restera peu de temps sur place.`,
        suggestion: 'Envisagez de déplacer une étape au lendemain.',
      });
    } else if (maxLegKm >= SAME_DAY_DISTANCE_KM) {
      issues.push({
        id: `day-distance-${day}`,
        severity: 'warning',
        stopIds: dayStops.map((s) => s.id),
        title: `Étapes éloignées le ${day}`,
        detail: `Un trajet de ${Math.round(maxLegKm)} km sépare deux étapes de la même journée.`,
        suggestion: 'Vérifiez qu\'un transport rapide existe, ou séparez ces étapes.',
      });
    }
  }

  // ─── 4. Ordre des étapes incohérent avec les dates ───
  const dated = ordered.filter((s) => s.startDate);
  for (let i = 0; i < dated.length - 1; i++) {
    const current = toDay(dated[i].startDate);
    const next = toDay(dated[i + 1].startDate);
    if (current && next && next < current) {
      issues.push({
        id: `order-mismatch-${dated[i].id}`,
        severity: 'warning',
        stopIds: [dated[i].id, dated[i + 1].id],
        title: 'Ordre incohérent avec les dates',
        detail: `« ${dated[i + 1].destinationName} » (${next}) est placée après « ${dated[i].destinationName} » (${current}).`,
        suggestion: 'Réorganisez les étapes ou ajustez leurs dates.',
      });
      break; // une seule alerte suffit : l'utilisateur va tout réordonner
    }
  }

  const rank: Record<CheckSeverity, number> = { blocking: 0, warning: 1, info: 2 };
  return issues.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

/** Durée totale de trajet estimée sur l'itinéraire, en minutes. */
export function totalTravelMinutes(stops: CheckableStop[]): number {
  const ordered = [...stops].sort((a, b) => a.orderIndex - b.orderIndex);
  let total = 0;
  for (let i = 0; i < ordered.length - 1; i++) {
    total += estimateTravelMinutes(ordered[i], ordered[i + 1]) ?? 0;
  }
  return total;
}

export { formatMinutes };
