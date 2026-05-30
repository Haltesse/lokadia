/**
 * CheckoutScreen — panier + paiement in-app (aucune redirection).
 *
 * Récap par catégorie, infos voyageur, formulaire de carte, paiement via
 * paymentService (simulé, branchable Stripe), puis confirmation avec
 * référence de commande. Le panier est vidé après succès.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft, Lock, Trash2, CheckCircle2, ShoppingCart, ShieldCheck, Plus, Minus,
} from 'lucide-react';
import { useCart, CATEGORY_META } from '../lib/cart';
import { processPayment, type PaymentDetails } from '../lib/paymentService';

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const { items, remove, setQty, clear, total, count } = useCart();
  // Pré-rempli avec une carte de test pour une démo investisseur fluide
  // (carte ne finissant pas par 0000 → paiement accepté en simulation).
  const [details, setDetails] = useState<PaymentDetails>({
    fullName: 'Tanguy Fillon', email: 'demo@lokadia.fr',
    cardNumber: '4242 4242 4242 4242', expiry: '12/28', cvc: '123',
  });
  const [status, setStatus] = useState<'idle' | 'paying' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  const fmt = (n: number) => `${n.toLocaleString('fr-FR')} €`;
  const fees = items.length > 0 ? Math.max(0, Math.round(total * 0.0)) : 0; // pas de frais de service en démo
  const grand = total + fees;

  async function pay() {
    setStatus('paying'); setError('');
    const res = await processPayment(grand, items, details);
    if (res.ok) { setReference(res.reference!); setStatus('success'); clear(); }
    else { setError(res.error ?? 'Erreur de paiement'); setStatus('error'); }
  }

  // ─── Confirmation ───
  if (status === 'success') {
    return (
      <main className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--lokadia-background)' }}>
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CheckCircle2 className="h-9 w-9" style={{ color: '#059669' }} />
          </div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--lokadia-gray-900)' }}>Réservation confirmée 🎉</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
            Votre voyage est réservé. Un récapitulatif a été envoyé par email.
          </p>
          <div className="my-5 rounded-2xl p-4" style={{ background: 'var(--lokadia-info-bg)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>Référence</p>
            <p className="text-lg font-black" style={{ color: 'var(--lokadia-primary)' }}>{reference}</p>
          </div>
          <button onClick={() => navigate('/trips')} className="w-full rounded-2xl py-3.5 text-sm font-black text-white" style={{ background: 'var(--gradient-primary)' }}>
            Voir mes voyages
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
          <p className="text-lg font-black" style={{ color: 'var(--lokadia-gray-700)' }}>Votre panier est vide</p>
          <button onClick={() => navigate('/destination-count')} className="mt-4 rounded-full px-6 py-3 text-sm font-black text-white" style={{ background: 'var(--gradient-primary)' }}>
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
          <h1 className="text-2xl font-black text-white lg:text-3xl">Panier & paiement</h1>
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
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg" style={{ background: `${c.color}12` }}>{c.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: c.color }}>{c.label}</p>
                  <p className="text-sm font-bold truncate" style={{ color: 'var(--lokadia-gray-900)' }}>{it.title}</p>
                  <p className="text-[11px] truncate" style={{ color: 'var(--lokadia-gray-500)' }}>{it.subtitle}{it.meta ? ` · ${it.meta}` : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setQty(it.id, it.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--lokadia-gray-100)' }}><Minus className="h-3.5 w-3.5" /></button>
                  <span className="w-6 text-center text-sm font-bold tabular-nums">{it.qty}</span>
                  <button onClick={() => setQty(it.id, it.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: 'var(--lokadia-gray-100)' }}><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <div className="w-20 text-right">
                  <p className="text-sm font-black" style={{ color: 'var(--lokadia-gray-900)' }}>{fmt(it.price * it.qty)}</p>
                </div>
                <button onClick={() => remove(it.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            );
          })}
        </div>

        {/* Paiement */}
        <aside className="lg:sticky lg:top-6 h-fit space-y-4 rounded-3xl bg-white p-6" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm"><span style={{ color: 'var(--lokadia-gray-600)' }}>Sous-total</span><span className="font-bold">{fmt(total)}</span></div>
            <div className="flex justify-between text-sm"><span style={{ color: 'var(--lokadia-gray-600)' }}>Frais de service</span><span className="font-bold" style={{ color: '#059669' }}>Offerts</span></div>
            <div className="flex justify-between border-t pt-2 text-base font-black" style={{ borderColor: 'var(--lokadia-gray-100)' }}><span>Total</span><span>{fmt(grand)}</span></div>
          </div>

          <div className="space-y-3 pt-2">
            <input type="text" placeholder="Nom complet" value={details.fullName} onChange={(e) => setDetails({ ...details, fullName: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ border: '1px solid var(--lokadia-gray-200)' }} />
            <input type="email" placeholder="Email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ border: '1px solid var(--lokadia-gray-200)' }} />
            <input inputMode="numeric" placeholder="Numéro de carte" value={details.cardNumber} onChange={(e) => setDetails({ ...details, cardNumber: e.target.value })} className="w-full rounded-xl px-4 py-3 text-sm outline-none" style={{ border: '1px solid var(--lokadia-gray-200)' }} />
            <div className="flex gap-3">
              <input inputMode="numeric" placeholder="MM/AA" value={details.expiry} onChange={(e) => setDetails({ ...details, expiry: e.target.value })} className="w-1/2 rounded-xl px-4 py-3 text-sm outline-none" style={{ border: '1px solid var(--lokadia-gray-200)' }} />
              <input inputMode="numeric" placeholder="CVC" value={details.cvc} onChange={(e) => setDetails({ ...details, cvc: e.target.value })} className="w-1/2 rounded-xl px-4 py-3 text-sm outline-none" style={{ border: '1px solid var(--lokadia-gray-200)' }} />
            </div>
          </div>

          {status === 'error' && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button onClick={pay} disabled={status === 'paying'} className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white" style={{ background: 'var(--gradient-primary)', opacity: status === 'paying' ? 0.7 : 1 }}>
            {status === 'paying' ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Paiement…</>
            ) : (
              <><Lock className="h-4 w-4" /> Payer {fmt(grand)}</>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#059669' }} />
            Paiement sécurisé · mode démo (carte de test pré-remplie, aucun débit réel)
          </div>
        </aside>
      </div>
    </main>
  );
}
