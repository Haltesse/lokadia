/**
 * TripBookingTab — onglet « Budget » d'un voyage.
 *
 * Cet onglet s'appelait « Réserver » et affichait, catégorie par catégorie, des
 * offres qui n'existaient pas : compagnies aériennes tirées au sort, hôtels
 * nommés d'après des enseignes réelles avec des notes et des nombres d'avis
 * fabriqués, prix issus d'un générateur pseudo-aléatoire. On pouvait les
 * « ajouter au panier » et « finaliser » — sans que rien ne soit jamais
 * réservé ni facturé.
 *
 * Il présente désormais des fourchettes assumées, avec pour chacune la méthode
 * de calcul et les liens vers les moteurs de recherche partenaires. Le
 * voyageur retient les postes qui l'intéressent ; le total est un budget
 * prévisionnel, jamais un panier.
 */
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Check, Plus, Wallet, RotateCcw, CheckCircle2,
} from 'lucide-react';
import type { TripWithChecklist } from '../lib/tripService';
import { getTripBooking, clearTripBooking, type TripBooking } from '../lib/tripBookings';
import { estimateFlightBudget, formatRange } from '../lib/travelOffers';
import {
  estimateEsim, estimateInsurance, estimateLodging, estimateActivities, estimateTrain,
  type CategoryEstimate,
} from '../lib/bookingCatalog';
import { useCart, CATEGORY_META } from '../lib/cart';
import { BudgetEstimateCard, EstimateDisclaimer } from './BudgetEstimateCard';

export default function TripBookingTab({ trip }: { trip: TripWithChecklist }) {
  const navigate = useNavigate();
  const { add, remove, has, count, total } = useCart();

  // Plan de budget déjà enregistré pour ce voyage ?
  const [booking, setBooking] = useState<TripBooking | null>(() => getTripBooking(trip.id));
  useEffect(() => {
    const refresh = () => setBooking(getTripBooking(trip.id));
    window.addEventListener('lokadia_trip_booking_change', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('lokadia_trip_booking_change', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [trip.id]);

  const destinationId = trip.destinationId;
  const destName = trip.destinationName;
  const startDate = trip.startDate;
  const endDate = trip.endDate;
  const travelers = trip.travelers || 1;
  const countryName = destName.includes(',') ? destName.split(',').pop()!.trim() : '';

  const estimates = useMemo<CategoryEstimate[]>(() => {
    const list: CategoryEstimate[] = [];

    const flight = estimateFlightBudget({
      destinationId, destinationName: destName, startDate, endDate, travelers,
    });
    if (flight) {
      list.push({
        category: 'flight',
        label: `Vol aller-retour · ${travelers} voyageur${travelers > 1 ? 's' : ''}`,
        low: flight.low * travelers,
        high: flight.high * travelers,
        method: `${flight.method} Par personne : ${formatRange(flight)}.`,
        partners: [{
          id: 'skyscanner',
          name: flight.partner,
          description: `Vols vers ${destName}`,
          brandColor: '#0770E3',
          href: flight.searchUrl,
        }],
      });
    }

    list.push(estimateLodging({ destinationName: destName, country: countryName, startDate, endDate, travelers }));
    const train = estimateTrain({ destinationName: destName, country: countryName, startDate, travelers });
    if (train) list.push(train);
    list.push(estimateActivities(destName, startDate, endDate, travelers));
    list.push(estimateEsim(countryName));
    list.push(estimateInsurance(startDate, endDate, travelers));
    return list;
  }, [destinationId, destName, countryName, startDate, endDate, travelers]);

  // ─── Plan déjà enregistré ───
  if (booking) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-3xl p-5"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.3)' }}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0" style={{ color: '#059669' }} />
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                Budget enregistré
              </h3>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--lokadia-gray-600)' }}>
                {booking.items.length} poste{booking.items.length > 1 ? 's' : ''} ·{' '}
                {formatRange(booking.total)} · enregistré le{' '}
                {new Date(booking.savedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {booking.items.map((line) => {
              const meta = CATEGORY_META[line.category];
              return (
                <div key={line.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                  <meta.Icon className="h-4 w-4 flex-shrink-0" style={{ color: meta.color }} />
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {line.label}
                  </p>
                  <p className="flex-shrink-0 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {formatRange(line)}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => { clearTripBooking(trip.id); setBooking(null); }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-bold"
            style={{ color: 'var(--lokadia-gray-700)', border: '1px solid var(--lokadia-gray-200)' }}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Refaire mon budget
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-24">
      <EstimateDisclaimer />

      {estimates.map((estimate) => {
        const id = `${estimate.category}-${destinationId}`;
        const added = has(id);
        const meta = CATEGORY_META[estimate.category];
        return (
          <div key={id}>
            <BudgetEstimateCard estimate={estimate} Icon={meta.Icon} accentColor={meta.color} />
            <button
              onClick={() =>
                added
                  ? remove(id)
                  : add({
                      id,
                      category: estimate.category,
                      label: estimate.label,
                      low: estimate.low,
                      high: estimate.high,
                      method: estimate.method,
                      destinationId,
                    })
              }
              className="mt-1.5 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors"
              style={{
                background: added ? meta.color : 'white',
                color: added ? 'white' : meta.color,
                border: `1.5px solid ${meta.color}`,
              }}
            >
              {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              {added ? 'Dans mon budget' : 'Ajouter à mon budget'}
            </button>
          </div>
        );
      })}

      {count > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-30 border-t px-5 py-3"
          style={{ background: 'white', borderColor: 'var(--lokadia-gray-100)' }}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-600)' }}>
                Budget estimé · {count} poste{count > 1 ? 's' : ''}
              </p>
              <p className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                {formatRange(total)}
              </p>
            </div>
            <button
              onClick={() => navigate('/checkout', { state: { tripId: trip.id } })}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
              style={{ background: 'var(--lokadia-primary)' }}
            >
              <Wallet className="h-4 w-4" /> Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
