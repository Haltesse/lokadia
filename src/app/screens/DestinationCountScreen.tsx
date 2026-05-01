import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, MapPin, CheckCircle, Search, X } from "lucide-react";
import { destinationsDatabase } from "../data/destinationData";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { HeroSlideshow } from "../components/HeroSlideshow";

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
        className="px-6 pt-8 pb-10"
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
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 mb-8"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>

          <h1 className="text-3xl font-bold text-white mb-3">
            Destinations disponibles
          </h1>
          <p className="text-white/90 text-lg mb-6">
            {totalCount} fiches détaillées
          </p>

          {/* Barre de recherche */}
          <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
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
      <div className="px-6 py-6">
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
              Chaque fiche contient: score GoSafe, alertes, zones dangereuses, conseils de sécurité, 
              vaccins, système de santé, visa, arnaques courantes, prix indicatifs, numéros d'urgence, 
              consulat, coutumes locales et comportements à éviter.
            </p>
          </div>
        )}

        {sortedDestinations.length > 0 ? (
          <div className="space-y-2">
            {sortedDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => {
                  console.log("🔍 Navigation vers destination:", dest.id);
                  navigate(`/destination/${dest.id}`);
                }}
                className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98] transform transition-transform"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" style={{ color: "var(--lokadia-blue)" }} />
                  <div>
                    <div className="font-medium" style={{ color: "var(--lokadia-text-dark)" }}>
                      {dest.name}
                    </div>
                    <div className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
                      {dest.country}
                    </div>
                  </div>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: 
                      dest.safetyLevel === "safe"
                        ? "rgba(34, 197, 94, 0.1)"
                        : dest.safetyLevel === "vigilance"
                        ? "rgba(251, 146, 60, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                    color:
                      dest.safetyLevel === "safe"
                        ? "#22c55e"
                        : dest.safetyLevel === "vigilance"
                        ? "#fb923c"
                        : "#ef4444",
                  }}
                >
                  {dest.goSafeScore}/100
                </div>
              </div>
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
  );
}