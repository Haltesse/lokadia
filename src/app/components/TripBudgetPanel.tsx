import { useMemo, useState } from 'react';
import { Wallet, Users, CalendarDays, Layers, Info } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

/**
 * TripBudgetPanel — budget prévisionnel, lu sous trois angles.
 *
 * Le même montant ne répond pas à la même question selon qu'on prépare
 * un budget global, qu'on compare une journée à une autre, ou qu'on
 * annonce sa part à chaque voyageur. Les trois vues sont donc explicites
 * plutôt que laissées au calcul mental.
 *
 * Les montants sont estimés en euros puis convertis dans la devise
 * choisie, avec les taux du CurrencyContext. L'origine des estimations
 * est affichée : un budget dont on ignore les hypothèses ne sert à rien.
 */

export interface BudgetBreakdown {
  /** Transport, pour l'ensemble du groupe — valeur centrale de la fourchette. */
  flights: number;
  hotel: number;
  food: number;
  activities: number;
  total: number;
  /** Bornes du total. Affichées telles quelles : le centre seul ferait croire à une précision qu'aucune estimation n'a. */
  low: number;
  high: number;
  /** Hypothèses de calcul, affichées sous le montant. */
  method: string;
}

interface Props {
  budget: BudgetBreakdown;
  travelers: number;
  nights: number;
  className?: string;
}

type View = 'category' | 'day' | 'person';

const CATEGORY_META: Array<{ key: 'flights' | 'hotel' | 'food' | 'activities'; label: string; color: string }> = [
  { key: 'flights', label: 'Transport', color: '#8B5CF6' },
  { key: 'hotel', label: 'Hébergement', color: '#06B6D4' },
  { key: 'food', label: 'Restauration', color: '#F59E0B' },
  { key: 'activities', label: 'Activités', color: '#EC4899' },
];

export function TripBudgetPanel({ budget, travelers, nights, className = '' }: Props) {
  const { formatAmount, selectedCurrency } = useCurrency();
  const [view, setView] = useState<View>('category');

  const rows = useMemo(() => {
    const days = Math.max(1, nights);
    const people = Math.max(1, travelers);

    if (view === 'category') {
      return CATEGORY_META.map((c) => ({
        key: c.key,
        label: c.label,
        color: c.color,
        amount: budget[c.key],
        share: budget.total > 0 ? budget[c.key] / budget.total : 0,
      }));
    }

    if (view === 'person') {
      return CATEGORY_META.map((c) => ({
        key: c.key,
        label: c.label,
        color: c.color,
        amount: budget[c.key] / people,
        share: budget.total > 0 ? budget[c.key] / budget.total : 0,
      }));
    }

    // Par jour : seules les dépenses récurrentes se divisent par nuitée.
    // Le transport et les essentiels sont ponctuels — les étaler donnerait
    // un chiffre journalier faux.
    return [
      {
        key: 'hotel' as const, label: 'Hébergement / nuit', color: '#06B6D4',
        amount: budget.hotel / days, share: 0,
      },
      {
        key: 'food' as const, label: 'Restauration / jour', color: '#F59E0B',
        amount: budget.food / days, share: 0,
      },
      {
        key: 'activities' as const, label: 'Activités / jour', color: '#EC4899',
        amount: budget.activities / days, share: 0,
      },
    ];
  }, [budget, travelers, nights, view]);

  const headline = useMemo(() => {
    if (view === 'person') return budget.total / Math.max(1, travelers);
    if (view === 'day') return (budget.hotel + budget.food + budget.activities) / Math.max(1, nights);
    return budget.total;
  }, [budget, travelers, nights, view]);

  const headlineLabel =
    view === 'person' ? `par personne (${travelers})`
      : view === 'day' ? `par jour sur place (${nights} nuit${nights > 1 ? 's' : ''})`
        : 'total du voyage';

  const VIEWS: Array<{ id: View; label: string; Icon: typeof Layers }> = [
    { id: 'category', label: 'Par catégorie', Icon: Layers },
    { id: 'day', label: 'Par jour', Icon: CalendarDays },
    { id: 'person', label: 'Par personne', Icon: Users },
  ];

  return (
    <section
      className={`rounded-2xl bg-white ${className}`}
      style={{ border: '1px solid var(--lokadia-gray-200)' }}
      aria-label="Budget prévisionnel"
    >
      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            <Wallet size={15} /> Budget prévisionnel
          </h3>
          <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-400)' }}>
            {selectedCurrency}
          </span>
        </div>
        <p className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--lokadia-primary)' }}>
          {view === 'category'
            ? `${formatAmount(budget.low, 'EUR')} – ${formatAmount(budget.high, 'EUR')}`
            : formatAmount(headline, 'EUR')}
        </p>
        <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
          {headlineLabel} · estimation
        </p>
        <p className="mt-1 text-[10px] leading-snug" style={{ color: 'var(--lokadia-gray-400)' }}>
          {budget.method}
        </p>
      </div>

      <div className="flex gap-1.5 px-4 pt-3" role="tablist" aria-label="Angle de lecture du budget">
        {VIEWS.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{
              background: view === id ? 'var(--lokadia-primary)' : 'white',
              color: view === id ? 'white' : 'var(--lokadia-gray-600)',
              border: '1px solid ' + (view === id ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)'),
            }}
          >
            <Icon size={11} /> {label}
          </button>
        ))}
      </div>

      <ul className="space-y-2 px-4 py-3">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold" style={{ color: 'var(--lokadia-gray-700)' }}>
                {row.label}
              </span>
              <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>
                {formatAmount(row.amount, 'EUR')}
              </span>
            </div>
            {view !== 'day' && row.share > 0 && (
              <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--lokadia-gray-100)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.round(row.share * 100)}%`, background: row.color }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      <p
        className="flex items-start gap-1.5 border-t px-4 py-2.5 text-[11px] leading-relaxed"
        style={{ borderColor: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-400)' }}
      >
        <Info size={11} className="mt-0.5 flex-shrink-0" />
        <span>
          Estimation à partir des modes de transport choisis, d'un hébergement
          moyen et d'un forfait quotidien restauration/activités. Vue « par jour » :
          seules les dépenses récurrentes sont divisées — transport et essentiels
          sont ponctuels.
        </span>
      </p>
    </section>
  );
}
