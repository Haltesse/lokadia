import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { LEGAL, missingLegalFields, type LegalValue } from '../data/legal';

/**
 * Habillage commun des pages légales (mentions, CGU, confidentialité).
 *
 * Texte long, lecture sur mobile : colonne étroite, interlignage généreux,
 * titres hiérarchisés — et surtout un rendu explicite des informations
 * manquantes plutôt qu'une phrase vague qui laisserait croire la page
 * complète.
 */

/** Date lisible en français à partir d'une date ISO. */
export function formatLegalDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Affiche une information légale, ou un marqueur visible si elle n'a pas
 * encore été fournie. Jamais de valeur inventée pour « faire propre ».
 */
export function LegalField({ value, label }: { value: LegalValue; label: string }) {
  if (value) return <>{value}</>;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[13px] font-semibold"
      style={{ background: 'var(--lokadia-warning-bg)', color: 'var(--lokadia-category-culture)' }}
    >
      {label} — à compléter
    </span>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] leading-7" style={{ color: 'var(--lokadia-gray-600)' }}>
        {children}
      </div>
    </section>
  );
}

/** Liste à puces sobre, réutilisée dans les trois pages. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-5">
      {items.map((item, index) => (
        <li key={index} className="list-disc">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  const missing = missingLegalFields();

  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-8">
      <h1 className="text-2xl font-bold lg:text-3xl" style={{ color: 'var(--lokadia-gray-900)' }}>
        {title}
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
        Dernière mise à jour : {formatLegalDate(LEGAL.updatedOn)}
      </p>

      {intro && (
        <div className="mt-5 text-[15px] leading-7" style={{ color: 'var(--lokadia-gray-600)' }}>
          {intro}
        </div>
      )}

      {missing.length > 0 && (
        <div
          className="mt-6 flex gap-3 rounded-2xl p-4"
          style={{ background: 'var(--lokadia-warning-bg)', border: '1px solid #FDE68A' }}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--lokadia-warning)' }} />
          <div className="text-sm leading-6" style={{ color: 'var(--lokadia-category-culture)' }}>
            <p className="font-bold">Informations légales incomplètes</p>
            <p className="mt-1">
              Ces éléments sont obligatoires (article 6 III de la LCEN) et n'ont pas
              encore été publiés : {missing.join(', ')}.
            </p>
            {import.meta.env.DEV && (
              <p className="mt-1">
                À renseigner dans <code>src/app/data/legal.ts</code>.
              </p>
            )}
          </div>
        </div>
      )}

      {children}
    </main>
  );
}
