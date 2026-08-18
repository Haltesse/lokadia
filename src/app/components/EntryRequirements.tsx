import { AlertTriangle, CheckCircle2, ExternalLink, HelpCircle, Scale } from 'lucide-react';
import { useNationality } from '../context/NationalityContext';
import { assessEntry, verdictTone, type EntryAssessment } from '../lib/formalities';
import { NationalitySelector } from './NationalitySelector';
import { DATASET_CONSOLIDATED_ON } from '../data/provenance';
import { formatLegalDate } from './LegalPage';

/**
 * Conditions d'entrée d'une destination, lues pour la nationalité déclarée.
 *
 * L'écran précédent affichait une coche verte « Pas de visa nécessaire »
 * sans savoir qui lisait. Ici, le verdict vert n'apparaît que lorsqu'il
 * repose sur un droit vérifiable (libre circulation) ; sinon, la couleur
 * est ambre et le texte renvoie aux autorités compétentes.
 *
 * Le contenu rédactionnel de la fiche est conservé, mais relégué en bas,
 * daté, et explicitement présenté comme non spécifique à la nationalité.
 */

const TONE_STYLE = {
  positive: {
    bg: 'var(--lokadia-success-bg)',
    color: 'var(--lokadia-success)',
    border: '#A7F3D0',
  },
  attention: {
    bg: 'var(--lokadia-warning-bg)',
    color: '#B45309',
    border: '#FDE68A',
  },
  neutral: {
    bg: 'var(--lokadia-info-bg)',
    color: 'var(--lokadia-primary)',
    border: 'var(--lokadia-gray-200)',
  },
} as const;

function VerdictIcon({ verdict }: { verdict: EntryAssessment['verdict'] }) {
  if (verdict === 'free-movement' || verdict === 'own-country') {
    return <CheckCircle2 className="h-6 w-6 flex-shrink-0" />;
  }
  if (verdict === 'nationality-unknown') {
    return <HelpCircle className="h-6 w-6 flex-shrink-0" />;
  }
  return <AlertTriangle className="h-6 w-6 flex-shrink-0" />;
}

export function EntryRequirements({
  destinationCountry,
  editorialNote,
  documentsNote,
}: {
  destinationCountry: string;
  /** Texte de la fiche sur les visas — contexte général, non sourcé */
  editorialNote?: string;
  /** Texte de la fiche sur les documents — contexte général, non sourcé */
  documentsNote?: string;
}) {
  const { nationality } = useNationality();
  const assessment = assessEntry(nationality, destinationCountry);
  const tone = TONE_STYLE[verdictTone(assessment.verdict)];

  return (
    <div className="space-y-4">
      <NationalitySelector />

      {/* Verdict */}
      <div
        className="rounded-2xl p-5"
        style={{ background: tone.bg, border: `1px solid ${tone.border}` }}
      >
        <div className="flex items-start gap-3" style={{ color: tone.color }}>
          <VerdictIcon verdict={assessment.verdict} />
          <div className="min-w-0">
            <p className="text-base font-bold">{assessment.headline}</p>
            <p
              className="mt-1.5 text-sm leading-6"
              style={{ color: 'var(--lokadia-gray-700)' }}
            >
              {assessment.explanation}
            </p>

            {assessment.legalBasis && (
              <a
                href={assessment.legalBasis.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold underline"
                style={{ color: 'var(--lokadia-primary)' }}
              >
                <Scale size={14} />
                {assessment.legalBasis.label}
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Points à vérifier */}
      {assessment.checks.length > 0 && (
        <div
          className="rounded-2xl bg-white p-5"
          style={{ border: '1px solid var(--lokadia-gray-100)' }}
        >
          <h3 className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            À vérifier avant de réserver
          </h3>
          <ul className="mt-3 space-y-3">
            {assessment.checks.map((check) => (
              <li key={check.title} className="flex gap-3">
                <span
                  className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                  style={{
                    background: check.toVerify
                      ? 'var(--lokadia-warning)'
                      : 'var(--lokadia-success)',
                  }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                    {check.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
                    {check.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources qui font foi */}
      <div
        className="rounded-2xl bg-white p-5"
        style={{ border: '1px solid var(--lokadia-gray-100)' }}
      >
        <h3 className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
          Sources officielles
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
          Ce sont elles qui font foi, pas cette page.
        </p>
        <div className="mt-3 space-y-2">
          {assessment.sources.map((source) => (
            <a
              key={source.url + source.label}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border p-3.5 transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--lokadia-gray-100)' }}
            >
              <span
                className="flex items-center justify-between gap-2 text-sm font-bold"
                style={{ color: 'var(--lokadia-primary)' }}
              >
                {source.label}
                <ExternalLink size={14} className="flex-shrink-0" />
              </span>
              <span
                className="mt-1 block text-sm leading-6"
                style={{ color: 'var(--lokadia-gray-600)' }}
              >
                {source.detail}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Contexte rédactionnel de la fiche — daté et cadré */}
      {(editorialNote || documentsNote) && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--lokadia-gray-50)', border: '1px solid var(--lokadia-gray-100)' }}
        >
          <h3 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            Ce que dit notre fiche
          </h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            Contexte général rédigé par Lokadia, consolidé le{' '}
            {formatLegalDate(DATASET_CONSOLIDATED_ON)}. Il ne tient pas compte de
            votre nationalité et ne remplace pas les sources ci-dessus.
          </p>
          {editorialNote && (
            <p className="mt-3 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
              {editorialNote}
            </p>
          )}
          {documentsNote && (
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
              {documentsNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
