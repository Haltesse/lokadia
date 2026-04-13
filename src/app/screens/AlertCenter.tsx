import { AlertTriangle, Train, Cloud, HeartPulse, ChevronRight } from "lucide-react";

export function AlertCenter() {
  const alerts = [
    {
      id: 1,
      type: "transport",
      icon: Train,
      title: "Grève des rails et du métro",
      description: "Des perturbations sont prévues sur les lignes 1, 2 et 5 du métro jusqu'au 22 février.",
      time: "Il y a 2h",
      severity: "high",
    },
    {
      id: 2,
      type: "health",
      icon: HeartPulse,
      title: "Alerte canicule",
      description: "Températures élevées attendues. Restez hydraté et évitez l'exposition au soleil.",
      time: "Il y a 5h",
      severity: "medium",
    },
    {
      id: 3,
      type: "weather",
      icon: Cloud,
      title: "Avertissement météo",
      description: "Fortes pluies prévues ce soir. Soyez prudent sur les routes.",
      time: "Il y a 1 jour",
      severity: "low",
    },
    {
      id: 4,
      type: "safety",
      icon: AlertTriangle,
      title: "Zone de vigilance",
      description: "Activité accrue de pickpockets signalée dans le centre historique.",
      time: "Il y a 2 jours",
      severity: "medium",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "var(--lokadia-emergency-orange)";
      case "medium":
        return "var(--lokadia-warning-orange)";
      default:
        return "var(--lokadia-blue)";
    }
  };

  const getIconBgColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "#FFF4F0";
      case "medium":
        return "#FFF9E6";
      default:
        return "#F0F5FF";
    }
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-6" style={{ backgroundColor: "#0A2545" }}>
        <h1 className="text-2xl font-bold text-white mb-2">Centre d'alertes</h1>
        <p className="text-white/80 text-sm">Notifications vérifiées en temps réel</p>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { label: "Toutes", active: true },
            { label: "Transport", active: false },
            { label: "Sécurité", active: false },
            { label: "Santé", active: false },
            { label: "Météo", active: false },
          ].map((tab, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                tab.active
                  ? "text-white"
                  : "bg-gray-100"
              }`}
              style={
                tab.active
                  ? { backgroundColor: "#0A2545" }
                  : { color: "var(--lokadia-text-light)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="px-4 py-4 space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className="bg-white rounded-2xl shadow-sm p-4 transition-shadow hover:shadow-md cursor-pointer"
            >
              <div className="flex gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: getIconBgColor(alert.severity) }}
                >
                  <Icon
                    className="h-6 w-6"
                    style={{ color: getSeverityColor(alert.severity) }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className="font-semibold text-base leading-tight"
                      style={{ color: "var(--lokadia-text-dark)" }}
                    >
                      {alert.title}
                    </h3>
                    <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 mt-0.5" />
                  </div>

                  <p className="text-sm mb-2" style={{ color: "var(--lokadia-text-light)" }}>
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{alert.time}</span>
                    {alert.severity === "high" && (
                      <span
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          backgroundColor: "#FFF4F0",
                          color: "var(--lokadia-emergency-orange)",
                        }}
                      >
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State Info */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-6 text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "var(--lokadia-soft-white)" }}
          >
            <AlertTriangle className="h-8 w-8" style={{ color: "var(--lokadia-blue)" }} />
          </div>
          <h3 className="font-semibold mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
            Restez informé
          </h3>
          <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
            Toutes les alertes sont vérifiées par notre équipe avant publication
          </p>
        </div>
      </div>
    </div>
  );
}