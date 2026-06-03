/**
 * TripBookingTab — assistant de réservation du voyage (onglet "Réserver").
 *
 * UX repensée "checklist de voyage" :
 *   - Vue d'ensemble : une carte par catégorie (Hébergement, Vol, Train,
 *     e-SIM, Assurance, Activités) avec statut visuel (✓ réservé / à réserver),
 *     aperçu de la sélection et barre de progression globale.
 *   - On entre dans une catégorie pour parcourir et choisir les offres.
 *   - Barre de panier flottante + bouton "Finaliser" vers le checkout.
 *
 * Tout est pré-rempli avec les dates / voyageurs / destination du voyage.
 */
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Plane, Building2, Train, Wifi, ShieldCheck, Ticket, Home,
  Check, Plus, Star, ShoppingCart, Clock, ChevronRight, ArrowLeft,
  Trash2, Sparkles, CheckCircle2, RotateCcw, type LucideIcon,
} from 'lucide-react';
import type { TripWithChecklist } from '../lib/tripService';
import { getTripBooking, clearTripBooking, type TripBooking } from '../lib/tripBookings';
import { generateFlightOffers, generateHotelOffers } from '../lib/travelOffers';
import {
  generateStayOffers, generateEsimOffers, generateInsuranceOffers,
  generateTrainOffers, generateActivityOffers, type CatalogOffer,
} from '../lib/bookingCatalog';
import { useCart, CATEGORY_META, type CartCategory } from '../lib/cart';

interface CatDef {
  id: CartCategory;
  label: string;
  Icon: any;
  desc: string;
  essential: boolean;
}
const CATEGORIES: CatDef[] = [
  { id: 'hotel', label: 'Hébergement', Icon: Building2, desc: 'Hôtels, appartements & maisons', essential: true },
  { id: 'flight', label: 'Vol', Icon: Plane, desc: 'Billets aller-retour', essential: true },
  { id: 'train', label: 'Train', Icon: Train, desc: 'Alternative ferroviaire', essential: false },
  { id: 'esim', label: 'e-SIM', Icon: Wifi, desc: 'Internet dès l\'arrivée', essential: true },
  { id: 'insurance', label: 'Assurance', Icon: ShieldCheck, desc: 'Couverture santé & annulation', essential: true },
  { id: 'activity', label: 'Activités', Icon: Ticket, desc: 'Visites & expériences', essential: false },
];

