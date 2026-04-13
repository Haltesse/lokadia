import { motion } from 'motion/react';
import { Shield, MapPin, TrendingUp } from 'lucide-react';
import { useGoSafeScore } from '../hooks/useGoSafeScore';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TrendingDestinationCardProps {
  destination: {
    id: string;
    city: string;
    country: string;
    image: string;
    safetyScore: number;
    goSafeScore?: number;
  };
  index: number;
  onClick: () => void;
}

/**
 * Carte de destination tendance avec GoSafe Score en temps réel
 */
export function TrendingDestinationCard({ destination, index, onClick }: TrendingDestinationCardProps) {
  // Récupérer le score en temps réel depuis Numbeo
  const { score: goSafeScore, loading } = useGoSafeScore(destination.id);
  
  // Utiliser le score temps réel si disponible, sinon le score statique
  const displayedScore = goSafeScore || destination.goSafeScore || destination.safetyScore;
  
  // Déterminer la couleur du badge selon le score
  const getBadgeColor = (score: number) => {
    if (score >= 70) return 'var(--lokadia-success)';
    if (score >= 50) return 'var(--lokadia-warning)';
    return 'var(--lokadia-danger)';
  };

  return (
    <motion.div
      key={destination.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <button
        onClick={onClick}
        className="flex-shrink-0 snap-start group block"
        style={{ width: "280px" }}
      >
        <div 
          className="bg-white rounded-3xl overflow-hidden transition-all"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="relative h-44 overflow-hidden">
            <ImageWithFallback
              src={destination.image}
              alt={`${destination.city}, ${destination.country}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Gradient subtil pour lisibilité */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50"></div>

            {/* Safety Badge avec animation de chargement */}
            <div
              className="absolute top-3 right-3 px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5"
              style={{ 
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {loading ? (
                <>
                  <div 
                    className="h-4 w-4 rounded-full animate-pulse"
                    style={{ backgroundColor: 'var(--lokadia-gray-300)' }}
                  />
                  <div 
                    className="h-3 w-8 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--lokadia-gray-300)' }}
                  />
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" style={{ color: getBadgeColor(displayedScore) }} />
                  <span 
                    className="font-semibold text-sm"
                    style={{ color: 'var(--lokadia-gray-900)' }}
                  >
                    {displayedScore}/100
                  </span>
                </>
              )}
            </div>

            {/* City and Country - Style raffiné */}
            <div className="absolute bottom-3 left-3">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-white/90 drop-shadow-lg flex-shrink-0" />
                <h3 className="text-sm font-semibold text-white drop-shadow-lg">
                  {destination.city}, <span className="font-normal text-white/90">{destination.country}</span>
                </h3>
              </div>
            </div>
          </div>

          {/* Card Footer */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--lokadia-warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--lokadia-gray-700)' }}>
                Populaire
              </span>
            </div>
            <div className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
              Voir plus →
            </div>
          </div>
        </div>
      </button>
    </motion.div>
  );
}
