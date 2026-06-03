/**
 * TripBookingFunnel — réservation GUIDÉE et séquentielle d'un voyage.
 *
 * On arrive ici depuis la carte interactive (TripMapPlannerScreen), une fois la
 * destination + dates choisies. Le parcours est volontairement linéaire et dans
 * l'ordre logique d'un voyage :
 *
 *   1. Vol            (generateFlightOffers)
 *   2. Hébergement    (generateLodgingOffers — Hôtel / Appartement / Maison / Airbnb / Hostel)
 *   3. e-SIM          (generateEsimOffers)
 *   4. Activités      (generateActivityOffers — proposées SELON la destination)
 *
 * Chaque sélection s'ajoute au panier in-app, puis paiement via /checkout
 * (le tripId est transmis pour rattacher la réservation au voyage).
 *
 * URL : /trips/:tripId/book?dest=&name=&country=&start=&end=&travelers=&from=
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import {
  ArrowLeft, ArrowRight, Plane, BedDouble, Wifi, Ticket,
  Check, Plus, ShoppingCart, MapPin, Sparkles, ChevronRight,
} from 'lucide-react';
import {
  generateLodgingOffers, generateEsimOffers, generateActivityOffers,
  type CatalogOffer,
} from '../lib/bookingCatalog';
import { generateFlightOffers } from '../lib/travelOffers';
import { useCart, type CartCategory } from '../lib/cart';

type StepId = 'flight' | 'lodging' | 'esim' | 'activity';

const STEPS: Array<{ id: StepId; label: string; Icon: typeof Plane; hint: string }> = [
  { id: 'flight',   label: 'Vol',         Icon: Plane,     hint: 'Choisis ton vol aller-retour' },
  { id: 'lodging',  label: 'Hébergement', Icon: BedDouble, hint: 'Hôtel, appartement, maison, Airbnb ou auberge' },
  { id: 'esim',     label: 'e-SIM',       Icon: Wifi,      hint: 'Reste connecté dès l\'atterrissage' },
  { id: 'activity', label: 'Activités',   Icon: Ticket,    hint: 'Sélectionnées pour ta destination' },
];

const LODGING_GROUPS = ['Hôtel', 'Appartement', 'Maison', 'Airbnb', 'Hostel'] as const;

function defaultDates(): { start: string; end: string } {
  const s = new Date(Date.now() + 30 * 86400000);
  const e = new Date(Date.now() + 37 * 86400000);
  return { start: s.toISOString().slice(0, 10), end: e.toISOString().slice(0, 10) };
}

const fmt = (n: number) => `${n.toLocaleString('fr-FR')} €`;

export default function TripBookingFunnel() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const qs = new URLSearchParams(useLocation().search);
  const dd = defaultDates();

  const destinationId = qs.get('dest') || 'paris-france';
  const destName = qs.get('name') || 'ta destination';
  const country = qs.get('country') || '';
  const startDate = qs.get('start') || dd.start;
  const endDate = qs.get('end') || dd.end;
  const travelers = Math.max(1, parseInt(qs.get('travelers') || '1', 10));
  const originIata = qs.get('from') || 'PARI';

  const { add, remove, has, count, total } = useCart();
  const [stepIndex, setStepIndex] = useState(0);
  const [lodgingGroup, setLodgingGroup] = useState<(typeof LODGING_GROUPS)[number] | null>(null);

  const step = STEPS[stepIndex];

  // ── Offres par étape (réutilise le catalogue déterministe) ──
  const flightOffers: CatalogOffer[] = useMemo(() => {
    return generateFlightOffers({ destinationId, destinationName: destName, startDate, endDate, travelers, originIata })
      .map((f) => ({
        id: f.id,
        category: 'flight' as CartCategory,
        title: f.airline,
        subtitle: `${f.departTime} → ${f.arriveTime} · ${f.duration} · ${f.stops === 0 ? 'Direct' : `${f.stops} escale${f.stops > 1 ? 's' : ''}`}`,
        price: f.price * travelers,
        meta: `${travelers} voyageur${travelers > 1 ? 's' : ''} · aller-retour`,
        badge: f.tag,
        destinationId,
      }));
  }, [destinationId, destName, startDate, endDate, travelers, originIata]);

  const lodgingOffers = useMemo(
    () => generateLodgingOffers(destinationId, destName, startDate, endDate, travelers),
    [destinationId, destName, startDate, endDate, travelers],
  );
  const esimOffers = useMemo(() => generateEsimOffers(destinationId, country || destName), [destinationId, country, destName]);
  const activityOffers = useMemo(() => generateActivityOffers(destinationId, destName, travelers), [destinationId, destName, travelers]);

  const offersForStep: CatalogOffer[] = useMemo(() => {
    switch (step.id) {
      case 'flight': return flightOffers;
      case 'lodging': return lodgingGroup ? lodgingOffers.filter((o) => o.group === lodgingGroup) : lodgingOffers;
      case 'esim': return esimOffers;
      case 'activity': return activityOffers;
    }
  }, [step.id, flightOffers, lodgingOffers, lodgingGroup, esimOffers, activityOffers]);

  const isLast = stepIndex === STEPS.length - 1;
  const stepHasSelection = offersForStep.some((o) => has(o.id));

  const toggle = (o: CatalogOffer) => {
    if (has(o.id)) remove(o.id);
    else add({ id: o.id, category: o.category, title: o.title, subtitle: o.subtitle, price: o.price, meta: o.meta, destinationId });
  };

  const goNext = () => {
    if (isLast) {
      navigate('/checkout', { state: { tripId } });
    } else {
      setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const goPrev = () => {
    if (stepIndex === 0) navigate(-1);
    else { setStepIndex((i) => Math.max(0, i - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  return (
    <main className="min-h-screen pb-28" style={{ background: 'var(--lokadia-background)' }}>
      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-5 text-white" style={{ background: 'var(--gradient-primary)' }}>
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
              aria-label="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white/80">
                <MapPin className="h-3 w-3" /> {destName}{country ? `, ${country}` : ''}
              </p>
              <h1 className="text-lg font-bold leading-tight">Réserve ton voyage, étape par étape</h1>
            </div>
            {tripId && (
              <button
                onClick={() => navigate(`/trips/${tripId}`)}
                className="flex-shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold transition-colors hover:bg-white/25"
              >
                Voir le voyage
              </button>
            )}
          </div>

          {/* Stepper */}
          <div className="mt-5 flex items-center gap-1.5">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const active = i === stepIndex;
              const SIcon = s.Icon;
              return (
                <div key={s.id} className="flex flex-1 items-center gap-1.5">
                  <button
                    onClick={() => setStepIndex(i)}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-all"
                    style={{
                      background: active ? 'white' : 'rgba(255,255,255,0.15)',
                      color: active ? 'var(--lokadia-primary)' : 'white',
                    }}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : <SIcon className="h-3.5 w-3.5" />}
                    <span className={active ? '' : 'hidden sm:inline'}>{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && <div className="h-0.5 flex-1 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Corps de l'étape ── */}
      <div className="mx-auto max-w-3xl px-4 pt-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'var(--lokadia-info-bg)' }}>
            <step.Icon className="h-5 w-5" style={{ color: 'var(--lokadia-primary)' }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              {stepIndex + 1}. {step.label}
            </h2>
            <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
              {step.id === 'activity' && <Sparkles className="h-3 w-3" style={{ color: 'var(--lokadia-accent)' }} />}
              {step.hint}
            </p>
          </div>
        </div>

        {/* Filtres types d'hébergement */}
        {step.id === 'lodging' && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            <FilterChip label="Tous" active={lodgingGroup === null} onClick={() => setLodgingGroup(null)} />
            {LODGING_GROUPS.map((g) => (
              <FilterChip key={g} label={g} active={lodgingGroup === g} onClick={() => setLodgingGroup(g)} />
            ))}
          </div>
        )}

        {/* Liste d'offres */}
        <div className="space-y-2.5">
          {offersForStep.map((o) => {
            const added = has(o.id);
            return (
              <button
                key={o.id}
                onClick={() => toggle(o)}
                className="flex w-full items-center gap-3 rounded-2xl border bg-white p-3.5 text-left transition-all"
                style={{
                  borderColor: added ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-100)',
                  boxShadow: added ? '0 0 0 1px var(--lokadia-primary)' : 'var(--shadow-sm)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{o.title}</p>
                    {o.badge && (
                      <span className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ background: 'var(--lokadia-info-bg)', color: 'var(--lokadia-primary)' }}>
                        {o.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>{o.subtitle}</p>
                  <p className="mt-1 text-[11px]" style={{ color: 'var(--lokadia-gray-400)' }}>{o.meta}</p>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(o.price)}</span>
                  <span
                    className="flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-bold transition-colors"
                    style={{
                      background: added ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-100)',
                      color: added ? 'white' : 'var(--lokadia-gray-700)',
                    }}
                  >
                    {added ? <><Check className="h-3.5 w-3.5" /> Ajouté</> : <><Plus className="h-3.5 w-3.5" /> Ajouter</>}
                  </span>
                </div>
              </button>
            );
          })}

          {offersForStep.length === 0 && (
            <div className="rounded-2xl border border-dashed bg-white p-6 text-center" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
              <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-700)' }}>Aucune offre pour ce filtre</p>
              <p className="mt-1 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>Essaie un autre type d'hébergement.</p>
            </div>
          )}
        </div>

        {/* Skip */}
        <button
          onClick={goNext}
          className="mt-4 flex w-full items-center justify-center gap-1 py-2 text-xs font-bold transition-colors hover:opacity-80"
          style={{ color: 'var(--lokadia-gray-500)' }}
        >
          {stepHasSelection ? 'Continuer sans rien ajouter de plus' : `Passer cette étape`}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Barre d'action fixe ── */}
      <div className="sticky-bottom-cta border-t" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'var(--lokadia-info-bg)' }}>
              <ShoppingCart className="h-4 w-4" style={{ color: 'var(--lokadia-primary)' }} />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>
                  {count}
                </span>
              )}
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--lokadia-gray-400)' }}>Panier</p>
              <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(total)}</p>
            </div>
          </div>

          <button
            onClick={goNext}
            className="ml-auto flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold text-white transition-all"
            style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-md)' }}
          >
            {isLast
              ? <>Vers le paiement <ArrowRight className="h-4 w-4" /></>
              : <>Continuer · {STEPS[stepIndex + 1].label} <ArrowRight className="h-4 w-4" /></>}
          </button>
        </div>
      </div>
    </main>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-xs font-bold transition-all"
      data-touch="compact"
      style={{
        background: active ? 'var(--lokadia-primary)' : 'white',
        color: active ? 'white' : 'var(--lokadia-gray-700)',
        border: `1px solid ${active ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)'}`,
      }}
    >
      {label}
    </button>
  );
}
