/**
 * NosServicesPage (/services) — page "guide" présentant nos services dans
 * l'ordre logique d'un voyage : on choisit d'abord le vol, puis l'hébergement,
 * une e-SIM si besoin, on regarde les activités, et enfin l'assurance voyage.
 *
 * Positionnement : Lokadia est une application de voyage qui réunit tous les
 * essentiels au meilleur prix, et dont l'avantage différenciant est la
 * sécurité — l'assurance personnalisée en étant le point d'orgue, le Lokascore
 * servant de repère pour choisir la bonne couverture.
 */
import { useNavigate } from 'react-router';
import {
  Plane, BedDouble, Wifi, Ticket, ShieldCheck, Shield,
  ArrowRight, Check, ArrowLeft,
} from 'lucide-react';

interface Step {
  n: number;
  id: string;
  title: string;
  lead: string;
  advantage: string;
  price: string;
  provider: string;
  Icon: typeof Plane;
  color: string;
  bg: string;
  featured?: boolean;
}

const STEPS: Step[] = [
  {
    n: 1,
    id: 'flight',
    title: 'Le vol',
    lead: 'On commence toujours par le vol.',
    advantage: 'Comparateur multi-compagnies avec alertes prix : on vous trouve le meilleur tarif, direct ou avec escale, sans mauvaise surprise.',
    price: 'Vos billets d\'avion aux meilleurs prix',
    provider: 'Kiwi · Skyscanner',
    Icon: Plane,
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.08)',
  },
  {
    n: 2,
    id: 'lodging',
    title: 'L\'hébergement',
    lead: 'Ensuite, où dormir.',
    advantage: 'Hôtel, appartement, maison, Airbnb ou auberge — tarifs négociés en direct, jusqu\'à 10 % moins cher qu\'ailleurs, annulation gratuite.',
    price: 'Vos hôtels & hébergements aux meilleurs prix',
    provider: 'Booking · Airbnb · Hostelworld',
    Icon: BedDouble,
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
  },
  {
    n: 3,
    id: 'esim',
    title: 'L\'e-SIM',
    lead: 'Si besoin, restez connecté.',
    advantage: 'Internet dès l\'atterrissage, sans frais d\'itinérance. On active votre forfait data local en deux minutes.',
    price: 'Forfaits data dès quelques euros',
    provider: 'Airalo · Holafly',
    Icon: Wifi,
    color: '#0A84FF',
    bg: 'rgba(10, 132, 255, 0.08)',
  },
  {
    n: 4,
    id: 'activity',
    title: 'Les activités & visites',
    lead: 'On regarde quoi faire sur place.',
    advantage: 'Expériences locales vérifiées et billets coupe-file, sélectionnés selon votre destination pour ne rien manquer de l\'essentiel.',
    price: 'Activités & visites dès 15 €/pers.',
    provider: 'GetYourGuide · Viator',
    Icon: Ticket,
    color: '#8B5CF6',
    bg: 'rgba(139, 92, 246, 0.08)',
  },
  {
    n: 5,
    id: 'insurance',
    title: 'L\'assurance voyage',
    lead: 'Enfin, on voyage couvert.',
    advantage: 'Découvrez votre assurance personnalisée selon votre voyage : destination, hébergement, activités, transport, durée et niveau de risque. Le Lokascore vous oriente vers la couverture la plus adaptée.',
    price: 'Santé, annulation & bagages couverts',
    provider: 'Chapka · AXA',
    Icon: ShieldCheck,
    color: '#059669',
    bg: 'rgba(5, 150, 105, 0.10)',
    featured: true,
  },
];

export default function NosServicesPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen pb-16" style={{ background: 'var(--lokadia-background)' }}>
      {/* ── Hero ── */}
      <section className="text-white" style={{ background: 'var(--gradient-primary)' }}>
        <div className="mx-auto max-w-4xl px-5 pt-6 pb-12 lg:pt-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold transition-colors hover:bg-white/25"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Retour
          </button>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">
            Tout votre voyage, au meilleur prix
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight lg:text-5xl">
            Découvrez nos offres, au meilleur prix.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/90">
            Vols, hébergements, e-SIM, activités et assurance — tous les essentiels de votre voyage
            réunis au même endroit, avec une sécurité renforcée avant, pendant et après votre séjour.
          </p>
        </div>
      </section>

      {/* ── Parcours guidé ── */}
      <section className="mx-auto max-w-4xl px-5">
        <div className="-mt-6 space-y-4">
          {STEPS.map((s) => {
            const Icon = s.Icon;
            return (
              <article
                key={s.id}
                className="rounded-3xl bg-white p-5 lg:p-6"
                style={{
                  border: `1px solid ${s.featured ? s.color : 'var(--lokadia-gray-100)'}`,
                  boxShadow: s.featured ? '0 0 0 1px ' + s.color + ', var(--shadow-md)' : 'var(--shadow-sm)',
                }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {/* Numéro + icône */}
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center">
                    <span
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white tabular-nums"
                      style={{ background: s.color }}
                    >
                      {s.n}
                    </span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: s.bg }}>
                      <Icon className="h-6 w-6" style={{ color: s.color }} />
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                        {s.title}
                      </h2>
                      <span className="text-sm font-semibold" style={{ color: s.color }}>· {s.lead}</span>
                      {s.featured && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: s.color }}>
                          Notre valeur ajoutée
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6" style={{ color: 'var(--lokadia-gray-600)' }}>
                      {s.advantage}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: s.color }}>
                        <Check className="h-4 w-4" /> {s.price}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--lokadia-gray-400)' }}>
                        {s.provider}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => navigate('/trips/map-planner')}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                        style={{ background: s.color }}
                      >
                        {s.id === 'insurance' ? 'Obtenir mon assurance' : `Choisir ${s.id === 'flight' ? 'mon vol' : s.id === 'lodging' ? 'mon hébergement' : s.id === 'esim' ? 'mon e-SIM' : 'mes activités'}`}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      {s.featured && (
                        <button
                          onClick={() => navigate('/lokascore')}
                          className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold"
                          style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-primary)' }}
                        >
                          <Shield className="h-4 w-4" /> Comprendre le Lokascore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── CTA final ── */}
        <div className="mt-8 overflow-hidden rounded-3xl p-6 text-center text-white lg:p-8" style={{ background: 'var(--gradient-primary)' }}>
          <h2 className="text-2xl font-bold tracking-tight">Prêt à organiser votre voyage ?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/90">
            Choisissez votre destination sur la carte : on enchaîne le vol, l'hébergement, l'e-SIM,
            les activités puis l'assurance — sans quitter Lokadia.
          </p>
          <button
            onClick={() => navigate('/trips/map-planner')}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
            style={{ color: 'var(--lokadia-primary)' }}
          >
            Commencer mon voyage <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </main>
  );
}
