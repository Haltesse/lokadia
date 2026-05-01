import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Cloud,
  Filter,
  Flame,
  Flag,
  Heart,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Train,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { fetchRealTimeAlerts, type RealTimeAlert } from "../services/alertService";

type AlertType = "all" | "weather" | "security" | "transport" | "health" | "political" | "disaster";
type AlertLevel = "all" | "info" | "vigilance" | "urgent";

const alertTypeConfig = {
  weather: { icon: Cloud, label: "Météo", color: "#06B6D4" },
  security: { icon: Shield, label: "Sécurité", color: "#EF4444" },
  disaster: { icon: Flame, label: "Catastrophe", color: "#DC2626" },
  transport: { icon: Train, label: "Transport", color: "#8B5CF6" },
  health: { icon: Heart, label: "Santé", color: "#EC4899" },
  political: { icon: Flag, label: "Politique", color: "#F59E0B" },
  all: { icon: AlertTriangle, label: "Toutes", color: "#0F4C81" },
};

const alertLevelConfig = {
  urgent: {
    label: "Urgent",
    bg: "rgba(239, 68, 68, 0.1)",
    color: "#EF4444",
    borderColor: "rgba(239, 68, 68, 0.24)",
  },
  vigilance: {
    label: "Vigilance",
    bg: "rgba(245, 158, 11, 0.1)",
    color: "#F59E0B",
    borderColor: "rgba(245, 158, 11, 0.24)",
  },
  info: {
    label: "Info",
    bg: "rgba(6, 182, 212, 0.1)",
    color: "#06B6D4",
    borderColor: "rgba(6, 182, 212, 0.24)",
  },
};

const sources = [
  { code: "MAE", label: "Ministère Affaires Étrangères" },
  { code: "GDACS", label: "Catastrophes naturelles" },
  { code: "OMS", label: "Santé et sanitaire" },
  { code: "IATA", label: "Transport aérien" },
];

