/**
 * ProBriefingsScreen — briefings pré-départ par pays.
 *
 * Contrainte produit appliquée dans le formulaire : un briefing ne peut pas
 * être enregistré sans SOURCE officielle identifiable. C'est ce qui rend
 * l'accusé de lecture opposable (« informé de quoi, par quelle source »).
 * Un raccourci propose les sources officielles déjà branchées côté produit.
 */
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FileText, Plus, X, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { useOrg } from '../OrgContext';
import { useAuth } from '../../context/AuthContext';
import {
  fetchBriefings, saveBriefing, deleteBriefing,
  type Briefing, type BriefingInput,
} from '../proService';
import { destinationsDatabase } from '../../data/destinationData';
import { DESTINATION_TO_COUNTRY_ISO } from '../../data/countryRiskData';

/** Sources officielles déjà utilisées par le produit (cf. lokadia-product-context). */
const OFFICIAL_SOURCES = [
  { label: 'France Diplomatie (MEAE)', url: 'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/' },
  { label: 'UK FCDO', url: 'https://www.gov.uk/foreign-travel-advice' },
  { label: 'US State Department', url: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html' },
  { label: 'OMS (Organisation mondiale de la santé)', url: 'https://www.who.int/countries' },
];

/** Pays disponibles, dérivés du catalogue destinations. */
const COUNTRIES = [...new Map(
  Object.values(destinationsDatabase).map((d) => [
    d.country,
    { iso: (DESTINATION_TO_COUNTRY_ISO[d.id] ?? '').toUpperCase(), name: d.country },
  ]),
).values()]
  .filter((c) => c.iso.length === 2)
  .sort((a, b) => a.name.localeCompare(b.name));

const EMPTY: BriefingInput = {
  country_iso: '', country_name: '', title: '', content: '',
  source: OFFICIAL_SOURCES[0].label, source_url: OFFICIAL_SOURCES[0].url,
};

export default function ProBriefingsScreen() {
  const { user } = useAuth();
  const { org, membership } = useOrg();
  const canWrite = membership?.role === 'admin' || membership?.role === 'manager';

  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  const [editing, setEditing] = useState<Briefing | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<BriefingInput>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  async function load() {
    if (!org) return;
    setStatus('loading');
    try {
      setBriefings(await fetchBriefings(org.id));
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

  const usedIso = useMemo(
    () => new Set(briefings.filter((b) => b.id !== editing?.id).map((b) => b.country_iso)),
    [briefings, editing],
  );

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(b: Briefing) {
    setEditing(b);
    setForm({
      country_iso: b.country_iso, country_name: b.country_name, title: b.title,
      content: b.content, source: b.source, source_url: b.source_url,
    });
    setFormError('');
    setFormOpen(true);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!org || !user) return;
    setFormError('');

    if (form.country_iso.length !== 2) { setFormError('Choisissez le pays concerné.'); return; }
    if (form.title.trim().length < 2) { setFormError('Donnez un titre au briefing.'); return; }
    if (form.content.trim().length < 20) { setFormError('Le contenu doit faire au moins 20 caractères — c\'est ce que le voyageur devra lire et signer.'); return; }
    if (form.source.trim().length < 3) { setFormError('Une source officielle est obligatoire : c\'est elle qui rend l\'accusé de lecture opposable.'); return; }
    if (usedIso.has(form.country_iso)) { setFormError('Un briefing existe déjà pour ce pays — modifiez-le plutôt que d\'en créer un second.'); return; }

    setSaving(true);
    try {
      await saveBriefing(org.id, { id: user.id, email: user.email }, {
        ...form,
        title: form.title.trim(),
        content: form.content.trim(),
        source: form.source.trim(),
        source_url: form.source_url?.trim() || null,
      }, editing?.id);
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Enregistrement impossible.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(b: Briefing) {
    if (!org || !user) return;
    if (!window.confirm(`Supprimer le briefing « ${b.title} » (${b.country_name}) ? Les accusés déjà signés restent conservés dans le registre.`)) return;
    try {
      await deleteBriefing(org.id, { id: user.id, email: user.email }, b.id, b.country_name);
      await load();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Suppression impossible.');
    }
  }

  if (status === 'loading') {
    return (
      <div aria-busy="true">
        <div className="lk-skeleton mb-5 h-7 w-48 rounded-lg" />
        <div className="lk-skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Les briefings n'ont pas pu se charger</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>{errorMsg}</p>
        <button onClick={load} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Briefings pré-départ</h1>
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            Un briefing par pays. Chaque envoi produit un accusé de lecture nominatif et horodaté.
          </p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>
            <Plus size={15} /> Nouveau briefing
          </button>
        )}
      </div>

      {formOpen && (
        <form onSubmit={submit} className="rounded-2xl bg-white p-5 lk-fade-in" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--lokadia-gray-100)' }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              {editing ? `Modifier le briefing — ${editing.country_name}` : 'Nouveau briefing'}
            </h2>
            <button type="button" onClick={() => setFormOpen(false)} aria-label="Fermer" className="rounded-lg p-1.5" style={{ color: 'var(--lokadia-gray-400)' }}><X size={16} /></button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Pays</span>
              <select
                value={form.country_iso}
                onChange={(e) => {
                  const c = COUNTRIES.find((x) => x.iso === e.target.value);
                  setForm({ ...form, country_iso: e.target.value, country_name: c?.name ?? '' });
                }}
                disabled={!!editing}
                className="w-full rounded-xl border px-3 py-2.5 text-sm disabled:opacity-60"
                style={{ borderColor: 'var(--lokadia-gray-200)' }}
              >
                <option value="">Choisir…</option>
                {COUNTRIES.map((c) => (
                  <option key={c.iso} value={c.iso} disabled={usedIso.has(c.iso)}>
                    {c.name}{usedIso.has(c.iso) ? ' (déjà couvert)' : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Titre</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Briefing sécurité — mobilité Espagne"
                className="w-full rounded-xl border px-3 py-2.5 text-sm"
                style={{ borderColor: 'var(--lokadia-gray-200)' }}
              />
            </label>
          </div>

          <label className="mt-3 block text-sm">
            <span className="mb-1 block text-xs font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>
              Contenu lu et signé par le voyageur
            </span>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              placeholder={'Consignes de sécurité, zones à éviter, numéros d\'urgence locaux, conduite à tenir en cas d\'incident…'}
              className="w-full rounded-xl border p-3 text-sm leading-relaxed"
              style={{ borderColor: 'var(--lokadia-gray-200)' }}
            />
          </label>

          <fieldset className="mt-3 rounded-xl p-3.5" style={{ background: 'var(--lokadia-info-bg)' }}>
            <legend className="px-1 text-xs font-bold" style={{ color: 'var(--lokadia-primary)' }}>Source officielle (obligatoire)</legend>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {OFFICIAL_SOURCES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setForm({ ...form, source: s.label, source_url: s.url })}
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: form.source === s.label ? 'var(--lokadia-primary)' : 'white',
                    color: form.source === s.label ? 'white' : 'var(--lokadia-gray-600)',
                    border: '1px solid var(--lokadia-gray-200)',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="Nom de la source"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--lokadia-gray-200)' }}
              />
              <input
                type="url"
                value={form.source_url ?? ''}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                placeholder="https://…"
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--lokadia-gray-200)' }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
              La source est affichée au voyageur et conservée dans le registre :
              c'est elle qui prouve <em>de quoi</em> il a été informé.
            </p>
          </fieldset>

          {formError && <p className="mt-3 text-sm font-semibold text-red-600">{formError}</p>}

          <button type="submit" disabled={saving} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--lokadia-primary)' }}>
            {saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Créer le briefing'}
          </button>
        </form>
      )}

      {briefings.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <FileText className="mx-auto mb-3" size={32} style={{ color: 'var(--lokadia-gray-300)' }} />
          <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Aucun briefing rédigé</p>
          <p className="mx-auto mt-1 max-w-md text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            {canWrite
              ? 'Rédigez un briefing par pays de destination. Sans briefing, aucun accusé de lecture ne peut être produit — et c\'est précisément la preuve que réclame un auditeur.'
              : 'Les briefings rédigés par votre organisation apparaîtront ici.'}
          </p>
          {canWrite && (
            <button onClick={openCreate} className="mt-5 rounded-xl px-6 py-3 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>
              Rédiger le premier briefing
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {briefings.map((b) => (
            <article key={b.id} className="rounded-2xl bg-white p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-primary)' }}>{b.country_name}</p>
                  <h2 className="truncate text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{b.title}</h2>
                </div>
                {canWrite && (
                  <div className="flex flex-shrink-0 gap-1">
                    <button onClick={() => openEdit(b)} aria-label={`Modifier le briefing ${b.country_name}`} className="rounded-lg p-1.5" style={{ color: 'var(--lokadia-gray-500)' }}><Pencil size={14} /></button>
                    <button onClick={() => remove(b)} aria-label={`Supprimer le briefing ${b.country_name}`} className="rounded-lg p-1.5 text-red-500"><Trash2 size={14} /></button>
                  </div>
                )}
              </div>
              <p className="mb-3 line-clamp-3 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>{b.content}</p>
              <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                <span className="rounded px-1.5 py-0.5 font-semibold" style={{ background: 'var(--lokadia-gray-100)' }}>{b.source}</span>
                {b.source_url && (
                  <a href={b.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold" style={{ color: 'var(--lokadia-primary)' }}>
                    Consulter <ExternalLink size={10} />
                  </a>
                )}
                <span>MAJ {new Date(b.updated_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