export default function TripBookingTab({ trip }: { trip: TripWithChecklist }) {
  const navigate = useNavigate();
  const { items, add, remove, has, count, total } = useCart();
  const [view, setView] = useState<CartCategory | null>(null);

  // Réservation déjà finalisée pour ce voyage ?
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

  const nights = useMemo(() => {
    const n = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000);
    return n > 0 ? n : 7;
  }, [startDate, endDate]);

  // Offres par catégorie (mémorisées)
  const flights = useMemo(() => generateFlightOffers({ destinationId, destinationName: destName, startDate, endDate, travelers }), [destinationId, startDate, endDate, travelers]);
  const hotels = useMemo(() => generateHotelOffers({ destinationId, destinationName: destName, startDate, endDate, travelers }), [destinationId, startDate, endDate, travelers]);
  const stays = useMemo(() => generateStayOffers(destinationId, destName, startDate, endDate, travelers), [destinationId, startDate, endDate, travelers]);
  const trains = useMemo(() => generateTrainOffers(destinationId, countryName, startDate, travelers), [destinationId, countryName, startDate, travelers]);
  const esims = useMemo(() => generateEsimOffers(destinationId, countryName || destName), [destinationId, countryName, destName]);
  const insurances = useMemo(() => generateInsuranceOffers(destinationId, startDate, endDate, travelers), [destinationId, startDate, endDate, travelers]);
  const activities = useMemo(() => generateActivityOffers(destinationId, destName, travelers), [destinationId, destName, travelers]);

  const fmt = (n: number) => `${n.toLocaleString('fr-FR')} €`;

  // Items du panier par catégorie (pour le statut "réservé")
  const itemsByCat = useMemo(() => {
    const m: Record<string, typeof items> = {};
    for (const it of items) (m[it.category] ??= []).push(it);
    return m;
  }, [items]);

  const bookedCount = CATEGORIES.filter((c) => (itemsByCat[c.id]?.length ?? 0) > 0).length;
  const essentialTotal = CATEGORIES.filter((c) => c.essential).length;
  const essentialBooked = CATEGORIES.filter((c) => c.essential && (itemsByCat[c.id]?.length ?? 0) > 0).length;

  const addCatalog = (o: CatalogOffer) => add({ id: o.id, category: o.category, title: o.title, subtitle: o.subtitle, price: o.price, meta: o.meta, destinationId });

  // Vers le checkout en transmettant le voyage à finaliser
  const goCheckout = () => navigate('/checkout', { state: { tripId: trip.id } });

  // ─── ÉTAT : VOYAGE DÉJÀ FINALISÉ ───
  if (booking && !view) {
    const cats = new Map<string, { label: string; Icon: LucideIcon; items: typeof booking.items }>();
    for (const it of booking.items) {
      const m = CATEGORY_META[it.category];
      const e = cats.get(it.category) ?? { label: m.label, Icon: m.Icon, items: [] };
      e.items.push(it);
      cats.set(it.category, e);
    }
    return (
      <div className="space-y-5 pb-12">
        <div className="overflow-hidden rounded-3xl text-white" style={{ background: 'linear-gradient(135deg,#059669,#10B981)' }}>
          <div className="p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold">Voyage finalisé</h2>
            <p className="mt-1 text-sm text-white/85">Tout est réservé pour {destName}</p>
            <div className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold">
              Réf. {booking.reference}
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="mb-3 text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Votre voyage réservé</h3>
          <div className="space-y-3">
            {[...cats.entries()].map(([cat, group]) => (
              <div key={cat}>
                <div className="mb-1 flex items-center gap-1.5">
                  <group.Icon className="h-4 w-4" style={{ color: CATEGORY_META[cat as CartCategory].color }} />
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: CATEGORY_META[cat as CartCategory].color }}>{group.label}</span>
                </div>
                {group.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-2 pl-6">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#059669' }} />
                    <span className="text-sm flex-1 truncate" style={{ color: 'var(--lokadia-gray-700)' }}>{it.title}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>{fmt(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Total payé</span>
            <span className="text-xl font-bold" style={{ color: '#059669' }}>{fmt(booking.total)}</span>
          </div>
        </div>

        <button onClick={() => { clearTripBooking(trip.id); setBooking(null); }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-bold"
          style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-600)' }}>
          <RotateCcw className="h-4 w-4" /> Modifier mes réservations
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  VUE DÉTAIL D'UNE CATÉGORIE
  // ─────────────────────────────────────────────────────────────────────────
  if (view) {
    const cat = CATEGORIES.find((c) => c.id === view)!;
    const c = CATEGORY_META[view].color;
    return (
      <div className="space-y-3 pb-28">
        <button onClick={() => setView(null)} className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>
          <ArrowLeft className="h-4 w-4" /> Tout le voyage
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${c}15` }}>
            <cat.Icon className="h-5 w-5" style={{ color: c }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{cat.label}</h2>
            <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>{cat.desc}</p>
          </div>
        </div>

        {view === 'hotel' && (
          <>
            <Label icon={Building2} text="Hôtels" color={c} />
            {hotels.map((h) => {
              const id = `hotel-${destinationId}-${h.id}`;
              return (
                <HotelCard key={h.id} h={h} nights={nights} fmt={fmt} added={has(id)}
                  onToggle={() => has(id) ? remove(id) : add({ id, category: 'hotel', title: h.name, subtitle: `${h.tier} · ${h.rating.toFixed(1)}★`, price: h.totalPrice, meta: `${nights} nuit${nights > 1 ? 's' : ''}`, destinationId })} />
              );
            })}
            <Label icon={Home} text="Appartements & maisons" color={c} />
            {stays.map((s) => <Row key={s.id} o={s} added={has(s.id)} onToggle={() => has(s.id) ? remove(s.id) : addCatalog(s)} Icon={Home} />)}
          </>
        )}

        {view === 'flight' && flights.map((f) => {
          const id = `flight-${destinationId}-${f.id}`;
          const priceTotal = f.price * travelers;
          return (
            <div key={f.id} className="flex items-center gap-3 rounded-2xl bg-white p-4" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#0F4C81,#134074)' }}>{f.airlineCode}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{f.departTime} → {f.arriveTime} <span className="font-normal" style={{ color: 'var(--lokadia-gray-400)' }}>· {f.duration}</span></p>
                <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{f.airline} · {f.stops === 0 ? 'Direct' : `${f.stops} escale`}{f.tag ? ` · ${f.tag}` : ''}</p>
              </div>
              <div className="text-right flex-shrink-0"><p className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(priceTotal)}</p><p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>{travelers} pers.</p></div>
              <Toggle added={has(id)} color={CATEGORY_META.flight.color} onClick={() => has(id) ? remove(id) : add({ id, category: 'flight', title: `${f.airline} → ${destName}`, subtitle: `${f.departTime}-${f.arriveTime} · ${f.stops === 0 ? 'Direct' : f.stops + ' escale'}`, price: priceTotal, meta: `${travelers} voyageur${travelers > 1 ? 's' : ''}`, destinationId })} />
            </div>
          );
        })}

        {view === 'train' && (trains.length === 0 ? <Empty text="Pas de liaison ferroviaire pertinente — privilégiez l'avion." /> : trains.map((t) => <Row key={t.id} o={t} added={has(t.id)} onToggle={() => has(t.id) ? remove(t.id) : addCatalog(t)} Icon={Train} />))}
        {view === 'esim' && esims.map((e) => <Row key={e.id} o={e} added={has(e.id)} onToggle={() => has(e.id) ? remove(e.id) : addCatalog(e)} Icon={Wifi} />)}
        {view === 'insurance' && insurances.map((i) => <Row key={i.id} o={i} added={has(i.id)} onToggle={() => has(i.id) ? remove(i.id) : addCatalog(i)} Icon={ShieldCheck} />)}
        {view === 'activity' && activities.map((a) => <Row key={a.id} o={a} added={has(a.id)} onToggle={() => has(a.id) ? remove(a.id) : addCatalog(a)} Icon={Ticket} />)}

        {count > 0 && <CartBar count={count} total={total} fmt={fmt} onClick={goCheckout} />}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  VUE D'ENSEMBLE — checklist de voyage
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-28">
      {/* Bandeau progression */}
      <div className="overflow-hidden rounded-3xl text-white" style={{ background: 'var(--gradient-primary)' }}>
        <div className="p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <h2 className="text-lg font-bold">Organisez tout votre voyage</h2>
          </div>
          <p className="mt-1 text-sm text-white/85">
            {destName} · {nights} nuit{nights > 1 ? 's' : ''} · {travelers} voyageur{travelers > 1 ? 's' : ''}
          </p>
          {/* Barre de progression */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
              <span>{bookedCount} / {CATEGORIES.length} catégories</span>
              <span className="text-white/80">{essentialBooked}/{essentialTotal} essentiels</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${(bookedCount / CATEGORIES.length) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Grille de catégories */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const c = CATEGORY_META[cat.id].color;
          const catItems = itemsByCat[cat.id] ?? [];
          const isBooked = catItems.length > 0;
          const catTotal = catItems.reduce((s, it) => s + it.price * it.qty, 0);
          return (
            <button key={cat.id} onClick={() => setView(cat.id)}
              className="group flex flex-col rounded-3xl bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ border: `1.5px solid ${isBooked ? c : 'var(--lokadia-gray-100)'}`, boxShadow: 'var(--shadow-sm)' }}>
              <div className="mb-2 flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${c}15` }}>
                  <cat.Icon className="h-5 w-5" style={{ color: c }} />
                </div>
                {isBooked ? (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white" style={{ background: c }}>
                    <Check className="h-3 w-3" strokeWidth={3} /> {catItems.length}
                  </span>
                ) : (
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-500)' }}>
                    {cat.essential ? 'Recommandé' : 'Optionnel'}
                  </span>
                )}
              </div>
              <p className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{cat.label}</p>
              {isBooked ? (
                <>
                  <p className="mt-0.5 text-xs truncate" style={{ color: 'var(--lokadia-gray-600)' }}>{catItems[0].title}{catItems.length > 1 ? ` +${catItems.length - 1}` : ''}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold" style={{ color: c }}>{fmt(catTotal)}</span>
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>Modifier <ChevronRight className="h-3 w-3" /></span>
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>{cat.desc}</p>
                  <div className="mt-2 flex items-center justify-end">
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-bold transition-transform group-hover:translate-x-0.5" style={{ color: c }}>Choisir <ChevronRight className="h-3 w-3" /></span>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Récap panier */}
      {count > 0 && (
        <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              <ShoppingCart className="h-4 w-4" /> Récapitulatif
            </h3>
            <span className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>{count} article{count > 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {items.map((it) => {
              const m = CATEGORY_META[it.category];
              return (
                <div key={it.id} className="flex items-center gap-2.5">
                  <m.Icon className="h-4 w-4" style={{ color: m.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate" style={{ color: 'var(--lokadia-gray-900)' }}>{it.title}</p>
                    <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>{m.label}{it.qty > 1 ? ` ×${it.qty}` : ''}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(it.price * it.qty)}</span>
                  <button onClick={() => remove(it.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Total</span>
            <span className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(total)}</span>
          </div>
        </div>
      )}

      {/* État vide encourageant */}
      {count === 0 && (
        <div className="rounded-3xl bg-white p-6 text-center" style={{ border: '1px dashed var(--lokadia-gray-200)' }}>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: 'var(--lokadia-info-bg)' }}>
            <ShoppingCart className="h-6 w-6" style={{ color: 'var(--lokadia-primary)' }} />
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-700)' }}>Commencez par l'essentiel</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>Hébergement, vol et assurance pour un voyage serein.</p>
        </div>
      )}

      {count > 0 && <CartBar count={count} total={total} fmt={fmt} onClick={goCheckout} />}
    </div>
  );
}

// ─── Sous-composants ───
function CartBar({ count, total, fmt, onClick }: { count: number; total: number; fmt: (n: number) => string; onClick: () => void }) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-30 border-t bg-white px-5 py-3 lg:bottom-0" style={{ borderColor: 'var(--lokadia-gray-100)', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>{count} article{count > 1 ? 's' : ''}</p>
          <p className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(total)}</p>
        </div>
        <button onClick={onClick} className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
          <CheckCircle2 className="h-4 w-4" /> Finaliser le voyage
        </button>
      </div>
    </div>
  );
}

function Label({ icon: Icon, text, color }: { icon: any; text: string; color: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <Icon className="h-4 w-4" style={{ color }} />
      <h3 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{text}</h3>
    </div>
  );
}

function Toggle({ added, color, onClick }: { added: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
      style={{ background: added ? color : 'var(--lokadia-gray-100)', color: added ? 'white' : 'var(--lokadia-gray-600)' }}
      aria-label={added ? 'Retirer' : 'Ajouter'}>
      {added ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={3} />}
    </button>
  );
}

function HotelCard({ h, nights, fmt, added, onToggle }: { h: any; nights: number; fmt: (n: number) => string; added: boolean; onToggle: () => void }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3 transition-all" style={{ border: `1.5px solid ${added ? CATEGORY_META.hotel.color : 'var(--lokadia-gray-100)'}`, boxShadow: 'var(--shadow-sm)' }}>
      <div className="h-20 w-24 flex-shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${h.imageUrl})`, backgroundColor: 'var(--lokadia-gray-200)' }} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold truncate" style={{ color: 'var(--lokadia-gray-900)' }}>{h.name}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase" style={{ background: `${h.color}15`, color: h.color }}>{h.tier}</span>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-bold">{h.rating.toFixed(1)}</span>
        </div>
        <div className="mt-1.5 flex items-end justify-between">
          <div>
            <p className="text-base font-bold leading-none" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(h.totalPrice)}</p>
            <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>{nights} nuit{nights > 1 ? 's' : ''} · {h.pricePerNight}€/nuit</p>
          </div>
          <Toggle added={added} color={CATEGORY_META.hotel.color} onClick={onToggle} />
        </div>
      </div>
    </div>
  );
}

function Row({ o, added, onToggle, Icon }: { o: CatalogOffer; added: boolean; onToggle: () => void; Icon: any }) {
  const c = CATEGORY_META[o.category].color;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 transition-all" style={{ border: `1.5px solid ${added ? c : 'var(--lokadia-gray-100)'}`, boxShadow: 'var(--shadow-sm)' }}>
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
      <Toggle added={added} color={c} onClick={onToggle} />
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-white p-6 text-center" style={{ border: '1px solid var(--lokadia-gray-100)' }}>
      <Clock className="mx-auto mb-2 h-7 w-7" style={{ color: 'var(--lokadia-gray-300)' }} />
      <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>{text}</p>
    </div>
  );
}
