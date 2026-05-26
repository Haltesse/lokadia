import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, CheckCircle, Search, Shield, X } from "lucide-react";
import { destinationsDatabase, type DestinationDetails } from "../data/destinationData";
import { motion } from "motion/react";
import { HeroSlideshow } from "../components/HeroSlideshow";
import { useLokascore } from "../hooks/useLokascore";
import { DestinationImage } from "../components/DestinationImage";

interface DestinationListItemProps {
  dest: DestinationDetails;
  onClick: () => void;
}

function DestinationListItem({ dest, onClick }: DestinationListItemProps) {
  const { score, loading, level } = useLokascore(dest.id);
  // Couleurs 5-tiers Lokascore (cf. lib/lokascore.ts)
  const scoreColor = level.color;
  const scoreBackground = level.bgColor;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-stretch gap-3 overflow-hidden rounded-xl bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] lg:block lg:rounded-2xl lg:p-0"
    >
      <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl lg:h-32 lg:w-full lg:rounded-none">
        <DestinationImage
          src={dest.image}
          alt={`${dest.name}, ${dest.country}`}
          cityName={dest.name}
          countryName={dest.country}
          preferWikipedia
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 lg:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: "var(--lokadia-blue)" }} />
          <div className="min-w-0">
            <div className="truncate font-medium" style={{ color: "var(--lokadia-text-dark)" }}>
              {dest.name}
            </div>
            <div className="truncate text-sm" style={{ color: "var(--lokadia-text-light)" }}>
              {dest.country}
            </div>
          </div>
        </div>
        <div
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums"
          style={{
            backgroundColor: scoreBackground,
            color: scoreColor,
          }}
        >
          <Shield className="h-3.5 w-3.5" />
          {loading && score === null ? "..." : score !== null ? `${score}/100` : "--"}
        </div>
      </div>
    </button>
  );
}

export function DestinationCountScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Images pour le diaporama
  const heroImages = [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", // Destinations
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", // Lake
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", // Mountains
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080", // Travel road
  ];
  
  // Obtenir toutes les destinations
  const allDestinations = Object.values(destinationsDatabase);
  const totalCount = allDestinations.length;
  
  // Filtrer par recherche
  const filteredDestinations = allDestinations.filter((dest) => {
    const query = searchQuery.toLowerCase();
    return (
      dest.name.toLowerCase().includes(query) ||
      dest.country.toLowerCase().includes(query) ||
      dest.region?.toLowerCase().includes(query) ||
      dest.popularDistricts?.some((district) => district.toLowerCase().includes(query))
    );
  });
  
  // Trier par nom
  const sortedDestinations = [...filteredDestinations].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
      {/* Hero Header Section - Slideshow swipeable + indicateurs story-style */}
      <HeroSlideshow
        images={heroImages}
        className="px-6 pt-8 pb-10 lg:mx-auto lg:mt-6 lg:max-w-7xl lg:rounded-[32px] lg:px-10"
        style={{ height: '320px' }}
      >
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              navigate("/global-home");
            }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 mb-8 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>

          <h1 className="text-3xl font-bold text-white mb-3 lg:text-5xl lg:font-black">
            Destinations disponibles
          </h1>
          <p className="text-white/90 text-lg mb-6">
            {totalCount} fiches détaillées
          </p>

          {/* Barre de recherche */}
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-lg lg:max-w-2xl">
            <Search className="h-5 w-5 flex-shrink-0" style={{ color: "var(--lokadia-deep-blue)" }} />
            <input
              type="text"
              placeholder="Rechercher une destination, pays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-base"
              style={{ color: "var(--lokadia-text-dark)" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-4 w-4" style={{ color: "var(--lokadia-text-light)" }} />
              </button>
            )}
          </div>
        </motion.div>
      </HeroSlideshow>

      {/* Liste des destinations */}
      <div className="px-6 py-6 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6 lg:px-0">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl bg-white p-5" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
            <CheckCircle className="h-7 w-7 mb-4" style={{ color: "var(--lokadia-primary)" }} />
            <h2 className="text-2xl font-black" style={{ color: "var(--lokadia-gray-900)" }}>
              {totalCount}
            </h2>
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--lokadia-gray-600)" }}>
              fiches détaillées
            </p>
            <p className="text-sm leading-6" style={{ color: "var(--lokadia-gray-600)" }}>
              Score Lokascore, alertes, zones à risque, santé, visa, arnaques, prix indicatifs, urgences et coutumes locales.
            </p>
          </div>
        </aside>

        <div>
        {searchQuery !== "" && (
          <div className="mb-4">
            <p className="text-sm font-medium" style={{ color: "var(--lokadia-text-dark)" }}>
              {filteredDestinations.length} {filteredDestinations.length > 1 ? "destinations trouvées" : "destination trouvée"}
            </p>
          </div>
        )}
        
        {searchQuery === "" && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6" style={{ color: "var(--lokadia-blue)" }} />
              <h2 className="text-lg font-semibold" style={{ color: "var(--lokadia-text-dark)" }}>
                Total: {totalCount} destinations
              </h2>
            </div>
            <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
              Chaque fiche contient: score Lokascore, alertes, zones dangereuses, conseils de sécurité, 
              vaccins, système de santé, visa, arnaques courantes, prix indicatifs, numéros d'urgence, 
              consulat, coutumes locales et comportements à éviter.
            </p>
          </div>
        )}

        {sortedDestinations.length > 0 ? (
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 xl:grid-cols-3">
            {sortedDestinations.map((dest) => (
              <DestinationListItem
                key={dest.id}
                dest={dest}
                onClick={() => {
                  console.log("🔍 Navigation vers destination:", dest.id);
                  navigate(`/destination/${dest.id}`);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="h-16 w-16 mx-auto mb-4" style={{ color: "var(--lokadia-text-light)" }} />
            <p className="text-lg font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Aucune destination trouvée
            </p>
            <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
              Essayez avec un autre nom de destination ou pays
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
