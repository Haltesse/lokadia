import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  MapPin,
  Plane,
  Search,
  Shield,
  Star,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { BOOKING_PARTNERS } from "../components/PartnerBookingSection";
import { useLokascore } from "../hooks/useLokascore";
import { LiveAlertsBanner } from "../components/LiveAlertsBanner";

const destinations = [
  {
    id: "paris-france",
    city: "Paris",
    country: "France",
    tag: "City break",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "tokyo-japan",
    city: "Tokyo",
    country: "Japon",
    tag: "Ultra safe",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "barcelona-spain",
    city: "Barcelone",
    country: "Espagne",
    tag: "Soleil",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "rome-italy",
    city: "Rome",
    country: "Italie",
    tag: "Culture",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=900&q=80",
  },
  {
    id: "lisbon-portugal",
    city: "Lisbonne",
    country: "Portugal",
    tag: "Weekend",
    image: "https://images.unsplash.com/photo-1548707309-dcebeab9ea9b?w=900&q=80",
  },
  {
    id: "dubai-uae",
    city: "Dubaï",
    country: "Émirats Arabes Unis",
    tag: "Premium",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "new-york-usa",
    city: "New York",
    country: "États-Unis",
    tag: "Iconique",
    image:
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "london-uk",
    city: "Londres",
    country: "Royaume-Uni",
    tag: "Classique",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    id: "bali-indonesia",
    city: "Bali",
    country: "Indonésie",
    tag: "Nature",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80",
  },
  {
    id: "amsterdam-netherlands",
    city: "Amsterdam",
    country: "Pays-Bas",
    tag: "Tendance",
    image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=900&q=80",
  },
];

