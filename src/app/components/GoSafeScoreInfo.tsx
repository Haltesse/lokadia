/**
 * GoSafeScoreInfo — encart explicatif affiché sous le GoSafe Score
 * sur la page d'une destination.
 *
 * Explique en clair :
 *   1. Comment le score est calculé (formule + source primaire)
 *   2. Liens cliquables vers les vraies sources officielles consultables
 *      par l'utilisateur (Numbeo, France Diplomatie, OMS, GDACS, OSAC, CDC)
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
  GOSAFE_METHODOLOGY,
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
  data: { label: 'Données', color: '#1E40AF', bg: '#DBEAFE', Icon: Database },
  security: {
    label: 'Sécurité',
    color: '#92400E',
    bg: '#FEF3C7',
    Icon: Shield,
  },
  health: { label: 'Santé', color: '#6D28D9', bg: '#EDE9FE', Icon: Heart },
  disaster: {
    label: 'Catastrophes',
    color: '#991B1B',
    bg: '#FEE2E2',
    Icon: AlertTriangle,
  },
};

export function GoSafeScoreInfo({ cityName, countryName, score }: Props) {
  const [open, setOpen] = useState(false);
  const sources = getOfficialSources(cityName, countryName);

  // Trouver dans quel seuil se situe le score
  const currentThreshold = score
    ? GOSAFE_METHODOLOGY.thresholds.find(
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
              Le <strong>GoSafe Score</strong> est un indice de{' '}
              <strong>{GOSAFE_METHODOLOGY.scoreRange}</strong> calculé à partir
              du <strong>Safety Index</strong> de{' '}
              <a
                href={GOSAFE_METHODOLOGY.primarySource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline font-semibold"
              >
                Numbeo
              </a>
              , la base de données urbaine collaborative la plus utilisée au
              monde (600 000+ contributeurs).
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Les données sont rafraîchies automatiquement toutes les{' '}
              <strong>{GOSAFE_METHODOLOGY.refreshInterval}</strong>. Plus le
              score est haut, plus la destination est considérée comme sûre.
            </p>
            <a
              href={GOSAFE_METHODOLOGY.primarySource.methodology}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
            >
              Voir la méthodologie Numbeo détaillée
              <ExternalLink size={11} />
            </a>
          </div>

          {/* ─── Échelle des scores ─── */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Échelle de lecture
            </h4>
            <div className="space-y-1.5">
              {GOSAFE_METHODOLOGY.thresholds.map((t) => {
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
