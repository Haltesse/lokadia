import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import type { ItineraryIssue, CheckSeverity } from '../lib/itineraryChecks';

/**
 * ItineraryIssues — ce qui cloche dans l'itinéraire, et quoi y faire.
 *
 * Chaque alerte porte une action concrète : un constat sans issue ne sert
 * à personne. La sévérité n'est jamais portée par la seule couleur —
 * icône et libellé la doublent (a11y daltonisme).
 */

const SEVERITY_META: Record<CheckSeverity, { label: string; color: string; bg: string; Icon: typeof Info }> = {
  blocking: { label: 'Bloquant', color: 'var(--lokadia-danger)', bg: 'rgba(220,38,38,0.10)', Icon: AlertOctagon },
  warning: { label: 'À vérifier', color: 'var(--lokadia-warning)', bg: 'rgba(245,158,11,0.12)', Icon: AlertTriangle },
  info: { label: 'Information', color: '#0369A1', bg: 'rgba(14,165,233,0.10)', Icon: Info },
};

interface Props {
  issues: ItineraryIssue[];
  /** Met en évidence les étapes concernées dans la liste */
  onHighlight?: (stopIds: string[]) => void;
  className?: string;
}

export function ItineraryIssues({ issues, onHighlight, className = '' }: Props) {
  if (issues.length === 0) {
    return (
      <div
        className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 ${className}`}
        style={{ background: 'rgba(5,150,105,0.08)' }}
      >
        <CheckCircle2 size={16} style={{ color: 'var(--lokadia-success)' }} />
        <p className="text-xs font-semibold" style={{ color: 'var(--lokadia-success)' }}>
          Aucune incohérence détectée sur les données disponibles.
        </p>
      </div>
    );
  }

  const blocking = issues.filter((i) => i.severity === 'blocking').length;

  return (
    <section className={`rounded-2xl bg-white ${className}`} style={{ border: '1px solid var(--lokadia-gray-200)' }}>
      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
        <h3 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          {issues.length} point{issues.length > 1 ? 's' : ''} à revoir
          {blocking > 0 && (
            <span className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: SEVERITY_META.blocking.bg, color: SEVERITY_META.blocking.color }}>
              {blocking} bloquant{blocking > 1 ? 's' : ''}
            </span>
          )}
        </h3>
      </div>

      <ul>
        {issues.map((issue) => {
          const meta = SEVERITY_META[issue.severity];
          const Icon = meta.Icon;
          return (
            <li
              key={issue.id}
              className="border-t px-4 py-3 first:border-t-0"
              style={{ borderColor: 'var(--lokadia-gray-100)' }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: meta.bg }}
                >
                  <Icon size={13} style={{ color: meta.color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold" style={{ color: meta.color }}>
                    {meta.label}
                  </p>
                  <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {issue.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
                    {issue.detail}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-relaxed" style={{ color: 'var(--lokadia-primary)' }}>
                    {issue.suggestion}
                  </p>
                  {onHighlight && issue.stopIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onHighlight(issue.stopIds)}
                      className="mt-1.5 text-[11px] font-bold underline"
                      style={{ color: 'var(--lokadia-gray-500)' }}
                    >
                      Voir {issue.stopIds.length > 1 ? 'les étapes' : "l'étape"} concernée{issue.stopIds.length > 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="border-t px-4 py-2.5 text-[11px] leading-relaxed" style={{ borderColor: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-400)' }}>
        Contrôles fondés sur les distances et les dates que vous avez saisies.
        Les horaires d'ouverture et de transport ne sont pas vérifiés.
      </p>
    </section>
  );
}