export function AlertCenterScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<AlertType>("all");
  const [selectedLevel, setSelectedLevel] = useState<AlertLevel>("all");
  const [selectedDestination, setSelectedDestination] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    setLoading(true);
    try {
      const realTimeAlerts = await fetchRealTimeAlerts();
      setAlerts(realTimeAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }

  const uniqueDestinations = useMemo(() => {
    const names = alerts.flatMap((alert) => [alert.destination, ...(alert.affectedZones ?? [])]);
    return Array.from(new Set(names)).sort();
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const normalizeText = (text: string) =>
      text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    const searchNormalized = normalizeText(searchQuery);

    return alerts.filter((alert) => {
      const searchMatch =
        searchQuery === "" ||
        normalizeText(alert.title).includes(searchNormalized) ||
        normalizeText(alert.summary).includes(searchNormalized) ||
        normalizeText(alert.destination).includes(searchNormalized) ||
        alert.affectedZones?.some((zone) => normalizeText(zone).includes(searchNormalized));

      const typeMatch = selectedType === "all" || alert.type === selectedType;
      const levelMatch = selectedLevel === "all" || alert.level === selectedLevel;
      const destinationMatch =
        selectedDestination === "all" ||
        alert.destination === selectedDestination ||
        alert.affectedZones?.includes(selectedDestination);

      return searchMatch && typeMatch && levelMatch && destinationMatch;
    });
  }, [alerts, searchQuery, selectedDestination, selectedLevel, selectedType]);

  useEffect(() => {
    if (!filteredAlerts.length) {
      setSelectedAlertId(null);
      return;
    }

    if (!selectedAlertId || !filteredAlerts.some((alert) => alert.id === selectedAlertId)) {
      setSelectedAlertId(filteredAlerts[0].id);
    }
  }, [filteredAlerts, selectedAlertId]);

  const selectedAlert = filteredAlerts.find((alert) => alert.id === selectedAlertId) ?? filteredAlerts[0];
  const urgentCount = filteredAlerts.filter((alert) => alert.level === "urgent").length;
  const vigilanceCount = filteredAlerts.filter((alert) => alert.level === "vigilance").length;
  const infoCount = filteredAlerts.filter((alert) => alert.level === "info").length;

  const hasActiveFilters =
    searchQuery || selectedType !== "all" || selectedLevel !== "all" || selectedDestination !== "all";

  function resetFilters() {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedLevel("all");
    setSelectedDestination("all");
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-black" style={{ color: "var(--lokadia-gray-900)" }}>
            <Filter className="h-4 w-4" />
            Filtres
          </h2>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-xs font-bold" style={{ color: "var(--lokadia-primary)" }}>
              Réinitialiser
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {(Object.keys(alertTypeConfig) as AlertType[]).map((type) => {
            const config = alertTypeConfig[type];
            const Icon = config.icon;
            const isSelected = selectedType === type;

            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className="flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-bold transition-all hover:shadow-md"
                style={{
                  background: isSelected ? config.color : "white",
                  borderColor: isSelected ? config.color : "var(--lokadia-gray-100)",
                  color: isSelected ? "white" : "var(--lokadia-gray-700)",
                }}
              >
                <Icon className="h-4 w-4" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-black" style={{ color: "var(--lokadia-gray-900)" }}>
          <TrendingUp className="h-4 w-4" />
          Priorité
        </h3>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
          {(["all", "urgent", "vigilance", "info"] as AlertLevel[]).map((level) => {
            const isSelected = selectedLevel === level;
            const config = level === "all" ? { label: "Tous", color: "#0F4C81" } : alertLevelConfig[level];
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className="rounded-xl border px-3 py-3 text-sm font-bold transition-all hover:shadow-md"
                style={{
                  background: isSelected ? config.color : "white",
                  borderColor: isSelected ? config.color : "var(--lokadia-gray-100)",
                  color: isSelected ? "white" : "var(--lokadia-gray-700)",
                }}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {uniqueDestinations.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-black" style={{ color: "var(--lokadia-gray-900)" }}>
            <MapPin className="h-4 w-4" />
            Destination
          </h3>
          <div className="max-h-64 space-y-2 overflow-auto pr-1">
            <button
              onClick={() => setSelectedDestination("all")}
              className="w-full rounded-xl border px-3 py-2 text-left text-sm font-bold"
              style={{
                background: selectedDestination === "all" ? "var(--lokadia-info-bg)" : "white",
                borderColor: selectedDestination === "all" ? "var(--lokadia-primary)" : "var(--lokadia-gray-100)",
                color: selectedDestination === "all" ? "var(--lokadia-primary)" : "var(--lokadia-gray-700)",
              }}
            >
              Toutes
            </button>
            {uniqueDestinations.map((destination) => (
              <button
                key={destination}
                onClick={() => setSelectedDestination(destination)}
                className="w-full rounded-xl border px-3 py-2 text-left text-sm font-bold"
                style={{
                  background: selectedDestination === destination ? "var(--lokadia-info-bg)" : "white",
                  borderColor: selectedDestination === destination ? "var(--lokadia-primary)" : "var(--lokadia-gray-100)",
                  color: selectedDestination === destination ? "var(--lokadia-primary)" : "var(--lokadia-gray-700)",
                }}
              >
                {destination}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen pb-20 lg:pb-10" style={{ background: "linear-gradient(to bottom, #F8FAFC 0%, #F1F5F9 100%)" }}>
      <section className="relative overflow-hidden lg:mx-auto lg:mt-6 lg:max-w-7xl lg:rounded-[32px]" style={{ background: "linear-gradient(135deg, #0F4C81 0%, #134074 52%, #1E5A8E 100%)" }}>
        <div className="relative z-10 px-6 py-8 lg:grid lg:grid-cols-[1fr_420px] lg:gap-8 lg:px-10 lg:py-10">
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {sources.map((source) => (
                <div key={source.code} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur" title={source.label}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                  <span className="text-xs font-black text-white">{source.code}</span>
                </div>
              ))}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white lg:text-5xl">Alertes temps réel</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/90 lg:text-base">
              Centre de notifications bureau avec filtres permanents, lecture rapide et détail ouvert sans quitter la page.
            </p>
          </div>

          <div className="mt-6 lg:mt-0">
            <div className="rounded-3xl bg-white p-3 shadow-xl">
              <div className="flex items-center gap-3">
                <Search className="ml-2 h-5 w-5" style={{ color: "var(--lokadia-gray-400)" }} />
                <input
                  type="text"
                  placeholder="Rechercher une alerte, destination..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm font-semibold outline-none"
                  style={{ color: "var(--lokadia-gray-900)" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="rounded-full p-2 hover:bg-gray-100">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowFilters((value) => !value)}
                  className="rounded-2xl p-3 lg:hidden"
                  style={{ background: "var(--lokadia-info-bg)", color: "var(--lokadia-primary)" }}
                >
                  <Filter className="h-5 w-5" />
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="rounded-2xl p-3"
                  style={{ background: "var(--lokadia-info-bg)", color: "var(--lokadia-primary)" }}
                >
                  <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {!loading && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "Urgent", count: urgentCount, Icon: AlertTriangle, bg: "rgba(239,68,68,0.16)" },
                  { label: "Vigilance", count: vigilanceCount, Icon: Bell, bg: "rgba(245,158,11,0.16)" },
                  { label: "Info", count: infoCount, Icon: Sparkles, bg: "rgba(6,182,212,0.16)" },
                ].map((stat) => {
                  const Icon = stat.Icon;
                  return (
                    <div key={stat.label} className="rounded-2xl p-4 text-white backdrop-blur" style={{ background: stat.bg, border: "1px solid rgba(255,255,255,0.18)" }}>
                      <Icon className="mb-2 h-5 w-5 text-white/80" />
                      <p className="text-2xl font-black">{stat.count}</p>
                      <p className="text-xs font-semibold text-white/75">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {showFilters && (
        <section className="mx-5 mt-4 rounded-3xl bg-white p-5 lg:hidden" style={{ boxShadow: "var(--shadow-sm)" }}>
          <FilterPanel />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 py-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:gap-6 lg:px-0">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl bg-white p-5" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
            <FilterPanel />
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                {filteredAlerts.length} alerte{filteredAlerts.length > 1 ? "s" : ""}
              </h2>
              <p className="text-sm" style={{ color: "var(--lokadia-gray-500)" }}>
                Dernière mise à jour : {lastUpdate.toLocaleString("fr-FR")}
              </p>
            </div>
            <div className="hidden rounded-full px-3 py-1 text-xs font-black lg:block" style={{ background: "var(--lokadia-success-bg)", color: "var(--lokadia-success)" }}>
              Live
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-32 animate-pulse rounded-3xl bg-white" />
              ))}
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="rounded-3xl bg-white px-6 py-16 text-center" style={{ boxShadow: "var(--shadow-sm)" }}>
              <Bell className="mx-auto mb-4 h-10 w-10" style={{ color: "var(--lokadia-primary)" }} />
              <h3 className="text-xl font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                Aucune alerte trouvée
              </h3>
              <p className="mt-2 text-sm" style={{ color: "var(--lokadia-gray-600)" }}>
                Aucune alerte ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert, index) => {
                const typeConfig = alertTypeConfig[alert.type as keyof typeof alertTypeConfig] ?? alertTypeConfig.all;
                const levelConfig = alertLevelConfig[alert.level as keyof typeof alertLevelConfig];
                const Icon = typeConfig.icon;
                const selected = selectedAlert?.id === alert.id;

                return (
                  <motion.button
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="w-full overflow-hidden rounded-3xl border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      borderColor: selected ? "var(--lokadia-primary)" : levelConfig.borderColor,
                      boxShadow: selected ? "var(--shadow-md)" : "var(--shadow-sm)",
                    }}
                  >
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${levelConfig.color}, ${typeConfig.color})` }} />
                    <div className="flex gap-4 p-5">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl" style={{ background: `${typeConfig.color}16`, color: typeConfig.color }}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <h3 className="font-black leading-snug" style={{ color: "var(--lokadia-gray-900)" }}>
                            {alert.title}
                          </h3>
                          <span className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-black" style={{ background: levelConfig.bg, color: levelConfig.color }}>
                            {levelConfig.label}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm leading-6" style={{ color: "var(--lokadia-gray-600)" }}>
                          {alert.summary}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold" style={{ color: "var(--lokadia-gray-500)" }}>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {alert.destination}, {alert.country}
                          </span>
                          <span>{alert.date}</span>
                          <span>{alert.source}</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="mt-6 lg:mt-0">
          <div className="sticky top-28 rounded-3xl bg-white p-6" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
            {selectedAlert ? (
              <>
                {(() => {
                  const typeConfig = alertTypeConfig[selectedAlert.type as keyof typeof alertTypeConfig] ?? alertTypeConfig.all;
                  const levelConfig = alertLevelConfig[selectedAlert.level as keyof typeof alertLevelConfig];
                  const Icon = typeConfig.icon;
                  return (
                    <>
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${typeConfig.color}16`, color: typeConfig.color }}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: levelConfig.bg, color: levelConfig.color }}>
                          {levelConfig.label}
                        </span>
                      </div>
                      <h2 className="text-xl font-black leading-tight" style={{ color: "var(--lokadia-gray-900)" }}>
                        {selectedAlert.title}
                      </h2>
                      <p className="mt-4 text-sm leading-6" style={{ color: "var(--lokadia-gray-600)" }}>
                        {selectedAlert.summary}
                      </p>
                      <div className="mt-6 space-y-3 rounded-2xl p-4" style={{ background: "#F8FAFC" }}>
                        <p className="text-sm font-black" style={{ color: "var(--lokadia-gray-900)" }}>
                          {selectedAlert.destination}, {selectedAlert.country}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: "var(--lokadia-gray-500)" }}>
                          {selectedAlert.date} - {selectedAlert.isCached ? "Cache" : "Live"} - {selectedAlert.source}
                        </p>
                      </div>
                      {selectedAlert.affectedZones && selectedAlert.affectedZones.length > 0 && (
                        <div className="mt-4 rounded-2xl p-4" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#92400E" }}>
                          <p className="mb-1 text-sm font-black">Zones à risque</p>
                          <p className="text-sm leading-6">{selectedAlert.affectedZones.join(", ")}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            ) : (
              <div className="py-10 text-center">
                <Bell className="mx-auto mb-3 h-9 w-9" style={{ color: "var(--lokadia-gray-400)" }} />
                <p className="text-sm font-semibold" style={{ color: "var(--lokadia-gray-600)" }}>
                  Sélectionnez une alerte pour lire son détail.
                </p>
              </div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
