import { MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Dashboard() {
  const checklistItems = [
    { label: "Visa", checked: true, required: true },
    { label: "Vaccins", checked: true, required: true },
    { label: "Adaptateur", checked: false, required: false },
  ];

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
      {/* Header with Hero Image */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1629021815772-3b88faf192a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxMaXNib24lMjBQb3J0dWdhbCUyMGNpdHlzY2FwZSUyMHN1bnNldHxlbnwxfHx8fDE3NzE1OTI3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Lisbon skyline"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
        
        {/* Logo and Location */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full">
            <h1 className="text-xl font-bold" style={{ color: "#0A2545" }}>Lokadia</h1>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-white mb-2">
            <MapPin className="h-5 w-5" />
            <span className="text-2xl font-semibold">Lisbonne, Portugal</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Heure locale : 14:23</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-6 relative z-10">
        {/* GoSafe Index Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: "var(--lokadia-text-dark)" }}>
              Indice GoSafe
            </h2>
            <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--lokadia-success-green)" }}></div>
              <span className="text-sm font-medium" style={{ color: "var(--lokadia-success-green)" }}>Sûr</span>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-4">
            <div className="text-6xl font-bold" style={{ color: "#0A2545" }}>87</div>
            <div className="text-xl text-gray-400 mb-2">/100</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>Sécurité générale</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-1.5 rounded-full ${
                      i < 4 ? "bg-[var(--lokadia-success-green)]" : "bg-gray-200"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>Santé publique</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-1.5 rounded-full ${
                      i < 5 ? "bg-[var(--lokadia-success-green)]" : "bg-gray-200"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>Transport</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-1.5 rounded-full ${
                      i < 4 ? "bg-[var(--lokadia-success-green)]" : "bg-gray-200"
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trip Checklist Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--lokadia-text-dark)" }}>
            Liste de vérification du voyage
          </h2>

          <div className="space-y-3">
            {checklistItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ backgroundColor: "var(--lokadia-soft-white)" }}
              >
                <div className="flex items-center gap-3">
                  {item.checked ? (
                    <CheckCircle2 className="h-6 w-6" style={{ color: "var(--lokadia-success-green)" }} />
                  ) : (
                    <XCircle className="h-6 w-6 text-gray-300" />
                  )}
                  <div>
                    <span className="font-medium" style={{ color: "var(--lokadia-text-dark)" }}>
                      {item.label}
                    </span>
                    {item.required && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--lokadia-emergency-orange)", color: "white" }}>
                        Requis
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--lokadia-text-dark)" }}>
            Informations rapides
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>Numéro d'urgence</span>
              <span className="font-semibold" style={{ color: "#0A2545" }}>112</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>Monnaie</span>
              <span className="font-semibold" style={{ color: "#0A2545" }}>EUR (€)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>Langue</span>
              <span className="font-semibold" style={{ color: "#0A2545" }}>Portugais</span>
            </div>
          </div>
        </div>

        {/* Alertes en temps réel */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--lokadia-text-dark)" }}>
            Alertes en temps réel
          </h3>
          <div className="space-y-3">
            {/* Alerte 1 - Info */}
            <div className="flex gap-3 p-4 rounded-xl bg-blue-50">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">i</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: "#0A2545" }}>
                    Événement culturel
                  </span>
                  <span className="text-xs text-gray-500">Il y a 2h</span>
                </div>
                <p className="text-sm text-gray-600">
                  Festival de musique au parc Eduardo VII ce weekend - Affluence importante prévue
                </p>
              </div>
            </div>

            {/* Alerte 2 - Vigilance */}
            <div className="flex gap-3 p-4 rounded-xl bg-orange-50">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: "var(--lokadia-emergency-orange)" }}>
                    Pickpockets signalés
                  </span>
                  <span className="text-xs text-gray-500">Aujourd'hui</span>
                </div>
                <p className="text-sm text-gray-600">
                  Recrudescence de vols à la tire dans le tramway 28 - Restez vigilant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}