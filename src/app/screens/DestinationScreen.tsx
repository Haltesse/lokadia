import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Clock, 
  Download, 
  CheckCircle, 
  Info, 
  Cloud, 
  Bell, 
  Shield, 
  Syringe, 
  FileText, 
  AlertTriangle, 
  Phone, 
  Globe,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useWeather } from "../hooks/useWeather";
import { useNumbeoSafety } from "../hooks/useNumbeoSafety";
import { useGoSafeScore } from "../hooks/useGoSafeScore";
import { WeatherCard, WeatherCardSkeleton } from "../components/WeatherCard";
import { NumbeoLoadingIndicator } from "../components/NumbeoLoadingIndicator";
import { getDestinationData, type DestinationDetails } from "../data/destinationData";
import { useLanguageSafe } from "../context/LanguageContext";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Badge } from "../components/Badge";
import { Chip } from "../components/Chip";
import { Modal } from "../components/Modal";
import { CurrencySelector } from "../components/CurrencySelector";
import { CurrencyExchangeRate } from "../components/CurrencyExchangeRate";
import { PriceDisplay } from "../components/PriceDisplay";

type Tab = "overview" | "weather" | "alerts" | "safety" | "health" | "entry" | "scams" | "emergency" | "culture";

export function DestinationScreen() {
  const navigate = useNavigate();
  const { destinationId } = useParams<{ destinationId: string }>();

  // Récupérer l'ID depuis l'URL ou utiliser Paris par défaut
  const requestedId = destinationId || "paris-france";
  console.log("🔍 DestinationScreen - ID depuis URL:", requestedId);

  // Charger les données de la destination depuis la base de données
  const destination = getDestinationData(requestedId);
  console.log("🔍 DestinationScreen - Destination trouvée:", destination?.name, destination?.country);

  // Si la destination n'existe pas, rediriger vers Paris avec replace pour ne pas polluer l'historique
  useEffect(() => {
    if (!destination) {
      console.warn("❌ Destination non trouvée:", requestedId, "- Redirection vers Paris");
      // Utiliser replace: true pour remplacer l'entrée actuelle de l'historique au lieu d'en ajouter une nouvelle
      navigate("/destination/paris-france", { replace: true });
    }
  }, [destination, navigate, requestedId]);

  // Afficher un écran de chargement pendant la redirection
  if (!destination) {
    return null;
  }

  return <DestinationScreenContent destination={destination} />;
}

