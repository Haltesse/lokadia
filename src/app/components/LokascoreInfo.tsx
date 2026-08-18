/**
 * LokascoreInfo — encart explicatif affiché sous le Lokascore
 * sur la page d'une destination.
 *
 * Explique en clair :
 *   1. Comment le score est calculé : 4 dimensions agrégées côté serveur
 *      à partir de sources officielles et institutionnelles
 *   2. Liens cliquables vers les vraies sources consultables par
 *      l'utilisateur (France Diplomatie, OMS, GDACS, OSAC, CDC…)
 *
 * Aucune donnée inventée — chaque source mène à la vraie page officielle.
 */
import { useState } from 'react';
import {
  Info,
  ChevronDown,
  ExternalLink,
  Database,
  Shield,
  Heart,
  AlertTriangle,
} from 'lucide-react';
import {
  getOfficialSources,
  LOKASCORE_METHODOLOGY,
  type SourceCategory,
} from '../lib/officialSources';

interface Props {
  cityName: string;
  countryName: string;
  /** Score actuel pour montrer dans quel seuil il se situe */
  score: number | null;
}

const CATEGORY_META: Record<
  SourceCategory,
  { label: string; color: string; bg: string; Icon: typeof Database }
> = {
  data: { label: 'Données', color: 'var(--lokadia-category-safety)', bg: 'var(--lokadia-category-safety-bg)', Icon: Database },
  security: {
    label: 'Sécurité',
    color: 'var(--lokadia-category-culture)',
    bg: 'var(--lokadia-category-culture-bg)',
    Icon: Shield,
  },
  health: { label: 'Santé', color: 'var(--lokadia-category-transport)', bg: 'var(--lokadia-category-transport-bg)', Icon: Heart },
  disaster: {
    label: 'Catastrophes',
    color: 'var(--lokadia-danger)',
    bg: 'var(--lokadia-danger-bg)',
    Icon: AlertTriangle,
  },
};

export function LokascoreInfo({ cityName, countryName, score }: Props) {
  const [open, setOpen] = useState(false);
  const sources = getOfficialSources(cityName, countryName);

  // Trouver dans quel seuil se situe le score
  const currentThreshold = score !== null
    ? LOKASCORE_METHODOLOGY.thresholds.find(
        (t) => score >= t.min && score <= t.max,
      )
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header cliquable */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
          <Info className="text-blue-700" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight">
            Comment ce score est-il calculé ?
          </p>
          <p className="text-xs text-gray-500 leading-tight mt-0.5">
            Méthodologie & {sources.length} sources officielles consultables
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
          {/* ─── Méthodologie ─── */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Méthodologie
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              Le <strong>Lokascore</strong> est un indice{' '}
              <strong>indicatif</strong> de{' '}
              <strong>{LOKASCORE_METHODOLOGY.scoreRange}</strong>, calculé côté
              serveur en agrégeant quatre dimensions à partir de sources
              officielles et institutionnelles, puis enrichi en temps réel par
              les conseils aux voyageurs.
            </p>
            <ul className="space-y-1">
              {LOKASCORE_METHODOLOGY.dimensions.map((d) => (
                <li key={d.id} className="text-xs text-gray-600 leading-relaxed">
                  <strong className="text-gray-800">{d.label}</strong> — {d.sources}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-600 leading-relaxed">
              Les données sont rafraîchies automatiquement toutes les{' '}
              <strong>{LOKASCORE_METHODOLOGY.refreshInterval}</strong>. Plus le
              score est haut, plus la destination est considérée comme sûre.
              Ce score est indicatif : il ne remplace pas les recommandations
              officielles listées ci-dessous.
            </p>
          </div>

          {/* ─── Échelle des scores ─── */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Échelle de lecture
            </h4>
            <div className="space-y-1.5">
              {LOKASCORE_METHODOLOGY.thresholds.map((t) => {
                const isCurrent = currentThreshold?.level === t.level;
                return (
                  <div
                    key={t.level}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                      isCurrent ? 'ring-2 ring-offset-1' : ''
                    }`}
                    style={{
                      background: isCurrent ? `${t.color}15` : '#F9FAFB',
                      ...(isCurrent ? { '--tw-ring-color': t.color } as React.CSSProperties : {}),
                    }}
                  >
                    <div
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0"
                      style={{ background: t.color }}
                    >
                      {t.min}–{t.max}
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isCurrent ? t.color : '#374151' }}
                    >
                      {t.label}
                      {isCurrent && ' · destination actuelle'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Sources officielles consultables ─── */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Sources officielles à consulter
            </h4>
            <p className="text-xs text-gray-500">
              Cliquez pour vérifier directement chez la source.
            </p>
            <div className="space-y-2">
              {sources.map((source) => {
                const meta = CATEGORY_META[source.category];
                const Icon = meta.Icon;
                return (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-[0.99]"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: meta.bg }}
                    >
                      <Icon size={16} style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900 leading-tight">
                          {source.name}
                        </p>
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                          style={{ background: meta.bg, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-gray-600 mt-0.5">
                        {source.organization}
                      </p>
                      <p className="text-xs text-gray-500 leading-snug mt-1">
                        {source.description}
                      </p>
                    </div>
                    <ExternalLink
                      size={14}
                      className="text-gray-400 flex-shrink-0 mt-1"
                    />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Note de transparence */}
          <p className="text-[10px] text-center text-gray-400 italic px-2">
            Lokadia agrège ces sources publiques pour vous faire gagner du
            temps. Aucune information n'est inventée — chaque lien mène
            directement au site officiel de la source.
          </p>
        </div>
      )}
    </div>
  );
}
