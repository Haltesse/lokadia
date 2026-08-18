import {
  Ambulance,
  AlertCircle,
  ExternalLink,
  Flame,
  Phone,
  Shield,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import { findCountry, hasFreeMovement } from '../data/countries';
import { findNationality } from '../data/nationalities';
import { useNationality } from '../context/NationalityContext';
import { NationalitySelector } from './NationalitySelector';
import type { EmergencyContact } from '../data/types';

/**
 * Numéros d'urgence et assistance consulaire.
 *
 * Deux corrections par rapport à l'écran précédent :
 *  - le bouton « Contacter le consulat » n'était relié à rien. Il renvoie
 *    maintenant vers l'annuaire officiel du pays dont le voyageur est
 *    ressortissant — Lokadia n'a pas d'annuaire d'ambassades vérifié, et
 *    inventer une adresse ou un numéro sur une page d'urgence serait la
 *    pire chose à faire ;
 *  - le 112 est rappelé pour les destinations où il est effectivement le
 *    numéro d'urgence unique.
 */
/**
 * Le champ `icon` du jeu de données contient tantôt un emoji, tantôt un nom
 * d'icône Lucide — l'écran précédent affichait donc littéralement « Shield »
 * ou « Flame » à côté du numéro des pompiers. On rend l'icône quand le nom
 * est connu, l'emoji sinon.
 */
const ICON_BY_NAME: Record<string, LucideIcon> = {
  Shield,
  Flame,
  Ambulance,
  AlertCircle,
  Phone,
};

function ContactIcon({ icon }: { icon: string }) {
  const Known = ICON_BY_NAME[icon];
  if (Known) return <Known className="h-5 w-5" style={{ color: '#DC2626' }} aria-hidden="true" />;
  return (
    <span className="text-2xl" aria-hidden="true">
      {icon}
    </span>
  );
}

export function EmergencyContacts({
  destinationCountry,
  numbers,
  consulateNote,
}: {
  destinationCountry: string;
  numbers: EmergencyContact[];
  consulateNote?: string;
}) {
  const { nationality } = useNationality();
  const country = findCountry(destinationCountry);
  const authority = findNationality(nationality);
  const europeanNumber = country ? hasFreeMovement(country.iso2) : false;
  // Le 112 a sa propre carte : inutile de le répéter dans la liste locale.
  const localNumbers = europeanNumber
    ? numbers.filter((entry) => entry.number.replace(/\s/g, '') !== '112')
    : numbers;

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
          Numéros d'urgence
        </h3>

        {europeanNumber && (
          <div
            className="mt-4 flex items-center justify-between gap-3 rounded-xl p-4"
            style={{ background: 'var(--lokadia-info-bg)' }}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--lokadia-primary)' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                  112 — numéro d'urgence européen
                </p>
                <p className="text-xs leading-5" style={{ color: 'var(--lokadia-gray-600)' }}>
                  Valable dans toute l'Union européenne, gratuit, depuis un fixe
                  comme un mobile, même sans crédit.
                </p>
              </div>
            </div>
            <a
              href="tel:112"
              className="flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
              style={{ background: 'var(--lokadia-primary)' }}
            >
              112
            </a>
          </div>
        )}

        <div className="mt-3 space-y-3">
          {localNumbers.map((emergency, index) => (
            <div
              key={`${emergency.name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border-2 border-red-100 bg-red-50 p-4"
            >
              <div className="flex items-center gap-3">
                <ContactIcon icon={emergency.icon} />
                <span className="text-sm font-medium" style={{ color: '#0A2545' }}>
                  {emergency.name}
                </span>
              </div>
              <a
                href={`tel:${emergency.number}`}
                className="flex-shrink-0 rounded-xl px-5 py-2.5 font-bold text-white shadow-sm"
                style={{ backgroundColor: '#DC2626' }}
                aria-label={`Appeler ${emergency.name} au ${emergency.number}`}
              >
                {emergency.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
            Assistance consulaire
          </h3>

          {authority ? (
            <>
              <p className="mt-3 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
                En cas de perte de papiers, d'arrestation, d'hospitalisation ou de
                crise, c'est votre propre représentation diplomatique qui vous
                assiste — pas celle du pays visité.
              </p>
              <a
                href={authority.url}
                target="_blank"
                rel="noopener noreferrer"
                className="lk-btn mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white"
                style={{ backgroundColor: '#0A2545' }}
              >
                <Phone size={16} />
                Trouver votre représentation — {authority.label}
                <ExternalLink size={14} />
              </a>
              <p className="mt-2 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                Ouvre le site officiel : {authority.authority}.
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
                Indiquez votre nationalité pour obtenir le lien vers l'annuaire
                officiel de vos ambassades et consulats. Lokadia ne tient pas
                d'annuaire d'ambassades : sur une page d'urgence, un numéro
                approximatif est pire que pas de numéro du tout.
              </p>
              <div className="mt-4">
                <NationalitySelector compact />
              </div>
            </>
          )}
        </div>

        {consulateNote && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'var(--lokadia-gray-50)',
              border: '1px solid var(--lokadia-gray-100)',
            }}
          >
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
              Contexte local
            </p>
            <p className="mt-2 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
              {consulateNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