function DesktopDestinationFeature({
  destination,
  onClick,
  slideIndex,
}: {
  destination: (typeof destinations)[number];
  onClick: () => void;
  slideIndex: number;
}) {
  const { score, loading, level } = useLokascore(destination.id);
  const scoreBackground = level.fillColor;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block h-[430px] w-full overflow-hidden rounded-[32px] bg-slate-950 text-left shadow-[0_24px_70px_rgba(15,23,42,0.18)] transition-all hover:-translate-y-1 hover:shadow-[0_34px_90px_rgba(15,23,42,0.24)]"
    >
      {destinations.map((slide, index) => {
        const isActive = index === slideIndex;
        return (
          <motion.div
            key={slide.id}
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 1.035,
            }}
            transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            style={{ zIndex: isActive ? 2 : 1 }}
          >
            <ImageWithFallback
              src={slide.image}
              alt={`${slide.city}, ${slide.country}`}
              className="h-full w-full object-cover"
            />
          </motion.div>
        );
      })}

      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        animate={{ opacity: 1 }}
        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
        style={{ zIndex: 3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-950/34 to-slate-950/8" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/36 via-transparent to-black/16" />
      </motion.div>

      <motion.div
        key={`${destination.id}-content`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-full flex-col justify-between p-9"
        style={{ zIndex: 4 }}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-2 rounded-full bg-slate-950/38 px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-[0_12px_32px_rgba(15,23,42,0.18)] ring-1 ring-white/18">
            <Star className="h-4 w-4 fill-white" />
            {destination.tag}
          </div>
          <div
            className="rounded-full px-4 py-2 text-sm font-black text-white shadow-lg"
            style={{ background: scoreBackground }}
          >
            Lokascore {loading && score === null ? "..." : score !== null ? `${score}/100` : "--"}
          </div>
        </div>

        <div className="max-w-2xl">
          <h3 className="text-6xl font-black leading-none tracking-tight text-white">
            {destination.city}
          </h3>
          <div
            className="mt-5 flex items-center gap-2 text-xl font-semibold text-white drop-shadow-[0_3px_12px_rgba(15,23,42,0.45)]"
            style={{ color: "rgba(255, 255, 255, 0.92)" }}
          >
            <MapPin className="h-5 w-5" />
            {destination.country}
          </div>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-950/38 px-5 py-3 text-sm font-black text-white shadow-[0_18px_42px_rgba(15,23,42,0.22)] ring-1 ring-white/18 transition-transform group-hover:translate-x-1">
            Découvrir la destination <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </motion.div>
    </button>
  );
}

export function DesktopHomeExperience() {
  const navigate = useNavigate();
  const [activeDestinationIndex, setActiveDestinationIndex] = useState(0);
  const [isDestinationsPaused, setIsDestinationsPaused] = useState(false);
  const activeDestination = destinations[activeDestinationIndex];
  const visiblePartners = BOOKING_PARTNERS.slice(0, 5);

  useEffect(() => {
    if (isDestinationsPaused) return;

    const interval = window.setInterval(() => {
      setActiveDestinationIndex((currentIndex) => {
        return currentIndex >= destinations.length - 1 ? 0 : currentIndex + 1;
      });
    }, 4300);

    return () => window.clearInterval(interval);
  }, [isDestinationsPaused]);

  const quickActions = [
    {
      title: "Planifier un voyage",
      description: "Créer un itinéraire et préparer les essentiels avant le départ.",
      path: "/trips/create",
      Icon: CalendarDays,
      tone: "var(--lokadia-primary)",
      bg: "var(--lokadia-info-bg)",
    },
    {
      title: "Consulter Lokascore",
      description: "Vérifier le niveau de sécurité d'une destination.",
      path: "/lokascore",
      Icon: Shield,
      tone: "var(--lokadia-success)",
      bg: "var(--lokadia-success-bg)",
    },
    {
      title: "Voir mes voyages",
      description: "Reprendre une préparation ou consulter un séjour existant.",
      path: "/trips",
      Icon: Plane,
      tone: "var(--lokadia-warning)",
      bg: "var(--lokadia-warning-bg)",
    },
  ];

  return (
    <main className="min-h-screen" style={{ background: "var(--lokadia-background)" }}>
      <section className="relative min-h-[520px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=85"
          alt="Terrasse de voyage au coucher du soleil"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/45 to-slate-950/10" />

        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-7xl items-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl py-16"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur-md">
              <Shield className="h-4 w-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wide text-white">
                Lokadia voyage
              </span>
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[1.04] tracking-tight text-white">
              Préparez votre prochain voyage avec les bons repères.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">
              Destinations, sécurité, alertes et réservations essentielles dans un espace pensé pour explorer calmement sur ordinateur.
            </p>

            <button
              onClick={() => navigate("/destination-count")}
              className="mt-8 flex w-full max-w-2xl items-center gap-4 rounded-[28px] bg-white p-3 text-left shadow-2xl transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.28)]"
            >
              <span
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "var(--lokadia-info-bg)" }}
              >
                <Search className="h-5 w-5" style={{ color: "var(--lokadia-primary)" }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold" style={{ color: "var(--lokadia-gray-900)" }}>
                  Rechercher une destination
                </span>
                <span className="block truncate text-sm" style={{ color: "var(--lokadia-gray-500)" }}>
                  Ville, pays, séjour ou idée de départ
                </span>
              </span>
              <ChevronRight className="h-5 w-5" style={{ color: "var(--lokadia-gray-400)" }} />
            </button>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pt-6">
        <LiveAlertsBanner variant="desktop" />
      </section>

      <section className="mx-auto max-w-7xl px-8 py-10">
        <div className="grid grid-cols-3 gap-5">
          {quickActions.map((action, index) => {
            const Icon = action.Icon;
            return (
              <motion.button
                key={action.title}
                onClick={() => navigate(action.path)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group rounded-2xl border bg-white p-6 text-left transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ borderColor: "var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: action.bg }}>
                    <Icon className="h-5 w-5" style={{ color: action.tone }} />
                  </span>
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: "var(--lokadia-gray-400)" }} />
                </div>
                <h2 className="text-lg font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                  {action.title}
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--lokadia-gray-600)" }}>
                  {action.description}
                </p>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--lokadia-primary)" }}>
              Inspiration
            </p>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-3xl font-black tracking-tight" style={{ color: "var(--lokadia-gray-900)" }}>
                Destinations du moment
              </h2>
              <span
                className="rounded-full px-3 py-1 text-xs font-black tabular-nums"
                style={{ background: "var(--lokadia-info-bg)", color: "var(--lokadia-primary)" }}
              >
                {activeDestinationIndex + 1}/{destinations.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/all-destinations")}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors hover:bg-white"
              style={{ color: "var(--lokadia-primary)" }}
            >
              Voir toutes les destinations <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsDestinationsPaused(true)}
          onMouseLeave={() => setIsDestinationsPaused(false)}
        >
          <DesktopDestinationFeature
            destination={activeDestination}
            slideIndex={activeDestinationIndex}
            onClick={() => navigate(`/destination/${activeDestination.id}`)}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {destinations.map((destination, index) => (
            <button
              key={destination.id}
              type="button"
              onClick={() => setActiveDestinationIndex(index)}
              aria-label={`Afficher ${destination.city}`}
              aria-current={activeDestinationIndex === index ? "true" : undefined}
              className="h-2.5 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--lokadia-primary)] focus:ring-offset-2"
              style={{
                width: activeDestinationIndex === index ? 28 : 10,
                background:
                  activeDestinationIndex === index
                    ? "var(--lokadia-primary)"
                    : "var(--lokadia-gray-300)",
              }}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-16">
        <div className="rounded-3xl bg-white p-6" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" style={{ color: "var(--lokadia-primary)" }} />
                <h2 className="text-xl font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                  Essentiels de voyage
                </h2>
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--lokadia-gray-600)" }}>
                Les mêmes services que sur mobile, présentés en lecture large.
              </p>
            </div>
            <button
              onClick={() => navigate("/alerts")}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
              style={{ background: "var(--lokadia-info-bg)", color: "var(--lokadia-primary)" }}
            >
              Alertes temps réel <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {visiblePartners.map((partner) => {
              const Icon = partner.icon;
              return (
                <a
                  key={partner.id}
                  href={partner.href}
                  target="_blank"
                  rel="noopener nofollow sponsored"
                  className="rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ borderColor: "var(--lokadia-gray-100)" }}
                >
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: partner.bg }}>
                    <Icon className="h-5 w-5" style={{ color: partner.color }} />
                  </span>
                  <span className="block text-sm font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                    {partner.label}
                  </span>
                  <span className="mt-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: partner.color }}>
                    {partner.provider}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
