import { TrendingDestinationCard } from "../components/TrendingDestinationCard";
import { useRef } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Shield,
  MapPin,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useLanguageSafe } from "../context/LanguageContext";
import { PartnerBookingSection } from "../components/PartnerBookingSection";
import { HeroSlideshow } from "../components/HeroSlideshow";
import { DesktopHomeExperience } from "./DesktopHomeExperience";
import { useLokascore } from "../hooks/useLokascore";

interface PopularDestination {
  id: string;
  city: string;
  country: string;
  tag: string;
  image: string;
}

function PopularDestinationCard({
  dest,
  index,
  onClick,
}: {
  dest: PopularDestination;
  index: number;
  onClick: () => void;
}) {
  const { score, loading, level } = useLokascore(dest.id);
  // Couleur 5-tiers Lokascore officielle
  const scoreBackground = level.fillColor;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`lk-card-hover-lift relative rounded-2xl overflow-hidden text-left bg-gray-200 lk-fade-in-up lk-delay-${Math.min(index + 1, 6)}`}
      style={{
        height: index === 0 || index === 3 ? '180px' : '140px',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      <ImageWithFallback
        src={dest.image}
        alt={dest.city}
        className="lk-img-zoom absolute inset-0 w-full h-full object-cover"
      />
      <div className="lk-overlay-fade absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      <div className="absolute top-2 left-2">
        <span
          className="text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md tracking-wide"
          style={{ background: 'rgba(255,255,255,0.22)' }}
        >
          {dest.tag}
        </span>
      </div>

      <div className="absolute top-2 right-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md shadow-md"
          style={{ background: scoreBackground }}
        >
          <span className="text-white text-[10px] font-extrabold tabular-nums">
            {loading && score === null ? "..." : score ?? "--"}
          </span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="text-white font-bold text-sm leading-tight tracking-tight drop-shadow">{dest.city}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="h-3 w-3 text-white/70" />
          <p className="text-white/85 text-[11px] truncate">{dest.country}</p>
        </div>
      </div>
    </button>
  );
}

