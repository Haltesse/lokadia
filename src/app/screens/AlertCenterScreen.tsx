import { 
  ArrowLeft, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Cloud,
  Shield,
  Flame,
  Train,
  Heart,
  Flag,
  RefreshCw,
  Bell,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { fetchRealTimeAlerts, type RealTimeAlert } from '../services/alertService';
import { useLanguageSafe } from '../context/LanguageContext';

type AlertType = "all" | "weather" | "security" | "transport" | "health" | "political" | "disaster";
type AlertLevel = "all" | "info" | "vigilance" | "urgent";

// Icônes spécifiques par type d'alerte
const alertTypeConfig = {
  weather: { icon: Cloud, label: "Météo", color: "#06B6D4" },
  security: { icon: Shield, label: "Sécurité", color: "#EF4444" },
  disaster: { icon: Flame, label: "Catastrophe", color: "#DC2626" },
  transport: { icon: Train, label: "Transport", color: "#8B5CF6" },
  health: { icon: Heart, label: "Santé", color: "#EC4899" },
  political: { icon: Flag, label: "Politique", color: "#F59E0B" },
  all: { icon: AlertTriangle, label: "Toutes", color: "#0F4C81" }
};

const alertLevelConfig = {
  urgent: { 
    label: "Urgent", 
    bg: "rgba(239, 68, 68, 0.1)", 
    color: "#EF4444",
    borderColor: "rgba(239, 68, 68, 0.2)"
  },
  vigilance: { 
    label: "Vigilance", 
    bg: "rgba(245, 158, 11, 0.1)", 
    color: "#F59E0B",
    borderColor: "rgba(245, 158, 11, 0.2)"
  },
  info: { 
    label: "Info", 
    bg: "rgba(6, 182, 212, 0.1)", 
    color: "#06B6D4",
    borderColor: "rgba(6, 182, 212, 0.2)"
  }
};

export function AlertCenterScreen() {
  const { translate } = useLanguageSafe();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<AlertType>("all");
  const [selectedLevel, setSelectedLevel] = useState<AlertLevel>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Charger les alertes au montage
  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const realTimeAlerts = await fetchRealTimeAlerts();
      setAlerts(realTimeAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  };

  // Filtrage des alertes avec prise en compte des zones affectées
  const filteredAlerts = alerts.filter((alert) => {
    // Normalisation pour la recherche (enlever accents, mettre en minuscule)
    const normalizeText = (text: string) => {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
        .trim();
    };
    
    const searchNormalized = normalizeText(searchQuery);
    
    const searchMatch = searchQuery === "" || 
      normalizeText(alert.title).includes(searchNormalized) ||
      normalizeText(alert.summary).includes(searchNormalized) ||
      normalizeText(alert.destination).includes(searchNormalized) ||
      alert.affectedZones?.some(zone => normalizeText(zone).includes(searchNormalized));
    
    const typeMatch = selectedType === "all" || alert.type === selectedType;
    const levelMatch = selectedLevel === "all" || alert.level === selectedLevel;
    
    // Destination match étendu : on vérifie si la destination sélectionnée correspond
    // soit à la destination principale, soit aux zones affectées
    const destinationMatch = selectedDestination === "all" || 
      alert.destination === selectedDestination ||
      alert.affectedZones?.includes(selectedDestination);
    
    return searchMatch && typeMatch && levelMatch && destinationMatch;
  });

  // Extraire les destinations uniques (incluant les zones affectées)
  const allDestinationNames = alerts.flatMap(alert => {
    const destinations = [alert.destination];
    if (alert.affectedZones && alert.affectedZones.length > 0) {
      destinations.push(...alert.affectedZones);
    }
    return destinations;
  });
  const uniqueDestinations = Array.from(new Set(allDestinationNames)).sort();

  // Compter les alertes par niveau UNIQUEMENT sur les alertes filtrées (pas toutes)
  const urgentCount = filteredAlerts.filter(a => a.level === "urgent").length;
  const vigilanceCount = filteredAlerts.filter(a => a.level === "vigilance").length;
  const infoCount = filteredAlerts.filter(a => a.level === "info").length;

  return (
    <div className="min-h-screen pb-20" style={{ background: "linear-gradient(to bottom, #F8FAFC 0%, #F1F5F9 100%)" }}>
      {/* Header avec dégradé */}
      <div 
        className="relative px-6 pt-14 pb-8 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0F4C81 0%, #134074 50%, #1E5A8E 100%)"
        }}
      >
        {/* Effet de lumière d'ambiance */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 30% 50%, rgba(6, 182, 212, 0.3) 0%, transparent 50%)"
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Centre d'Alertes
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-white/80 text-sm">
                  {loading 
                    ? "Chargement..." 
                    : searchQuery || selectedType !== "all" || selectedLevel !== "all" || selectedDestination !== "all"
                      ? `${filteredAlerts.length} alerte${filteredAlerts.length > 1 ? 's' : ''} trouvée${filteredAlerts.length > 1 ? 's' : ''}`
                      : `${alerts.length} alertes actives`
                  }
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.2)"
              }}
            >
              <RefreshCw className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Barre de recherche moderne */}
          <div className="relative">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)"
              }}
            >
              <div className="flex items-center px-5 py-4">
                <Search className="h-5 w-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  placeholder="Rechercher une alerte, destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="ml-3 p-2 rounded-xl transition-all"
                  style={{
                    backgroundColor: showFilters ? "#0F4C81" : "#F3F4F6",
                    color: showFilters ? "white" : "#0F4C81"
                  }}
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Stats rapides */}
          {!loading && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl p-3 backdrop-blur-md"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.2)"
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{urgentCount}</p>
                    <p className="text-xs text-white/80">Urgent</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-red-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl p-3 backdrop-blur-md"
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.2)"
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{vigilanceCount}</p>
                    <p className="text-xs text-white/80">Vigilance</p>
                  </div>
                  <Bell className="h-6 w-6 text-amber-200" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl p-3 backdrop-blur-md"
                style={{
                  background: "rgba(6, 182, 212, 0.15)",
                  border: "1px solid rgba(6, 182, 212, 0.2)"
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{infoCount}</p>
                    <p className="text-xs text-white/80">Info</p>
                  </div>
                  <Sparkles className="h-6 w-6 text-cyan-200" />
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Panneau de filtres étendu */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-white border-b border-gray-200"
          >
            <div className="px-6 py-6">
              {/* Filtres par type */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Type d'alerte
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(alertTypeConfig) as AlertType[]).map((type) => {
                    const config = alertTypeConfig[type];
                    const Icon = config.icon;
                    const isSelected = selectedType === type;
                    
                    return (
                      <motion.button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-all"
                        style={{
                          backgroundColor: isSelected ? config.color : "white",
                          color: isSelected ? "white" : "#475569",
                          border: `2px solid ${isSelected ? config.color : "#E2E8F0"}`,
                          boxShadow: isSelected ? `0 4px 12px ${config.color}40` : "none"
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{config.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Filtres par niveau */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Niveau de priorité
                </h3>
                <div className="flex gap-2">
                  {(["all", "urgent", "vigilance", "info"] as AlertLevel[]).map((level) => {
                    const isSelected = selectedLevel === level;
                    const config = level !== "all" ? alertLevelConfig[level] : { label: "Tous", color: "#0F4C81" };
                    
                    return (
                      <motion.button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 py-2.5 px-3 rounded-xl font-medium text-sm transition-all"
                        style={{
                          backgroundColor: isSelected ? config.color : "#F8FAFC",
                          color: isSelected ? "white" : "#64748B",
                          border: `2px solid ${isSelected ? config.color : "#E2E8F0"}`
                        }}
                      >
                        {config.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Filtres par destination */}
              {uniqueDestinations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Destination
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <motion.button
                      onClick={() => setSelectedDestination("all")}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all"
                      style={{
                        backgroundColor: selectedDestination === "all" ? "#0F4C81" : "#F8FAFC",
                        color: selectedDestination === "all" ? "white" : "#64748B",
                        border: `2px solid ${selectedDestination === "all" ? "#0F4C81" : "#E2E8F0"}`
                      }}
                    >
                      Toutes
                    </motion.button>
                    {uniqueDestinations.map((dest) => (
                      <motion.button
                        key={dest}
                        onClick={() => setSelectedDestination(dest)}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all"
                        style={{
                          backgroundColor: selectedDestination === dest ? "#06B6D4" : "#F8FAFC",
                          color: selectedDestination === dest ? "white" : "#64748B",
                          border: `2px solid ${selectedDestination === dest ? "#06B6D4" : "#E2E8F0"}`
                        }}
                      >
                        {dest}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtres actifs (chips) */}
      {(searchQuery || selectedType !== "all" || selectedLevel !== "all" || selectedDestination !== "all") && (
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-semibold text-gray-600">Filtres actifs:</p>
            {searchQuery && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium"
              >
                <Search className="h-3 w-3" />
                {searchQuery}
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </motion.div>
            )}
            {selectedType !== "all" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: alertTypeConfig[selectedType].color }}
              >
                {alertTypeConfig[selectedType].label}
                <button onClick={() => setSelectedType("all")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </motion.div>
            )}
            {selectedLevel !== "all" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: alertLevelConfig[selectedLevel].color }}
              >
                {alertLevelConfig[selectedLevel].label}
                <button onClick={() => setSelectedLevel("all")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </motion.div>
            )}
            {selectedDestination !== "all" && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-medium"
              >
                <MapPin className="h-3 w-3" />
                {selectedDestination}
                <button onClick={() => setSelectedDestination("all")}>
                  <X className="h-3 w-3 ml-1" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Liste des alertes */}
      <div className="px-6 py-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)" }}
            >
              <Bell className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Aucune alerte trouvée
            </h3>
            <p className="text-gray-500 text-sm">
              Aucune alerte ne correspond à vos critères de recherche
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.map((alert, index) => {
                const typeConfig = alertTypeConfig[alert.type as keyof typeof alertTypeConfig] || alertTypeConfig.all;
                const levelConfig = alertLevelConfig[alert.level as keyof typeof alertLevelConfig];
                const Icon = typeConfig.icon;

                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl overflow-hidden transition-all hover:shadow-lg"
                    style={{
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                      border: `1px solid ${levelConfig.borderColor}`
                    }}
                  >
                    {/* Barre de couleur */}
                    <div 
                      className="h-1.5" 
                      style={{ 
                        background: `linear-gradient(90deg, ${levelConfig.color} 0%, ${typeConfig.color} 100%)` 
                      }} 
                    />

                    <div className="p-5">
                      <div className="flex gap-4">
                        {/* Icône */}
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ 
                            backgroundColor: `${typeConfig.color}15`,
                            border: `2px solid ${typeConfig.color}30`
                          }}
                        >
                          <Icon className="h-6 w-6" style={{ color: typeConfig.color }} />
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-bold text-gray-900 leading-tight">
                              {alert.title}
                            </h3>
                            <span
                              className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold"
                              style={{
                                backgroundColor: levelConfig.bg,
                                color: levelConfig.color
                              }}
                            >
                              {levelConfig.label}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {alert.summary}
                          </p>

                          {/* Métadonnées */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="font-medium">{alert.destination}, {alert.country}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{alert.date}</span>
                              </div>
                              <div 
                                className="px-2 py-0.5 rounded-md font-medium"
                                style={{
                                  backgroundColor: alert.isCached ? "#FEF3C7" : "#DBEAFE",
                                  color: alert.isCached ? "#92400E" : "#1E40AF"
                                }}
                              >
                                {alert.isCached ? "Cache" : "Live"} • {alert.source}
                              </div>
                            </div>
                            
                            {/* Zones affectées */}
                            {alert.affectedZones && alert.affectedZones.length > 0 && (
                              <div className="flex items-start gap-2 text-xs">
                                <AlertTriangle className="h-3.5 w-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-orange-700 font-semibold">Zones à risque : </span>
                                  <span className="text-gray-600">
                                    {alert.affectedZones.join(', ')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                            <button
                              className="flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                              style={{
                                background: `linear-gradient(135deg, ${typeConfig.color} 0%, ${levelConfig.color} 100%)`,
                                color: "white"
                              }}
                            >
                              Voir les détails
                            </button>
                            <button
                              className="px-4 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95"
                              style={{
                                backgroundColor: "#F8FAFC",
                                color: "#64748B"
                              }}
                            >
                              Partager
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer avec informations */}
      {!loading && alerts.length > 0 && (
        <div className="px-6 pb-6">
          <div 
            className="rounded-2xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(15, 76, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)",
              border: "1px solid rgba(15, 76, 129, 0.1)"
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "rgba(6, 182, 212, 0.1)" }}
              >
                <Sparkles className="h-5 w-5 text-cyan-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Données en temps réel
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  8 sources officielles : Open-Meteo • GDACS • NASA • GDELT • WHO/OMS • SNCF • TfL • Conseils Officiels
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Dernière mise à jour : {lastUpdate.toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}