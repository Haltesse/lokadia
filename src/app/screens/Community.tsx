import { useState, useRef, useEffect } from "react";
import { 
  MapPin, 
  Utensils, 
  Train, 
  Camera, 
  Hotel, 
  Shield, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  Star,
  X,
  ThumbsUp
} from "lucide-react";
import { Badge } from "../components/Badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { allTravelTips } from "../data/travelTipsData";
import { moreTravelTips } from "../data/travelTipsData2";
import { finalTravelTips } from "../data/travelTipsData3";
import { useTranslation } from "../hooks/useTranslation";

type Category = "all" | "restaurants" | "transport" | "activities" | "accommodation" | "safety";

// Fusionner toutes les sources de conseils (150+ conseils)
const travelTips = [...allTravelTips, ...moreTravelTips, ...finalTravelTips];

export function Community() {
  const tr = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");
  const [displayCount, setDisplayCount] = useState(10); // Nombre d'avis à afficher
  
  // Scroll horizontal pour les destinations
  const destinationScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollDestLeft, setCanScrollDestLeft] = useState(false);
  const [canScrollDestRight, setCanScrollDestRight] = useState(false);

  const categories = [
    { id: "all", label: tr("Tous"), icon: MapPin, gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" },
    { id: "restaurants", label: tr("Restaurants"), icon: Utensils, gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)" },
    { id: "transport", label: tr("Transport"), icon: Train, gradient: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)" },
    { id: "activities", label: tr("Activités"), icon: Camera, gradient: "linear-gradient(135deg, #A855F7 0%, #EC4899 100%)" },
    { id: "accommodation", label: tr("Hébergement"), icon: Hotel, gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)" },
    { id: "safety", label: tr("Sécurité"), icon: Shield, gradient: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" },
  ];

  // Extraire toutes les destinations uniques
  const allDestinations = Array.from(new Set(travelTips.map(tip => tip.destination))).sort();

  // Photos de profil pour les utilisateurs (pool d'images variées)
  const profilePhotos = [
    "https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1554765345-6ad6a5417cde?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1534385904739-212d1429f618?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1599139497043-042b5c90db45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1546961329-78bef0414d7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/flagged/photo-1596479042555-9265a7fa7983?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1589553009868-c7b2bb474531?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1633177188754-980c2a6b6266?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    "https://images.unsplash.com/photo-1570158268183-d296b2892211?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  ];

  // Fonction pour obtenir une photo de profil basée sur le nom de l'auteur (consistant)
  const getProfilePhoto = (authorName: string) => {
    let hash = 0;
    for (let i = 0; i < authorName.length; i++) {
      hash = authorName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return profilePhotos[Math.abs(hash) % profilePhotos.length];
  };

  // Fonction pour ouvrir Google Maps
  const openGoogleMaps = (query: string) => {
    const encodedQuery = encodeURIComponent(query);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedQuery}`, '_blank');
  };

  // Filtrage
  const filteredTips = travelTips.filter(tip => {
    const matchCategory = selectedCategory === "all" || tip.category === selectedCategory;
    const matchDestination = selectedDestination === "all" || tip.destination === selectedDestination;
    return matchCategory && matchDestination;
  });

  // Avis à afficher (limités par displayCount)
  const displayedTips = filteredTips.slice(0, displayCount);
  const hasMore = filteredTips.length > displayCount;

  // Réinitialiser le compteur quand les filtres changent
  useEffect(() => {
    setDisplayCount(10);
  }, [selectedCategory, selectedDestination]);

  // Fonction pour charger plus d'avis
  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  // Gestion du scroll horizontal destinations
  const checkDestinationScroll = () => {
    if (destinationScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = destinationScrollRef.current;
      setCanScrollDestLeft(scrollLeft > 0);
      setCanScrollDestRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollDestination = (direction: 'left' | 'right') => {
    if (destinationScrollRef.current) {
      const scrollAmount = 200;
      destinationScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkDestinationScroll();
    const ref = destinationScrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkDestinationScroll);
      return () => ref.removeEventListener('scroll', checkDestinationScroll);
    }
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <h1
          className="text-3xl font-bold mb-2 leading-tight"
          style={{ color: "var(--lokadia-text-dark)" }}
        >
          {tr("Conseils Voyage")}
        </h1>
        <p className="text-base" style={{ color: "var(--lokadia-text-light)" }}>
          {tr("Retours d'expérience de voyageurs vérifiés")}
        </p>
      </div>

      {/* Disclaimer */}
      <div className="px-6 mb-6">
        <div
          className="p-4 rounded-xl border-2"
          style={{
            backgroundColor: "rgba(59, 130, 246, 0.05)",
            borderColor: "rgba(59, 130, 246, 0.2)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--lokadia-text-dark)" }}>
            {tr("Conseils vérifiés par notre équipe. Cliquez sur")}{" "}
            <span className="font-semibold">"{tr("Voir sur Google Maps")}"</span> {tr("pour consulter les avis Google.")}
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 px-6 pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as Category)}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all"
                style={
                  isSelected
                    ? {
                        background: cat.gradient,
                        color: "white",
                        border: "2px solid transparent",
                      }
                    : {
                        backgroundColor: "white",
                        color: "var(--lokadia-text-dark)",
                        border: "2px solid var(--lokadia-gray-300)",
                      }
                }
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Destination Filter */}
      <div className="mb-6">
        <div className="px-6 mb-3 text-center">
          <h3 className="font-semibold text-base" style={{ color: "var(--lokadia-text-dark)" }}>
            {tr("Filtrer par destination")}
          </h3>
          {selectedDestination !== "all" && (
            <button
              onClick={() => setSelectedDestination("all")}
              className="text-xs font-medium flex items-center gap-1 justify-center mx-auto mt-2"
              style={{ color: "#0A2545" }}
            >
              <X className="h-3 w-3" />
              {tr("Réinitialiser")}
            </button>
          )}
        </div>
        
        <div className="relative px-6">
          {/* Bouton gauche */}
          {canScrollDestLeft && (
            <button
              onClick={() => scrollDestination('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "white" }}
            >
              <ChevronLeft className="h-5 w-5" style={{ color: "#0A2545" }} />
            </button>
          )}

          {/* Scroll container */}
          <div
            ref={destinationScrollRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => setSelectedDestination("all")}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex-shrink-0"
              style={
                selectedDestination === "all"
                  ? {
                      background: "linear-gradient(135deg, #0F4C81 0%, #1E40AF 100%)",
                      color: "white",
                      border: "2px solid transparent",
                      boxShadow: "0 4px 12px rgba(15, 76, 129, 0.3)",
                    }
                  : {
                      backgroundColor: "white",
                      color: "var(--lokadia-text-dark)",
                      border: "2px solid var(--lokadia-gray-300)",
                    }
              }
            >
              {tr("Toutes les destinations")}
              <span
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: selectedDestination === "all" ? "rgba(255,255,255,0.25)" : "var(--lokadia-soft-white)",
                  color: selectedDestination === "all" ? "white" : "#0A2545",
                }}
              >
                {travelTips.length}
              </span>
            </button>
            
            {allDestinations.map((dest) => {
              const count = travelTips.filter(tip => tip.destination === dest).length;
              const isSelected = selectedDestination === dest;
              return (
                <button
                  key={dest}
                  onClick={() => setSelectedDestination(dest)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all flex-shrink-0"
                  style={
                    isSelected
                      ? {
                          background: "linear-gradient(135deg, #0F4C81 0%, #1E40AF 100%)",
                          color: "white",
                          border: "2px solid transparent",
                          boxShadow: "0 4px 12px rgba(15, 76, 129, 0.3)",
                        }
                      : {
                          backgroundColor: "white",
                          color: "var(--lokadia-text-dark)",
                          border: "2px solid var(--lokadia-gray-300)",
                        }
                  }
                >
                  {dest}
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "var(--lokadia-soft-white)",
                      color: isSelected ? "white" : "#0A2545",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bouton droite */}
          {canScrollDestRight && (
            <button
              onClick={() => scrollDestination('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "white" }}
            >
              <ChevronRight className="h-5 w-5" style={{ color: "#0A2545" }} />
            </button>
          )}
        </div>
      </div>

      {/* Travel Tips */}
      <div className="px-6 space-y-4 mb-6">
        {displayedTips.map((tip) => {
          const CategoryIcon = categories.find(c => c.id === tip.category)?.icon || MapPin;
          return (
            <div key={tip.id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {/* Header */}
              <div className="p-5 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CategoryIcon className="h-4 w-4" style={{ color: "#0A2545" }} />
                      <span className="text-xs font-medium" style={{ color: "var(--lokadia-text-light)" }}>
                        {tip.destination}, {tip.country}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
                      {tip.title}
                    </h3>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-2 mb-3">
                  <ImageWithFallback
                    src={getProfilePhoto(tip.author.name)}
                    alt={tip.author.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: "var(--lokadia-text-dark)" }}>
                        {tip.author.name}
                      </span>
                      {tip.author.verified && (
                        <Badge variant="success" size="sm">✓ Vérifié</Badge>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: "var(--lokadia-text-light)" }}>
                      {tip.postedDate}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--lokadia-text-dark)" }}>
                  {tip.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {tip.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 rounded-md text-xs font-medium"
                      style={{
                        backgroundColor: "var(--lokadia-soft-white)",
                        color: "var(--lokadia-blue)",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: "var(--lokadia-text-light)" }}>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" /> <span className="font-semibold">{tip.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" /> <span className="font-semibold">{tip.helpful}</span> {tr("trouvent ça utile")}
                  </div>
                </div>

                {/* Google Maps Button */}
                <button
                  onClick={() => openGoogleMaps(tip.googleMapsQuery)}
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{
                    backgroundColor: "#0A2545",
                    color: "white",
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                  {tr("Voir sur Google Maps")}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results */}
      {filteredTips.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "var(--lokadia-soft-white)" }}
          >
            <MapPin className="h-8 w-8" style={{ color: "var(--lokadia-text-light)" }} />
          </div>
          <h3 className="font-bold text-lg mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
            {tr("Aucun conseil trouvé")}
          </h3>
          <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
            {tr("Essayez de changer les filtres")}
          </p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div className="px-6 mb-6">
          <button
            onClick={loadMore}
            className="w-full py-4 rounded-xl font-semibold text-sm flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
            style={{
              backgroundColor: "var(--lokadia-deep-blue)",
              color: "white",
            }}
          >
            <span>{tr("Afficher plus")}</span>
            <span className="text-xs opacity-80">
              {displayedTips.length} {tr("sur")} {filteredTips.length} {tr("conseils affichés")}
            </span>
          </button>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}