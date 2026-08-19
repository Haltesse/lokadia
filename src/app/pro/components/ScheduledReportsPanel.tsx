import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Download, FileText, Loader2 } from 'lucide-react';
import {
  fetchReportRuns,
  fetchScheduledReport,
  generateReportNow,
  saveScheduledReport,
  type ReportRun,
  type ScheduledReport,
} from '../proService';
import { downloadFile, toCsv } from '../dataExport';

/**
 * Rapports programmés — instantané de conformité, produit tout seul.
 *
 * Ce que l'écran assume :
 *  · la génération tourne **côté base**, planifiée par pg_cron. Aucune
 *    clé de service n'est stockée nulle part pour ça, et le rapport
 *    continue d'être produit même si personne n'ouvre l'application ;
 *  · l'envoi par e-mail n'existe pas encore (il demande un serveur SMTP
 *    configuré) — c'est écrit, plutôt que promis dans une case à cocher
 *    qui ne ferait rien.
 */

const FIELD_LABELS: Record<string, string> = {
  travelers: 'Personnes dans l’effectif',
  missions_total: 'Missions enregistrées',
  missions_active: 'Missions en cours aujourd’hui',
  missions_upcoming_30d: 'Départs dans les 30 jours',
  compliance_complete: 'Dossiers de conformité complets',
  compliance_incomplete: 'Dossiers incomplets',
  briefings_acknowledged: 'Accusés de briefing signés',
  briefings_pending: 'Accusés en attente',
  watch_alerts_open: 'Alertes de veille non traitées',
  risk_awaiting_decision: 'Évaluations en attente de validation',
  risk_residual_high: 'Missions validées à risque résiduel élevé',
};

/** Champs dont une valeur non nulle appelle une action. */
const ATTENTION = new Set([
  'compliance_incomplete',
  'briefings_pending',
  'watch_alerts_open',
  'risk_awaiting_decision',
  'risk_residual_high',
]);

export function ScheduledReportsPanel({
  orgId,
  actor,
  canWrite,
}: {
  orgId: string;
  actor: { id: string; email: string } | null;
  canWrite: boolean;
}) {
  const [schedule, setSchedule] = useState<ScheduledReport | null>(null);
  const [runs, setRuns] = useState<ReportRun[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const [s, r] = await Promise.all([fetchScheduledReport(orgId), fetchReportRuns(orgId)]);
    setSchedule(s);
    setRuns(r);
  }, [orgId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(action: () => Promise<void>, done: string) {
    if (!actor) return;
    setBusy(true);
    setMessage('');
    try {
      await action();
      await load();
      setMessage(done);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Opération impossible.');
    } finally {
      setBusy(false);
    }
  }

  const latest = runs[0];
  const payload = (latest?.payload ?? {}) as Record<string, unknown>;

  return (
    <section
      className="rounded-2xl bg-white p-5"
      style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}
    >
      <div className="mb-3 flex items-center gap-2">
        <CalendarClock size={17} style={{ color: 'var(--lokadia-primary)' }} />
        <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          Rapport de conformité programmé
        </h2>
      </div>

      <p className="text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
        Un instantané daté de l'état de conformité, produit automatiquement et
        conservé. Chaque chiffre est calculé sur vos données au moment de la
        génération — c'est ce qui en fait une pièce utilisable, et non un
        tableau de bord qui change sous les yeux.
      </p>

      {canWrite && actor && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(['weekly', 'monthly'] as const).map((frequency) => {
            const active = schedule?.active && schedule.frequency === frequency;
            return (
              <button
                key={frequency}
                type="button"
                disabled={busy}
                onClick={() =>
                  void run(
                    () => saveScheduledReport(orgId, actor, frequency, true),
                    frequency === 'weekly'
                      ? 'Rapport hebdomadaire programmé.'
                      : 'Rapport mensuel programmé.',
                  )
                }
                className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-60"
                style={{
                  borderColor: active ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)',
                  background: active ? 'var(--lokadia-info-bg)' : 'transparent',
                  color: active ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-700)',
                }}
              >
                {frequency === 'weekly' ? 'Chaque semaine' : 'Chaque mois'}
              </button>
            );
          })}

          {schedule?.active && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run(
                  () => saveScheduledReport(orgId, actor, schedule.frequency as 'weekly' | 'monthly', false),
                  'Programmation désactivée.',
                )
              }
              className="rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-60"
              style={{ color: 'var(--lokadia-gray-500)' }}
            >
              Désactiver
            </button>
          )}

          <button
            type="button"
            disabled={busy}
            onClick={() => void run(() => generateReportNow(orgId, actor), 'Rapport généré.')}
            className="lk-btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: 'var(--lokadia-primary)' }}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
            Générer maintenant
          </button>
        </div>
      )}

      {schedule?.active && (
        <p className="mt-2 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
          Prochain rapport le {new Date(schedule.next_run_at).toLocaleDateString('fr-FR')}
          {schedule.last_run_at
            ? ` · dernier produit le ${new Date(schedule.last_run_at).toLocaleDateString('fr-FR')}`
            : ' · aucun encore produit'}
          .
        </p>
      )}

      {/* Dernier instantané */}
      {latest && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
              Dernier rapport — {new Date(latest.created_at).toLocaleString('fr-FR')}
              {latest.manual ? ' (manuel)' : ''}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `rapport-conformite-${latest.created_at.slice(0, 10)}.json`,
                    JSON.stringify(latest.payload, null, 2),
                    'application/json',
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: 'var(--lokadia-primary)' }}
              >
                <Download size={13} /> JSON
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `rapport-conformite-${latest.created_at.slice(0, 10)}.csv`,
                    toCsv([payload]),
                    'text/csv',
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: 'var(--lokadia-primary)' }}
              >
                <Download size={13} /> CSV
              </button>
            </div>
          </div>

          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {Object.entries(FIELD_LABELS).map(([key, label]) => {
              const value = payload[key];
              if (typeof value !== 'number') return null;
              const alert = ATTENTION.has(key) && value > 0;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2"
                  style={{ background: alert ? 'var(--lokadia-warning-bg)' : 'var(--lokadia-gray-50)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--lokadia-gray-600)' }}>
                    {label}
                  </span>
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: alert ? 'var(--lokadia-warning)' : 'var(--lokadia-gray-900)' }}
                  >
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {runs.length > 1 && (
        <p className="mt-3 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
          {runs.length} rapports conservés. Les précédents restent téléchargeables
          depuis l'export intégral, dans l'écran « Données & RGPD ».
        </p>
      )}

      <p className="mt-3 text-xs leading-5" style={{ color: 'var(--lokadia-gray-500)' }}>
        L'envoi par e-mail n'est pas encore disponible : il demande un serveur
        d'envoi configuré. Le rapport est produit et conservé quoi qu'il arrive ;
        vous le retrouvez ici.
      </p>

      {message && (
        <p className="mt-2 text-sm font-semibold" role="status" style={{ color: 'var(--lokadia-gray-700)' }}>
          {message}
        </p>
      )}
    </section>
  );
}
