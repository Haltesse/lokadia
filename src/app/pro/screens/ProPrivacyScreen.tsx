import { useState } from 'react';
import { Download, FileText, ShieldCheck, Table2, Trash2 } from 'lucide-react';
import { useOrg } from '../OrgContext';
import { buildOrgExport, downloadFile, exportTables, toCsv, type ExportTable } from '../dataExport';
import { supabase } from '../../lib/supabase';

/**
 * Pack RGPD de l'organisation (P7).
 *
 * Ce que l'acheteur public réclame en appel d'offres : un registre des
 * traitements, des durées de conservation écrites, un contrat de
 * sous-traitance, et la preuve qu'il peut repartir avec ses données.
 *
 * Deux honnêtetés tenues ici :
 *  · le modèle de contrat de sous-traitance est présenté comme un
 *    **projet à faire relire**, pas comme un document signé — un DPA
 *    généré par un logiciel n'engage personne tant qu'aucun juriste ne
 *    l'a validé ;
 *  · l'export signale les tables qu'il n'a pas pu lire au lieu de les
 *    omettre : un export qu'on croit complet et qui ne l'est pas est pire
 *    qu'un export annoncé partiel.
 */

interface Processing {
  purpose: string;
  legalBasis: string;
  data: string;
  retention: string;
}

/** Registre des traitements — décrit ce que le produit fait réellement. */
const REGISTER: Processing[] = [
  {
    purpose: "Gestion de l'effectif exposé (personnes susceptibles de partir)",
    legalBasis: "Obligation légale de sécurité de l'employeur (art. L4121-1 du code du travail)",
    data: 'Nom, prénom, adresse e-mail professionnelle, rattachement au département',
    retention: "Durée de la relation avec l'organisation, puis suppression à sa demande",
  },
  {
    purpose: 'Suivi des missions et des dossiers de conformité',
    legalBasis: 'Obligation légale de sécurité et intérêt légitime',
    data: 'Destination, dates, statut, items de conformité et leur horodatage',
    retention: '5 ans après la fin de la mission — durée de prescription usuelle en responsabilité',
  },
  {
    purpose: 'Accusés de réception de briefing (preuve de transmission)',
    legalBasis: "Obligation légale de sécurité — c'est la pièce qui prouve l'information",
    data: 'Lien tokenisé, nom saisi par la personne, date et heure de lecture',
    retention: "5 ans : la preuve ne vaut que si elle survit à l'événement",
  },
  {
    purpose: 'Gestion de crise et check-in de sécurité',
    legalBasis: 'Sauvegarde des intérêts vitaux de la personne concernée',
    data: 'Réponse (en sécurité / besoin d’aide), note libre, position si la personne la joint volontairement',
    retention: "3 ans après clôture de l'événement, position comprise",
  },
  {
    purpose: 'Veille sur les pays où des personnes se trouvent',
    legalBasis: 'Intérêt légitime (protection des personnes)',
    data: 'Pays suivis, alertes de changement, nombre de personnes concernées',
    retention: '3 ans',
  },
  {
    purpose: "Journal d'audit (traçabilité des actions)",
    legalBasis: "Intérêt légitime — la conformité ne se prouve pas sans journal",
    data: "Auteur de l'action, libellé, cible, horodatage",
    retention: '5 ans, en écriture seule : ni modification ni suppression possibles',
  },
  {
    purpose: 'Notifications de sécurité (Web Push)',
    legalBasis: 'Consentement explicite de la personne',
    data: "Identifiant d'abonnement fourni par le navigateur",
    retention: "Jusqu'à désactivation par la personne",
  },
];

