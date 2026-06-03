import { useNavigate } from "react-router";
import { ArrowLeft, Heart, MapPin, Search, Shield } from "lucide-react";

export function FavoritesScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between lg:static lg:mx-auto lg:mt-6 lg:max-w-7xl lg:rounded-[32px] lg:px-8 lg:py-8"
        style={{ background: "var(--gradient-primary)" }}
      >
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors active:scale-95 lg:hidden"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="lg:flex-1">
          <p className="hidden lg:block text-xs font-bold uppercase tracking-wide text-white/75 mb-2">Sélections</p>
          <h1 className="text-xl font-bold text-white lg:text-4xl lg:font-bold">Favoris</h1>
          <p className="hidden lg:block mt-2 max-w-2xl text-sm leading-6 text-white/85">
            Retrouvez ici les destinations sauvegardées. L’espace est prêt pour une lecture desktop en grille.
          </p>
        </div>
        <div className="w-10 lg:hidden" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="px-6 py-8 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:px-0">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl bg-white p-5" style={{ border: "1px solid var(--lokadia-gray-100)", boxShadow: "var(--shadow-sm)" }}>
            <Heart className="h-6 w-6 mb-4" style={{ color: "var(--lokadia-primary)" }} />
            <h2 className="text-lg font-bold" style={{ color: "var(--lokadia-gray-900)" }}>Bibliothèque</h2>
            <div className="mt-5 space-y-2">
              {[
                { icon: MapPin, label: "Destinations", count: 0 },
                { icon: Shield, label: "Lokascore", count: 0 },
                { icon: Search, label: "Recherches", count: 0 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl px-3 py-2" style={{ background: "#F8FAFC" }}>
                    <span className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--lokadia-gray-700)" }}>
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="text-xs font-bold" style={{ color: "var(--lokadia-primary)" }}>{item.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="bg-white rounded-2xl p-8 text-center shadow-sm lg:min-h-[420px] lg:flex lg:flex-col lg:items-center lg:justify-center lg:rounded-[28px]">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--lokadia-deep-blue)" }}>
            Vos destinations favorites
          </h2>
          <p className="text-gray-600 mb-6">
            Cette fonctionnalité sera bientôt disponible. Vous pourrez retrouver ici toutes vos
            destinations favorites.
          </p>
          <button
            onClick={() => navigate("/profile")}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: "var(--gradient-primary)" }}
          >
            Retour au profil
          </button>
        </div>
      </div>
    </div>
  );
}
