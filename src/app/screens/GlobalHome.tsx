import { TrendingDestinationCard } from "../components/TrendingDestinationCard";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Search, 
  Shield, 
  MapPin, 
  Plus, 
  TrendingUp, 
  Globe, 
  Plane, 
  Smartphone,
  Bell,
  CheckSquare,
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

  const whyLokadia = [
    {
      icon: Shield,
      titleKey: 'verifiedInfo' as const,
      descKey: 'verifiedInfoDesc' as const,
      link: "/community",
      screen: "community"
    },
    {
      icon: Bell,
      titleKey: 'realTimeAlerts' as const,
      descKey: 'realTimeAlertsDesc' as const,
      link: "/alerts",
      screen: "alerts"
    },
    {
      icon: CheckSquare,
      titleKey: 'travelChecklist' as const,
      descKey: 'travelChecklistDesc' as const,
      link: "/checklist",
      screen: "checklist"
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

      {/* Why Lokadia Section */}
      <div className="px-6 mb-8">
        <h2 className="text-xl font-semibold mb-5" style={{ color: 'var(--lokadia-gray-900)' }}>
          {t.home.whyLokadia}
        </h2>

        <div className="space-y-3">
          {whyLokadia.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <button
                  onClick={() => navigate(item.link)}
                  className="block w-full"
                >
                  <motion.div
                    className="bg-white rounded-3xl p-5 flex items-start gap-4 transition-all"
                    style={{ boxShadow: 'var(--shadow-md)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'var(--lokadia-category-safety-bg)'
                      }}
                    >
                      <Icon className="h-7 w-7" style={{ color: 'var(--lokadia-category-safety)' }} />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-semibold mb-1 text-lg" style={{ color: 'var(--lokadia-gray-900)' }}>
                        {t.home[item.titleKey]}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                        {t.home[item.descKey]}
                      </p>
                    </div>
                    <ChevronRight 
                      className="h-5 w-5 flex-shrink-0 mt-2" 
                      style={{ color: 'var(--lokadia-gray-400)' }} 
                    />
                  </motion.div>
                </button>
              </motion.div>
            );
          })}
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