import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export function SplashScreen() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Timeout de sécurité : forcer la navigation après 5 secondes
    const safetyTimeout = setTimeout(() => {
      console.log('⚠️ Timeout de sécurité atteint, redirection forcée vers /login');
      navigate("/login");
    }, 5000);

    // Attendre que AuthContext ait fini de charger
    if (isLoading) {
      console.log('🔄 SplashScreen: Chargement de la session...');
      return () => clearTimeout(safetyTimeout);
    }

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        console.log('✅ SplashScreen: Utilisateur authentifié, redirection vers /global-home');
        navigate("/global-home");
      } else {
        console.log('✅ SplashScreen: Pas d\'utilisateur, redirection vers /login');
        navigate("/login");
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimeout);
    };
  }, [navigate, isAuthenticated, isLoading]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0B2545 0%, #134074 50%, #1E5A8E 100%)",
      }}
    >
      {/* Ambient Light Effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
        }}
      ></div>

      {/* Logo and Tagline */}
      <div className="relative z-10 text-center px-8">
        <h1
          className="text-5xl font-bold text-white mb-4 tracking-tight animate-fade-in"
          style={{ fontWeight: 700 }}
        >
          Lokadia
        </h1>
        <p
          className="text-white/80 text-lg mb-12 animate-fade-in-delayed"
          style={{ animationDelay: "0.3s" }}
        >
          Voyagez en terrain connu
        </p>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
          <div
            className="h-full bg-white rounded-full animate-loading-bar"
            style={{ width: "0%" }}
          ></div>
        </div>
      </div>

      {/* Pulsing Light Effect */}
      <div
        className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-64 h-64 rounded-full animate-pulse-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)",
        }}
      ></div>

      {/* Inline Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading-bar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: translate(-50%, 0) scale(1);
          }
          50% {
            opacity: 0.5;
            transform: translate(-50%, 0) scale(1.1);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }

        .animate-fade-in-delayed {
          opacity: 0;
          animation: fade-in 1s ease-out 0.3s forwards;
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}