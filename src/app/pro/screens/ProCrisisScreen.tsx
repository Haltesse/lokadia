/**
 * ProCrisisScreen — cellule de crise.
 *
 * Trois moments de la gestion d'un événement :
 *   1. Ouvrir — incident réel ou exercice (le mode exercice n'alarme
 *      personne mais produit la même preuve d'entraînement).
 *   2. Interroger — check-in « Êtes-vous en sécurité ? » ciblé, avec
 *      confirmation explicite du volume avant envoi.
 *   3. Suivre — réponses en temps réel, relance des non-répondants,
 *      escalade vers l'astreinte, main courante horodatée.
 *
 * Règles d'affichage : la sévérité n'est jamais portée par la seule
 * couleur (icône + libellé), le rouge est réservé à l'urgence réelle, et
 * aucun envoi n'a lieu sans confirmation rappelant le nombre de personnes.
 */
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Siren, Plus, X, Send, Users, CheckCircle2, AlertTriangle, Clock,
  PhoneCall, Link2, ClipboardList, GraduationCap, Radio,
} from 'lucide-react';
import { useOrg } from '../OrgContext';
import { useAuth } from '../../context/AuthContext';
import {
  fetchCrisisEvents, fetchCrisisLog, openCrisisEvent, closeCrisisEvent,
  addCrisisLogEntry, fetchMissions, targetsForScope, createCheckin,
  fetchCheckins, fetchCheckinResponses, dispatchCheckin, checkinUrl,
  fetchEscalationContacts,
  type CrisisEvent, type CrisisLogEntry, type CheckinRequest,
  type CheckinResponseWithTraveler, type MissionWithCompliance,
  type EscalationContact, type DispatchResult,
} from '../proService';
import { hasFeature } from '../entitlements';

const SEVERITY_META: Record<string, { label: string; color: string; bg: string; Icon: typeof Siren }> = {
  info: { label: 'Information', color: '#0369A1', bg: 'rgba(14,165,233,0.12)', Icon: Radio },
  vigilance: { label: 'Vigilance', color: '#B45309', bg: 'rgba(245,158,11,0.14)', Icon: AlertTriangle },
  urgent: { label: 'Urgence', color: '#B91C1C', bg: 'rgba(220,38,38,0.14)', Icon: Siren },
};

/** Écran affiché quand l'offre ne couvre pas la gestion de crise. */
function CrisisLocked() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
      <Siren className="mx-auto mb-3" size={32} style={{ color: 'var(--lokadia-gray-300)' }} />
      <h1 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
        La cellule de crise est incluse à partir de l'offre Pro
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
        Message groupé, check-in « Je suis en sécurité » avec suivi des réponses,
        relance automatique des non-répondants et exercices de crise.
        Votre offre Starter couvre l'effectif, les missions et la conformité.
      </p>
    </div>
  );
}

