import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Loader2, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Page « Noter l'application ».
 *
 * Trois partis pris :
 *
 *  · **L'avis est vraiment enregistré.** Un écran de notation qui répond
 *    « merci ! » sans rien conserver est une politesse, pas un retour
 *    utilisateur — et le reste du produit a passé plusieurs lots à retirer
 *    ce genre de faux boutons.
 *
 *  · **Un avis par compte, modifiable.** Sans compte, rien n'empêche de
 *    déposer mille notes ; avec modération, il faudrait quelqu'un pour
 *    modérer. Le compte est le compromis tenable.
 *
 *  · **La moyenne ne s'affiche qu'à partir de dix avis.** Un « 5,0 »
 *    calculé sur deux votes est un argument commercial, pas une
 *    information.
 */

const LABELS: Record<number, string> = {
  1: 'À côté de la plaque',
  2: 'Décevant',
  3: 'Correct',
  4: 'Utile',
  5: 'Indispensable',
};

export default function RateScreen() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [existing, setExisting] = useState(false);
  const [summary, setSummary] = useState<{ total: number; average: number | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data: agg } = await supabase.rpc('app_rating_summary');
    const row = Array.isArray(agg) ? agg[0] : null;
    setSummary(
      row ? { total: Number(row.total ?? 0), average: row.average === null ? null : Number(row.average) } : null,
    );

    if (user) {
      const { data } = await supabase
        .from('app_ratings')
        .select('rating,comment')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setRating(data.rating);
        setComment(data.comment ?? '');
        setExisting(true);
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit() {
    if (!user || rating === 0) return;
    setBusy(true);
    setMessage('');
    try {
      const { error } = await supabase.from('app_ratings').upsert(
        {
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
        },
        { onConflict: 'user_id' },
      );
      if (error) throw error;
      setExisting(true);
      setMessage('Avis enregistré. Merci — il est lu.');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!user) return;
    setBusy(true);
    try {
      await supabase.from('app_ratings').delete().eq('user_id', user.id);
      setRating(0);
      setComment('');
      setExisting(false);
      setMessage('Avis supprimé.');
      await load();
    } finally {
      setBusy(false);
    }
  }

  const shown = hover || rating;

  return (
    <main className="mx-auto max-w-2xl px-5 pb-16 pt-8">
      <h1 className="text-2xl font-bold lg:text-3xl" style={{ color: 'var(--lokadia-gray-900)' }}>
        Noter Lokadia
      </h1>
      <p className="mt-3 text-[15px] leading-7" style={{ color: 'var(--lokadia-gray-600)' }}>
        Votre avis sert à décider quoi construire ensuite. Il est enregistré et
        relu — ce n'est pas un formulaire décoratif.
      </p>

      {/* Moyenne publique, affichée seulement quand elle veut dire quelque chose */}
      {!loading && summary && (
        <p className="mt-2 text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
          {summary.average !== null
            ? `${summary.average.toString().replace('.', ',')} / 5 sur ${summary.total} avis.`
            : `${summary.total} avis déposé${summary.total > 1 ? 's' : ''} — la moyenne s'affichera à partir de dix, en dessous elle ne voudrait rien dire.`}
        </p>
      )}

      {!user ? (
        <section
          className="mt-6 rounded-2xl p-5"
          style={{ background: 'var(--lokadia-info-bg)', border: '1px solid var(--lokadia-gray-100)' }}
        >
          <p className="text-sm leading-6" style={{ color: 'var(--lokadia-gray-700)' }}>
            Il faut être connecté pour déposer un avis : un avis par compte, c'est
            ce qui empêche le formulaire de se remplir tout seul. Vous pourrez le
            modifier ou le supprimer à tout moment.
          </p>
          <Link
            to="/login"
            className="lk-btn mt-3 inline-flex rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={{ background: 'var(--lokadia-primary)' }}
          >
            Se connecter
          </Link>
        </section>
      ) : (
        <section
          className="mt-6 rounded-2xl bg-white p-5"
          style={{ border: '1px solid var(--lokadia-gray-100)' }}
        >
          {loading ? (
            <div className="lk-skeleton h-10 w-48 rounded-xl" />
          ) : (
            <>
              <div
                role="radiogroup"
                aria-label="Note sur cinq"
                className="flex items-center gap-1"
                onMouseLeave={() => setHover(0)}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} sur 5 — ${LABELS[value]}`}
                    onMouseEnter={() => setHover(value)}
                    onFocus={() => setHover(value)}
                    onClick={() => setRating(value)}
                    className="rounded-lg p-1.5 transition-transform hover:scale-110"
                  >
                    <Star
                      size={30}
                      strokeWidth={1.8}
                      style={{
                        color: value <= shown ? 'var(--lokadia-warning)' : 'var(--lokadia-gray-300)',
                        fill: value <= shown ? 'var(--lokadia-warning)' : 'transparent',
                      }}
                    />
                  </button>
                ))}
                {shown > 0 && (
                  <span className="ml-2 text-sm font-semibold" style={{ color: 'var(--lokadia-gray-700)' }}>
                    {LABELS[shown]}
                  </span>
                )}
              </div>

              <label
                htmlFor="rate-comment"
                className="mt-5 block text-sm font-semibold"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                Ce qui vous a manqué, ou ce qui vous a servi (facultatif)
              </label>
              <textarea
                id="rate-comment"
                value={comment}
                maxLength={1000}
                onChange={(event) => setComment(event.target.value)}
                rows={4}
                placeholder="Le plus utile pour nous : ce que vous avez cherché sans le trouver."
                className="mt-1.5 w-full rounded-xl border p-3 text-sm"
                style={{
                  borderColor: 'var(--lokadia-gray-200)',
                  background: 'var(--lokadia-surface)',
                  color: 'var(--lokadia-gray-900)',
                }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                {comment.length}/1000
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={busy || rating === 0}
                  className="lk-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: 'var(--lokadia-primary)' }}
                >
                  {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {existing ? "Mettre à jour mon avis" : 'Envoyer mon avis'}
                </button>

                {existing && (
                  <button
                    type="button"
                    onClick={() => void remove()}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold disabled:opacity-50"
                    style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-600)' }}
                  >
                    <Trash2 size={15} /> Supprimer
                  </button>
                )}
              </div>

              {message && (
                <p className="mt-3 text-sm font-semibold" role="status" style={{ color: 'var(--lokadia-success)' }}>
                  {message}
                </p>
              )}
            </>
          )}
        </section>
      )}

      <p className="mt-5 text-xs leading-5" style={{ color: 'var(--lokadia-gray-500)' }}>
        Votre note et votre commentaire sont rattachés à votre compte, lisibles
        par vous seul·e depuis cette page, et supprimables d'un clic. Ils ne sont
        jamais publiés à votre nom.{' '}
        <Link to="/confidentialite" className="underline" style={{ color: 'var(--lokadia-primary)' }}>
          Politique de confidentialité
        </Link>
      </p>
    </main>
  );
}
