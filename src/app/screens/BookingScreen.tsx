/**
 * BookingScreen — Hub de réservation complet d'un voyage (achat in-app).
 *
 * Tout ce dont un voyage a besoin, réservable sans quitter Lokadia :
 * Vol · Hôtel · Train · e-SIM · Assurance · Activités. Chaque offre s'ajoute
 * au panier, puis paiement in-app via /checkout (aucune redirection).
 *
 * URL : /booking/:destinationId?start=YYYY-MM-DD&end=YYYY-MM-DD&travelers=2&from=PARI
 */
import { useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import {
  ArrowLeft, Plane, Building2, Train, Wifi, ShieldCheck, Ticket,
  Check, Plus, ShoppingCart, Star, Clock,
} from 'lucide-react';
import { getDestinationData } from '../data/destinationData';
import { generateFlightOffers, generateHotelOffers } from '../lib/travelOffers';
import {
  generateEsimOffers, generateInsuranceOffers, generateTrainOffers, generateActivityOffers,
  type CatalogOffer,
} from '../lib/bookingCatalog';
import { useCart, CATEGORY_META, type CartCategory } from '../lib/cart';

const TABS: Array<{ id: CartCategory; label: string; Icon: any }> = [
  { id: 'flight', label: 'Vol', Icon: Plane },
  { id: 'hotel', label: 'Hôtel', Icon: Building2 },
  { id: 'train', label: 'Train', Icon: Train },
  { id: 'esim', label: 'e-SIM', Icon: Wifi },
  { id: 'insurance', label: 'Assurance', Icon: ShieldCheck },
  { id: 'activity', label: 'Activités', Icon: Ticket },
];

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

  const { add, has, count, total } = useCart();
  const [tab, setTab] = useState<CartCategory>('flight');

  const nights = useMemo(() => {
    const n = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
    return n > 0 ? n : 7;
  }, [startDate, endDate]);

  // Offres par catégorie
  const flights = useMemo(() => generateFlightOffers({ destinationId, destinationName: destName, startDate, endDate, travelers, originIata }), [destinationId, startDate, endDate, travelers, originIata]);
  const hotels = useMemo(() => generateHotelOffers({ destinationId, destinationName: destName, startDate, endDate, travelers }), [destinationId, startDate, endDate, travelers]);
  const trains = useMemo(() => generateTrainOffers(destinationId, countryName, startDate, travelers), [destinationId, countryName, startDate, travelers]);
  const esims = useMemo(() => generateEsimOffers(destinationId, countryName), [destinationId, countryName]);
  const insurances = useMemo(() => generateInsuranceOffers(destinationId, startDate, endDate, travelers), [destinationId, startDate, endDate, travelers]);
  const activities = useMemo(() => generateActivityOffers(destinationId, destName, travelers), [destinationId, destName, travelers]);

  function addCatalog(o: CatalogOffer) {
    add({ id: o.id, category: o.category, title: o.title, subtitle: o.subtitle, price: o.price, meta: o.meta, destinationId });
  }

  const fmt = (n: number) => `${n.toLocaleString('fr-FR')} €`;

  return (
    <main className="min-h-screen pb-28" style={{ background: 'var(--lokadia-background)' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-5" style={{ background: 'var(--gradient-primary)' }}>
        <div className="mx-auto max-w-5xl">
          <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour
          </button>
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Réserver mon voyage</h1>
          <p className="mt-1 text-sm text-white/85">
            {destName}{countryName ? `, ${countryName}` : ''} · {new Date(startDate).toLocaleDateString('fr-FR')} → {new Date(endDate).toLocaleDateString('fr-FR')} · {travelers} voyageur{travelers > 1 ? 's' : ''}
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold text-white">
            <ShoppingCart className="h-3.5 w-3.5" /> Tout réservable in-app · paiement unique sécurisé
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5">
        {/* Onglets catégories */}
        <div className="sticky top-0 z-20 -mx-5 flex gap-1.5 overflow-x-auto px-5 py-3 scrollbar-hide" style={{ background: 'var(--lokadia-background)' }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            const c = CATEGORY_META[t.id].color;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-colors"
                style={{ background: active ? c : 'white', color: active ? 'white' : 'var(--lokadia-gray-700)', border: '1px solid var(--lokadia-gray-100)' }}>
                <t.Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ─── VOLS ─── */}
        {tab === 'flight' && (
          <div className="space-y-2.5 pt-2">
            {flights.map((f) => {
              const id = `flight-${destinationId}-${f.id}`;
              const priceTotal = f.price * travelers;
              const added = has(id);
              return (
                <div key={f.id} className="flex items-center gap-3 rounded-2xl bg-white p-4" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#0F4C81,#134074)' }}>{f.airlineCode}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{f.departTime} → {f.arriveTime} <span className="font-normal" style={{ color: 'var(--lokadia-gray-400)' }}>· {f.duration}</span></p>
                    <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{f.airline} · {f.stops === 0 ? 'Direct' : `${f.stops} escale`}{f.tag ? ` · ${f.tag}` : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(priceTotal)}</p>
                    <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>{travelers} pers.</p>
                  </div>
                  <AddBtn added={added} color={CATEGORY_META.flight.color} onClick={() => add({ id, category: 'flight', title: `${f.airline} → ${destName}`, subtitle: `${f.departTime}-${f.arriveTime} · ${f.stops === 0 ? 'Direct' : f.stops + ' escale'}`, price: priceTotal, meta: `${travelers} voyageur${travelers > 1 ? 's' : ''}`, destinationId })} />
                </div>
              );
            })}
          </div>
        )}

        {/* ─── HÔTELS ─── */}
        {tab === 'hotel' && (
          <div className="space-y-2.5 pt-2">
            {hotels.map((h) => {
              const id = `hotel-${destinationId}-${h.id}`;
              const added = has(id);
              return (
                <div key={h.id} className="flex gap-3 rounded-2xl bg-white p-3" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${h.imageUrl})`, backgroundColor: 'var(--lokadia-gray-200)' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--lokadia-gray-900)' }}>{h.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ background: `${h.color}15`, color: h.color }}>{h.tier}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[11px] font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{h.rating.toFixed(1)}</span>
                    </div>
                    <div className="mt-1.5 flex items-end justify-between">
                      <div>
                        <p className="text-base font-bold leading-none" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(h.totalPrice)}</p>
                        <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>{nights} nuit{nights > 1 ? 's' : ''} · {h.pricePerNight}€/nuit</p>
                      </div>
                      <AddBtn added={added} color={CATEGORY_META.hotel.color} onClick={() => add({ id, category: 'hotel', title: h.name, subtitle: `${h.tier} · ${h.rating.toFixed(1)}★`, price: h.totalPrice, meta: `${nights} nuit${nights > 1 ? 's' : ''}`, destinationId })} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TRAIN ─── */}
        {tab === 'train' && (
          <div className="space-y-2.5 pt-2">
            {trains.length === 0 ? (
              <EmptyCat text={`Pas de liaison ferroviaire pertinente vers ${countryName || 'cette destination'} — privilégiez l'avion.`} />
            ) : trains.map((t) => <OfferRow key={t.id} o={t} added={has(t.id)} onAdd={() => addCatalog(t)} Icon={Train} />)}
          </div>
        )}

        {/* ─── e-SIM ─── */}
        {tab === 'esim' && (
          <div className="space-y-2.5 pt-2">
            {esims.map((e) => <OfferRow key={e.id} o={e} added={has(e.id)} onAdd={() => addCatalog(e)} Icon={Wifi} />)}
          </div>
        )}

        {/* ─── ASSURANCE ─── */}
        {tab === 'insurance' && (
          <div className="space-y-2.5 pt-2">
            {insurances.map((i) => <OfferRow key={i.id} o={i} added={has(i.id)} onAdd={() => addCatalog(i)} Icon={ShieldCheck} />)}
          </div>
        )}

        {/* ─── ACTIVITÉS ─── */}
        {tab === 'activity' && (
          <div className="space-y-2.5 pt-2">
            {activities.map((a) => <OfferRow key={a.id} o={a} added={has(a.id)} onAdd={() => addCatalog(a)} Icon={Ticket} />)}
          </div>
        )}

        <p className="mt-4 text-center text-[11px]" style={{ color: 'var(--lokadia-gray-400)' }}>
          Prix estimés — l'intégration des tarifs partenaires en temps réel est en cours.
        </p>
      </div>

      {/* Barre panier fixe */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white px-5 py-3" style={{ borderColor: 'var(--lokadia-gray-100)', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>{count} article{count > 1 ? 's' : ''} dans le panier</p>
              <p className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(total)}</p>
            </div>
            <button onClick={() => navigate('/checkout')} className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
              <ShoppingCart className="h-4 w-4" /> Voir le panier & payer
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function AddBtn({ added, color, onClick }: { added: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={added}
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
      style={{ background: added ? 'rgba(16,185,129,0.12)' : color, color: added ? '#059669' : 'white' }}
      aria-label={added ? 'Ajouté' : 'Ajouter au panier'}>
      {added ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={3} />}
    </button>
  );
}

function OfferRow({ o, added, onAdd, Icon }: { o: CatalogOffer; added: boolean; onAdd: () => void; Icon: any }) {
  const c = CATEGORY_META[o.category].color;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${c}15` }}>
        <Icon className="h-5 w-5" style={{ color: c }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{o.title}</p>
          {o.badge && <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold" style={{ background: `${c}15`, color: c }}>{o.badge}</span>}
        </div>
        <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{o.subtitle}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{o.price.toLocaleString('fr-FR')} €</p>
        <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>{o.meta}</p>
      </div>
      <AddBtn added={added} color={c} onClick={onAdd} />
    </div>
  );
}

function EmptyCat({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center" style={{ border: '1px solid var(--lokadia-gray-100)' }}>
      <Clock className="mx-auto mb-2 h-7 w-7" style={{ color: 'var(--lokadia-gray-300)' }} />
      <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>{text}</p>
    </div>
  );
}
