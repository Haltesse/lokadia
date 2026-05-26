/**
 * LokascoreBreakdown — affichage détaillé des 4 dimensions Lokascore
 * Affiche les barres de progression pour Sécurité / Santé / Nature / Infrastructure
 * avec les sources officielles utilisées et la pondération appliquée selon le profil.
 *
 * Phase 3 : affiche les VRAIES sources qui ont contribué (MAE, FCDO, WJP, CPI…)
 * via la `sourceTrace` retournée par useLokascore().
 */
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import {
  DIMENSION_META,
  PROFILE_WEIGHTS,
  PROFILE_META,
  getLokascoreLevel,
  type LokascoreDimensions,
  type TravelProfile,
} from '../lib/lokascore';
import type { LokascoreSourceTrace } from '../lib/lokascoreSources';
import { useTravelProfile } from '../context/TravelProfileContext';

interface LokascoreBreakdownProps {
  dimensions: LokascoreDimensions | null;
  /** Score Lokascore composite (pour cohérence avec affichage parent) */
  compositeScore: number | null;
  /** Trace des sources officielles utilisées (Phase 3) */
  sourceTrace?: LokascoreSourceTrace | null;
  /** Profil utilisé pour la modulation (par défaut = celui du context) */
  profile?: TravelProfile;
  /** Affichage compact (mode card) vs étendu (mode page détail) */
  compact?: boolean;
}

export function LokascoreBreakdown({
  dimensions,
  compositeScore,
  sourceTrace,
  profile: profileProp,
  compact = false,
}: LokascoreBreakdownProps) {
  const { profile: ctxProfile } = useTravelProfile();
  const profile = profileProp ?? ctxProfile;
  const weights = PROFILE_WEIGHTS[profile];
  const profileMeta = PROFILE_META[profile];

  if (!dimensions) {
    return (
      <div className="p-4 rounded-2xl border bg-gray-50" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Info className="h-4 w-4" />
          Détail des 4 dimensions en cours de chargement…
        </div>
      </div>
    );
  }

  const rows: Array<{ key: keyof LokascoreDimensions; weight: number; value: number }> = [
    { key: 'security', weight: weights.security, value: dimensions.security },
    { key: 'health', weight: weights.health, value: dimensions.health },
    { key: 'nature', weight: weights.nature, value: dimensions.nature },
    { key: 'infrastructure', weight: weights.infrastructure, value: dimensions.infrastructure },
  ];

  return (
    <div
      className={compact ? 'p-4 rounded-2xl bg-white border' : 'p-5 rounded-3xl bg-white border'}
      style={{ borderColor: 'var(--lokadia-gray-100)', boxShadow: compact ? undefined : 'var(--shadow-sm)' }}
    >
      {/* Header : profil + score composite */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--lokadia-primary)' }}>
            Décomposition Lokascore
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--lokadia-gray-600)' }}>
            <span className="font-bold">{profileMeta.emoji} {profileMeta.label}</span>
            {' · '}
            <span style={{ color: 'var(--lokadia-gray-500)' }}>{profileMeta.description}</span>
          </p>
        </div>
        {compositeScore !== null && (
          <div className="flex flex-col items-end flex-shrink-0">
            <span
              className="text-2xl font-black tabular-nums leading-none"
              style={{ color: getLokascoreLevel(compositeScore).color }}
            >
              {compositeScore}
            </span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>
              /100
            </span>
          </div>
        )}
      </div>

      {/* ⚠️ Alertes live actives — USGS / ReliefWeb */}
      {sourceTrace?.liveAlerts && sourceTrace.liveAlerts.length > 0 && (
        <div
          className="mb-3 p-3 rounded-xl flex items-start gap-2.5"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#dc2626' }} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black" style={{ color: '#991b1b' }}>
              {sourceTrace.liveAlerts.length} alerte{sourceTrace.liveAlerts.length > 1 ? 's' : ''} active{sourceTrace.liveAlerts.length > 1 ? 's' : ''}
            </p>
            <ul className="mt-1 space-y-0.5">
              {sourceTrace.liveAlerts.slice(0, 3).map((alert, i) => (
                <li key={i} className="text-[10px] leading-snug" style={{ color: '#7f1d1d' }}>
                  <span className="font-bold">[{alert.source}]</span> {alert.description}
                </li>
              ))}
              {sourceTrace.liveAlerts.length > 3 && (
                <li className="text-[10px] italic" style={{ color: '#7f1d1d' }}>
                  +{sourceTrace.liveAlerts.length - 3} autre{sourceTrace.liveAlerts.length - 3 > 1 ? 's' : ''}…
                </li>
              )}
            </ul>
            <p className="text-[10px] mt-1 italic" style={{ color: '#991b1b' }}>
              La dimension Nature est réduite en conséquence (modulation temporelle).
            </p>
          </div>
        </div>
      )}

      {/* Barres par dimension */}
      <div className="space-y-2.5">
        {rows.map(({ key, weight, value }) => {
          const meta = DIMENSION_META[key];
          const intValue = Math.round(value);
          const intWeight = Math.round(weight * 100);
          const lvl = getLokascoreLevel(intValue);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs" aria-hidden="true">{meta.emoji}</span>
                  <span className="text-xs font-bold truncate" style={{ color: 'var(--lokadia-gray-700)' }}>
                    {meta.label}
                  </span>
                  <span
                    className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-600)' }}
                  >
                    {intWeight}%
                  </span>
                </div>
                <span
                  className="text-xs font-black tabular-nums flex-shrink-0"
                  style={{ color: lvl.color }}
                >
                  {intValue}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--lokadia-gray-100)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(2, intValue)}%`,
                    background: lvl.fillColor,
                  }}
                />
              </div>
              {!compact && (
                <div className="mt-1.5">
                  {/* Phase 3 : sources réellement utilisées vs cibles */}
                  {sourceTrace && sourceTrace[key].hasOfficialSource ? (
                    <div className="flex items-center gap-1 flex-wrap">
                      <CheckCircle2 className="h-2.5 w-2.5" style={{ color: '#15803d' }} />
                      {sourceTrace[key].contributions.map((c) => (
                        <span
                          key={c.id}
                          className="text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded"
                          style={{ background: `${meta.color}15`, color: meta.color }}
                          title={`${c.label} : ${Math.round(c.value)}/100 (poids ${Math.round(c.weight * 100)}%)`}
                        >
                          {c.label} · {Math.round(c.value)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                      Sources cibles : {meta.sources.join(' · ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer Phase 3 ou MVP selon les sources réellement utilisées */}
      {!compact && (
        <div
          className="mt-4 p-2.5 rounded-lg flex items-start gap-2"
          style={{
            background: sourceTrace?.hasAnyOfficialSource
              ? 'rgba(34, 197, 94, 0.10)'
              : 'var(--lokadia-info-bg)',
          }}
        >
          {sourceTrace?.hasAnyOfficialSource ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: '#15803d' }} />
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
                <strong style={{ color: '#15803d' }}>Phase 3 active :</strong> le Lokascore de cette destination utilise
                des sources officielles réelles (MAE France, UK FCDO, US State, Lancet HAQ,
                WJP Rule of Law, Transparency CPI, World Bank Stability, EM-DAT…). Snapshot mis à jour trimestriellement
                pour les advisories.
              </p>
            </>
          ) : (
            <>
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--lokadia-primary)' }} />
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
                <strong>Fallback Numbeo :</strong> ce pays n'est pas encore dans la base de données
                officielle Phase 3. Le score est estimé via les sous-indices Numbeo
                (safety, healthcare, pollution, quality of life).
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
