import { TrendingDestinationCard } from "../components/TrendingDestinationCard";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Shield,
  MapPin,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useLanguageSafe } from "../context/LanguageContext";

export function GlobalHome() {
  const navigate = useNavigate();
  const context = useLanguageSafe();
  
  // États pour le carrousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Images pour le hero slideshow
  const heroImages = [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80",
    "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80",
  ];
  
  // Changer de slide automatiquement toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [heroImages.length]);
  
  // Gestion du drag pour le scroll horizontal
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const startX = e.pageX - container.offsetLeft;
    const scrollLeft = container.scrollLeft;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };
    
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      container.style.cursor = "grab";
    };
    
    container.style.cursor = "grabbing";
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
      safetyScore: 85,
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "tokyo-japan",
      city: "Tokyo",
      country: "Japon",
      safetyScore: 95,
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "dubai-uae",
      city: "Dubaï",
      country: "Émirats Arabes Unis",
      safetyScore: 90,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "barcelona-spain",
      city: "Barcelone",
      country: "Espagne",
      safetyScore: 78,
      image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "new-york-usa",
      city: "New York",
      country: "États-Unis",
      safetyScore: 82,
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
    {
      id: "london-uk",
      city: "Londres",
      country: "Royaume-Uni",
      safetyScore: 85,
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    },
  ];

  const popularDestinations = [
    {
      id: "rome-italy",
      city: "Rome",
      country: "Italie",
      tag: "Culture",
      safetyScore: 80,
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80",
    },
    {
      id: "bali-indonesia",
      city: "Bali",
      country: "Indonésie",
      tag: "Nature",
      safetyScore: 74,
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    },
    {
      id: "santorini-greece",
      city: "Santorin",
      country: "Grèce",
      tag: "Romantique",
      safetyScore: 86,
      image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",
    },
    {
      id: "marrakech-morocco",
      city: "Marrakech",
      country: "Maroc",
      tag: "Découverte",
      safetyScore: 70,
      image: "https://images.unsplash.com/photo-1577147443647-81856d5e4a5c?w=600&q=80",
    },
    {
      id: "amsterdam-netherlands",
      city: "Amsterdam",
      country: "Pays-Bas",
      tag: "Tendance",
      safetyScore: 83,
      image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80",
    },
    {
      id: "bangkok-thailand",
      city: "Bangkok",
      country: "Thaïlande",
      tag: "Aventure",
      safetyScore: 72,
      image: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80",
    },
  ];

  return (
    <div 
      className="min-h-screen pb-20 relative" 
      style={{ background: 'var(--lokadia-background)' }}
    >
      {/* Hero Header Section - Slideshow avec images de voyage */}
      <div 
        className="px-6 pt-8 pb-10 relative overflow-hidden"
        style={{ height: '320px' }}
      >
        {/* Slideshow Background */}
        <div className="absolute inset-0">
          <AnimatePresence>
            {heroImages.map((image, index) => (
              index === currentSlide && (
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <ImageWithFallback
                    src={image}
                    alt="Destination de voyage"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )
            ))}
          </AnimatePresence>
          
          {/* Dark overlay pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70"></div>
        </div>

        {/* Indicateurs de slide */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className="transition-all"
              style={{
                width: currentSlide === index ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.4)',
              }}
              aria-label={`Aller à la slide ${index + 1}`}
            />
          ))}
        </div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo/Brand */}
          <div className="flex items-center gap-2.5 mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md"
              style={{ 
                background: "rgba(255, 255, 255, 0.25)",
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">Lokadia</h1>
              <p className="text-white/90 text-xs drop-shadow-md">Votre compagnon de voyage</p>
            </div>
          </div>

          <h2
            className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-lg"
          >
            {t.home.greeting}
          </h2>
          <p className="text-base text-white/95 max-w-md drop-shadow-md">
            {t.home.subtitle}
          </p>
        </motion.div>
      </div>

      {/* Search Bar - Central Action */}
      <div className="px-6 -mt-6 relative z-10 mb-8">
        <button onClick={() => navigate("/destination-count")} className="block w-full">
          <motion.div
            className="flex items-center gap-4 bg-white rounded-3xl p-5 border-2 transition-all"
            style={{ 
              borderColor: 'var(--lokadia-primary)',
              boxShadow: 'var(--shadow-xl)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--lokadia-info-bg)' }}
            >
              <Search className="h-6 w-6" style={{ color: 'var(--lokadia-primary)' }} />
            </div>
            <span className="text-base font-medium" style={{ color: 'var(--lokadia-gray-700)' }}>
              {t.home.searchPlaceholder}
            </span>
          </motion.div>
        </button>
      </div>

      {/* Trending Destinations - Improved Slider */}
      <div className="mb-8">
        <div className="px-6 mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-0.5" style={{ color: 'var(--lokadia-gray-900)' }}>
              {t.home.trendingDestinations}
            </h2>
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Destinations populaires du moment
            </p>
          </div>
          <button onClick={() => navigate('/all-destinations')}>
            <TrendingUp className="h-5 w-5" style={{ color: 'var(--lokadia-warning)' }} />
          </button>
        </div>

        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          className="overflow-x-auto scrollbar-hide flex gap-4 px-6 snap-x snap-proximity"
          style={{ cursor: "grab" }}
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

        {/* Hint pour indiquer qu'on peut scroller */}
        <div className="px-6 mt-3 text-center">
          <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            {t.home.swipeHint}
          </p>
        </div>
      </div>

      {/* Popular Destinations Section */}
      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold mb-0.5" style={{ color: 'var(--lokadia-gray-900)' }}>
              Destinations du moment
            </h2>
            <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
              Coup de cœur de la communauté
            </p>
          </div>
          <button
            onClick={() => navigate('/all-destinations')}
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: 'var(--lokadia-primary)' }}
          >
            Voir tout
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {popularDestinations.map((dest, index) => (
            <motion.button
              key={dest.id}
              onClick={() => navigate(`/destination/${dest.id}`)}
              className="relative rounded-2xl overflow-hidden text-left"
              style={{
                height: index === 0 || index === 3 ? '180px' : '140px',
                boxShadow: 'var(--shadow-md)'
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.07 }}
              whileTap={{ scale: 0.97 }}
            >
              <ImageWithFallback
                src={dest.image}
                alt={dest.city}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Tag */}
              <div className="absolute top-2.5 left-2.5">
                <span
                  className="text-white text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm"
                  style={{ background: 'rgba(255,255,255,0.25)' }}
                >
                  {dest.tag}
                </span>
              </div>

              {/* Safety score */}
              <div className="absolute top-2.5 right-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm"
                  style={{
                    background: dest.safetyScore >= 80
                      ? 'rgba(16, 185, 129, 0.85)'
                      : dest.safetyScore >= 70
                      ? 'rgba(245, 158, 11, 0.85)'
                      : 'rgba(239, 68, 68, 0.85)'
                  }}
                >
                  <span className="text-white text-[10px] font-bold">{dest.safetyScore}</span>
                </div>
              </div>

              {/* City + Country */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-sm leading-tight">{dest.city}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-white/70" />
                  <p className="text-white/80 text-xs">{dest.country}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* CTA Card */}
      <div className="px-6 mb-8">
        <motion.div
          className="rounded-3xl p-6 text-center"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: 'var(--shadow-2xl)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Shield className="h-12 w-12 text-white mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">
            {t.home.travelPeace}
          </h3>
          <p className="text-white/90 text-sm mb-5">
            {t.home.travelPeaceDesc}
          </p>
          <button
            onClick={() => navigate("/premium")}
            className="inline-block px-8 py-3 rounded-full font-semibold transition-all"
            style={{ 
              backgroundColor: 'var(--lokadia-warning)',
              color: 'white',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            {t.home.discoverPremium}
          </button>
        </motion.div>
      </div>
    </div>
  );
}