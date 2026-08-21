/**
 * TripBookingFunnel — budget prévisionnel, rattaché à un voyage.
 *
 * Ce parcours enchaînait quatre étapes de sélection d'offres (vol, hébergement,
 * e-SIM, activités). Aucune de ces offres n'existait : elles étaient produites
 * par un générateur pseudo-aléatoire, avec des noms d'établissements, des
 * horaires et des prix fabriqués. Un tunnel de réservation qui ne réserve rien
 * et affiche des prix qui n'existent pas ne peut pas être « corrigé » par un
 * avertissement : il fallait le remplacer.
 *
 * On garde ce qui avait du sens — arriver ici depuis la carte avec la
 * destination, les dates et les voyageurs déjà connus — pour produire un
 * budget prévisionnel poste par poste, rattaché au voyage.
 *
 * URL : /trips/:tripId/book?dest=&name=&country=&start=&end=&travelers=&from=
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { ArrowLeft, Check, Plus, Wallet } from 'lucide-react';
import { estimateFlightBudget, formatRange } from '../lib/travelOffers';
import {
  estimateEsim, estimateInsurance, estimateLodging, estimateActivities, estimateTrain,
  type CategoryEstimate,
} from '../lib/bookingCatalog';
import { useCart, CATEGORY_META } from '../lib/cart';
import { BudgetEstimateCard, EstimateDisclaimer } from '../components/BudgetEstimateCard';

export default function TripBookingFunnel() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);

  const destinationId = qs.get('dest') || 'paris-france';
  const destName = qs.get('name') || 'Destination';
  const countryName = qs.get('country') || '';
  const startDate = qs.get('start') || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const endDate = qs.get('end') || new Date(Date.now() + 37 * 86400000).toISOString().slice(0, 10);
  const travelers = Math.max(1, parseInt(qs.get('travelers') || '1', 10));
  const originIata = qs.get('from') || 'PARI';

  const { add, remove, has, count, total } = useCart();
  const [note, setNote] = useState('');

  const estimates = useMemo<CategoryEstimate[]>(() => {
    const list: CategoryEstimate[] = [];
    const flight = estimateFlightBudget({
      destinationId, destinationName: destName, startDate, endDate, travelers, originIata,
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
  }, [destinationId, destName, countryName, startDate, endDate, travelers, originIata]);

  return (
    <main className="min-h-screen pb-28" style={{ background: 'var(--lokadia-background)' }}>
      <div className="px-5 pt-6 pb-5" style={{ background: 'var(--gradient-primary)' }}>
        <div className="mx-auto max-w-3xl">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour
          </button>
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Budget de mon voyage</h1>
          <p className="mt-1 text-sm text-white/85">
            {destName}{countryName ? `, ${countryName}` : ''} ·{' '}
            {new Date(startDate).toLocaleDateString('fr-FR')} → {new Date(endDate).toLocaleDateString('fr-FR')} ·{' '}
            {travelers} voyageur{travelers > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-3 px-5 pt-4">
        <EstimateDisclaimer />

        {estimates.map((estimate) => {
          const id = `${estimate.category}-${destinationId}`;
          const added = has(id);
          const meta = CATEGORY_META[estimate.category];
          return (
            <div key={id}>
              <BudgetEstimateCard estimate={estimate} Icon={meta.Icon} accentColor={meta.color} />
              <button
                onClick={() => {
                  if (added) {
                    remove(id);
                    setNote(`${estimate.label} retiré`);
                  } else {
                    add({
                      id,
                      category: estimate.category,
                      label: estimate.label,
                      low: estimate.low,
                      high: estimate.high,
                      method: estimate.method,
                      destinationId,
                    });
                    setNote(`${estimate.label} ajouté`);
                  }
                }}
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

        {note && (
          <p className="text-center text-xs font-semibold" style={{ color: 'var(--lokadia-primary)' }}>
            {note}
          </p>
        )}
      </div>

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
              onClick={() => navigate('/checkout', { state: { tripId } })}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
              style={{ background: 'var(--lokadia-primary)' }}
            >
              <Wallet className="h-4 w-4" /> Récapitulatif
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
