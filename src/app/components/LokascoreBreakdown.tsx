/**
 * LokascoreBreakdown — affichage détaillé des 4 dimensions Lokascore
 * Affiche les barres de progression pour Sécurité / Santé / Nature / Infrastructure
 * avec les sources officielles cibles et la pondération appliquée selon le profil.
 */
import { Info } from 'lucide-react';
import {
  DIMENSION_META,
  PROFILE_WEIGHTS,
  PROFILE_META,
  getLokascoreLevel,
  type LokascoreDimensions,
  type TravelProfile,
} from '../lib/lokascore';
import { useTravelProfile } from '../context/TravelProfileContext';

interface LokascoreBreakdownProps {
  dimensions: LokascoreDimensions | null;
  /** Score Lokascore composite (pour cohérence avec affichage parent) */
  compositeScore: number | null;
  /** Profil utilisé pour la modulation (par défaut = celui du context) */
  profile?: TravelProfile;
  /** Affichage compact (mode card) vs étendu (mode page détail) */
  compact?: boolean;
}

export function LokascoreBreakdown({
  dimensions,
  compositeScore,
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
                <p className="text-[10px] mt-1" style={{ color: 'var(--lokadia-gray-500)' }}>
                  Sources cibles : {meta.sources.join(' · ')}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer MVP */}
      {!compact && (
        <div className="mt-4 p-2.5 rounded-lg flex items-start gap-2" style={{ background: 'var(--lokadia-info-bg)' }}>
          <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--lokadia-primary)' }} />
          <p className="text-[10px] leading-relaxed" style={{ color: 'var(--lokadia-gray-700)' }}>
            <strong>MVP :</strong> les 4 dimensions sont actuellement estimées via les sous-indices Numbeo
            (safety, healthcare, pollution, quality of life). L'intégration progressive des sources officielles
            (MAE, OMS, GDACS, WJP…) remplacera ces approximations.
          </p>
        </div>
      )}
    </div>
  );
}
