/**
 * tripBookings — budget prévisionnel enregistré pour un voyage.
 *
 * Le voyageur fige les postes qu'il retient ; le plan est relu ensuite dans
 * l'aperçu du voyage. Rien n'est réservé ni transmis : Lokadia ne vend pas et
 * n'encaisse pas. Le stockage est local à l'appareil, comme le reste des
 * préférences.
 */
import type { BudgetLine } from './cart';

export interface TripBooking {
  tripId: string;
  items: BudgetLine[];
  /** Fourchette totale du plan, en euros. */
  total: { low: number; high: number };
  /** Date d'enregistrement du plan (ISO). */
  savedAt: string;
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
