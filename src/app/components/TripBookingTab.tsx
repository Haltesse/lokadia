/**
 * TripBookingTab — onglet "Réserver" du détail d'un voyage déjà créé.
 *
 * C'est ICI (et pas pendant la création) que le voyageur voit et choisit ses
 * hébergements (hôtels, appartements, maisons), son vol, son train, son e-SIM,
 * son assurance et ses activités — puis les ajoute au panier et paie in-app
 * (mode simulation). Tout est pré-rempli avec les dates / voyageurs / destination
 * réels du voyage.
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Plane, Building2, Train, Wifi, ShieldCheck, Ticket, Home,
  Check, Plus, Star, ShoppingCart, Clock,
} from 'lucide-react';
import type { TripWithChecklist } from '../lib/tripService';
import { generateFlightOffers, generateHotelOffers } from '../lib/travelOffers';
import {
  generateStayOffers, generateEsimOffers, generateInsuranceOffers,
  generateTrainOffers, generateActivityOffers, type CatalogOffer,
} from '../lib/bookingCatalog';
import { useCart, CATEGORY_META, type CartCategory } from '../lib/cart';

const TABS: Array<{ id: CartCategory; label: string; Icon: any }> = [
  { id: 'hotel', label: 'Hébergement', Icon: Building2 },
  { id: 'flight', label: 'Vol', Icon: Plane },
  { id: 'train', label: 'Train', Icon: Train },
  { id: 'esim', label: 'e-SIM', Icon: Wifi },
  { id: 'insurance', label: 'Assurance', Icon: ShieldCheck },
  { id: 'activity', label: 'Activités', Icon: Ticket },
];

export default function TripBookingTab({ trip }: { trip: TripWithChecklist }) {
  const navigate = useNavigate();
  const { add, has, count, total } = useCart();
  const [tab, setTab] = useState<CartCategory>('hotel');

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

  const flights = useMemo(() => generateFlightOffers({ destinationId, destinationName: destName, startDate, endDate, travelers }), [destinationId, startDate, endDate, travelers]);
  const hotels = useMemo(() => generateHotelOffers({ destinationId, destinationName: destName, startDate, endDate, travelers }), [destinationId, startDate, endDate, travelers]);
  const stays = useMemo(() => generateStayOffers(destinationId, destName, startDate, endDate, travelers), [destinationId, startDate, endDate, travelers]);
  const trains = useMemo(() => generateTrainOffers(destinationId, countryName, startDate, travelers), [destinationId, countryName, startDate, travelers]);
  const esims = useMemo(() => generateEsimOffers(destinationId, countryName || destName), [destinationId, countryName, destName]);
  const insurances = useMemo(() => generateInsuranceOffers(destinationId, startDate, endDate, travelers), [destinationId, startDate, endDate, travelers]);
  const activities = useMemo(() => generateActivityOffers(destinationId, destName, travelers), [destinationId, destName, travelers]);

  const fmt = (n: number) => `${n.toLocaleString('fr-FR')} €`;
  const addCatalog = (o: CatalogOffer) => add({ id: o.id, category: o.category, title: o.title, subtitle: o.subtitle, price: o.price, meta: o.meta, destinationId });

  return (
    <div className="space-y-4 pb-24">
      {/* Bandeau contexte voyage */}
      <div className="rounded-2xl p-4" style={{ background: 'var(--lokadia-info-bg)' }}>
        <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          🧳 Réservez tout pour {destName}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--lokadia-gray-600)' }}>
          {new Date(startDate).toLocaleDateString('fr-FR')} → {new Date(endDate).toLocaleDateString('fr-FR')} · {nights} nuit{nights > 1 ? 's' : ''} · {travelers} voyageur{travelers > 1 ? 's' : ''} · paiement in-app (démo)
        </p>
      </div>

      {/* Onglets catégories */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map((t) => {
          const active = tab === t.id;
          const c = CATEGORY_META[t.id].color;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-bold transition-colors"
              style={{ background: active ? c : 'white', color: active ? 'white' : 'var(--lokadia-gray-700)', border: '1px solid var(--lokadia-gray-200)' }}>
              <t.Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* ─── HÉBERGEMENT : hôtels + appartements + maisons ─── */}
      {tab === 'hotel' && (
        <div className="space-y-2.5">
          <SectionLabel icon={Building2} text="Hôtels" color={CATEGORY_META.hotel.color} />
          {hotels.map((h) => {
            const id = `hotel-${destinationId}-${h.id}`;
            return (
              <div key={h.id} className="flex gap-3 rounded-2xl bg-white p-3" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
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
                      <p className="text-base font-black leading-none" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(h.totalPrice)}</p>
                      <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>{nights} nuit{nights > 1 ? 's' : ''} · {h.pricePerNight}€/nuit</p>
                    </div>
                    <AddBtn added={has(id)} color={CATEGORY_META.hotel.color} onClick={() => add({ id, category: 'hotel', title: h.name, subtitle: `${h.tier} · ${h.rating.toFixed(1)}★`, price: h.totalPrice, meta: `${nights} nuit${nights > 1 ? 's' : ''}`, destinationId })} />
                  </div>
                </div>
              </div>
            );
          })}
          <SectionLabel icon={Home} text="Appartements & maisons" color={CATEGORY_META.hotel.color} />
          {stays.map((s) => <OfferRow key={s.id} o={s} added={has(s.id)} onAdd={() => addCatalog(s)} Icon={Home} />)}
        </div>
      )}

      {/* ─── VOL ─── */}
      {tab === 'flight' && (
        <div className="space-y-2.5">
          {flights.map((f) => {
            const id = `flight-${destinationId}-${f.id}`;
            const priceTotal = f.price * travelers;
            return (
              <div key={f.id} className="flex items-center gap-3 rounded-2xl bg-white p-4" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#0F4C81,#134074)' }}>{f.airlineCode}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{f.departTime} → {f.arriveTime} <span className="font-normal" style={{ color: 'var(--lokadia-gray-400)' }}>· {f.duration}</span></p>
                  <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{f.airline} · {f.stops === 0 ? 'Direct' : `${f.stops} escale`}{f.tag ? ` · ${f.tag}` : ''}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-black" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(priceTotal)}</p>
                  <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>{travelers} pers.</p>
                </div>
                <AddBtn added={has(id)} color={CATEGORY_META.flight.color} onClick={() => add({ id, category: 'flight', title: `${f.airline} → ${destName}`, subtitle: `${f.departTime}-${f.arriveTime} · ${f.stops === 0 ? 'Direct' : f.stops + ' escale'}`, price: priceTotal, meta: `${travelers} voyageur${travelers > 1 ? 's' : ''}`, destinationId })} />
              </div>
            );
          })}
        </div>
      )}

      {tab === 'train' && (
        <div className="space-y-2.5">
          {trains.length === 0 ? <Empty text={`Pas de liaison ferroviaire pertinente — privilégiez l'avion.`} /> : trains.map((t) => <OfferRow key={t.id} o={t} added={has(t.id)} onAdd={() => addCatalog(t)} Icon={Train} />)}
        </div>
      )}
      {tab === 'esim' && <div className="space-y-2.5">{esims.map((e) => <OfferRow key={e.id} o={e} added={has(e.id)} onAdd={() => addCatalog(e)} Icon={Wifi} />)}</div>}
      {tab === 'insurance' && <div className="space-y-2.5">{insurances.map((i) => <OfferRow key={i.id} o={i} added={has(i.id)} onAdd={() => addCatalog(i)} Icon={ShieldCheck} />)}</div>}
      {tab === 'activity' && <div className="space-y-2.5">{activities.map((a) => <OfferRow key={a.id} o={a} added={has(a.id)} onAdd={() => addCatalog(a)} Icon={Ticket} />)}</div>}

      <p className="text-center text-[11px]" style={{ color: 'var(--lokadia-gray-400)' }}>
        Prix estimés · réservation en mode simulation (aucun débit réel)
      </p>

      {/* Barre panier fixe */}
      {count > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-30 border-t bg-white px-5 py-3 lg:bottom-0" style={{ borderColor: 'var(--lokadia-gray-100)', boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>{count} article{count > 1 ? 's' : ''}</p>
              <p className="text-xl font-black" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(total)}</p>
            </div>
            <button onClick={() => navigate('/checkout')} className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white" style={{ background: 'var(--gradient-primary)' }}>
              <ShoppingCart className="h-4 w-4" /> Réserver & payer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ icon: Icon, text, color }: { icon: any; text: string; color: string }) {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Icon className="h-4 w-4" style={{ color }} />
      <h3 className="text-sm font-black" style={{ color: 'var(--lokadia-gray-900)' }}>{text}</h3>
    </div>
  );
}

function AddBtn({ added, color, onClick }: { added: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={added}
      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-90"
      style={{ background: added ? 'rgba(16,185,129,0.12)' : color, color: added ? '#059669' : 'white' }}
      aria-label={added ? 'Ajouté' : 'Ajouter'}>
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
          {o.badge && <span className="rounded-full px-1.5 py-0.5 text-[9px] font-black" style={{ background: `${c}15`, color: c }}>{o.badge}</span>}
        </div>
        <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>{o.subtitle}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-base font-black" style={{ color: 'var(--lokadia-gray-900)' }}>{o.price.toLocaleString('fr-FR')} €</p>
        <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>{o.meta}</p>
      </div>
      <AddBtn added={added} color={c} onClick={onAdd} />
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
