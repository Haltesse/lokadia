import { useMemo, useState } from 'react';
import { Check, ShieldAlert, X } from 'lucide-react';
import {
  RISK_FACTORS,
  RISK_LEVELS,
  RISK_STATUS_LABEL,
  inherentLevel,
  residualGuidance,
  suggestLevelFromScore,
  type RiskFactorValue,
  type RiskLevel,
  type RiskStatus,
} from '../risk';
import type { RiskAssessment } from '../proService';

/**
 * Évaluation de risque d'une mission — saisie, soumission, décision.
 *
 * L'écran distingue deux gestes qui n'engagent pas les mêmes personnes :
 * **rédiger** l'évaluation (qui cote les facteurs et décide des mesures)
 * et **valider** (qui assume le départ). La base refuse que ce soit la
 * même personne ; l'interface le dit avant, plutôt que de laisser
 * découvrir l'erreur au moment du clic.
 *
 * Une évaluation décidée n'est plus modifiable : elle s'affiche en lecture
 * avec sa décision, son auteur et sa date. Une trace réécrite ne prouve
 * plus rien.
 */

function LevelPicker({
  value,
  onChange,
  disabled,
}: {
  value: RiskLevel;
  onChange: (level: RiskLevel) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Niveau">
      {([1, 2, 3, 4] as RiskLevel[]).map((level) => {
        const active = value === level;
        const meta = RISK_LEVELS[level];
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(level)}
            className="rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-60"
            style={{
              background: active ? meta.bg : 'var(--lokadia-gray-50)',
              color: active ? meta.color : 'var(--lokadia-gray-500)',
              border: `1px solid ${active ? meta.color : 'var(--lokadia-gray-200)'}`,
            }}
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

export function MissionRiskPanel({
  assessment,
  missionLabel,
  lokascore,
  canWrite,
  currentUserId,
  onSave,
  onDecide,
  onClose,
}: {
  assessment: RiskAssessment | null;
  missionLabel: string;
  /** Lokascore de la destination, s'il est connu — sert de suggestion */
  lokascore: number | null;
  canWrite: boolean;
  currentUserId: string;
  onSave: (draft: {
    factors: RiskFactorValue[];
    inherent_level: number;
    mitigations: string[];
    residual_level: number;
    submit: boolean;
  }) => Promise<void>;
  onDecide: (decision: 'approved' | 'refused', note: string) => Promise<void>;
  onClose: () => void;
}) {
  const status = (assessment?.status ?? 'draft') as RiskStatus;
  const decided = status === 'approved' || status === 'refused';
  const isAuthor = assessment?.submitted_by === currentUserId;

  const initialFactors = useMemo<RiskFactorValue[]>(() => {
    // `factors` est du jsonb côté base : on le retype explicitement plutôt
    // que de faire semblant que Postgres nous rend un tableau typé.
    const saved = (assessment?.factors ?? []) as unknown as RiskFactorValue[];
    return RISK_FACTORS.map((definition) => {
      const previous = saved.find((f) => f.id === definition.id);
      if (previous) return { ...previous, label: definition.label };
      return {
        id: definition.id,
        label: definition.label,
        // Seul le contexte sécuritaire est pré-coté, et à partir d'une
        // donnée réelle. Les autres partent à « faible » : c'est à
        // l'évaluateur de les monter, pas au produit de les deviner.
        level: definition.id === 'security' ? suggestLevelFromScore(lokascore) : 1,
      };
    });
  }, [assessment, lokascore]);

  const [factors, setFactors] = useState<RiskFactorValue[]>(initialFactors);
  const [mitigations, setMitigations] = useState<string>(
    (assessment?.mitigations ?? []).join('\n'),
  );
  const [residual, setResidual] = useState<RiskLevel>(
    (assessment?.residual_level as RiskLevel) ?? inherentLevel(initialFactors),
  );
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const inherent = inherentLevel(factors);
  const mitigationList = mitigations
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--lokadia-surface)', border: '1px solid var(--lokadia-gray-200)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            <ShieldAlert size={18} style={{ color: 'var(--lokadia-primary)' }} />
            Évaluation de risque — {missionLabel}
          </h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            Démarche inspirée de l'ISO 31030 : coter, atténuer, faire valider
            par quelqu'un d'autre, garder la trace.
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-1.5">
          <X size={16} style={{ color: 'var(--lokadia-gray-500)' }} />
        </button>
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
        Statut : {RISK_STATUS_LABEL[status]}
      </p>

      {/* Facteurs */}
      <div className="mt-4 space-y-3">
        {RISK_FACTORS.map((definition) => {
          const value = factors.find((f) => f.id === definition.id)!;
          return (
            <div
              key={definition.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-xl p-3"
              style={{ background: 'var(--lokadia-gray-50)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {definition.label}
                </p>
                <p className="mt-0.5 text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
                  {definition.help}
                </p>
              </div>
              <LevelPicker
                value={value.level}
                disabled={decided || !canWrite}
                onChange={(level) =>
                  setFactors((list) =>
                    list.map((f) => (f.id === definition.id ? { ...f, level } : f)),
                  )
                }
              />
            </div>
          );
        })}
      </div>

      {/* Niveaux */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl p-3" style={{ background: RISK_LEVELS[inherent].bg }}>
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: RISK_LEVELS[inherent].color }}>
            Niveau brut (calculé)
          </p>
          <p className="mt-1 text-lg font-bold" style={{ color: RISK_LEVELS[inherent].color }}>
            {RISK_LEVELS[inherent].label}
          </p>
          <p className="mt-1 text-[11px] leading-4" style={{ color: 'var(--lokadia-gray-600)' }}>
            Le facteur le plus élevé commande — une moyenne masquerait un point critique.
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ background: RISK_LEVELS[residual].bg }}>
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: RISK_LEVELS[residual].color }}>
            Niveau résiduel (déclaré)
          </p>
          <div className="mt-1.5">
            <LevelPicker value={residual} disabled={decided || !canWrite} onChange={setResidual} />
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
        {residualGuidance(residual)}
      </p>

      {/* Mesures */}
      <label className="mt-4 block text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
        Mesures d'atténuation — une par ligne
      </label>
      <textarea
        value={mitigations}
        onChange={(event) => setMitigations(event.target.value)}
        disabled={decided || !canWrite}
        rows={4}
        placeholder={"Briefing sécurité avant départ\nHébergement validé par le référent local\nPoint de contact quotidien"}
        className="mt-1.5 w-full rounded-xl border p-3 text-sm"
        style={{
          borderColor: 'var(--lokadia-gray-200)',
          background: 'var(--lokadia-surface)',
          color: 'var(--lokadia-gray-900)',
        }}
      />

      {/* Décision prise : lecture seule */}
      {decided && (
        <div
          className="mt-4 rounded-xl p-3"
          style={{
            background: status === 'approved' ? 'var(--lokadia-success-bg)' : 'var(--lokadia-danger-bg)',
          }}
        >
          <p
            className="text-sm font-bold"
            style={{ color: status === 'approved' ? 'var(--lokadia-success)' : 'var(--lokadia-danger)' }}
          >
            {status === 'approved' ? 'Validée' : 'Refusée'}
            {assessment?.decided_at
              ? ` le ${new Date(assessment.decided_at).toLocaleString('fr-FR')}`
              : ''}
          </p>
          {assessment?.decision_note && (
            <p className="mt-1 text-sm leading-6" style={{ color: 'var(--lokadia-gray-700)' }}>
              {assessment.decision_note}
            </p>
          )}
          <p className="mt-1 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
            Une évaluation décidée n'est plus modifiable : c'est ce qui la rend opposable.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm font-semibold" role="alert" style={{ color: 'var(--lokadia-danger)' }}>
          {error}
        </p>
      )}

      {/* Actions */}
      {!decided && canWrite && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(() =>
                onSave({
                  factors,
                  inherent_level: inherent,
                  mitigations: mitigationList,
                  residual_level: residual,
                  submit: false,
                }),
              )
            }
            className="rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
            style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}
          >
            Enregistrer le brouillon
          </button>

          {status !== 'submitted' && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(() =>
                  onSave({
                    factors,
                    inherent_level: inherent,
                    mitigations: mitigationList,
                    residual_level: residual,
                    submit: true,
                  }),
                )
              }
              className="lk-btn rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'var(--lokadia-primary)' }}
            >
              Soumettre à validation
            </button>
          )}
        </div>
      )}

      {/* Décision hiérarchique */}
      {status === 'submitted' && canWrite && (
        <div className="mt-4 rounded-xl p-3" style={{ background: 'var(--lokadia-info-bg)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            Décision hiérarchique
          </p>
          {isAuthor ? (
            <p className="mt-1 text-sm leading-6" style={{ color: 'var(--lokadia-gray-700)' }}>
              Vous avez rédigé cette évaluation : la validation doit venir d'une
              autre personne de l'organisation. C'est cette séparation qui lui
              donne sa valeur — une auto-validation ne prouve rien.
            </p>
          ) : (
            <>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={2}
                placeholder="Commentaire de décision (facultatif, mais conservé)"
                className="mt-2 w-full rounded-xl border p-2.5 text-sm"
                style={{
                  borderColor: 'var(--lokadia-gray-200)',
                  background: 'var(--lokadia-surface)',
                  color: 'var(--lokadia-gray-900)',
                }}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => onDecide('approved', note))}
                  className="lk-btn inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: 'var(--lokadia-success)' }}
                >
                  <Check size={15} /> Valider le départ
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => onDecide('refused', note))}
                  className="lk-btn inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: 'var(--lokadia-danger)' }}
                >
                  <X size={15} /> Refuser
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
