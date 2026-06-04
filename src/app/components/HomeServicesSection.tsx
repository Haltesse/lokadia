/**
 * HomeServicesSection — section "Nos services" affichée sur l'accueil (mobile & desktop).
 *
 * Positionnement : Lokadia est d'abord une application de VOYAGE (vols,
 * hébergement, activités, e-SIM), et la SÉCURITÉ est l'avantage différenciant
 * qui se décline en services à valeur ajoutée — notamment l'assurance
 * personnalisée, vers laquelle le Lokascore sert de tunnel d'orientation.
 *
 * Ordre imposé : vols → hébergement → e-SIM & activités → assurance →
 * alertes temps réel → Lokascore.
 */
import { useNavigate } from 'react-router';
import { Plane, BedDouble, Wifi, ShieldCheck, Bell, Shield, ChevronRight } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  Icon: typeof Plane;
  color: string;
  bg: string;
  to: string;
  featured?: boolean;
}

const SERVICES: ServiceItem[] = [
  {
    id: 'flights',
    title: 'Nos offres de vols',
    description: 'Réservez vos billets d\'avion aux meilleurs prix.',
    Icon: Plane,
    color: '#0F4C81',
    bg: 'rgba(15, 76, 129, 0.10)',
    to: '/trips/map-planner',
  },
  {
    id: 'lodging',
    title: 'Nos offres d\'hébergement',
    description: 'Réservez vos hôtels aux meilleurs prix — hôtel, appartement, maison, Airbnb ou auberge.',
    Icon: BedDouble,
    color: '#7C3AED',
    bg: 'rgba(124, 58, 237, 0.10)',
    to: '/trips/map-planner',
  },
  {
    id: 'esim-activities',
    title: 'Nos offres e-SIM et activités',
    description: 'Restez connecté dès l\'atterrissage et vivez des expériences choisies selon votre destination.',
    Icon: Wifi,
    color: '#0891B2',
    bg: 'rgba(6, 182, 212, 0.10)',
    to: '/trips/map-planner',
  },
  {
    id: 'insurance',
    title: 'Nos offres d\'assurance voyage',
    description: 'Découvrez votre assurance personnalisée selon votre voyage : destination, hébergement, activités, transport et durée.',
    Icon: ShieldCheck,
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.12)',
    to: '/trips/map-planner',
    featured: true,
  },
  {
    id: 'alerts',
    title: 'Alertes en temps réel',
    description: 'Restez au courant de tout ce qui se passe avant et pendant votre voyage.',
    Icon: Bell,
    color: '#D97706',
    bg: 'rgba(245, 158, 11, 0.12)',
    to: '/alerts',
  },
  {
    id: 'lokascore',
    title: 'Lokascore',
    description: 'Votre repère sécurité par destination — il vous oriente vers l\'assurance la plus adaptée.',
    Icon: Shield,
    color: '#0F4C81',
    bg: 'rgba(15, 76, 129, 0.10)',
    to: '/lokascore',
  },
];

export function HomeServicesSection({ className = '' }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <section id="nos-services" className={`scroll-mt-24 ${className}`}>
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-primary)' }}>
          Tout votre voyage, au même endroit
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl" style={{ color: 'var(--lokadia-gray-900)' }}>
          Nos services
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
          Organisez votre voyage de A à Z et bénéficiez d'une sécurité renforcée avant, pendant et après votre séjour.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const Icon = s.Icon;
          return (
            <button
              key={s.id}
              onClick={() => navigate(s.to)}
              className="group flex h-full flex-col rounded-2xl border bg-white p-5 text-left transition-all hover:-translate-y-1"
              style={{
                borderColor: s.featured ? s.color : 'var(--lokadia-gray-100)',
                boxShadow: s.featured ? '0 0 0 1px ' + s.color + ', var(--shadow-md)' : 'var(--shadow-sm)',
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: s.bg }}>
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                </span>
                {s.featured && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: s.color }}>
                    Recommandé
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{s.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>{s.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold transition-transform group-hover:translate-x-0.5" style={{ color: s.color }}>
                Découvrir <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
