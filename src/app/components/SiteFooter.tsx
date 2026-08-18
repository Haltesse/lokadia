import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { DATASET_CONSOLIDATED_ON } from '../data/provenance';
import { formatLegalDate } from './LegalPage';

/**
 * Pied de page.
 *
 * Deux rôles : rendre les pages obligatoires accessibles depuis n'importe
 * où (une mention légale planquée n'en est pas une), et donner aux moteurs
 * un maillage interne vers les pages de fond. Il rappelle aussi, à chaque
 * écran, la nature indicative du Lokascore.
 */

const LINKS: { to: string; label: string }[] = [
  { to: '/lokascore', label: 'Méthodologie du Lokascore' },
  { to: '/all-destinations', label: 'Toutes les destinations' },
  { to: '/services', label: 'Nos services' },
  { to: '/pro', label: 'Lokadia Pro' },
  { to: '/rate', label: 'Donner mon avis' },
  { to: '/statut', label: 'Statut des services' },
  { to: '/mentions-legales', label: 'Mentions légales' },
  { to: '/cgu', label: "Conditions d'utilisation" },
  { to: '/confidentialite', label: 'Confidentialité' },
];

export function SiteFooter() {
  return (
    <footer
      className="mt-12 border-t px-5 py-8"
      style={{ borderColor: 'var(--lokadia-gray-200)', background: 'var(--lokadia-gray-50)' }}
    >
      <div className="mx-auto max-w-7xl">
        <div
          className="flex items-start gap-3 rounded-2xl p-4"
          style={{ background: 'var(--lokadia-info-bg)' }}
        >
          <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--lokadia-primary)' }} />
          <p className="text-sm leading-6" style={{ color: 'var(--lokadia-gray-700)' }}>
            Le Lokascore est un indicateur <strong>indicatif</strong>, calculé à partir de
            sources officielles citées et datées. Il ne remplace ni les conseils aux
            voyageurs de votre ministère des Affaires étrangères, ni une vérification
            consulaire des formalités.
          </p>
        </div>

        <nav aria-label="Liens de bas de page" className="mt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm font-semibold hover:underline"
                  style={{ color: 'var(--lokadia-gray-600)' }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mt-6 text-xs leading-5" style={{ color: 'var(--lokadia-gray-500)' }}>
          © {new Date().getFullYear()} Lokadia. Jeu de données destinations consolidé le{' '}
          {formatLegalDate(DATASET_CONSOLIDATED_ON)} — les informations de sécurité et de
          formalités proviennent des publications officielles, consultables depuis chaque
          fiche.
        </p>
      </div>
    </footer>
  );
}
