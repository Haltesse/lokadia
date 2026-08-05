import { getLokascoreLevel } from '../lib/lokascore';
import type { DimensionSources } from '../hooks/useLokascore';

/**
 * LokascoreBadge — SEUL affichage autorisé du Lokascore.
 *
 * Contrainte produit (juridique) : le score ne s'affiche jamais nu.
 * Chaque variante porte : la valeur + le libellé de niveau (jamais la
 * couleur seule), la mention « indicatif », la/les source(s) et la date
 * de mise à jour (inline/full ; en variante chip compacte, sources et
 * date sont dans l'infobulle et l'aria-label).
 *
 * Toute nouvelle surface qui montre le score DOIT passer par ce composant.
 */

interface LokascoreBadgeProps {
  score: number | null;
  /** Squelette de chargement si true et score encore null */
  loading?: boolean;
  /** Sources par dimension renvoyées par useLokascore (noms uniquement) */
  sources?: DimensionSources | null;
  /** Date de mise à jour déjà formatée (useLokascore.lastUpdate) */
  lastUpdate?: string;
  /**
   * chip   — pastille compacte pour cartes/listes (sources + date en infobulle)
   * inline — une ligne : score, niveau, « indicatif », MAJ
   * full   — bloc complet : score, niveau, mention, sources, date
   */
  variant?: 'chip' | 'inline' | 'full';
  className?: string;
}

/** Liste plate et dédupliquée des noms de sources. */
function flatSources(sources?: DimensionSources | null): string[] {
  if (!sources) return [];
  return [...new Set([
    ...sources.security,
    ...sources.health,
    ...sources.nature,
    ...sources.infrastructure,
  ])];
}

export function LokascoreBadge({
  score,
  loading = false,
  sources,
  lastUpdate,
  variant = 'chip',
  className = '',
}: LokascoreBadgeProps) {
  const level = getLokascoreLevel(score);
  const Icon = level.Icon;
  const srcList = flatSources(sources);
  const srcText = srcList.length > 0 ? srcList.join(', ') : 'sources officielles';
  const majText = lastUpdate ? `MAJ ${lastUpdate}` : '';
  const tooltip =
    score === null
      ? 'Lokascore indisponible'
      : `Lokascore ${score}/100 — ${level.label} (indicatif). Sources : ${srcText}.${majText ? ` ${majText}.` : ''}`;

  // ─── Chargement ───
  if (loading && score === null) {
    if (variant === 'chip') {
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-md ${className}`}>
          <span className="lk-skeleton h-3.5 w-3.5 rounded-full" />
          <span className="lk-skeleton h-2.5 w-10 rounded" />
        </span>
      );
    }
    return <span className={`lk-skeleton inline-block h-5 w-40 rounded ${className}`} />;
  }

  // ─── Chip compact (cartes) ───
  if (variant === 'chip') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[.92] backdrop-blur-md shadow-md ${className}`}
        title={tooltip}
        aria-label={tooltip}
      >
        <Icon className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} style={{ color: level.fillColor }} aria-hidden />
        <span className="text-xs font-bold tabular-nums leading-none" style={{ color: 'var(--lokadia-gray-900)' }}>
          {score ?? '--'}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-wide leading-none" style={{ color: 'var(--lokadia-gray-500)' }}>
          indicatif
        </span>
      </span>
    );
  }

  // ─── Inline (lignes de liste) ───
  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-2 flex-wrap ${className}`} title={tooltip}>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ background: level.bgColor }}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2.5} style={{ color: level.color }} aria-hidden />
          <span className="text-xs font-bold tabular-nums" style={{ color: level.color }}>
            {score ?? '--'}
          </span>
          <span className="text-xs font-semibold" style={{ color: level.color }}>
            {level.label}
          </span>
        </span>
        <span className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
          indicatif{majText ? ` · ${majText}` : ''}
        </span>
      </span>
    );
  }

  // ─── Full (fiche destination) ───
  return (
    <div className={className}>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{ background: level.bgColor }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.5} style={{ color: level.color }} aria-hidden />
          <span className="text-sm font-bold" style={{ color: level.color }}>
            {level.label}
          </span>
        </span>
        <span
          className="text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
          style={{ color: 'var(--lokadia-gray-600)', background: 'var(--lokadia-gray-100, #F3F4F6)' }}
        >
          Score indicatif
        </span>
      </div>
      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--lokadia-gray-500)' }}>
        Sources : {srcText}
        {majText ? ` · ${majText}` : ''}
      </p>
    </div>
  );
}