function DestinationScreenContent({ destination }: { destination: DestinationDetails }) {
  const navigate = useNavigate();
  const { t } = useLanguageSafe();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Récupérer le GoSafe Score depuis Numbeo en temps réel
  const { score: goSafeScore, safetyLevel, loading: scoreLoading, lastUpdate: scoreLastUpdate } = useGoSafeScore(destination.id);
  
  // Utiliser le score Numbeo si disponible, sinon utiliser le score statique
  const displayedScore = goSafeScore || destination.goSafeScore;
  const displayedSafetyLevel = goSafeScore ? safetyLevel : destination.safetyLevel;
  const displayedLastUpdate = goSafeScore ? scoreLastUpdate : destination.lastUpdate;

  const tabs = [
    { id: "overview", label: t.destination.overview_tab, icon: Info },
    { id: "weather", label: t.destination.weather_tab, icon: Cloud },
    { id: "alerts", label: t.destination.alerts_tab, icon: Bell },
    { id: "safety", label: t.destination.safety_tab, icon: Shield },
    { id: "health", label: t.destination.health_tab, icon: Syringe },
    { id: "entry", label: t.destination.entry_tab, icon: FileText },
    { id: "scams", label: t.destination.scams_tab, icon: AlertTriangle },
    { id: "emergency", label: t.destination.emergency_tab, icon: Phone },
    { id: "culture", label: t.destination.culture_tab, icon: Globe },
  ];

  // Vérifier si on peut scroller
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScrollButtons();
      container.addEventListener("scroll", checkScrollButtons);
      
      // Vérifier aussi après un délai pour s'assurer que le rendu est terminé
      const timer = setTimeout(checkScrollButtons, 100);
      
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        clearTimeout(timer);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleDownload = () => {
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          return null;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${destination.name} - Lokadia`,
          text: `Découvrez les informations de sécurité pour ${destination.name}`,
          url: window.location.href,
        });
      } catch (error) {
        // Ignorer silencieusement les erreurs AbortError et NotAllowedError
        // (utilisateur annule ou permission refusée)
        if (error instanceof Error && 
            error.name !== 'AbortError' && 
            error.name !== 'NotAllowedError') {
          console.error('Erreur lors du partage:', error);
        }
      }
    }
  };

  const handleCreateTrip = () => {
    const destinationForTrip = {
      id: destination.id,
      name: destination.name,
      country: destination.country,
    };
    console.log("✈️ Création de voyage pour:", destinationForTrip);
    navigate("/trips/create", { state: { destination: destinationForTrip } });
  };

  const handleGoToChecklist = () => {
    navigate(`/checklist/${destination.id}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => {
              console.log("🔙 Retour cliqué - Navigation vers la page précédente");
              navigate(-1);
            }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95 touch-manipulation"
            style={{ pointerEvents: 'auto' }}
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          
          {/* Currency Selector */}
          <CurrencySelector compact />
        </div>
      </div>

      {/* Header Image */}
      <div className="relative h-64">
        <ImageWithFallback
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70"></div>

        {/* Action Buttons */}
        <div className="absolute top-12 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95"
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`}
            />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95"
          >
            <Share2 className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Destination Info */}
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-4xl font-bold text-white mb-2">{destination.name}</h1>
          <div className="flex items-center gap-2 text-white/90 mb-4">
            <MapPin className="h-5 w-5" />
            <span className="text-lg">{destination.country}</span>
          </div>
        </div>
      </div>

      {/* GoSafe Score Card */}
      <div className="px-6 -mt-6 mb-8 relative z-10">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-light)" }}>
                GoSafe Index
              </h3>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl font-bold"
                  style={{ color: "#0A2545" }}
                >
                  {displayedScore}
                </span>
                <span className="text-xl" style={{ color: "var(--lokadia-text-light)" }}>
                  /100
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="safe" size="md">
                <CheckCircle className="h-4 w-4 mr-1" />
                Sûr
              </Badge>
              <div className="flex items-center gap-1 text-xs" style={{ color: "var(--lokadia-text-light)" }}>
                <Clock className="h-3 w-3" />
                {displayedLastUpdate}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <button
              onClick={handleCreateTrip}
              className="col-span-2 py-3 rounded-xl font-semibold text-white transition-transform active:scale-98"
              style={{ backgroundColor: "#4169E1" }}
            >
              Créer un voyage
            </button>
            <button
              onClick={handleGoToChecklist}
              className="py-3 rounded-xl font-semibold text-white transition-transform active:scale-98"
              style={{ backgroundColor: "#0A2545" }}
              title="Checklist voyage"
            >
              ✓
            </button>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloadProgress !== null}
            className="w-full py-3 rounded-xl font-semibold border-2 transition-transform active:scale-98"
            style={{
              borderColor: "#0A2545",
              color: "#0A2545",
            }}
          >
            {downloadProgress !== null ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                {downloadProgress}%
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Download className="h-5 w-5" />
                Télécharger les infos
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative mb-6">
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide" 
          style={{ 
            scrollSnapType: "x proximity",
            WebkitOverflowScrolling: "touch"
          }}
        >
          <div className="flex gap-2 px-6 pb-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Chip
                  key={tab.id}
                  selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  icon={<Icon className="h-4 w-4" />}
                >
                  {tab.label}
                </Chip>
              );
            })}
          </div>
        </div>
        
        {/* Bouton gauche */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-2 w-10 flex items-center justify-center transition-opacity hover:opacity-80 active:scale-95"
            style={{
              background: "linear-gradient(to right, var(--lokadia-soft-white) 60%, transparent 100%)",
            }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: "#0A2545" }}
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </div>
          </button>
        )}
        
        {/* Bouton droit */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-2 w-10 flex items-center justify-center transition-opacity hover:opacity-80 active:scale-95"
            style={{
              background: "linear-gradient(to left, var(--lokadia-soft-white) 60%, transparent 100%)",
            }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ backgroundColor: "#0A2545" }}
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </div>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="px-6 pb-24">
        {activeTab === "overview" && <OverviewTab destination={destination} />}
        {activeTab === "weather" && <WeatherTab destination={destination} />}
        {activeTab === "alerts" && <AlertsTab destination={destination} />}
        {activeTab === "safety" && <SafetyTab destination={destination} />}
        {activeTab === "health" && <HealthTab destination={destination} />}
        {activeTab === "entry" && <EntryTab destination={destination} />}
        {activeTab === "scams" && <ScamsTab destination={destination} />}
        {activeTab === "emergency" && <EmergencyTab destination={destination} />}
        {activeTab === "culture" && <CultureTab destination={destination} />}
      </div>

      {/* Floating Sources Button */}
      <button
        onClick={() => setShowSourcesModal(true)}
        className="fixed bottom-6 right-6 px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2"
        style={{ backgroundColor: "var(--lokadia-blue)" }}
      >
        <ExternalLink className="h-5 w-5" />
        Sources
      </button>

      {/* Sources Modal */}
      <Modal
        isOpen={showSourcesModal}
        onClose={() => setShowSourcesModal(false)}
        title="Sources officielles"
      >
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
            Toutes les informations proviennent de sources officielles vérifiées :
          </p>
          <div className="space-y-3">
            {[
              { name: "Ministère des Affaires Étrangères", trust: "Haute confiance", updated: "Il y a 2h" },
              { name: "Organisation Mondiale de la Santé", trust: "Haute confiance", updated: "Il y a 1j" },
              { name: "Ambassade de France", trust: "Haute confiance", updated: "Il y a 3h" },
            ].map((source, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sm" style={{ color: "var(--lokadia-text-dark)" }}>
                    {source.name}
                  </h4>
                  <Badge variant="safe" size="sm">
                    {source.trust}
                  </Badge>
                </div>
                <p className="text-xs" style={{ color: "var(--lokadia-text-light)" }}>
                  Mis à jour: {source.updated}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Modal>

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

// Tab Components
function OverviewTab({ destination }: { destination: DestinationDetails }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-base" style={{ color: "var(--lokadia-text-dark)" }}>
          Informations essentielles
        </h3>
        <div className="space-y-4">
          <div className="py-3 border-b border-gray-100">
            <span className="text-sm block mb-2" style={{ color: "var(--lokadia-text-light)" }}>
              Fuseau horaire
            </span>
            <span className="font-medium text-sm block" style={{ color: "var(--lokadia-text-dark)" }}>
              {destination.timezone}
            </span>
          </div>
          <div className="py-3 border-b border-gray-100">
            <span className="text-sm block mb-2" style={{ color: "var(--lokadia-text-light)" }}>
              Langue
            </span>
            <span className="font-medium text-sm block" style={{ color: "var(--lokadia-text-dark)" }}>
              {destination.language}
            </span>
          </div>
          <div className="py-3">
            <span className="text-sm block mb-2" style={{ color: "var(--lokadia-text-light)" }}>
              Monnaie
            </span>
            <span className="font-medium text-sm block mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
              {destination.currency}
            </span>
            <CurrencyExchangeRate localCurrency={destination.currency} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-base" style={{ color: "var(--lokadia-text-dark)" }}>
          Résumé sécurité
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--lokadia-text-light)" }}>
          {destination.securitySummary}
        </p>
      </div>
    </div>
  );
}

function WeatherTab({ destination }: { destination: DestinationDetails }) {
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(destination.name);
  
  return (
    <div>
      {weatherLoading ? (
        <WeatherCardSkeleton />
      ) : weatherError || !weather ? (
        <WeatherCardSkeleton error />
      ) : (
        <WeatherCard weather={weather} cityName={destination.name} />
      )}
    </div>
  );
}

function AlertsTab({ destination }: { destination: DestinationDetails }) {
  if (destination.alerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <CheckCircle className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--lokadia-success-green)" }} />
        <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
          Aucune alerte active pour cette destination
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {destination.alerts.map((alert) => (
        <div key={alert.id} className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <Bell
              className="h-5 w-5 mt-0.5 flex-shrink-0"
              style={{ 
                color: alert.type === "info" 
                  ? "var(--lokadia-info)" 
                  : alert.type === "danger"
                  ? "var(--lokadia-emergency-orange)"
                  : "var(--lokadia-vigilance)" 
              }}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold" style={{ color: "var(--lokadia-text-dark)" }}>
                  {alert.title}
                </h3>
                <Badge 
                  variant={alert.type === "info" ? "info" : alert.type === "danger" ? "danger" : "vigilance"} 
                  size="sm"
                >
                  {alert.type === "info" ? "Info" : alert.type === "danger" ? "Danger" : "Vigilance"}
                </Badge>
              </div>
              <p className="text-sm mb-2" style={{ color: "var(--lokadia-text-light)" }}>
                {alert.summary}
              </p>
              <p className="text-xs" style={{ color: "var(--lokadia-text-light)" }}>
                {alert.date}
              </p>
            </div>
          </div>
          <button
            className="w-full py-2 rounded-lg font-medium text-sm transition-colors"
            style={{
              color: "var(--lokadia-blue)",
              backgroundColor: "var(--lokadia-soft-white)",
            }}
          >
            Voir les détails
          </button>
        </div>
      ))}
    </div>
  );
}

function SafetyTab({ destination }: { destination: DestinationDetails }) {
  const { safetyData, loading: safetyLoading, error: safetyError, refresh } = useNumbeoSafety(destination.id);
  
  return (
    <div className="space-y-4">
      {/* Numbeo Safety Index Card */}
      {safetyData && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-sm border-2 border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-medium mb-1 text-blue-600">
                Numbeo Safety Index (temps réel)
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-900">
                  {safetyData.safetyIndex.toFixed(1)}
                </span>
                <span className="text-lg text-blue-600">/100</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant={safetyData.safetyLevel === "safe" ? "safe" : safetyData.safetyLevel === "moderate" ? "vigilance" : "danger"} 
                size="md"
              >
                {safetyData.safetyLevel === "safe" ? "Sûr" : safetyData.safetyLevel === "moderate" ? "Modéré" : "Risqué"}
              </Badge>
              <button
                onClick={refresh}
                className="text-xs text-blue-600 underline hover:text-blue-800"
              >
                Actualiser
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white/50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Indice de criminalité</p>
              <p className="text-lg font-bold text-red-700">{safetyData.crimeIndex.toFixed(1)}</p>
            </div>
            {safetyData.healthCareIndex && (
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Système de santé</p>
                <p className="text-lg font-bold text-green-700">{safetyData.healthCareIndex.toFixed(1)}</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-blue-600">
            <span>Source: Numbeo.com</span>
            <span>MAJ: {safetyData.lastUpdate}</span>
          </div>
        </div>
      )}
      
      {safetyLoading && (
        <NumbeoLoadingIndicator />
      )}
      
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
          Quartiers à éviter
        </h3>
        <ul className="space-y-2">
          {destination.dangerousAreas.map((zone, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertTriangle
                className="h-4 w-4 mt-0.5 flex-shrink-0"
                style={{ color: "var(--lokadia-warning-orange)" }}
              />
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
                {zone}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
          Conseils de sécurité
        </h3>
        <ul className="space-y-3">
          {destination.safetyTips.map((tip, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: "var(--lokadia-blue)" }}
              >
                {i + 1}
              </div>
              <span className="text-sm pt-0.5" style={{ color: "var(--lokadia-text-light)" }}>
                {tip}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HealthTab({ destination }: { destination: DestinationDetails }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
          Vaccins recommandés
        </h3>
        <div className="space-y-3">
          {destination.vaccines.map((vaccine, i) => (
            <div 
              key={i} 
              className={`flex items-center gap-3 p-3 rounded-xl ${
                vaccine.status === 'required' ? 'bg-orange-50' : 'bg-blue-50'
              }`}
            >
              <CheckCircle 
                className={`h-5 w-5 flex-shrink-0 ${
                  vaccine.status === 'required' ? 'text-orange-600' : 'text-blue-600'
                }`} 
              />
              <div className="flex-1">
                <span className="text-sm block" style={{ color: "var(--lokadia-text-dark)" }}>
                  {vaccine.name}
                </span>
                {vaccine.status === 'required' && (
                  <span className="text-xs" style={{ color: "var(--lokadia-warning-orange)" }}>
                    Obligatoire
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
          Système de santé
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--lokadia-text-light)" }}>
          {destination.healthSystem}
        </p>
      </div>
    </div>
  );
}

function EntryTab({ destination }: { destination: DestinationDetails }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
          Conditions d'entrée
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {destination.visaRequired ? (
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-sm mb-1" style={{ color: "var(--lokadia-text-dark)" }}>
                {destination.visaRequired ? "Visa requis" : "Pas de visa nécessaire"}
              </p>
              <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
                {destination.visaDetails}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: "var(--lokadia-blue)" }} />
            <div>
              <p className="font-medium text-sm mb-1" style={{ color: "var(--lokadia-text-dark)" }}>
                Documents requis
              </p>
              <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
                {destination.entryDocuments}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScamsTab({ destination }: { destination: DestinationDetails }) {
  // Extraire le code de devise depuis destination.currency (ex: "Yuan chinois (CNY/¥)" -> "CNY")
  const currencyMatch = destination.currency.match(/\(([A-Z]{3})/);
  const localCurrencyCode = currencyMatch ? currencyMatch[1] : undefined;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
          Arnaques courantes
        </h3>
        <div className="space-y-3">
          {destination.commonScams.map((scam, i) => (
            <div key={i} className="p-4 rounded-xl border-2 border-orange-100 bg-orange-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: "var(--lokadia-text-dark)" }}>
                    {scam.title}
                  </p>
                  <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
                    {scam.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
          Prix repères
        </h3>
        <div className="space-y-2">
          {destination.priceGuide.map((price, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
                {price.item}
              </span>
              <span className="font-semibold text-sm" style={{ color: "var(--lokadia-text-dark)" }}>
                <PriceDisplay price={price.price} showOriginal={true} localCurrency={localCurrencyCode} />
              </span>
            </div>
          ))}
        </div>
        
        {/* Convertisseur de devise */}
        <CurrencyExchangeRate localCurrency={destination.currency} />
      </div>
    </div>
  );
}

function EmergencyTab({ destination }: { destination: DestinationDetails }) {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-5 text-base" style={{ color: "var(--lokadia-text-dark)" }}>
          Numéros d'urgence
        </h3>
        <div className="space-y-3">
          {destination.emergencyNumbers.map((emergency, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-red-50 border-2 border-red-100">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emergency.icon}</span>
                <span className="font-medium text-sm" style={{ color: "#0A2545" }}>
                  {emergency.name}
                </span>
              </div>
              <a
                href={`tel:${emergency.number}`}
                className="px-5 py-2.5 rounded-xl font-bold text-white shadow-sm"
                style={{ backgroundColor: "#DC2626" }}
              >
                {emergency.number}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-base" style={{ color: "var(--lokadia-text-dark)" }}>
          Consulat
        </h3>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: "var(--lokadia-text-light)" }}>
          {destination.consulateInfo}
        </p>
        <button
          className="w-full py-3 rounded-xl font-semibold text-white"
          style={{ backgroundColor: "#0A2545" }}
        >
          Contacter le consulat
        </button>
      </div>
    </div>
  );
}

function CultureTab({ destination }: { destination: DestinationDetails }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
          Coutumes locales
        </h3>
        <ul className="space-y-3">
          {destination.localCustoms.map((custom, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle
                className="h-5 w-5 mt-0.5 flex-shrink-0"
                style={{ color: "var(--lokadia-success-green)" }}
              />
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
                {custom}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
          Comportements à éviter
        </h3>
        <ul className="space-y-3">
          {destination.behaviorsToAvoid.map((behavior, i) => (
            <li key={i} className="flex items-start gap-3">
              <AlertTriangle
                className="h-5 w-5 mt-0.5 flex-shrink-0"
                style={{ color: "var(--lokadia-warning-orange)" }}
              />
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
                {behavior}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}