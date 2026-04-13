import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, MapPin, TrendingUp, Search } from "lucide-react";
import { motion } from "motion/react";
import { destinationsDatabase } from "../data/destinationData";
import { useGoSafeScore } from "../hooks/useGoSafeScore";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface DestinationCardProps {
  destination: {
    id: string;
    name: string;
    country: string;
    image: string;
    goSafeScore: number;
  };
  onClick: () => void;
}

function DestinationCard({ destination, onClick }: DestinationCardProps) {
  const { score: goSafeScore, loading } = useGoSafeScore(destination.id);
  const displayedScore = goSafeScore || destination.goSafeScore;

  const getBadgeColor = (score: number) => {
    if (score >= 70) return 'var(--lokadia-success)';
    if (score >= 50) return 'var(--lokadia-warning)';
    return 'var(--lokadia-danger)';
  };

  return (
    <button onClick={onClick} className="block w-full">
      <div
        className="bg-white rounded-2xl overflow-hidden transition-all"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <div className="relative h-32 overflow-hidden">
          <ImageWithFallback
            src={destination.image}
            alt={`${destination.name}, ${destination.country}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40"></div>

          {/* Safety Badge */}
          <div
            className="absolute top-2 right-2 px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {loading ? (
              <div className="h-3 w-12 rounded animate-pulse" style={{ backgroundColor: 'var(--lokadia-gray-300)' }} />
            ) : (
              <>
                <Shield className="h-3 w-3" style={{ color: getBadgeColor(displayedScore) }} />
                <span className="font-semibold text-xs" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {displayedScore}
                </span>
              </>
            )}
          </div>

          {/* Location */}
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-white/90 drop-shadow-lg" />
              <span className="text-xs font-semibold text-white drop-shadow-lg">
                {destination.name}
              </span>
            </div>
            <span className="text-xs text-white/80 drop-shadow-md ml-4">
              {destination.country}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function AllDestinationsScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [allDestinations, setAllDestinations] = useState<any[]>([]);

  useEffect(() => {
    // Convertir destinationsDatabase en array
    const destinations = Object.values(destinationsDatabase);
    setAllDestinations(destinations);
  }, []);

  // Filtrer les destinations selon la recherche
  const filteredDestinations = allDestinations.filter(dest => {
    const query = searchQuery.toLowerCase();
    return (
      dest.name.toLowerCase().includes(query) ||
      dest.country.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className="min-h-screen pb-20"
      style={{ background: 'var(--lokadia-background)' }}
    >
      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ background: 'var(--gradient-primary)' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Toutes les destinations</h1>
              <p className="text-white/90 text-sm">{allDestinations.length} destinations disponibles</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
              style={{ color: 'var(--lokadia-gray-500)' }}
            />
            <input
              type="text"
              placeholder="Rechercher une destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 transition-all"
              style={{
                borderColor: 'transparent',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                outline: 'none'
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Destinations Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredDestinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.02 }}
            >
              <DestinationCard
                destination={destination}
                onClick={() => navigate(`/destination/${destination.id}`)}
              />
            </motion.div>
          ))}
        </div>

        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-medium" style={{ color: 'var(--lokadia-gray-600)' }}>
              Aucune destination trouvée
            </p>
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
              Essayez une autre recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
