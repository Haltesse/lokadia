import { useNavigate } from "react-router";
import { ArrowLeft, MapPin } from "lucide-react";

export function FollowedScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "var(--gradient-primary)" }}
      >
        <button
          onClick={() => navigate("/profile")}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Destinations suivies</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--lokadia-deep-blue)" }}>
            Destinations suivies
          </h2>
          <p className="text-gray-600 mb-6">
            Cette fonctionnalité sera bientôt disponible. Vous pourrez retrouver ici toutes les
            destinations que vous suivez pour recevoir des alertes.
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
