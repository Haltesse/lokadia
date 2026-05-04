import { motion } from "motion/react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plane,
  Search,
  Shield,
  Star,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { BOOKING_PARTNERS } from "../components/PartnerBookingSection";
import { useGoSafeScore } from "../hooks/useGoSafeScore";

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

const DESTINATION_CARD_STEP = 340;

function DesktopDestinationCard({
  destination,
  onClick,
}: {
  destination: (typeof destinations)[number];
  onClick: () => void;
}) {
  const { score, loading } = useGoSafeScore(destination.id);
  const scoreBackground =
    score === null
      ? "var(--lokadia-gray-500)"
      : score >= 70
      ? "var(--lokadia-success)"
      : score >= 50
      ? "var(--lokadia-warning)"
      : "var(--lokadia-danger)";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative min-h-[320px] w-[300px] flex-shrink-0 snap-start overflow-hidden rounded-2xl text-left transition-all hover:-translate-y-1 hover:shadow-2xl xl:w-[320px]"
    >
      <ImageWithFallback
        src={destination.image}
        alt={`${destination.city}, ${destination.country}`}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/22 to-transparent" />
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
        <Star className="h-3.5 w-3.5 fill-white" />
        {destination.tag}
      </div>
      <div className="absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-black text-white" style={{ background: scoreBackground }}>
        {loading && score === null ? "..." : score !== null ? `${score}/100` : "--"}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-2xl font-black text-white">{destination.city}</h3>
        <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white/85">
          <MapPin className="h-4 w-4" />
          {destination.country}
        </div>
      </div>
    </button>
  );
}

export function DesktopHomeExperience() {
  const navigate = useNavigate();
  const destinationsRailRef = useRef<HTMLDivElement>(null);
  const [activeDestinationIndex, setActiveDestinationIndex] = useState(0);
  const visiblePartners = BOOKING_PARTNERS.slice(0, 5);

  const slideDestinations = (direction: "left" | "right") => {
    const rail = destinationsRailRef.current;
    if (!rail) return;
    const nextIndex =
      direction === "left"
        ? Math.max(0, activeDestinationIndex - 1)
        : Math.min(destinations.length - 1, activeDestinationIndex + 1);

    setActiveDestinationIndex(nextIndex);
    rail.scrollTo({
      left: nextIndex * DESTINATION_CARD_STEP,
      behavior: "smooth",
    });
  };

  const handleDestinationsScroll = () => {
    const rail = destinationsRailRef.current;
    if (!rail) return;
    setActiveDestinationIndex(
      Math.min(destinations.length - 1, Math.round(rail.scrollLeft / DESTINATION_CARD_STEP))
    );
  };

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
      title: "Consulter GoSafe",
      description: "Vérifier le niveau de sécurité d'une destination.",
      path: "/gosafe",
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

        <div className="relative">
          <button
            type="button"
            onClick={() => slideDestinations("left")}
            aria-label="Voir les destinations précédentes"
            className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-bold shadow-xl transition-all hover:-translate-y-[54%] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: "var(--lokadia-primary)" }}
            disabled={activeDestinationIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            ref={destinationsRailRef}
            onScroll={handleDestinationsScroll}
            className="flex snap-x gap-5 overflow-x-auto scroll-smooth rounded-[28px] border bg-white/55 p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ borderColor: "var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}
            aria-label="Carousel destinations du moment"
          >
            {destinations.map((destination) => (
              <DesktopDestinationCard
                key={destination.id}
                destination={destination}
                onClick={() => navigate(`/destination/${destination.id}`)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => slideDestinations("right")}
            aria-label="Voir les destinations suivantes"
            className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-sm font-bold shadow-xl transition-all hover:-translate-y-[54%] hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-40"
            style={{ color: "var(--lokadia-primary)" }}
            disabled={activeDestinationIndex >= destinations.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="pointer-events-none absolute inset-y-4 left-4 w-16 rounded-l-[22px] bg-gradient-to-r from-white/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-4 right-4 w-20 rounded-r-[22px] bg-gradient-to-l from-white/85 to-transparent" />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          {destinations.map((destination, index) => (
            <button
              key={destination.id}
              type="button"
              onClick={() => {
                const rail = destinationsRailRef.current;
                if (!rail) return;
                setActiveDestinationIndex(index);
                rail.scrollTo({ left: index * DESTINATION_CARD_STEP, behavior: "smooth" });
              }}
              aria-label={`Afficher ${destination.city}`}
              className="h-2.5 rounded-full transition-all"
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
