/**
 * LokascoreBreakdown — aperçu par catégorie du Lokascore.
 *
 * Affiche le score de chaque dimension (Sécurité / Santé / Nature /
 * Infrastructure) et les NOMS des sources officielles qui ont contribué.
 *
 * ⚠️ Les pondérations et la formule ne sont jamais affichées (secret de
 * fabrique). Seuls les résultats et les noms de sources sont montrés.
 */
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  DIMENSION_META,
  PROFILE_META,
  getLokascoreLevel,
  type LokascoreDimensions,
  type TravelProfile,
} from '../lib/lokascore';
import type { LiveAlert } from '../lib/liveAlertsService';
import type { DimensionSources } from '../hooks/useLokascore';
import { useTravelProfile } from '../context/TravelProfileContext';

interface LokascoreBreakdownProps {
  dimensions: LokascoreDimensions | null;
  compositeScore: number | null;
  /** Sources officielles par dimension (noms seulement) */
  sources?: DimensionSources | null;
  /** True si au moins une source officielle a contribué */
  hasOfficialSource?: boolean;
  /** Alertes catastrophes live actives pour le pays */
  liveAlerts?: LiveAlert[];
  profile?: TravelProfile;
  compact?: boolean;
}

export function LokascoreBreakdown({
  dimensions,
  compositeScore,
  sources,
  hasOfficialSource = false,
  liveAlerts,
  profile: profileProp,
  compact = false,
}: LokascoreBreakdownProps) {
  const { profile: ctxProfile } = useTravelProfile();
  const profile = profileProp ?? ctxProfile;
  const profileMeta = PROFILE_META[profile];

  if (!dimensions) {
    return (
      <div className="p-4 rounded-2xl border bg-gray-50" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Info className="h-4 w-4" />
          Détail par catégorie en cours de chargement…
        </div>
      </div>
    );
  }

  const rows: Array<{ key: keyof LokascoreDimensions; value: number }> = [
    { key: 'security', value: dimensions.security },
    { key: 'health', value: dimensions.health },
    { key: 'nature', value: dimensions.nature },
    { key: 'infrastructure', value: dimensions.infrastructure },
  ];

  return (
    <div
      className={compact ? 'p-4 rounded-2xl bg-white border' : 'p-5 rounded-3xl bg-white border'}
      style={{ borderColor: 'var(--lokadia-gray-100)', boxShadow: compact ? undefined : 'var(--shadow-sm)' }}
    >
      {/* Header : profil + score composite */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--lokadia-primary)' }}>
            Aperçu par catégorie
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--lokadia-gray-600)' }}>
            <span className="inline-flex items-center gap-1 font-bold"><profileMeta.Icon className="h-3.5 w-3.5" style={{ color: 'var(--lokadia-primary)' }} /> {profileMeta.label}</span>
            {' · '}
            <span style={{ color: 'var(--lokadia-gray-500)' }}>{profileMeta.description}</span>
          </p>
        </div>
        {compositeScore !== null && (
          <div className="flex flex-col items-end flex-shrink-0">
            <span
              className="text-2xl font-bold tabular-nums leading-none"
              style={{ color: getLokascoreLevel(compositeScore).color }}
            >
              {compositeScore}
            </span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>/100</span>
          </div>
        )}
      </div>

      {/* ⚠️ Alertes live actives */}
      {liveAlerts && liveAlerts.length > 0 && (
        <div
          className="mb-3 p-3 rounded-xl flex items-start gap-2.5"
          style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)' }}
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold" style={{ color: '#991b1b' }}>
              {liveAlerts.length} alerte{liveAlerts.length > 1 ? 's' : ''} active{liveAlerts.length > 1 ? 's' : ''}
            </p>
            <ul className="mt-1 space-y-0.5">
              {liveAlerts.slice(0, 3).map((alert, i) => (
                <li key={i} className="text-[10px] leading-snug" style={{ color: '#7f1d1d' }}>
                  <span className="font-bold">[{alert.source}]</span> {alert.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Barres par dimension */}
      <div className="space-y-2.5">
        {rows.map(({ key, value }) => {
          const meta = DIMENSION_META[key];
          const intValue = Math.round(value);
          const lvl = getLokascoreLevel(intValue);
          const usedSources = sources?.[key] ?? [];
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <meta.Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                  <span className="text-xs font-bold truncate" style={{ color: 'var(--lokadia-gray-700)' }}>
                    {meta.label}
                  </span>
                </div>
                <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color: lvl.color }}>
                  {intValue}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--lokadia-gray-100)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, intValue)}%`, background: lvl.fillColor }}
                />
              </div>
              {!compact && (
                <div className="mt-1.5">
                  {usedSources.length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      <CheckCircle2 className="h-2.5 w-2.5" style={{ color: '#15803d' }} />
                      {usedSources.map((label) => (
                        <span
                          key={label}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ background: `${meta.color}15`, color: meta.color }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                      Sources : {meta.sources.join(' · ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      {!compact && (
        <div
          className="mt-4 p-2.5 rounded-lg flex items-start gap-2"
          style={{ background: hasOfficialSource ? 'rgba(34, 197, 94, 0.10)' : 'var(--lokadia-info-bg)' }}
        >
          {hasOfficialSource ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: '#15803d' }} />
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
                <strong style={{ color: '#15803d' }}>Score officiel</strong> — agrégation propriétaire
                de sources internationales vérifiables, calculée en continu.
              </p>
            </>
          ) : (
            <>
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--lokadia-primary)' }} />
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
                <strong>Score estimé</strong> — cette destination n'est pas encore dans notre catalogue
                de pays curés. La fiche complète arrive bientôt.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
