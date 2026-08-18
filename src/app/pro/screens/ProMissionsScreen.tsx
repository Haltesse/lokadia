/**
 * ProMissionsScreen — missions & dossiers de conformité.
 *
 * Filtres partagés par URL (?filter=active|incomplete|upcoming-incomplete),
 * dossier de conformité éditable en ligne (4 items horodatés), création de
 * mission adossée au catalogue destinations (score disponible) ou saisie
 * libre pays (hors catalogue, affiché honnêtement sans score).
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plane, Plus, X, Send, Link2, Check, ShieldAlert } from 'lucide-react';
import { useOrg } from '../OrgContext';
import {
  fetchMissions, fetchTravelers, createMission, setComplianceStatus,
  sendBriefings, briefingAckUrl,
  isMissionActiveToday, isMissionUpcoming, complianceComplete,
  fetchRiskAssessments, saveRiskAssessment, decideRiskAssessment,
  type MissionWithCompliance, type Traveler, type NewMission, type RiskAssessment,
} from '../proService';
import { destinationsDatabase } from '../../data/destinationData';
import { DESTINATION_TO_COUNTRY_ISO } from '../../data/countryRiskData';
import { useAuth } from '../../context/AuthContext';
import { MissionRiskPanel } from '../components/MissionRiskPanel';
import { RISK_LEVELS, RISK_STATUS_LABEL, type RiskLevel, type RiskStatus } from '../risk';

const FILTERS = [
  { id: 'all', label: 'Toutes' },
  { id: 'active', label: 'En cours' },
  { id: 'incomplete', label: 'Dossier incomplet' },
  { id: 'upcoming-incomplete', label: 'Départ J-30 incomplet' },
] as const;
type FilterId = (typeof FILTERS)[number]['id'];

const COMPLIANCE_LABELS: Record<string, string> = {
  briefing: 'Briefing sécurité',
  insurance: 'Assurance',
  emergency_contact: 'Contact d\'urgence',
  formalities: 'Formalités d\'entrée',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon', submitted: 'Soumise', approved: 'Approuvée',
  refused: 'Refusée', active: 'En cours', done: 'Terminée',
};

const CATALOG = Object.values(destinationsDatabase)
  .map((d) => ({
    id: d.id,
    label: `${d.name} — ${d.country}`,
    country: d.country,
    city: d.name,
    iso: DESTINATION_TO_COUNTRY_ISO[d.id] ?? '',
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function ProMissionsScreen() {
  const { user } = useAuth();
  const { org, membership } = useOrg();
  const canWrite = membership?.role === 'admin' || membership?.role === 'manager';
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (FILTERS.find((f) => f.id === searchParams.get('filter'))?.id ?? 'all') as FilterId;

  const [missions, setMissions] = useState<MissionWithCompliance[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [riskMissionId, setRiskMissionId] = useState<string | null>(null);
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const [briefingMsg, setBriefingMsg] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Création
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ traveler: '', destination: '', otherCountry: '', otherIso: '', start: '', end: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function load() {
    if (!org) return;
    setStatus('loading');
    try {
      const [m, t, r] = await Promise.all([
        fetchMissions(org.id),
        fetchTravelers(org.id),
        fetchRiskAssessments(org.id),
      ]);
      setMissions(m);
      setTravelers(t);
      setRisks(r);
      setStatus('ready');
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Chargement impossible.');
      setStatus('error');
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id]);

  const visible = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const in30 = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    switch (filter) {
      case 'active':
        return missions.filter((m) => isMissionActiveToday(m));
      case 'incomplete':
        return missions.filter((m) => (isMissionActiveToday(m) || isMissionUpcoming(m)) && !complianceComplete(m));
      case 'upcoming-incomplete':
        return missions.filter((m) => m.date_start > today && m.date_start <= in30 && !complianceComplete(m) && m.status !== 'refused' && m.status !== 'done');
      default:
        return missions;
    }
  }, [missions, filter]);

  async function toggleCompliance(missionId: string, itemId: string, kind: string, done: boolean) {
    if (!org || !user) return;
    // Optimiste : l'UI bascule immédiatement, rollback si erreur
    setMissions((prev) => prev.map((m) => ({
      ...m,
      compliance_items: m.compliance_items.map((c) =>
        c.id === itemId ? { ...c, status: done ? 'done' : 'pending', completed_at: done ? new Date().toISOString() : null } : c),
    })));
    try {
      await setComplianceStatus(org.id, { id: user.id, email: user.email }, itemId, kind, missionId, done);
    } catch {
      await load();
    }
  }

  /** Génère les liens d'accusé de briefing pour les missions affichées. */
  async function handleSendBriefings() {
    if (!org || !user || visible.length === 0) return;
    setBriefingMsg(null);
    try {
      const res = await sendBriefings(org.id, { id: user.id, email: user.email }, visible);
      const parts: string[] = [];
      if (res.created > 0) parts.push(`${res.created} lien${res.created > 1 ? 's' : ''} d'accusé généré${res.created > 1 ? 's' : ''}`);
      if (res.alreadySent > 0) parts.push(`${res.alreadySent} déjà envoyé${res.alreadySent > 1 ? 's' : ''}`);
      if (res.skippedNoBriefing.length > 0) {
        parts.push(`aucun briefing rédigé pour : ${res.skippedNoBriefing.join(', ')}`);
      }
      setBriefingMsg(parts.join(' · ') || 'Rien à envoyer.');
      if (res.created > 0) await load();
    } catch (e) {
      setBriefingMsg(e instanceof Error ? e.message : 'Génération impossible.');
    }
  }

  async function submitCreate(e: FormEvent) {
    e.preventDefault();
    setFormError('');
    const catalogEntry = CATALOG.find((c) => c.id === form.destination);
    const isOther = form.destination === '__other__';
    if (!form.traveler) { setFormError('Choisissez la personne qui part.'); return; }
    if (!catalogEntry && !isOther) { setFormError('Choisissez une destination.'); return; }
    if (isOther && (form.otherCountry.trim().length < 2 || form.otherIso.trim().length !== 2)) {
      setFormError('Pour une destination hors catalogue : nom du pays + code ISO à 2 lettres (ex. BR).');
      return;
    }
    if (!form.start || !form.end || form.end < form.start) {
      setFormError('Vérifiez les dates : la fin doit être après le début.');
      return;
    }
    if (!org || !user) return;

    const mission: NewMission = catalogEntry
      ? {
          traveler_id: form.traveler, destination_id: catalogEntry.id,
          country_iso: catalogEntry.iso || catalogEntry.country.slice(0, 2).toUpperCase(),
          country_name: catalogEntry.country, city: catalogEntry.city,
          date_start: form.start, date_end: form.end,
        }
      : {
          traveler_id: form.traveler, destination_id: null,
          country_iso: form.otherIso.trim().toUpperCase(),
          country_name: form.otherCountry.trim(), city: null,
          date_start: form.start, date_end: form.end,
        };

    setSaving(true);
    try {
      await createMission(org.id, { id: user.id, email: user.email }, mission);
      setCreateOpen(false);
      setForm({ traveler: '', destination: '', otherCountry: '', otherIso: '', start: '', end: '' });
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'La création a échoué. Réessayez.');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return (
      <div aria-busy="true">
        <div className="lk-skeleton mb-5 h-7 w-48 rounded-lg" />
        <div className="lk-skeleton h-80 rounded-2xl" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Les missions n'ont pas pu se charger</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>{errorMsg}</p>
        <button onClick={load} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>Réessayer</button>
      </div>
    );
  }

  const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Missions</h1>
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            {missions.length} mission{missions.length > 1 ? 's' : ''} · le dossier de conformité (4 items) se crée automatiquement
          </p>
        </div>
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSendBriefings}
              disabled={visible.length === 0}
              title="Génère un lien d'accusé de lecture nominatif pour chaque mission affichée qui n'en a pas encore."
              className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold disabled:opacity-50"
              style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}
            >
              <Send size={15} /> Envoyer les briefings ({visible.length})
            </button>
            <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>
              <Plus size={15} /> Nouvelle mission
            </button>
          </div>
        )}
      </div>

      {briefingMsg && (
        <p className="rounded-xl px-4 py-2.5 text-sm font-semibold" style={{ background: 'var(--lokadia-info-bg)', color: 'var(--lokadia-gray-700)' }}>
          {briefingMsg}
        </p>
      )}

      {/* Filtres (partagés par URL) */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtres missions">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setSearchParams(f.id === 'all' ? {} : { filter: f.id })}
            className="rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors"
            style={{
              background: filter === f.id ? 'var(--lokadia-primary)' : 'white',
              color: filter === f.id ? 'white' : 'var(--lokadia-gray-600)',
              border: '1px solid ' + (filter === f.id ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)'),
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Création */}
      {createOpen && (
        <form onSubmit={submitCreate} className="rounded-2xl bg-white p-5 lk-fade-in" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--lokadia-gray-100)' }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Nouvelle mission</h2>
            <button type="button" onClick={() => setCreateOpen(false)} aria-label="Fermer" className="rounded-lg p-1.5" style={{ color: 'var(--lokadia-gray-400)' }}><X size={16} /></button>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Personne</span>
              <select value={form.traveler} onChange={(e) => setForm({ ...form, traveler: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
                <option value="">Choisir…</option>
                {travelers.map((t) => <option key={t.id} value={t.id}>{t.last_name.toUpperCase()} {t.first_name}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Destination</span>
              <select value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
                <option value="">Choisir…</option>
                {CATALOG.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                <option value="__other__">Autre destination (hors catalogue)</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Départ</span>
              <input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Retour</span>
              <input type="date" value={form.end} min={form.start || undefined} onChange={(e) => setForm({ ...form, end: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }} />
            </label>
          </div>
          {form.destination === '__other__' && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Pays</span>
                <input type="text" value={form.otherCountry} onChange={(e) => setForm({ ...form, otherCountry: e.target.value })} placeholder="Brésil" className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }} />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Code ISO (2 lettres)</span>
                <input type="text" value={form.otherIso} onChange={(e) => setForm({ ...form, otherIso: e.target.value })} placeholder="BR" maxLength={2} className="w-full rounded-xl border px-3 py-2.5 text-sm uppercase" style={{ borderColor: 'var(--lokadia-gray-200)' }} />
              </label>
              <p className="text-xs md:col-span-2" style={{ color: 'var(--lokadia-gray-500)' }}>
                Destination hors catalogue : le Lokascore ne sera pas disponible pour cette mission (affiché honnêtement sur le tableau de bord).
              </p>
            </div>
          )}
          {formError && <p className="mt-3 text-sm font-semibold text-red-600">{formError}</p>}
          <button type="submit" disabled={saving} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--lokadia-primary)' }}>
            {saving ? 'Création…' : 'Créer la mission'}
          </button>
        </form>
      )}

      {/* Liste */}
      {visible.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <Plane className="mx-auto mb-3" size={32} style={{ color: 'var(--lokadia-gray-300)' }} />
          <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            {filter === 'all' ? 'Aucune mission pour le moment' : 'Rien ne correspond à ce filtre'}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            {filter === 'all'
              ? canWrite ? 'Créez la première mission : la conformité se suit automatiquement.' : 'Les missions créées par votre organisation apparaîtront ici.'
              : 'Bonne nouvelle si vous filtriez les dossiers incomplets.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
                <th className="px-4 py-2.5 font-bold">Personne</th>
                <th className="px-4 py-2.5 font-bold">Destination</th>
                <th className="px-4 py-2.5 font-bold">Dates</th>
                <th className="px-4 py-2.5 font-bold">Statut</th>
                <th className="px-4 py-2.5 font-bold">Briefing</th>
                <th className="px-4 py-2.5 font-bold">Dossier de conformité</th>
                <th className="px-4 py-2.5 font-bold">Risque</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((m) => {
                const done = m.compliance_items.filter((c) => c.status === 'done').length;
                return (
                  <tr key={m.id} className="border-t align-top" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                      {m.travelers ? `${m.travelers.last_name.toUpperCase()} ${m.travelers.first_name}` : '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--lokadia-gray-700)' }}>
                      {m.city ? `${m.city}, ` : ''}{m.country_name}
                      {!m.destination_id && <span className="ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-500)' }}>hors catalogue</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums" style={{ color: 'var(--lokadia-gray-600)' }}>
                      {fmtDate(m.date_start)} → {fmtDate(m.date_end)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-600)' }}>
                        {STATUS_LABELS[m.status] ?? m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const receipt = m.briefing_receipts;
                        if (!receipt) {
                          return <span className="text-xs" style={{ color: 'var(--lokadia-gray-400)' }}>Non envoyé</span>;
                        }
                        if (receipt.read_at) {
                          return (
                            <span
                              className="inline-flex items-center gap-1 text-xs font-bold"
                              style={{ color: 'var(--lokadia-success)' }}
                              title={`Accusé signé par ${receipt.read_name ?? '—'} le ${new Date(receipt.read_at).toLocaleString('fr-FR')}`}
                            >
                              <Check size={13} /> Lu le {new Date(receipt.read_at).toLocaleDateString('fr-FR')}
                            </span>
                          );
                        }
                        return (
                          <button
                            onClick={async () => {
                              await navigator.clipboard.writeText(briefingAckUrl(receipt.token));
                              setCopiedToken(receipt.token);
                              window.setTimeout(() => setCopiedToken(null), 2000);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold"
                            style={{ color: 'var(--lokadia-primary)' }}
                            title="Copier le lien d'accusé de lecture à transmettre au voyageur"
                          >
                            <Link2 size={13} />
                            {copiedToken === receipt.token ? 'Lien copié' : 'En attente — copier le lien'}
                          </button>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold tabular-nums" style={{ color: done === 4 ? '#059669' : 'var(--lokadia-warning)' }}>{done}/4</span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.compliance_items.map((c) => (
                            <label
                              key={c.id}
                              title={`${COMPLIANCE_LABELS[c.kind]}${c.completed_at ? ` — validé le ${new Date(c.completed_at).toLocaleDateString('fr-FR')}` : ''}`}
                              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-1.5 py-1 text-[11px] font-semibold"
                              style={{
                                background: c.status === 'done' ? 'rgba(5,150,105,0.1)' : 'var(--lokadia-gray-100)',
                                color: c.status === 'done' ? 'var(--lokadia-success)' : 'var(--lokadia-gray-500)',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={c.status === 'done'}
                                disabled={!canWrite}
                                onChange={(e) => toggleCompliance(m.id, c.id, c.kind, e.target.checked)}
                                className="h-3.5 w-3.5"
                              />
                              {COMPLIANCE_LABELS[c.kind]}
                            </label>
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Évaluation de risque (P5) */}
                    <td className="px-4 py-3">
                      {(() => {
                        const risk = risks.find((r) => r.mission_id === m.id);
                        const level = (risk?.residual_level ?? 1) as RiskLevel;
                        return (
                          <button
                            type="button"
                            onClick={() => setRiskMissionId(riskMissionId === m.id ? null : m.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-bold"
                            style={
                              risk
                                ? { background: RISK_LEVELS[level].bg, color: RISK_LEVELS[level].color }
                                : { background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-500)' }
                            }
                            title={
                              risk
                                ? `${RISK_STATUS_LABEL[risk.status as RiskStatus]} — risque résiduel ${RISK_LEVELS[level].label.toLowerCase()}`
                                : "Aucune évaluation : le départ n'a pas été évalué"
                            }
                          >
                            <ShieldAlert size={13} />
                            {risk
                              ? `${RISK_LEVELS[level].label} · ${RISK_STATUS_LABEL[risk.status as RiskStatus]}`
                              : 'À évaluer'}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Panneau d'évaluation de risque de la mission sélectionnée */}
      {riskMissionId && (() => {
        const mission = missions.find((m) => m.id === riskMissionId);
        if (!mission) return null;
        const risk = risks.find((r) => r.mission_id === riskMissionId) ?? null;
        const label = `${mission.travelers ? mission.travelers.last_name.toUpperCase() : '—'} · ${mission.country_name}`;
        return (
          <div className="mt-5">
            <MissionRiskPanel
              assessment={risk}
              missionLabel={label}
              // Le score de la destination sert de suggestion pour le
              // facteur sécuritaire ; il n'est pas connu hors catalogue.
              lokascore={null}
              canWrite={canWrite}
              currentUserId={user?.id ?? ''}
              onClose={() => setRiskMissionId(null)}
              onSave={async (draft) => {
                if (!org || !user) return;
                await saveRiskAssessment(org.id, { id: user.id, email: user.email }, {
                  mission_id: riskMissionId,
                  ...draft,
                });
                await load();
              }}
              onDecide={async (decision, note) => {
                if (!org || !user || !risk) return;
                await decideRiskAssessment(org.id, { id: user.id, email: user.email }, risk, decision, note);
                await load();
              }}
            />
          </div>
        );
      })()}
    </div>
  );
}
