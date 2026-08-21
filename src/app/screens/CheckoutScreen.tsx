/**
 * CheckoutScreen — récapitulatif du budget prévisionnel.
 *
 * Cet écran s'appelait « Panier & réservation » et produisait une « Demande
 * enregistrée » avec une référence de la forme LOKADIA-XXXX-1234. Rien n'était
 * pourtant envoyé nulle part : la référence était fabriquée localement et le
 * contenu stocké dans le navigateur. Un numéro de dossier qui ne correspond à
 * aucun dossier vaut moins que pas de numéro du tout.
 *
 * Il ne reste donc que ce qui est vrai : la liste des postes retenus, leur
 * fourchette, la méthode de chacun, et l'enregistrement du plan sur l'appareil
 * pour le retrouver depuis le voyage.
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Trash2, CheckCircle2, Wallet, Handshake, Save } from 'lucide-react';
import { useCart, CATEGORY_META } from '../lib/cart';
import { saveTripBooking } from '../lib/tripBookings';
import { formatRange } from '../lib/travelOffers';

export default function CheckoutScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  // tripId transmis par l'onglet budget pour rattacher le plan à CE voyage
  const tripId = (location.state as { tripId?: string } | null)?.tripId ?? null;
  const { items, remove, clear, total, count } = useCart();
  const [saved, setSaved] = useState(false);

  function savePlan() {
    if (tripId) {
      saveTripBooking({
        tripId,
        items: [...items],
        total,
        savedAt: new Date().toISOString(),
      });
    }
    setSaved(true);
  }

  // ─── Confirmation ───
  if (saved) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--lokadia-background)' }}>
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <CheckCircle2 className="h-9 w-9" style={{ color: '#059669' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Budget enregistré</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
            {tripId
              ? 'Votre plan est rattaché à ce voyage et consultable depuis son onglet budget.'
              : 'Votre plan est enregistré sur cet appareil.'}{' '}
            Aucune réservation n'a été faite : elle se fait chez les partenaires,
            aux prix qu'ils affichent.
          </p>
          <div className="my-5 rounded-2xl p-4" style={{ background: 'var(--lokadia-info-bg)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
              Total estimé
            </p>
            <p className="text-lg font-bold" style={{ color: 'var(--lokadia-primary)' }}>{formatRange(total)}</p>
          </div>
          <button
            onClick={() => navigate(tripId ? `/trips/${tripId}` : '/trips')}
            className="w-full rounded-2xl py-3.5 text-sm font-bold text-white"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {tripId ? 'Voir mon voyage' : 'Voir mes voyages'}
          </button>
          <button
            onClick={() => { clear(); navigate('/global-home'); }}
            className="mt-2 w-full rounded-2xl py-3 text-sm font-bold"
            style={{ color: 'var(--lokadia-gray-600)' }}
          >
            Retour à l'accueil
          </button>
        </div>
      </main>
    );
  }

  // ─── Plan vide ───
  if (count === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--lokadia-background)' }}>
        <div className="text-center">
          <Wallet className="mx-auto mb-3 h-12 w-12" style={{ color: 'var(--lokadia-gray-300)' }} />
          <p className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-700)' }}>
            Aucun poste dans votre budget
          </p>
          <button
            onClick={() => navigate('/destination-count')}
            className="mt-4 rounded-full px-6 py-3 text-sm font-bold text-white"
            style={{ background: 'var(--gradient-primary)' }}
          >
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
          <button
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Continuer
          </button>
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Budget prévisionnel</h1>
          <p className="mt-1 text-sm text-white/85">
            {count} poste{count > 1 ? 's' : ''} · {formatRange(total)}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-6 px-5 pt-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-2.5">
          {items.map((line) => {
            const meta = CATEGORY_META[line.category];
            return (
              <div
                key={line.id}
                className="flex items-start gap-3 rounded-2xl bg-white p-4"
                style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${meta.color}12` }}
                >
                  <meta.Icon className="h-5 w-5" style={{ color: meta.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{line.label}</p>
                  <p className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--lokadia-gray-500)' }}>
                    {line.method}
                  </p>
                </div>
                <div className="w-28 flex-shrink-0 text-right">
                  <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {formatRange(line)}
                  </p>
                </div>
                <button
                  onClick={() => remove(line.id)}
                  aria-label="Retirer ce poste"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        <aside
          className="lg:sticky lg:top-6 h-fit space-y-4 rounded-3xl bg-white p-6"
          style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}
        >
          <div className="flex justify-between border-b pb-3 text-base font-bold" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <span>Total estimé</span>
            <span>{formatRange(total)}</span>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl p-3.5" style={{ background: 'var(--lokadia-info-bg)' }}>
            <Handshake className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: 'var(--lokadia-info)' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
              <strong>Lokadia ne vend rien.</strong> Ces montants sont des
              estimations calculées à partir de la distance, de la durée et du
              coût de la vie local. La réservation et le paiement se font chez
              les partenaires, aux prix qu'ils affichent.
            </p>
          </div>

          <button
            onClick={savePlan}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <Save className="h-4 w-4" /> Enregistrer ce budget
          </button>

          <p className="text-center text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
            Enregistré sur cet appareil, rien n'est transmis.
          </p>
        </aside>
      </div>
    </main>
  );
}
