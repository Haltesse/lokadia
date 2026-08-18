/**
 * ProComplianceScreen — registre de conformité et journal d'audit.
 *
 * Deux onglets :
 *   · Rapport — état de conformité présentable à la direction, à l'assureur
 *     ou en cas de mise en cause. Imprimable / exportable en PDF via le
 *     navigateur (feuille de style d'impression dédiée), sans dépendance.
 *   · Journal — registre horodaté append-only de toutes les actions du
 *     back-office, exportable en CSV.
 *
 * Aucun chiffre sans méthode : l'en-tête du rapport rappelle la définition
 * exacte d'un « dossier complet ».
 */
import { useEffect, useMemo, useState } from 'react';
import { FileCheck2, Printer, Download, ScrollText, AlertTriangle } from 'lucide-react';
import { useOrg } from '../OrgContext';
import {
  fetchMissions, fetchAuditLog, isMissionActiveToday, isMissionUpcoming,
  complianceComplete, type MissionWithCompliance, type AuditEntry,
} from '../proService';

const COMPLIANCE_LABELS: Record<string, string> = {
  briefing: 'Briefing', insurance: 'Assurance',
  emergency_contact: 'Contact d\'urgence', formalities: 'Formalités',
};

const ACTION_LABELS: Record<string, string> = {
  'traveler.import': 'Import d\'effectif',
  'mission.create': 'Création de mission',
  'compliance.validate': 'Validation d\'un élément de conformité',
  'compliance.revoke': 'Retrait d\'une validation',
  'briefing.create': 'Création d\'un briefing',
  'briefing.update': 'Modification d\'un briefing',
  'briefing.delete': 'Suppression d\'un briefing',
  'briefing.send': 'Envoi de briefings',
  'briefing.ack': 'Accusé de lecture signé',
  'member.invite': 'Invitation d\'un membre',
};

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(filename: string, rows: string[][]): void {
  // BOM UTF-8 pour qu'Excel FR ouvre les accents correctement
  const content = '﻿' + rows.map((r) => r.map(csvEscape).join(';')).join('\r\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ProComplianceScreen() {
  const { org } = useOrg();
  const [tab, setTab] = useState<'report' | 'audit'>('report');
  const [missions, setMissions] = useState<MissionWithCompliance[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!org) return;
    let cancelled = false;
    (async () => {
      setStatus('loading');
      try {
        const [m, a] = await Promise.all([fetchMissions(org.id), fetchAuditLog(org.id)]);
        if (cancelled) return;
        setMissions(m);
        setAudit(a);
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setErrorMsg(e instanceof Error ? e.message : 'Chargement impossible.');
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [org]);

  const report = useMemo(() => {
    const relevant = missions.filter((m) => isMissionActiveToday(m) || isMissionUpcoming(m));
    const complete = relevant.filter(complianceComplete);
    const incomplete = relevant.filter((m) => !complianceComplete(m));
    const signed = relevant.filter((m) => m.briefing_receipts?.read_at).length;
    const coverage = relevant.length > 0 ? Math.round((complete.length / relevant.length) * 100) : null;
    return { relevant, complete, incomplete, signed, coverage };
  }, [missions]);

  function exportAuditCsv() {
    downloadCsv(
      `lokadia-journal-audit-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ['Horodatage', 'Auteur', 'Action', 'Cible', 'Détail'],
        ...audit.map((e) => [
          new Date(e.created_at).toLocaleString('fr-FR'),
          e.actor_label,
          ACTION_LABELS[e.action] ?? e.action,
          `${e.target_kind ?? ''} ${e.target_id ?? ''}`.trim(),
          e.detail ? JSON.stringify(e.detail) : '',
        ]),
      ],
    );
  }

  function exportReportCsv() {
    downloadCsv(
      `lokadia-conformite-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ['Personne', 'Destination', 'Départ', 'Retour', 'Briefing', 'Assurance', 'Contact urgence', 'Formalités', 'Accusé de lecture'],
        ...report.relevant.map((m) => {
          const by = new Map(m.compliance_items.map((c) => [c.kind, c.status === 'done']));
          const receipt = m.briefing_receipts;
          return [
            m.travelers ? `${m.travelers.last_name.toUpperCase()} ${m.travelers.first_name}` : '—',
            `${m.city ? m.city + ', ' : ''}${m.country_name}`,
            m.date_start, m.date_end,
            by.get('briefing') ? 'Oui' : 'Non',
            by.get('insurance') ? 'Oui' : 'Non',
            by.get('emergency_contact') ? 'Oui' : 'Non',
            by.get('formalities') ? 'Oui' : 'Non',
            receipt?.read_at
              ? `Signé par ${receipt.read_name ?? '—'} le ${new Date(receipt.read_at).toLocaleString('fr-FR')}`
              : receipt ? 'Envoyé, non signé' : 'Non envoyé',
          ];
        }),
      ],
    );
  }

  if (status === 'loading') {
    return (
      <div aria-busy="true">
        <div className="lk-skeleton mb-5 h-7 w-56 rounded-lg" />
        <div className="lk-skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Le registre n'a pas pu se charger</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Feuille de style d'impression : seul le rapport part au PDF */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #compliance-report, #compliance-report * { visibility: visible; }
          #compliance-report { position: absolute; inset: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Conformité</h1>
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            Registre présentable à la direction, à l'assureur ou à un auditeur.
          </p>
        </div>
        <div className="flex gap-2">
          {tab === 'report' ? (
            <>
              <button onClick={exportReportCsv} className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold" style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}>
                <Download size={15} /> Export CSV
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>
                <Printer size={15} /> Rapport PDF
              </button>
            </>
          ) : (
            <button onClick={exportAuditCsv} className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold" style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}>
              <Download size={15} /> Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="no-print flex gap-2" role="tablist" aria-label="Vues conformité">
        {([['report', 'Rapport de conformité', FileCheck2], ['audit', 'Journal d\'audit', ScrollText]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold"
            style={{
              background: tab === id ? 'var(--lokadia-primary)' : 'white',
              color: tab === id ? 'white' : 'var(--lokadia-gray-600)',
              border: '1px solid ' + (tab === id ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)'),
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ─── Rapport ─── */}
      {tab === 'report' && (
        <div id="compliance-report" className="rounded-2xl bg-white p-6" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <header className="mb-5 border-b pb-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <h2 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              Rapport de conformité — {org?.name}
            </h2>
            <p className="mt-1 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
              Édité le {new Date().toLocaleString('fr-FR')} · Périmètre : missions en cours et à venir
            </p>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
              <strong>Méthode :</strong> un dossier est réputé complet lorsque les quatre éléments
              — briefing sécurité, assurance, contact d'urgence, formalités d'entrée — sont validés
              et horodatés. L'accusé de lecture est signé nominativement par le voyageur via un lien
              personnel ; son horodatage est posé côté serveur et ne peut pas être modifié ensuite.
            </p>
          </header>

          <div className="mb-5 grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Missions au périmètre', value: String(report.relevant.length) },
              { label: 'Dossiers complets', value: String(report.complete.length) },
              { label: 'Taux de couverture', value: report.coverage !== null ? `${report.coverage} %` : '—' },
              { label: 'Accusés signés', value: String(report.signed) },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>{s.label}</p>
                <p className="mt-0.5 text-2xl font-bold tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {report.relevant.length === 0 ? (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
              Aucune mission en cours ni à venir : le rapport se remplira dès la première mission créée.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
                    <th className="py-2 pr-3 font-bold">Personne</th>
                    <th className="py-2 pr-3 font-bold">Destination</th>
                    <th className="py-2 pr-3 font-bold">Dates</th>
                    {Object.values(COMPLIANCE_LABELS).map((l) => <th key={l} className="py-2 pr-3 font-bold">{l}</th>)}
                    <th className="py-2 font-bold">Accusé de lecture</th>
                  </tr>
                </thead>
                <tbody>
                  {report.relevant.map((m) => {
                    const by = new Map(m.compliance_items.map((c) => [c.kind, c.status === 'done']));
                    const receipt = m.briefing_receipts;
                    return (
                      <tr key={m.id} className="border-t" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                        <td className="py-2 pr-3 font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                          {m.travelers ? `${m.travelers.last_name.toUpperCase()} ${m.travelers.first_name}` : '—'}
                        </td>
                        <td className="py-2 pr-3" style={{ color: 'var(--lokadia-gray-700)' }}>{m.city ? `${m.city}, ` : ''}{m.country_name}</td>
                        <td className="whitespace-nowrap py-2 pr-3 tabular-nums" style={{ color: 'var(--lokadia-gray-600)' }}>
                          {new Date(m.date_start + 'T00:00:00').toLocaleDateString('fr-FR')} → {new Date(m.date_end + 'T00:00:00').toLocaleDateString('fr-FR')}
                        </td>
                        {Object.keys(COMPLIANCE_LABELS).map((kind) => (
                          <td key={kind} className="py-2 pr-3 font-semibold" style={{ color: by.get(kind) ? 'var(--lokadia-success)' : 'var(--lokadia-warning)' }}>
                            {by.get(kind) ? 'Oui' : 'Non'}
                          </td>
                        ))}
                        <td className="py-2" style={{ color: 'var(--lokadia-gray-700)' }}>
                          {receipt?.read_at
                            ? `Signé par ${receipt.read_name ?? '—'} le ${new Date(receipt.read_at).toLocaleDateString('fr-FR')}`
                            : receipt ? 'Envoyé, non signé' : 'Non envoyé'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {report.incomplete.length > 0 && (
            <div className="mt-5 rounded-xl p-4" style={{ background: 'var(--lokadia-warning-bg, #FFFBEB)' }}>
              <p className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--lokadia-warning)' }}>
                <AlertTriangle size={14} /> {report.incomplete.length} dossier{report.incomplete.length > 1 ? 's' : ''} incomplet{report.incomplete.length > 1 ? 's' : ''} au moment de l'édition
              </p>
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
                Ces missions sont listées ci-dessus avec le détail des éléments manquants.
              </p>
            </div>
          )}

          <footer className="mt-5 border-t pt-3 text-[10px] leading-relaxed" style={{ borderColor: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-400)' }}>
            Document généré par Lokadia Pro à partir des données saisies par l'organisation et des
            accusés de lecture horodatés côté serveur. Les Lokascore éventuellement consultés dans
            l'application sont des indicateurs indicatifs, sourcés et datés, qui ne se substituent
            pas aux recommandations officielles des autorités compétentes.
          </footer>
        </div>
      )}

      {/* ─── Journal d'audit ─── */}
      {tab === 'audit' && (
        <div className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <div className="border-b px-5 py-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Journal d'audit</h2>
            <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
              Registre append-only : une entrée écrite ne peut plus être modifiée ni supprimée,
              y compris par un administrateur. 200 dernières actions.
            </p>
          </div>
          {audit.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
              Aucune action enregistrée pour l'instant. Chaque import, mission, validation ou
              accusé de lecture viendra s'inscrire ici automatiquement.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
                    <th className="px-5 py-2.5 font-bold">Horodatage</th>
                    <th className="px-5 py-2.5 font-bold">Auteur</th>
                    <th className="px-5 py-2.5 font-bold">Action</th>
                    <th className="px-5 py-2.5 font-bold">Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((e) => (
                    <tr key={e.id} className="border-t" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                      <td className="whitespace-nowrap px-5 py-2.5 tabular-nums" style={{ color: 'var(--lokadia-gray-600)' }}>
                        {new Date(e.created_at).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-5 py-2.5 font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>{e.actor_label}</td>
                      <td className="px-5 py-2.5" style={{ color: 'var(--lokadia-gray-700)' }}>{ACTION_LABELS[e.action] ?? e.action}</td>
                      <td className="px-5 py-2.5 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                        {e.detail ? JSON.stringify(e.detail).slice(0, 120) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
