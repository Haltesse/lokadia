/**
 * CheckoutScreen — panier + demande de réservation.
 *
 * Aucune saisie de carte ici : Lokadia n'encaisse pas de paiement
 * (pas de statut d'agence de voyage ni d'intégration PSP à ce stade).
 * Le panier est figé en « demande de réservation » avec une référence,
 * et le règlement s'effectue chez les partenaires concernés.
 * Brancher un vrai PSP (Stripe via Edge Function) remplacera ce flux.
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  ArrowLeft, Trash2, CheckCircle2, ShoppingCart, ShieldCheck, Plus, Minus, Handshake,
} from 'lucide-react';
import { useCart, CATEGORY_META } from '../lib/cart';
import { saveTripBooking } from '../lib/tripBookings';

interface ContactDetails {
  fullName: string;
  email: string;
}

function genReference(): string {
  return 'LOKADIA-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 9000 + 1000);
}

function validateContact(d: ContactDetails): string | null {
  if (!d.fullName.trim()) return 'Indiquez votre nom pour retrouver la réservation.';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)) return 'Cette adresse email ne semble pas valide.';
  return null;
}

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  // tripId transmis par l'onglet "Réserver" pour finaliser CE voyage
  const tripId = (location.state as { tripId?: string } | null)?.tripId ?? null;
  const { items, remove, setQty, clear, total, count } = useCart();
  const [details, setDetails] = useState<ContactDetails>({ fullName: '', email: '' });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  const fmt = (n: number) => `${n.toLocaleString('fr-FR')} €`;
  const grand = total;

  function confirmBooking() {
    const validationError = validateContact(details);
    if (validationError) {
      setError(validationError);
      setStatus('error');
      return;
    }
    const ref = genReference();
    if (tripId) {
      saveTripBooking({
        tripId, items: [...items], total: grand,
        reference: ref, bookedAt: new Date().toISOString(),
      });
    }
    setReference(ref);
    setStatus('success');
    clear();
  }

  // ─── Confirmation ───
  if (status === 'success') {
    return (
      <main className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--lokadia-background)' }}>
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CheckCircle2 className="h-9 w-9" style={{ color: '#059669' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Demande enregistrée</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
            Votre sélection est rattachée à votre voyage. Le règlement
            s'effectue directement chez chaque partenaire au moment de la
            réservation finale.
          </p>
          <div className="my-5 rounded-2xl p-4" style={{ background: 'var(--lokadia-info-bg)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>Référence</p>
            <p className="text-lg font-bold" style={{ color: 'var(--lokadia-primary)' }}>{reference}</p>
          </div>
          <button onClick={() => navigate(tripId ? `/trips/${tripId}` : '/trips')} className="w-full rounded-2xl py-3.5 text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
            {tripId ? 'Voir mon voyage finalisé' : 'Voir mes voyages'}
          </button>
          <button onClick={() => navigate('/global-home')} className="mt-2 w-full rounded-2xl py-3 text-sm font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>
            Retour à l'accueil
          </button>
        </div>
      </main>
    );
  }

  // ─── Panier vide ───
  if (count === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--lokadia-background)' }}>
        <div className="text-center">
          <ShoppingCart className="mx-auto mb-3 h-12 w-12" style={{ color: 'var(--lokadia-gray-300)' }} />
          <p className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-700)' }}>Votre panier est vide</p>
          <button onClick={() => navigate('/destination-count')} className="mt-4 rounded-full px-6 py-3 text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
            Explorer les destinations
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-16" style={{ background: 'var(--lokadia-background)' }}>
      <div className="px-5 pt-6 pb-5" style={{ background: 'var(--gradient-primary)' }}>
        <div className="mx-auto max-w-5xl">
          <button onClick={() => navigate(-1)} className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            <ArrowLeft className="h-3.5 w-3.5" /> Continuer mes achats
          </button>
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Panier & réservation</h1>
          <p className="mt-1 text-sm text-white/85">{count} article{count > 1 ? 's' : ''} · {fmt(grand)}</p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-5 pt-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Récap panier */}
        <div className="space-y-2.5">
          {items.map((it) => {
            const c = CATEGORY_META[it.category];
            return (
              <div key={it.id} className="flex items-center gap-3 rounded-2xl bg-white p-4" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl" style={{ background: `${c.color}12` }}><c.Icon className="h-5 w-5" style={{ color: c.color }} /></div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: c.color }}>{c.label}</p>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--lokadia-gray-900)' }}>{it.title}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--lokadia-gray-500)' }}>{it.subtitle}{it.meta ? ` · ${it.meta}` : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setQty(it.id, it.qty - 1)} aria-label="Réduire la quantité" className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--lokadia-gray-100)' }}><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-6 text-center text-sm font-bold tabular-nums">{it.qty}</span>
                  <button onClick={() => setQty(it.id, it.qty + 1)} aria-label="Augmenter la quantité" className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--lokadia-gray-100)' }}><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <div className="w-20 text-right">
                  <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(it.price * it.qty)}</p>
                </div>
                <button onClick={() => remove(it.id)} aria-label="Retirer du panier" className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>

        {/* Demande de réservation */}
        <aside className="lg:sticky lg:top-6 h-fit space-y-4 rounded-3xl bg-white p-6" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm"><span style={{ color: 'var(--lokadia-gray-600)' }}>Sous-total</span><span className="font-bold">{fmt(total)}</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: 'var(--lokadia-gray-600)' }}>Frais de service</span><span className="font-bold" style={{ color: '#059669' }}>Offerts</span></div>
            <div className="flex justify-between border-t pt-2 text-base font-bold" style={{ borderColor: 'var(--lokadia-gray-100)' }}><span>Total estimé</span><span>{fmt(grand)}</span></div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl p-3.5" style={{ background: 'var(--lokadia-info-bg)' }}>
            <Handshake className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--lokadia-info)' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
              <strong>Réservation via nos partenaires.</strong> Aucun paiement
              n'est prélevé ici : le règlement s'effectue directement chez
              chaque partenaire, aux prix affichés par celui-ci.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <input
              type="text"
              placeholder="Nom complet"
              autoComplete="name"
              value={details.fullName}
              onChange={(e) => { setDetails({ ...details, fullName: e.target.value }); if (status === 'error') setStatus('idle'); }}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ border: '1px solid var(--lokadia-gray-200)' }}
            />
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              inputMode="email"
              value={details.email}
              onChange={(e) => { setDetails({ ...details, email: e.target.value }); if (status === 'error') setStatus('idle'); }}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ border: '1px solid var(--lokadia-gray-200)' }}
            />
          </div>

          {status === 'error' && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button onClick={confirmBooking} className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white" style={{ background: 'var(--gradient-primary)' }}>
            <ShieldCheck className="h-4 w-4" /> Confirmer ma demande
          </button>

          <p className="text-center text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
            Votre sélection est enregistrée sur cet appareil et rattachée à
            votre voyage.
          </p>
        </aside>
      </div>
    </main>
  );
}
