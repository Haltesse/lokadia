/**
 * BookingScreen — budget prévisionnel d'un voyage et accès aux partenaires.
 *
 * Cet écran présentait auparavant des listes d'offres : « Air France · 08h15 →
 * 11h40 · 285 € », « ibis Styles Tokyo · 8,4/10 · 1 847 avis ». Rien de tout
 * cela n'existait : les compagnies étaient tirées au sort, les horaires
 * fabriqués, le prix dérivé de la somme des codes de caractères du code IATA,
 * et les notes d'hôtels inventées de toutes pièces — sur des enseignes bien
 * réelles, ce qui aggravait le procédé.
 *
 * L'écran fait maintenant ce que Lokadia peut honnêtement faire : chiffrer une
 * fourchette par poste, dire d'où elle vient, et renvoyer vers les moteurs de
 * recherche des partenaires pour le prix du jour.
 *
 * URL : /booking/:destinationId?start=YYYY-MM-DD&end=YYYY-MM-DD&travelers=2&from=PARI
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import {
  ArrowLeft, Plane, Check, Plus, Wallet, ExternalLink,
} from 'lucide-react';
import { getDestinationData } from '../data/destinationData';
import { estimateFlightBudget, formatRange } from '../lib/travelOffers';
import {
  estimateEsim, estimateInsurance, estimateLodging, estimateActivities, estimateTrain,
  type CategoryEstimate,
} from '../lib/bookingCatalog';
import { useCart, CATEGORY_META } from '../lib/cart';
import { BudgetEstimateCard, EstimateDisclaimer } from '../components/BudgetEstimateCard';

function defaultDates(): { start: string; end: string } {
  const s = new Date(Date.now() + 30 * 86400000);
  const e = new Date(Date.now() + 37 * 86400000);
  return { start: s.toISOString().slice(0, 10), end: e.toISOString().slice(0, 10) };
}

export default function BookingScreen() {
  const navigate = useNavigate();
  const { destinationId = 'paris-france' } = useParams();
  const location = useLocation();
  const qs = new URLSearchParams(location.search);
  const dd = defaultDates();
  const startDate = qs.get('start') || dd.start;
  const endDate = qs.get('end') || dd.end;
  const travelers = Math.max(1, parseInt(qs.get('travelers') || '1', 10));
  const originIata = qs.get('from') || 'PARI';

  const dest = getDestinationData(destinationId);
  const destName = dest?.name ?? 'Destination';
  const countryName = dest?.country ?? '';

  const { add, remove, has, count, total } = useCart();
  const [confirmation, setConfirmation] = useState('');

  /** Fourchette « vol », qui porte sa propre recherche Skyscanner. */
  const flight = useMemo(() => {
    const estimate = estimateFlightBudget({
      destinationId, destinationName: destName, startDate, endDate, travelers, originIata,
    });
    if (!estimate) return null;
    const line: CategoryEstimate = {
      category: 'flight',
      label: `Vol aller-retour · ${travelers} voyageur${travelers > 1 ? 's' : ''}`,
      low: estimate.low * travelers,
      high: estimate.high * travelers,
      method: `${estimate.method} Par personne : ${formatRange(estimate)}.`,
      partners: [{
        id: 'skyscanner',
        name: estimate.partner,
        description: `Vols vers ${destName}`,
        brandColor: '#0770E3',
        href: estimate.searchUrl,
      }],
    };
    return line;
  }, [destinationId, destName, startDate, endDate, travelers, originIata]);

  const estimates = useMemo(() => {
    const list: CategoryEstimate[] = [];
    if (flight) list.push(flight);
    list.push(estimateLodging({ destinationName: destName, country: countryName, startDate, endDate, travelers }));
    const train = estimateTrain({ destinationName: destName, country: countryName, startDate, travelers });
    if (train) list.push(train);
    list.push(estimateActivities(destName, startDate, endDate, travelers));
    list.push(estimateEsim(countryName));
    list.push(estimateInsurance(startDate, endDate, travelers));
    return list;
  }, [flight, destName, countryName, startDate, endDate, travelers]);

  function lineId(estimate: CategoryEstimate) {
    return `${estimate.category}-${destinationId}`;
  }

  function toggle(estimate: CategoryEstimate) {
    const id = lineId(estimate);
    if (has(id)) {
      remove(id);
      setConfirmation(`${estimate.label} retiré du budget`);
      return;
    }
    add({
      id,
      category: estimate.category,
      label: estimate.label,
      low: estimate.low,
      high: estimate.high,
      method: estimate.method,
      destinationId,
    });
    setConfirmation(`${estimate.label} ajouté au budget`);
  }

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
          const id = lineId(estimate);
          const added = has(id);
          const meta = CATEGORY_META[estimate.category];
          return (
            <div key={id}>
              <BudgetEstimateCard estimate={estimate} Icon={meta.Icon} accentColor={meta.color} />
              <button
                onClick={() => toggle(estimate)}
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

        {!flight && (
          <p className="rounded-2xl bg-white p-4 text-xs" style={{ color: 'var(--lokadia-gray-600)' }}>
            Aucune coordonnée n'est enregistrée pour cette destination : le poste
            « vol » ne peut pas être estimé sans distance réelle. Il est donc
            omis plutôt qu'approximé.
          </p>
        )}

        {confirmation && (
          <p className="text-center text-xs font-semibold" style={{ color: 'var(--lokadia-primary)' }}>
            {confirmation}
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
              onClick={() => navigate('/checkout')}
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

/** Lien de secours vers la recherche partenaire, réutilisable ailleurs. */
export function PartnerSearchLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener nofollow sponsored"
      className="inline-flex items-center gap-1.5 text-xs font-semibold"
      style={{ color: 'var(--lokadia-primary)' }}
    >
      <Plane className="h-3.5 w-3.5" /> {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}