export function GlobalHome() {
  const navigate = useNavigate();
  const context = useLanguageSafe();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Images pour le hero slideshow
  const heroImages = [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
    "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80",
  ];
  
  // Drag-to-scroll horizontal sur PC :
  //   - Démarre TOUJOURS (pas de skip sur button — les cartes SONT des boutons)
  //   - Si mouvement > 5 px → drag mode : scroll + suppression du click qui suit
  //   - Si mouvement < 5 px → click normal (la carte navigue)
  //   - rAF-throttlé + 1:1 (pas de multiplicateur)
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    // Boutons gauche uniquement
    if (e.button !== 0) return;

    const startX = e.pageX;
    const startScrollLeft = container.scrollLeft;
    let pendingX = startX;
    let moved = false;
    let rafId: number | null = null;

    const apply = () => {
      rafId = null;
      if (!scrollContainerRef.current) return;
      scrollContainerRef.current.scrollLeft = startScrollLeft - (pendingX - startX);
    };

    const handleMouseMove = (ev: MouseEvent) => {
      pendingX = ev.pageX;
      const delta = Math.abs(pendingX - startX);
      if (!moved && delta > 5) {
        moved = true;
        container.style.cursor = "grabbing";
      }
      if (moved) {
        ev.preventDefault();
        if (rafId == null) rafId = requestAnimationFrame(apply);
      }
    };

    const handleMouseUp = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.style.cursor = "grab";

      if (moved) {
        // Supprime le click qui suit le drag (sinon la carte navigue après un drag)
        const suppressClick = (clickEv: MouseEvent) => {
          clickEv.stopPropagation();
          clickEv.preventDefault();
          document.removeEventListener("click", suppressClick, true);
        };
        document.addEventListener("click", suppressClick, true);
        // Cleanup au cas où aucun click ne survient (très rare)
        setTimeout(() => document.removeEventListener("click", suppressClick, true), 300);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Si le contexte n'est pas disponible, utiliser des valeurs par défaut
  const t = context?.t || {
    home: {
      title: "Découvrez le monde en toute sécurité",
      subtitle: "Informations en temps réel pour vos voyages",
      search: "Rechercher une destination",
      quickActions: "Actions rapides",
      travelTips: "Conseils de voyage",
      popularDestinations: "Destinations populaires"
    }
  };
  
  const trendingDestinations = [
    {
      id: "paris-france",
      city: "Paris",
      country: "France",
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "tokyo-japan",
      city: "Tokyo",
      country: "Japon",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "dubai-uae",
      city: "Dubaï",
      country: "Émirats Arabes Unis",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "barcelona-spain",
      city: "Barcelone",
      country: "Espagne",
      image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "new-york-usa",
      city: "New York",
      country: "États-Unis",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "london-uk",
      city: "Londres",
      country: "Royaume-Uni",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
  ];

  const popularDestinations = [
    {
      id: "rome-italy",
      city: "Rome",
      country: "Italie",
      tag: "Culture",
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80",
    },
    {
      id: "bali-indonesia",
      city: "Bali",
      country: "Indonésie",
      tag: "Nature",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    },
    {
      id: "santorini-greece",
      city: "Santorin",
      country: "Grèce",
      tag: "Romantique",
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",
    },
    {
      id: "marrakech-morocco",
      city: "Marrakech",
      country: "Maroc",
      tag: "Découverte",
      image: "https://images.unsplash.com/photo-1577147443647-81856d5e4a5c?w=600&q=80",
    },
    {
      id: "amsterdam-netherlands",
      city: "Amsterdam",
      country: "Pays-Bas",
      tag: "Tendance",
      image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80",
    },
    {
      id: "bangkok-thailand",
      city: "Bangkok",
      country: "Thaïlande",
      tag: "Aventure",
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80",
    },
  ];

  return (
    <>
    <div className="hidden lg:block">
      <DesktopHomeExperience />
    </div>
    <div
      className="lg:hidden"
    >
    <div 
      className="min-h-screen relative"
      style={{ background: 'var(--lokadia-background)' }}
    >
      {/* ───────── HERO — plus compact (260px), pas de duplication brand ───────── */}
      <HeroSlideshow
        images={heroImages}
        className="px-5 pt-7 pb-8 md:rounded-3xl md:mt-3 lg:mt-4 md:mx-4 lg:mx-0"
        style={{ height: '260px' }}
      >
        <div className="relative z-10 lk-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md"
              style={{
                background: "rgba(255, 255, 255, 0.22)",
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)'
              }}
            >
              <Shield className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-white drop-shadow-md tracking-tight">Lokadia</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-1.5 leading-[1.15] drop-shadow-lg tracking-tight">
            {t.home.greeting}
          </h2>
          <p className="text-sm md:text-base text-white/95 max-w-md drop-shadow-md leading-snug">
            {t.home.subtitle}
          </p>
        </div>
      </HeroSlideshow>

      {/* ───────── SEARCH BAR — focus state premium ───────── */}
      <div className="px-5 -mt-5 relative z-10 mb-6 max-w-3xl mx-auto w-full lk-fade-in-up lk-delay-2">
        <button
          onClick={() => navigate("/destination-count")}
          className="lk-search lk-btn flex items-center gap-3 w-full bg-white rounded-2xl p-3.5 border-2 group"
          style={{
            borderColor: 'var(--lokadia-primary)',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: 'var(--lokadia-info-bg)' }}
          >
            <Search className="h-5 w-5" style={{ color: 'var(--lokadia-primary)' }} />
          </div>
          <span className="text-sm font-medium text-left flex-1" style={{ color: 'var(--lokadia-gray-700)' }}>
            {t.home.searchPlaceholder}
          </span>
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" style={{ color: 'var(--lokadia-gray-400)' }} />
        </button>
      </div>

      {/* ───────── TRENDING — slider horizontal compact ───────── */}
      <section className="mb-6 lk-fade-in-up lk-delay-3">
        <div className="px-5 mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight lk-heading-accent" style={{ color: 'var(--lokadia-gray-900)' }}>
              {t.home.trendingDestinations}
            </h2>
            <p className="text-xs md:text-sm mt-1.5" style={{ color: 'var(--lokadia-gray-500)' }}>
              Destinations populaires du moment
            </p>
          </div>
          <button
            onClick={() => navigate('/all-destinations')}
            className="lk-btn flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 hover:bg-amber-50 transition-colors"
            style={{ color: 'var(--lokadia-warning)' }}
          >
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            Voir tout
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className="overflow-x-auto scrollbar-hide flex gap-3 px-5"
          style={{ cursor: "grab", scrollBehavior: "auto", overscrollBehaviorX: "contain" }}
        >
          {trendingDestinations.map((destination, index) => (
            <TrendingDestinationCard
              key={destination.id}
              destination={destination}
              index={index}
              onClick={() => navigate(`/destination/${destination.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Partner commission section — driver de revenu */}
      <div className="lk-fade-in-up lk-delay-4">
        <PartnerBookingSection />
      </div>

      {/* ───────── POPULAR — grille dense premium 2/3/4 cols, hover lift ───────── */}
      <section className="px-5 mb-6 lk-fade-in-up lk-delay-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight lk-heading-accent" style={{ color: 'var(--lokadia-gray-900)' }}>
              Destinations du moment
            </h2>
            <p className="text-xs md:text-sm mt-1.5" style={{ color: 'var(--lokadia-gray-500)' }}>
              Les plus populaires cette saison
            </p>
          </div>
          <button
            onClick={() => navigate('/all-destinations')}
            className="lk-btn flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1.5 hover:bg-blue-50 transition-colors"
            style={{ color: 'var(--lokadia-primary)' }}
          >
            Voir tout
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {popularDestinations.map((dest, index) => (
            <PopularDestinationCard
              key={dest.id}
              dest={dest}
              index={index}
              onClick={() => navigate(`/destination/${dest.id}`)}
            />
          ))}
        </div>
      </section>

      {/* ───────── CTA Premium — plus compact, hover lift ───────── */}
      <div className="px-5 mb-6 lk-fade-in-up lk-delay-6">
        <div
          className="lk-card-hover relative rounded-2xl p-5 text-center overflow-hidden"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          {/* Décor : motif radial subtil */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(255,255,255,0.25), transparent 50%), radial-gradient(circle at 80% 100%, rgba(255,255,255,0.18), transparent 50%)'
            }}
            aria-hidden="true"
          />
          <div className="relative">
            <div className="inline-flex w-12 h-12 rounded-full bg-white/20 backdrop-blur-md items-center justify-center mb-3 shadow-lg">
              <Shield className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
              {t.home.travelPeace}
            </h3>
            <p className="text-white/90 text-sm mb-4 max-w-md mx-auto leading-snug">
              {t.home.travelPeaceDesc}
            </p>
            <button
              onClick={() => navigate("/premium")}
              className="lk-btn inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:shadow-2xl"
              style={{
                backgroundColor: 'var(--lokadia-warning)',
                color: 'white',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              {t.home.discoverPremium}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
    </>
  );
}
