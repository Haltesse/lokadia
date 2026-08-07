/**
 * ProPeopleScreen — effectif de l'organisation.
 *
 * Table triable + recherche, import CSV (coller ou fichier) avec
 * prévisualisation et confirmation explicite du volume, modèle CSV
 * téléchargeable. Écriture réservée aux rôles admin/gestionnaire ;
 * plafond d'effectif appliqué selon l'offre (entitlements).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Upload, Download, Search, Users, X } from 'lucide-react';
import { useOrg } from '../OrgContext';
import {
  fetchTravelers, fetchDepartments, importTravelers,
  type Traveler, type Department,
} from '../proService';
import { parseTravelersCsv, CSV_TEMPLATE, type CsvParseResult } from '../csv';

type SortKey = 'name' | 'department' | 'nationality';

export default function ProPeopleScreen() {
  const { org, membership, entitlements } = useOrg();
  const canWrite = membership?.role === 'admin' || membership?.role === 'manager';

  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');

  // Import
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsed, setParsed] = useState<CsvParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    if (!org) return;
    setStatus('loading');
    try {
      const [t, d] = await Promise.all([fetchTravelers(org.id), fetchDepartments(org.id)]);
      setTravelers(t);
      setDepartments(d);
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

  const deptName = useMemo(() => new Map(departments.map((d) => [d.id, d.name])), [departments]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? travelers.filter((t) =>
          `${t.first_name} ${t.last_name}`.toLowerCase().includes(q)
          || (t.email ?? '').toLowerCase().includes(q)
          || (deptName.get(t.department_id ?? '') ?? '').toLowerCase().includes(q))
      : travelers;
    return [...filtered].sort((a, b) => {
      if (sortKey === 'name') return `${a.last_name} ${a.first_name}`.localeCompare(`${b.last_name} ${b.first_name}`);
      if (sortKey === 'department') return (deptName.get(a.department_id ?? '') ?? '').localeCompare(deptName.get(b.department_id ?? '') ?? '');
      return (a.nationality ?? '').localeCompare(b.nationality ?? '');
    });
  }, [travelers, query, sortKey, deptName]);

  function handleCsv(text: string) {
    setCsvText(text);
    setParsed(text.trim() ? parseTravelersCsv(text) : null);
    setImportMsg(null);
  }

  async function confirmImport() {
    if (!org || !parsed || parsed.rows.length === 0) return;
    const cap = entitlements.maxTravelers;
    if (cap !== null && travelers.length + parsed.rows.length > cap) {
      setImportMsg(`Votre offre ${entitlements.label} est limitée à ${cap} personnes (actuellement ${travelers.length}). Passez à l'offre supérieure pour importer ${parsed.rows.length} personnes de plus.`);
      return;
    }
    setImporting(true);
    try {
      const n = await importTravelers(org.id, parsed.rows);
      setImportMsg(`${n} personne${n > 1 ? 's' : ''} importée${n > 1 ? 's' : ''}.`);
      setCsvText(''); setParsed(null);
      await load();
    } catch (e) {
      setImportMsg(e instanceof Error ? `L'import a échoué : ${e.message}` : 'L\'import a échoué. Vérifiez le fichier et réessayez.');
    } finally {
      setImporting(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'lokadia-pro-effectif-modele.csv'; a.click();
    URL.revokeObjectURL(url);
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
        <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>L'effectif n'a pas pu se charger</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>{errorMsg}</p>
        <button onClick={load} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Effectif</h1>
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            {travelers.length} personne{travelers.length > 1 ? 's' : ''}
            {entitlements.maxTravelers !== null && ` · plafond ${entitlements.label} : ${entitlements.maxTravelers}`}
          </p>
        </div>
        {canWrite && (
          <div className="flex gap-2">
            <button onClick={downloadTemplate} className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold" style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}>
              <Download size={15} /> Modèle CSV
            </button>
            <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>
              <Upload size={15} /> Importer un CSV
            </button>
          </div>
        )}
      </div>

      {/* Import */}
      {importOpen && (
        <div className="rounded-2xl bg-white p-5 lk-fade-in" style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--lokadia-gray-100)' }}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Importer l'effectif</h2>
            <button onClick={() => { setImportOpen(false); setCsvText(''); setParsed(null); setImportMsg(null); }} aria-label="Fermer l'import" className="rounded-lg p-1.5" style={{ color: 'var(--lokadia-gray-400)' }}>
              <X size={16} />
            </button>
          </div>
          <p className="mb-3 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-500)' }}>
            Colonnes reconnues : Prénom, Nom (obligatoires), Email, Téléphone, Nationalité, Département.
            Séparateur virgule ou point-virgule. Les départements manquants sont créés automatiquement.
          </p>
          <div className="flex flex-wrap gap-3">
            <textarea
              value={csvText}
              onChange={(e) => handleCsv(e.target.value)}
              placeholder={'Prénom;Nom;Email;Département\nMarie;Dupont;marie@exemple.fr;Erasmus Espagne'}
              rows={6}
              className="min-w-64 flex-1 rounded-xl p-3 font-mono text-xs outline-none"
              style={{ border: '1px solid var(--lokadia-gray-200)' }}
            />
            <div className="flex w-56 flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) handleCsv(await f.text());
                }}
              />
              <button onClick={() => fileRef.current?.click()} className="rounded-xl border px-3.5 py-2.5 text-sm font-semibold" style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}>
                Choisir un fichier…
              </button>
              {parsed && !parsed.error && (
                <div className="rounded-xl p-3 text-xs" style={{ background: 'var(--lokadia-info-bg)', color: 'var(--lokadia-gray-700)' }}>
                  <strong>{parsed.rows.length}</strong> personne{parsed.rows.length > 1 ? 's' : ''} prête{parsed.rows.length > 1 ? 's' : ''} à importer
                  {parsed.skipped.length > 0 && <> · {parsed.skipped.length} ligne{parsed.skipped.length > 1 ? 's' : ''} ignorée{parsed.skipped.length > 1 ? 's' : ''} (nom manquant)</>}
                </div>
              )}
              {parsed?.error && <p className="text-xs font-semibold text-red-600">{parsed.error}</p>}
              <button
                onClick={confirmImport}
                disabled={!parsed || !!parsed.error || parsed.rows.length === 0 || importing}
                className="rounded-xl px-3.5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                style={{ background: 'var(--lokadia-primary)' }}
              >
                {importing ? 'Import en cours…' : parsed && parsed.rows.length > 0 ? `Importer ${parsed.rows.length} personne${parsed.rows.length > 1 ? 's' : ''}` : 'Importer'}
              </button>
            </div>
          </div>
          {importMsg && <p className="mt-3 text-sm font-semibold" style={{ color: importMsg.includes('échoué') || importMsg.includes('limitée') ? '#DC2626' : '#059669' }}>{importMsg}</p>}
        </div>
      )}

      {/* Liste */}
      {travelers.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <Users className="mx-auto mb-3" size={32} style={{ color: 'var(--lokadia-gray-300)' }} />
          <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Aucune personne dans l'effectif</p>
          <p className="mx-auto mt-1 max-w-sm text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            {canWrite
              ? 'Importez un CSV pour ajouter une promo ou une équipe entière en quelques minutes.'
              : 'Votre rôle est en lecture seule — demandez à un administrateur d\'importer l\'effectif.'}
          </p>
          {canWrite && (
            <button onClick={() => setImportOpen(true)} className="mt-5 rounded-xl px-6 py-3 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>
              Importer l'effectif
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <Search size={15} style={{ color: 'var(--lokadia-gray-400)' }} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une personne, un email, un département…"
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Rechercher dans l'effectif"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
                  {([['name', 'Nom'], ['department', 'Département'], ['nationality', 'Nationalité']] as [SortKey, string][]).map(([key, label]) => (
                    <th key={key} className="px-4 py-2.5">
                      <button onClick={() => setSortKey(key)} className="font-bold" style={{ color: sortKey === key ? 'var(--lokadia-primary)' : undefined }}>
                        {label}{sortKey === key ? ' ↓' : ''}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-2.5 font-bold">Email</th>
                  <th className="px-4 py-2.5 font-bold">Téléphone</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id} className="border-t" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                    <td className="px-4 py-2.5 font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>{t.last_name.toUpperCase()} {t.first_name}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--lokadia-gray-600)' }}>{deptName.get(t.department_id ?? '') ?? '—'}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--lokadia-gray-600)' }}>{t.nationality ?? '—'}</td>
                    <td className="px-4 py-2.5" style={{ color: 'var(--lokadia-gray-600)' }}>{t.email ?? '—'}</td>
                    <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--lokadia-gray-600)' }}>{t.phone ?? '—'}</td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
                    Aucun résultat pour « {query} ».
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
