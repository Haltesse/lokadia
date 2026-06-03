import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, MapPin, TrendingUp, Search, X } from "lucide-react";
import { destinationsDatabase } from "../data/destinationData";
import { useLokascore } from "../hooks/useLokascore";
import { DestinationImage } from "../components/DestinationImage";

interface DestinationCardProps {
  destination: {
    id: string;
    name: string;
    country: string;
    image: string;
  };
  onClick: () => void;
  index: number;
}

function DestinationCard({ destination, onClick, index }: DestinationCardProps) {
  const { score: lokascore, loading, level } = useLokascore(destination.id);
  const displayedScore = lokascore;
  const badgeColor = level.fillColor;

  // Stagger compact (max delay-6) basé sur l'index
  const delayClass = `lk-delay-${Math.min((index % 6) + 1, 6)}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`lk-card-hover-lift lk-fade-in-up ${delayClass} block w-full group bg-white rounded-2xl overflow-hidden text-left`}
      style={{ boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="relative h-32 md:h-36 overflow-hidden">
        <DestinationImage
          src={destination.image}
          alt={`${destination.name}, ${destination.country}`}
          cityName={destination.name}
          countryName={destination.country}
          preferWikipedia
          className="lk-img-zoom w-full h-full object-cover"
        />
        <div className="lk-overlay-fade absolute inset-0 bg-gradient-to-b from-transparent to-black/55"></div>

        {/* Safety Badge */}
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-md"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.92)" }}
        >
          {loading && displayedScore === null ? (
            <div className="lk-skeleton h-3 w-9 rounded" />
          ) : (
            <>
              <Shield className="h-3 w-3" strokeWidth={2.5} style={{ color: badgeColor }} />
              <span className="font-bold text-[11px] tabular-nums" style={{ color: 'var(--lokadia-gray-900)' }}>
                {displayedScore ?? '--'}
              </span>
            </>
          )}
        </div>

        {/* Location */}
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-white/90 drop-shadow-lg flex-shrink-0" />
            <span className="text-sm font-bold text-white drop-shadow-lg tracking-tight truncate">
              {destination.name}
            </span>
          </div>
          <span className="text-[11px] text-white/85 drop-shadow ml-4 truncate block">
            {destination.country}
          </span>
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
      {/* ───────── HEADER plus compact + search bar premium ───────── */}
      <div
        className="px-5 pt-6 pb-5 lk-fade-in-down lg:mx-auto lg:mt-6 lg:max-w-7xl lg:rounded-[32px] lg:px-8 lg:py-8"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.22)' }}
            >
              <TrendingUp className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight lg:text-4xl lg:font-bold">
                Toutes les destinations
              </h1>
              <p className="text-white/85 text-xs md:text-sm tabular-nums">
                {allDestinations.length} destinations disponibles
              </p>
            </div>
          </div>

          {/* Search Bar premium avec focus state animé */}
          <div className="lk-search relative bg-white/95 rounded-2xl shadow-lg flex items-center pr-2 lg:max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5"
              style={{ color: 'var(--lokadia-gray-500)' }}
            />
            <input
              type="text"
              placeholder="Rechercher une destination..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="lk-input flex-1 pl-11 pr-2 py-2.5 rounded-2xl text-sm bg-transparent outline-none"
              style={{ color: 'var(--lokadia-gray-900)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="lk-btn p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" style={{ color: 'var(--lokadia-gray-500)' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ───────── COUNTER avec transition douce sur changement ───────── */}
      <div className="max-w-7xl mx-auto px-5 pt-4 pb-2 flex items-center justify-between lg:px-0 lg:pt-6">
        <p
          key={filteredDestinations.length}
          className="text-xs lk-fade-in tabular-nums"
          style={{ color: 'var(--lokadia-gray-500)' }}
        >
          <span className="font-bold" style={{ color: 'var(--lokadia-gray-700)' }}>
            {filteredDestinations.length}
          </span>{' '}
          {filteredDestinations.length > 1 ? 'résultats' : 'résultat'}
          {searchQuery && <> pour « <span className="italic">{searchQuery}</span> »</>}
        </p>
      </div>

      {/* ───────── GRILLE dense premium 2/3/4/5 cols ───────── */}
      <div className="max-w-7xl mx-auto px-5 pb-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6 lg:px-0">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl bg-white p-5" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
            <TrendingUp className="h-6 w-6 mb-4" style={{ color: "var(--lokadia-primary)" }} />
            <h2 className="text-xl font-bold" style={{ color: "var(--lokadia-gray-900)" }}>
              Catalogue
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--lokadia-gray-600)" }}>
              Une grille dense pour scanner rapidement les destinations, avec score Lokascore visible dès la liste.
            </p>
          </div>
        </aside>

        {filteredDestinations.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {filteredDestinations.map((destination, index) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                index={index}
                onClick={() => navigate(`/destination/${destination.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 lk-fade-in">
            <div
              className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-3 mx-auto"
              style={{ backgroundColor: 'var(--lokadia-gray-100)' }}
            >
              <Search className="h-7 w-7" style={{ color: 'var(--lokadia-gray-400)' }} />
            </div>
            <p className="text-base font-semibold" style={{ color: 'var(--lokadia-gray-700)' }}>
              Aucune destination trouvée
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--lokadia-gray-500)' }}>
              Essayez avec un autre mot-clé
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
