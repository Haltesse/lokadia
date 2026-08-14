import { FileText, ShieldCheck, ExternalLink } from 'lucide-react';
import { getProvenance, formatProvenanceDate } from '../data/provenance';

/**
 * ProvenanceNote — d'où vient ce qu'on lit, et de quand ça date.
 *
 * Marqueur de sérieux exigé par l'audit : une fiche sans date ni source
 * se présente comme actuelle sans l'être. On sépare explicitement le
 * contenu rédigé par Lokadia (daté) des données de sécurité et de
 * formalités (qui ne valent que par leur source officielle).
 */

interface Props {
  destinationId: string;
  cityName: string;
  countryName: string;
  className?: string;
}

export function ProvenanceNote({ destinationId, cityName, countryName, className = '' }: Props) {
  const { reviewed, date, officialSources } = getProvenance(destinationId, cityName, countryName);
  const securitySources = officialSources.filter(
    (s) => s.category === 'security' || s.category === 'health' || s.category === 'disaster',
  );

  return (
    <section
      className={`rounded-2xl bg-white p-4 ${className}`}
      style={{ border: '1px solid var(--lokadia-gray-200)' }}
      aria-label="Provenance des informations"
    >
      <div className="flex items-start gap-2.5">
        <FileText size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--lokadia-gray-500)' }} />
        <div className="min-w-0">
          <p className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-800)' }}>
            Contenu éditorial
          </p>
          <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
            {reviewed ? (
              <>Relu par la rédaction Lokadia le {formatProvenanceDate(date)}.</>
            ) : (
              <>
                Rédigé par Lokadia, jeu de données consolidé le{' '}
                {formatProvenanceDate(date)}. Cette date correspond à la dernière
                mise en cohérence des fiches, pas à une vérification de chaque
                information.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2.5 border-t pt-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
        <ShieldCheck size={15} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--lokadia-primary)' }} />
        <div className="min-w-0">
          <p className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-800)' }}>
            Sécurité, santé et formalités
          </p>
          <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
            Ces informations ne remplacent pas les recommandations officielles.
            Vérifiez toujours à la source avant de partir :
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {securitySources.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold"
                  style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-primary)' }}
                >
                  {s.organization}
                  <ExternalLink size={9} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
