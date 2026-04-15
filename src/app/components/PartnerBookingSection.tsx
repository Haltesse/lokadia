import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Wifi, ShieldCheck, Hotel, Ticket, Plane, ArrowRight } from 'lucide-react';

/**
 * Section partenaires commerciaux — driver de commissions.
 * Affichée sur GlobalHome et sur le récap de création de voyage.
 * Chaque carte est un lien d'affiliation (à câbler plus tard vers les liens partenaires réels).
 */

export type BookingPartner = {
  id: string;
  label: string;
  description: string;
  provider: string;
  icon: any;
  color: string;
  bg: string;
  href?: string; // lien d'affiliation (à remplir)
  internalPath?: string;
};

export const BOOKING_PARTNERS: BookingPartner[] = [
  {
    id: 'esim',
    label: 'e-SIM internet',
    description: 'Reste connecté dès l\'atterrissage, sans frais d\'itinérance.',
    provider: 'Airalo · Holafly',
    icon: Wifi,
    color: '#0A84FF',
    bg: 'rgba(10, 132, 255, 0.08)',
    href: 'https://www.airalo.com/',
  },
  {
    id: 'insurance',
    label: 'Assurance voyage',
    description: 'Couvre santé, annulation et bagages en 2 minutes.',
    provider: 'Chapka · AXA',
    icon: ShieldCheck,
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.08)',
    href: 'https://www.chapkadirect.fr/',
  },
  {
    id: 'hotel',
    label: 'Hôtels & auberges',
    description: 'Tarifs négociés en direct, 10 % moins cher qu\'en OTA.',
    provider: 'Accor · B&B · FUAJ',
    icon: Hotel,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    href: 'https://all.accor.com/',
  },
  {
    id: 'activity',
    label: 'Activités & visites',
    description: 'Réserve les meilleures expériences locales vérifiées.',
    provider: 'GetYourGuide',
    icon: Ticket,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
    href: 'https://www.getyourguide.com/',
  },
  {
    id: 'flight',
    label: 'Vols',
    description: 'Comparateur multi-compagnies avec alertes prix.',
    provider: 'Kiwi · Skyscanner',
    icon: Plane,
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.08)',
    href: 'https://www.kiwi.com/',
  },
];

interface Props {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

export function PartnerBookingSection({
  title = 'Réserve ton voyage en toute sécurité',
  subtitle = 'Tous les essentiels au meilleur prix, via nos partenaires certifiés.',
  compact = false,
}: Props) {
  const navigate = useNavigate();

  return (
    <section className="px-4 md:px-6 lg:px-8 mb-10">
      <div className="mb-5 md:mb-7 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--lokadia-gray-900)' }}>
            {title}
          </h2>
          <p className="text-sm md:text-base" style={{ color: 'var(--lokadia-gray-600)' }}>
            {subtitle}
          </p>
        </div>
        <button
          onClick={() => navigate('/partenaires')}
          className="hidden md:flex items-center gap-1 text-sm font-medium whitespace-nowrap"
          style={{ color: 'var(--lokadia-primary)' }}
        >
          Tous les partenaires <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <div className={`grid gap-3 md:gap-4 ${
        compact
          ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
      }`}>
        {BOOKING_PARTNERS.map((p, idx) => {
          const Icon = p.icon;
          return (
            <motion.a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener nofollow sponsored"
              className="group relative rounded-2xl p-4 md:p-5 text-left overflow-hidden bg-white block"
              style={{
                border: '1px solid var(--lokadia-gray-100)',
                boxShadow: 'var(--shadow-sm)',
              }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={{ background: p.bg }}
              >
                <Icon className="h-5 w-5" style={{ color: p.color }} />
              </div>
              <h3 className="font-bold text-sm md:text-base leading-tight mb-1" style={{ color: 'var(--lokadia-gray-900)' }}>
                {p.label}
              </h3>
              <p className="text-xs mb-2 leading-snug" style={{ color: 'var(--lokadia-gray-600)' }}>
                {p.description}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: p.color }}>
                {p.provider}
              </p>
            </motion.a>
          );
        })}
      </div>

      <p className="mt-3 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
        Liens partenaires. Lokadia reste 100 % gratuit pour toi — nous sommes rémunérés par nos partenaires.
      </p>
    </section>
  );
}
