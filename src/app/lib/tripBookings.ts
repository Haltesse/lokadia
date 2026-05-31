/**
 * tripBookings — persistance locale des réservations rattachées à un voyage.
 *
 * Quand l'utilisateur finalise son voyage, le contenu du panier est figé dans
 * localStorage sous la clé du voyage. Permet d'afficher ensuite le récapitulatif
 * "voyage finalisé" (vol ✓, hôtel ✓, e-SIM ✓...) dans l'aperçu du voyage.
 *
 * (Démo : stockage local. En prod, ces réservations seraient persistées côté
 * backend avec les références de commande des partenaires.)
 */
import type { CartItem } from './cart';

export interface TripBooking {
  tripId: string;
  items: CartItem[];
  total: number;
  reference: string;
  bookedAt: string; // ISO
}

const KEY = 'lokadia_trip_bookings_v1';

function readAll(): Record<string, TripBooking> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, TripBooking>;
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, TripBooking>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota plein */
  }
}

/** Enregistre (ou écrase) la réservation finalisée d'un voyage. */
export function saveTripBooking(booking: TripBooking): void {
  const all = readAll();
  all[booking.tripId] = booking;
  writeAll(all);
  try {
    window.dispatchEvent(new CustomEvent('lokadia_trip_booking_change', { detail: { tripId: booking.tripId } }));
  } catch { /* ignore */ }
}

/** Récupère la réservation finalisée d'un voyage (ou null). */
export function getTripBooking(tripId: string): TripBooking | null {
  return readAll()[tripId] ?? null;
}

/** Supprime la réservation d'un voyage (pour re-réserver). */
export function clearTripBooking(tripId: string): void {
  const all = readAll();
  delete all[tripId];
  writeAll(all);
  try {
    window.dispatchEvent(new CustomEvent('lokadia_trip_booking_change', { detail: { tripId } }));
  } catch { /* ignore */ }
}
