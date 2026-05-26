import { Shield, MapPin, TrendingUp } from 'lucide-react';
import { useLokascore } from '../hooks/useLokascore';
import { DestinationImage } from './DestinationImage';

interface TrendingDestinationCardProps {
  destination: {
    id: string;
    city: string;
    country: string;
    image: string;
  };
  index: number;
  onClick: () => void;
}

/**
 * Carte de destination tendance avec Lokascore en temps réel.
 * Compact premium : 240px, hover lift + image zoom via classes utilitaires .lk-*.
 */
export function TrendingDestinationCard({ destination, index, onClick }: TrendingDestinationCardProps) {
  // Récupérer le Lokascore (modulé par profil) en temps réel
  const { score: lokascore, loading, level } = useLokascore(destination.id);

  const displayedScore = lokascore;
  const badgeColor = level.fillColor;

  // Stagger d'apparition basé sur l'index (max 6 pour cohérence)
  const delayClass = `lk-delay-${Math.min(index + 1, 6)}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`lk-card-hover-lift lk-fade-in-up ${delayClass} flex-shrink-0 snap-start group block bg-white rounded-2xl overflow-hidden text-left`}
      style={{ width: "240px", boxShadow: 'var(--shadow-md)' }}
    >
      <div className="relative h-36 overflow-hidden">
        <DestinationImage
          src={destination.image}
          alt={`${destination.city}, ${destination.country}`}
          cityName={destination.city}
          countryName={destination.country}
          preferWikipedia
          className="lk-img-zoom w-full h-full object-cover"
        />

        {/* Gradient subtil pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55 lk-overlay-fade"></div>

        {/* Safety Badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-md"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.92)",
          }}
        >
          {loading && displayedScore === null ? (
            <>
              <div className="lk-skeleton h-3.5 w-3.5 rounded-full" />
              <div className="lk-skeleton h-2.5 w-7 rounded" />
            </>
          ) : (
            <>
              <Shield className="h-3.5 w-3.5" strokeWidth={2.5} style={{ color: badgeColor }} />
              <span
                className="font-bold text-xs tabular-nums"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                {displayedScore ?? '--'}
              </span>
            </>
          )}
        </div>

        {/* City and Country - sur l'image */}
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-white/90 drop-shadow-lg flex-shrink-0" />
            <h3 className="text-sm font-bold text-white drop-shadow-lg tracking-tight truncate">
              {destination.city}
            </h3>
          </div>
          <p className="text-[11px] text-white/85 drop-shadow ml-4 truncate">{destination.country}</p>
        </div>
      </div>

      {/* Card Footer compact */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} style={{ color: 'var(--lokadia-warning)' }} />
          <span className="text-[11px] font-semibold" style={{ color: 'var(--lokadia-gray-700)' }}>
            Populaire
          </span>
        </div>
        <span
          className="text-[11px] font-semibold transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ color: 'var(--lokadia-primary)' }}
        >
          Voir →
        </span>
      </div>
    </button>
  );
}