export default function ProPrivacyScreen() {
  const { org, membership } = useOrg();
  const isAdmin = membership?.role === 'admin';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [confirmName, setConfirmName] = useState('');

  async function exportJson() {
    if (!org) return;
    setBusy(true);
    setMessage('');
    try {
      const data = await buildOrgExport(org.id);
      downloadFile(
        `lokadia-${org.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(data, null, 2),
        'application/json',
      );
      setMessage(
        data.incomplete.length > 0
          ? `Export téléchargé. ${data.incomplete.length} table(s) non lisible(s) avec vos droits, listée(s) dans le fichier.`
          : 'Export intégral téléchargé.',
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export impossible.');
    } finally {
      setBusy(false);
    }
  }

  async function exportCsv(table: ExportTable) {
    if (!org) return;
    setBusy(true);
    setMessage('');
    try {
      const { data, error } = await supabase.from(table).select('*').eq('org_id', org.id);
      if (error) throw error;
      const rows = (data ?? []) as Record<string, unknown>[];
      if (rows.length === 0) {
        setMessage(`Aucune ligne dans « ${table} » : rien à exporter.`);
        return;
      }
      downloadFile(`${table}-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows), 'text/csv');
      setMessage(`${rows.length} ligne(s) exportée(s).`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Export impossible.');
    } finally {
      setBusy(false);
    }
  }

  function downloadRegister() {
    const lines = [
      "REGISTRE DES TRAITEMENTS — LOKADIA PRO",
      `Organisation : ${org?.name ?? ''}`,
      `Édité le ${new Date().toLocaleDateString('fr-FR')}`,
      '',
      "Ce registre décrit les traitements opérés par Lokadia pour le compte de",
      "l'organisation, en qualité de sous-traitant au sens de l'article 28 du RGPD.",
      '',
      ...REGISTER.flatMap((entry) => [
        `FINALITÉ : ${entry.purpose}`,
        `  Base légale  : ${entry.legalBasis}`,
        `  Données      : ${entry.data}`,
        `  Conservation : ${entry.retention}`,
        '',
      ]),
      'HÉBERGEMENT',
      "  Base de données et authentification : Union européenne (Paris).",
      '',
      'SOUS-TRAITANCE ULTÉRIEURE',
      "  Hébergeur de la base de données et du site. La liste à jour figure dans",
      "  les mentions légales du service.",
      '',
      'DROITS DES PERSONNES',
      "  Accès, rectification, effacement, portabilité : exercés auprès de",
      "  l'organisation responsable de traitement, qui dispose de l'export intégral",
      "  et de la suppression depuis cet écran.",
    ];
    downloadFile('registre-des-traitements.txt', lines.join('\r\n'), 'text/plain');
  }

  async function deleteOrganization() {
    if (!org || confirmName !== org.name) return;
    setBusy(true);
    try {
      const { error } = await supabase.from('organizations').delete().eq('id', org.id);
      if (error) throw error;
      // Les suppressions en cascade emportent missions, briefings, alertes…
      window.location.href = '/pro/app';
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Suppression impossible.');
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
        Données et conformité RGPD
      </h1>

      {/* Registre */}
      <section
        className="rounded-2xl bg-white p-5"
        style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}
      >
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck size={17} style={{ color: 'var(--lokadia-primary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            Registre des traitements
          </h2>
        </div>
        <p className="text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
          Ce que Lokadia traite pour votre compte, pourquoi, et pendant combien de
          temps. Décrit le fonctionnement réel du produit, pas un texte type.
        </p>

        <div className="mt-3 space-y-2">
          {REGISTER.map((entry) => (
            <details
              key={entry.purpose}
              className="rounded-xl border p-3"
              style={{ borderColor: 'var(--lokadia-gray-100)' }}
            >
              <summary
                className="cursor-pointer text-sm font-semibold"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                {entry.purpose}
              </summary>
              <dl className="mt-2 space-y-1 text-xs" style={{ color: 'var(--lokadia-gray-600)' }}>
                <div><dt className="inline font-bold">Base légale : </dt><dd className="inline">{entry.legalBasis}</dd></div>
                <div><dt className="inline font-bold">Données : </dt><dd className="inline">{entry.data}</dd></div>
                <div><dt className="inline font-bold">Conservation : </dt><dd className="inline">{entry.retention}</dd></div>
              </dl>
            </details>
          ))}
        </div>

        <button
          type="button"
          onClick={downloadRegister}
          className="lk-btn mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
          style={{ background: 'var(--lokadia-primary)' }}
        >
          <FileText size={15} /> Télécharger le registre
        </button>
      </section>

      {/* Export */}
      <section
        className="rounded-2xl bg-white p-5"
        style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Download size={17} style={{ color: 'var(--lokadia-primary)' }} />
          <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            Export de vos données
          </h2>
        </div>
        <p className="text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
          L'export est produit dans votre navigateur, avec vos droits : vous ne
          pouvez extraire que ce que vous avez le droit de lire, et rien ne
          transite par un service tiers.
        </p>

        <button
          type="button"
          onClick={() => void exportJson()}
          disabled={busy}
          className="lk-btn mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          style={{ background: 'var(--lokadia-primary)' }}
        >
          <Download size={15} /> Export intégral (JSON)
        </button>

        <p className="mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
          <Table2 size={13} /> Table par table (CSV, ouvrable dans un tableur)
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {exportTables().map((table) => (
            <button
              key={table}
              type="button"
              disabled={busy}
              onClick={() => void exportCsv(table)}
              className="rounded-lg border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-60"
              style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}
            >
              {table}
            </button>
          ))}
        </div>
      </section>

      {/* Contrat de sous-traitance */}
      <section
        className="rounded-2xl p-5"
        style={{ background: 'var(--lokadia-warning-bg)', border: '1px solid var(--lokadia-gray-100)' }}
      >
        <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          Contrat de sous-traitance (DPA)
        </h2>
        <p className="mt-1.5 text-xs leading-5" style={{ color: 'var(--lokadia-gray-700)' }}>
          Le registre ci-dessus contient les éléments qu'un DPA doit décrire
          (finalités, données, durées, hébergement, sous-traitance ultérieure). Le
          contrat lui-même doit être établi et signé entre votre organisation et
          l'éditeur : un document généré par le logiciel n'engagerait personne tant
          qu'aucun juriste ne l'a relu. Nous ne prétendrons pas le contraire pour
          cocher une case d'appel d'offres.
        </p>
      </section>

      {/* Suppression */}
      {isAdmin && org && (
        <section
          className="rounded-2xl p-5"
          style={{ background: 'var(--lokadia-danger-bg)', border: '1px solid var(--lokadia-gray-100)' }}
        >
          <div className="mb-2 flex items-center gap-2">
            <Trash2 size={17} style={{ color: 'var(--lokadia-danger)' }} />
            <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              Supprimer l'organisation et toutes ses données
            </h2>
          </div>
          <p className="text-xs leading-5" style={{ color: 'var(--lokadia-gray-700)' }}>
            Effacement définitif : effectif, missions, briefings et accusés, alertes,
            journal d'audit. Irréversible, et sans copie de notre côté. Pensez à
            faire l'export avant.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              placeholder={`Saisissez « ${org.name} » pour confirmer`}
              className="flex-1 rounded-xl border px-3 py-2 text-sm"
              style={{ borderColor: 'var(--lokadia-gray-200)', minWidth: 240 }}
            />
            <button
              type="button"
              disabled={busy || confirmName !== org.name}
              onClick={() => void deleteOrganization()}
              className="lk-btn rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              style={{ background: 'var(--lokadia-danger)' }}
            >
              Supprimer définitivement
            </button>
          </div>
        </section>
      )}

      {message && (
        <p className="text-sm" role="status" style={{ color: 'var(--lokadia-gray-700)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
