/**
 * Carte « poste de budget ».
 *
 * Remplace les anciennes listes d'offres fabriquées (compagnies, hôtels nommés,
 * notes et nombres d'avis inventés). Elle affiche trois choses, et rien d'autre :
 * une fourchette, la méthode qui l'a produite, et les liens vers les vraies
 * recherches partenaires où lire le prix du jour.
 *
 * La méthode n'est pas repliée derrière un « en savoir plus » : c'est elle qui
 * distingue une estimation assumée d'un prix inventé, elle doit donc se lire
 * en même temps que le montant.
 */
import { ExternalLink, type LucideIcon } from 'lucide-react';
import type { CategoryEstimate } from '../lib/bookingCatalog';
import { formatRange } from '../lib/travelOffers';

interface Props {
  estimate: CategoryEstimate;
  Icon?: LucideIcon;
  accentColor?: string;
}

export function BudgetEstimateCard({ estimate, Icon, accentColor }: Props) {
  const accent = accentColor ?? 'var(--lokadia-primary)';

  return (
    <div
      className="rounded-2xl bg-white p-4"
      style={{ border: '1.5px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="h-5 w-5 flex-shrink-0" style={{ color: accent }} />}
          <h3 className="text-sm font-bold truncate" style={{ color: 'var(--lokadia-gray-900)' }}>
            {estimate.label}
          </h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            {formatRange(estimate)}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: accent }}>
            Estimation
          </p>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-snug" style={{ color: 'var(--lokadia-gray-600)' }}>
        {estimate.method}
      </p>

      {estimate.partners.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {estimate.partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.href}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-opacity hover:opacity-85"
              style={{ background: `${partner.brandColor}12`, color: partner.brandColor }}
            >
              {partner.name}
              <ExternalLink className="h-3 w-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Bandeau à placer en tête d'un écran de budget : dit une fois pour toutes ce
 * que valent les montants affichés en dessous.
 */
export function EstimateDisclaimer() {
  return (
    <div
      className="rounded-2xl p-3 text-[11px] leading-snug"
      style={{ background: 'var(--lokadia-soft-white)', color: 'var(--lokadia-gray-600)' }}
    >
      <strong style={{ color: 'var(--lokadia-gray-900)' }}>Ce sont des estimations.</strong>{' '}
      Lokadia n'affiche aucun prix de vente et ne vend rien : les montants
      ci-dessous servent à préparer un budget. Le prix réel se lit chez le
      partenaire, qui seul connaît ses disponibilités du jour.
    </div>
  );
}