export default function ProCrisisScreen() {
  const { user } = useAuth();
  const { org, membership, entitlements } = useOrg();
  const canWrite = membership?.role === 'admin' || membership?.role === 'manager';
  const actor = user ? { id: user.id, email: user.email } : null;

  const [events, setEvents] = useState<CrisisEvent[]>([]);
  const [checkins, setCheckins] = useState<CheckinRequest[]>([]);
  const [missions, setMissions] = useState<MissionWithCompliance[]>([]);
  const [escalation, setEscalation] = useState<EscalationContact[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedEvent, setSelectedEvent] = useState<CrisisEvent | null>(null);
  const [logEntries, setLogEntries] = useState<CrisisLogEntry[]>([]);
  const [logDraft, setLogDraft] = useState('');

  const [selectedCheckin, setSelectedCheckin] = useState<CheckinRequest | null>(null);
  const [responses, setResponses] = useState<CheckinResponseWithTraveler[]>([]);
  const [dispatchMsg, setDispatchMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Formulaires
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '', description: '', countryIso: '', city: '', severity: 'vigilance', isExercise: false,
  });
  const [checkinFormOpen, setCheckinFormOpen] = useState(false);
  const [checkinForm, setCheckinForm] = useState({
    message: 'Merci de confirmer votre situation dès que possible.',
    countryIso: '', askPosition: false, isExercise: false,
  });
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    if (!org) return;
    setStatus('loading');
    try {
      const [e, c, m, esc] = await Promise.all([
        fetchCrisisEvents(org.id), fetchCheckins(org.id),
        fetchMissions(org.id), fetchEscalationContacts(org.id),
      ]);
      setEvents(e); setCheckins(c); setMissions(m); setEscalation(esc);
      setStatus('ready');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Chargement impossible.');
      setStatus('error');
    }
  }, [org]);

  useEffect(() => { load(); }, [load]);

  // Suivi des réponses : rafraîchissement régulier tant qu'un check-in est ouvert
  useEffect(() => {
    if (!selectedCheckin) return;
    let cancelled = false;
    async function tick() {
      try {
        const r = await fetchCheckinResponses(selectedCheckin!.id);
        if (!cancelled) setResponses(r);
      } catch {
        // Réseau instable en crise : on retentera au prochain cycle
      }
    }
    tick();
    const interval = window.setInterval(tick, 15000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [selectedCheckin]);

  useEffect(() => {
    if (!selectedEvent) { setLogEntries([]); return; }
    let cancelled = false;
    fetchCrisisLog(selectedEvent.id)
      .then((l) => { if (!cancelled) setLogEntries(l); })
      .catch(() => { /* la main courante se rechargera à la prochaine action */ });
    return () => { cancelled = true; };
  }, [selectedEvent]);

  // Pays où l'organisation a des personnes aujourd'hui
  const countries = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of missions) map.set(m.country_iso.toUpperCase(), m.country_name);
    return [...map.entries()].map(([iso, name]) => ({ iso, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [missions]);

  const previewTargets = useMemo(
    () => targetsForScope(missions, { countryIso: checkinForm.countryIso || null, missionsOnly: true }),
    [missions, checkinForm.countryIso],
  );

  const stats = useMemo(() => {
    const safe = responses.filter((r) => r.status === 'safe').length;
    const help = responses.filter((r) => r.status === 'help').length;
    const pending = responses.filter((r) => r.status === 'pending').length;
    const answered = responses.filter((r) => r.responded_at);
    // Délai médian de réponse — mesure honnête de la réactivité réelle
    let medianMin: number | null = null;
    if (answered.length > 0 && selectedCheckin) {
      const start = new Date(selectedCheckin.created_at).getTime();
      const delays = answered
        .map((r) => (new Date(r.responded_at as string).getTime() - start) / 60000)
        .sort((a, b) => a - b);
      medianMin = Math.round(delays[Math.floor(delays.length / 2)]);
    }
    return { safe, help, pending, total: responses.length, medianMin };
  }, [responses, selectedCheckin]);

  if (!hasFeature(org?.tier, 'crisis')) return <CrisisLocked />;

  async function submitEvent(e: FormEvent) {
    e.preventDefault();
    if (!org || !actor) return;
    setFormError('');
    if (eventForm.title.trim().length < 2) { setFormError("Donnez un intitulé à l'événement."); return; }
    setBusy(true);
    try {
      await openCrisisEvent(org.id, actor, {
        title: eventForm.title.trim(),
        description: eventForm.description.trim() || null,
        country_iso: eventForm.countryIso || null,
        city: eventForm.city.trim() || null,
        severity: eventForm.severity,
        is_exercise: eventForm.isExercise,
      });
      setEventFormOpen(false);
      setEventForm({ title: '', description: '', countryIso: '', city: '', severity: 'vigilance', isExercise: false });
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Ouverture impossible.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCheckin(e: FormEvent) {
    e.preventDefault();
    if (!org || !actor) return;
    setFormError('');
    if (checkinForm.message.trim().length < 5) { setFormError('Rédigez le message envoyé aux voyageurs.'); return; }
    if (previewTargets.length === 0) { setFormError('Aucune personne en mission ne correspond à ce ciblage.'); return; }

    const scopeLabel = checkinForm.countryIso
      ? `Personnes en mission — ${countries.find((c) => c.iso === checkinForm.countryIso)?.name ?? checkinForm.countryIso}`
      : 'Toutes les personnes en mission aujourd\'hui';

    const pays = new Set(previewTargets.map((t) => t.countryName)).size;
    const confirmation = checkinForm.isExercise
      ? `EXERCICE — ce check-in sera envoyé à ${previewTargets.length} personne(s) dans ${pays} pays. Les destinataires verront qu'il s'agit d'un exercice. Confirmer ?`
      : `Ce check-in partira à ${previewTargets.length} personne(s) dans ${pays} pays. Confirmer l'envoi ?`;
    if (!window.confirm(confirmation)) return;

    setBusy(true);
    try {
      const requestId = await createCheckin(org.id, actor, {
        eventId: selectedEvent?.id ?? null,
        message: checkinForm.message.trim(),
        scopeLabel,
        isExercise: checkinForm.isExercise,
        askPosition: checkinForm.askPosition,
        targets: previewTargets.map((t) => ({ travelerId: t.travelerId, missionId: t.missionId })),
      });
      const result = await dispatchCheckin(org.id, requestId, false);
      setDispatchMsg(describeDispatch(result));
      setCheckinFormOpen(false);
      await load();
      const fresh = await fetchCheckins(org.id);
      setSelectedCheckin(fresh.find((c) => c.id === requestId) ?? null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  }

  function describeDispatch(r: DispatchResult): string {
    const parts = [`${r.targeted} personne(s) ciblée(s)`, `${r.pushed} notification(s) délivrée(s)`];
    if (r.without_push > 0) parts.push(`${r.without_push} sans notification (pas encore abonnée) — transmettez-leur leur lien`);
    if (r.failed > 0) parts.push(`${r.failed} échec(s) d'envoi`);
    if (r.removed > 0) parts.push(`${r.removed} abonnement(s) expiré(s) retiré(s)`);
    return parts.join(' · ');
  }

  async function relaunch() {
    if (!org || !selectedCheckin) return;
    const pending = responses.filter((r) => r.status === 'pending').length;
    if (pending === 0) return;
    if (!window.confirm(`Relancer les ${pending} personne(s) sans réponse ?`)) return;
    setBusy(true);
    try {
      const result = await dispatchCheckin(org.id, selectedCheckin.id, true);
      setDispatchMsg(`Relance : ${describeDispatch(result)}`);
      setResponses(await fetchCheckinResponses(selectedCheckin.id));
    } catch (err) {
      setDispatchMsg(err instanceof Error ? err.message : 'Relance impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function submitLog(e: FormEvent) {
    e.preventDefault();
    if (!org || !actor || !selectedEvent || logDraft.trim().length < 2) return;
    try {
      await addCrisisLogEntry(org.id, actor, selectedEvent.id, logDraft.trim(), 'note');
      setLogDraft('');
      setLogEntries(await fetchCrisisLog(selectedEvent.id));
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Ajout impossible.');
    }
  }

  async function endEvent(ev: CrisisEvent) {
    if (!org || !actor) return;
    if (!window.confirm(`Clore « ${ev.title} » ? La main courante reste consultable et exportable.`)) return;
    await closeCrisisEvent(org.id, actor, ev.id);
    setSelectedEvent(null);
    await load();
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
        <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>La cellule de crise n'a pas pu se charger</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>{errorMsg}</p>
        <button onClick={load} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>Réessayer</button>
      </div>
    );
  }

  const openEvents = events.filter((e) => e.status === 'open');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Cellule de crise</h1>
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            {openEvents.length > 0
              ? `${openEvents.length} événement${openEvents.length > 1 ? 's' : ''} en cours`
              : 'Aucun événement en cours'}
            {' · '}offre {entitlements.label}
          </p>
        </div>
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setCheckinForm({ ...checkinForm, isExercise: true }); setCheckinFormOpen(true); }}
              className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold"
              style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}
            >
              <GraduationCap size={15} /> Lancer un exercice
            </button>
            <button
              onClick={() => { setCheckinForm({ ...checkinForm, isExercise: false }); setCheckinFormOpen(true); }}
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white"
              style={{ background: '#B91C1C' }}
            >
              <Send size={15} /> Lancer un check-in
            </button>
            <button
              onClick={() => setEventFormOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white"
              style={{ background: 'var(--lokadia-primary)' }}
            >
              <Plus size={15} /> Ouvrir un événement
            </button>
          </div>
        )}
      </div>

      {dispatchMsg && (
        <p className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'var(--lokadia-info-bg)', color: 'var(--lokadia-gray-700)' }}>
          {dispatchMsg}
        </p>
      )}

      {/* ─── Formulaire événement ─── */}
      {eventFormOpen && (
        <form onSubmit={submitEvent} className="rounded-2xl bg-white p-5 lk-fade-in" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--lokadia-gray-100)' }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Ouvrir un événement</h2>
            <button type="button" onClick={() => setEventFormOpen(false)} aria-label="Fermer" className="rounded-lg p-1.5" style={{ color: 'var(--lokadia-gray-400)' }}><X size={16} /></button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Intitulé</span>
              <input type="text" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="Séisme — région de Tokyo" className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Pays concerné</span>
              <select value={eventForm.countryIso} onChange={(e) => setEventForm({ ...eventForm, countryIso: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
                <option value="">Tous / non précisé</option>
                {countries.map((c) => <option key={c.iso} value={c.iso}>{c.name}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Sévérité</span>
              <select value={eventForm.severity} onChange={(e) => setEventForm({ ...eventForm, severity: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
                {Object.entries(SEVERITY_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
              </select>
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Description (facultative)</span>
              <textarea value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} rows={3} className="w-full rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }} />
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={eventForm.isExercise} onChange={(e) => setEventForm({ ...eventForm, isExercise: e.target.checked })} className="h-4 w-4" />
            <span style={{ color: 'var(--lokadia-gray-700)' }}>Exercice — n'alarme personne, mais produit la preuve d'entraînement</span>
          </label>
          {formError && <p className="mt-3 text-sm font-semibold text-red-600">{formError}</p>}
          <button type="submit" disabled={busy} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--lokadia-primary)' }}>
            {busy ? 'Ouverture…' : "Ouvrir l'événement"}
          </button>
        </form>
      )}

      {/* ─── Formulaire check-in ─── */}
      {checkinFormOpen && (
        <form onSubmit={submitCheckin} className="rounded-2xl bg-white p-5 lk-fade-in" style={{ boxShadow: 'var(--shadow-md)', border: `2px solid ${checkinForm.isExercise ? 'var(--lokadia-gray-200)' : '#B91C1C'}` }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              {checkinForm.isExercise ? <GraduationCap size={16} /> : <Siren size={16} style={{ color: '#B91C1C' }} />}
              {checkinForm.isExercise ? 'Exercice de check-in' : 'Check-in de sécurité'}
            </h2>
            <button type="button" onClick={() => setCheckinFormOpen(false)} aria-label="Fermer" className="rounded-lg p-1.5" style={{ color: 'var(--lokadia-gray-400)' }}><X size={16} /></button>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Message envoyé</span>
            <textarea value={checkinForm.message} onChange={(e) => setCheckinForm({ ...checkinForm, message: e.target.value })} rows={3} className="w-full rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }} />
          </label>

          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Ciblage</span>
              <select value={checkinForm.countryIso} onChange={(e) => setCheckinForm({ ...checkinForm, countryIso: e.target.value })} className="w-full rounded-xl border px-3 py-2.5 text-sm" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
                <option value="">Toutes les personnes en mission aujourd'hui</option>
                {countries.map((c) => <option key={c.iso} value={c.iso}>Personnes en mission — {c.name}</option>)}
              </select>
            </label>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={checkinForm.askPosition} onChange={(e) => setCheckinForm({ ...checkinForm, askPosition: e.target.checked })} className="h-4 w-4" />
                <span style={{ color: 'var(--lokadia-gray-700)' }}>Proposer de joindre sa position (facultatif côté voyageur)</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={checkinForm.isExercise} onChange={(e) => setCheckinForm({ ...checkinForm, isExercise: e.target.checked })} className="h-4 w-4" />
                <span style={{ color: 'var(--lokadia-gray-700)' }}>Mode exercice</span>
              </label>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl px-3.5 py-2.5" style={{ background: previewTargets.length > 0 ? 'var(--lokadia-info-bg)' : 'var(--lokadia-gray-100)' }}>
            <Users size={15} style={{ color: 'var(--lokadia-primary)' }} />
            <p className="text-xs font-semibold" style={{ color: 'var(--lokadia-gray-700)' }}>
              {previewTargets.length === 0
                ? 'Aucune personne en mission ne correspond à ce ciblage.'
                : `${previewTargets.length} personne(s) seront interrogées, dans ${new Set(previewTargets.map((t) => t.countryName)).size} pays.`}
            </p>
          </div>

          {formError && <p className="mt-3 text-sm font-semibold text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={busy || previewTargets.length === 0}
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            style={{ background: checkinForm.isExercise ? 'var(--lokadia-primary)' : '#B91C1C' }}
          >
            <Send size={15} />
            {busy ? 'Envoi…' : checkinForm.isExercise ? "Lancer l'exercice" : 'Envoyer le check-in'}
          </button>
        </form>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          {/* ─── Suivi du check-in sélectionné ─── */}
          {selectedCheckin && (
            <section className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {selectedCheckin.is_exercise && (
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-600)' }}>Exercice</span>
                    )}
                    Suivi des réponses
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                    {selectedCheckin.scope_label} · lancé le {new Date(selectedCheckin.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {canWrite && stats.pending > 0 && (
                    <button onClick={relaunch} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold disabled:opacity-50" style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}>
                      <Send size={13} /> Relancer les {stats.pending} sans réponse
                    </button>
                  )}
                  <button onClick={() => setSelectedCheckin(null)} aria-label="Fermer le suivi" className="rounded-lg p-1.5" style={{ color: 'var(--lokadia-gray-400)' }}><X size={15} /></button>
                </div>
              </div>

              <div className="grid gap-3 border-b px-5 py-4 sm:grid-cols-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                {[
                  { label: 'En sécurité', value: stats.safe, color: '#047857', Icon: CheckCircle2 },
                  { label: "Besoin d'aide", value: stats.help, color: '#B91C1C', Icon: AlertTriangle },
                  { label: 'Sans réponse', value: stats.pending, color: '#B45309', Icon: Clock },
                  { label: 'Délai médian', value: stats.medianMin !== null ? `${stats.medianMin} min` : '—', color: 'var(--lokadia-gray-700)', Icon: Clock },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
                      <s.Icon size={12} /> {s.label}
                    </p>
                    <p className="mt-0.5 text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left text-xs uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
                      <th className="px-5 py-2.5 font-bold">Personne</th>
                      <th className="px-5 py-2.5 font-bold">Réponse</th>
                      <th className="px-5 py-2.5 font-bold">Reçue</th>
                      <th className="px-5 py-2.5 font-bold">Lien</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...responses]
                      .sort((a, b) => {
                        const order: Record<string, number> = { help: 0, pending: 1, safe: 2 };
                        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
                      })
                      .map((r) => (
                        <tr key={r.id} className="border-t" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                          <td className="px-5 py-2.5 font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                            {r.travelers ? `${r.travelers.last_name.toUpperCase()} ${r.travelers.first_name}` : '—'}
                            {r.status === 'help' && r.travelers?.phone && (
                              <a href={`tel:${r.travelers.phone}`} className="ml-2 inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#B91C1C' }}>
                                <PhoneCall size={11} /> {r.travelers.phone}
                              </a>
                            )}
                          </td>
                          <td className="px-5 py-2.5">
                            {r.status === 'safe' && <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#047857' }}><CheckCircle2 size={13} /> En sécurité</span>}
                            {r.status === 'help' && <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: '#B91C1C' }}><AlertTriangle size={13} /> Besoin d'aide</span>}
                            {r.status === 'pending' && <span className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: '#B45309' }}><Clock size={13} /> Sans réponse{r.reminded_at ? ' (relancée)' : ''}</span>}
                            {r.note && <p className="mt-0.5 text-[11px]" style={{ color: 'var(--lokadia-gray-600)' }}>{r.note}</p>}
                          </td>
                          <td className="px-5 py-2.5 text-xs tabular-nums" style={{ color: 'var(--lokadia-gray-600)' }}>
                            {r.responded_at ? new Date(r.responded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                          </td>
                          <td className="px-5 py-2.5">
                            <button
                              onClick={() => navigator.clipboard.writeText(checkinUrl(r.token))}
                              className="inline-flex items-center gap-1 text-xs font-semibold"
                              style={{ color: 'var(--lokadia-primary)' }}
                              title="Copier le lien personnel de réponse"
                            >
                              <Link2 size={12} /> Copier
                            </button>
                          </td>
                        </tr>
                      ))}
                    {responses.length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>Chargement des destinataires…</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ─── Check-ins récents ─── */}
          <section className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
            <div className="border-b px-5 py-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Check-ins</h2>
            </div>
            {checkins.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
                Aucun check-in lancé. Commencez par un exercice : il entraîne l'équipe et
                produit une preuve d'entraînement, sans alarmer personne.
              </p>
            ) : (
              <ul>
                {checkins.map((c) => (
                  <li key={c.id} className="border-t first:border-t-0" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                    <button onClick={() => setSelectedCheckin(c)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-gray-50">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                          {c.is_exercise && <span className="mr-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-600)' }}>Exercice</span>}
                          {c.scope_label}
                        </p>
                        <p className="truncate text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>{c.message}</p>
                      </div>
                      <span className="flex-shrink-0 text-xs tabular-nums" style={{ color: 'var(--lokadia-gray-500)' }}>
                        {new Date(c.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ─── Colonne latérale ─── */}
        <div className="space-y-5">
          {/* Événements */}
          <section className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
            <div className="border-b px-4 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Événements</h2>
            </div>
            {events.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                Aucun événement ouvert.
              </p>
            ) : (
              <ul>
                {events.slice(0, 8).map((ev) => {
                  const meta = SEVERITY_META[ev.severity] ?? SEVERITY_META.info;
                  return (
                    <li key={ev.id} className="border-t first:border-t-0" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                      <button onClick={() => setSelectedEvent(selectedEvent?.id === ev.id ? null : ev)} className="w-full px-4 py-3 text-left hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <meta.Icon size={14} style={{ color: ev.status === 'closed' ? 'var(--lokadia-gray-400)' : meta.color }} />
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>{ev.title}</span>
                          {ev.is_exercise && <span className="rounded px-1 py-0.5 text-[9px] font-bold uppercase" style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-500)' }}>Exercice</span>}
                        </div>
                        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                          {meta.label} · {ev.status === 'closed' ? 'clos' : 'en cours'} · {new Date(ev.opened_at).toLocaleDateString('fr-FR')}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Main courante */}
          {selectedEvent && (
            <section className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                <h2 className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                  <ClipboardList size={14} /> Main courante
                </h2>
                {canWrite && selectedEvent.status === 'open' && (
                  <button onClick={() => endEvent(selectedEvent)} className="text-xs font-semibold" style={{ color: 'var(--lokadia-gray-500)' }}>Clore</button>
                )}
              </div>
              <ol className="max-h-72 space-y-2 overflow-y-auto px-4 py-3">
                {logEntries.map((l) => (
                  <li key={l.id} className="border-l-2 pl-2.5" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
                    <p className="text-[11px] tabular-nums" style={{ color: 'var(--lokadia-gray-500)' }}>
                      {new Date(l.created_at).toLocaleString('fr-FR')} · {l.actor_label}
                    </p>
                    <p className="text-xs leading-snug" style={{ color: 'var(--lokadia-gray-700)' }}>{l.entry}</p>
                  </li>
                ))}
                {logEntries.length === 0 && (
                  <li className="text-center text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                    Les décisions et les réponses viendront s'inscrire ici, horodatées.
                  </li>
                )}
              </ol>
              {canWrite && selectedEvent.status === 'open' && (
                <form onSubmit={submitLog} className="border-t px-4 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                  <textarea
                    value={logDraft}
                    onChange={(e) => setLogDraft(e.target.value)}
                    rows={2}
                    placeholder="Consigner une décision ou une observation…"
                    className="w-full rounded-lg border p-2 text-xs"
                    style={{ borderColor: 'var(--lokadia-gray-200)' }}
                  />
                  <button type="submit" disabled={logDraft.trim().length < 2} className="mt-2 w-full rounded-lg py-2 text-xs font-bold text-white disabled:opacity-40" style={{ background: 'var(--lokadia-primary)' }}>
                    Ajouter à la main courante
                  </button>
                </form>
              )}
            </section>
          )}

          {/* Astreinte */}
          <section className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
            <div className="border-b px-4 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
              <h2 className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                <PhoneCall size={14} /> Arbre d'escalade
              </h2>
            </div>
            {escalation.length === 0 ? (
              <p className="px-4 py-5 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-500)' }}>
                Aucun contact d'astreinte. Renseignez-les dans les réglages : en crise,
                savoir qui appeler et dans quel ordre fait gagner de longues minutes.
              </p>
            ) : (
              <ol className="divide-y" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                {escalation.map((c) => (
                  <li key={c.id} className="px-4 py-2.5">
                    <p className="text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                      {c.rank}. {c.name}
                      {c.role && <span className="ml-1 text-xs font-normal" style={{ color: 'var(--lokadia-gray-500)' }}>— {c.role}</span>}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--lokadia-gray-600)' }}>
                      {c.phone && <a href={`tel:${c.phone}`} className="font-semibold" style={{ color: 'var(--lokadia-primary)' }}>{c.phone}</a>}
                      {c.phone && c.email && ' · '}
                      {c.email}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--lokadia-gray-400)' }}>Escalade après {c.delay_min} min</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
