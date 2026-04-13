import { useLocation, useNavigate } from "react-router";
import { Home, Bell, Users, User, Plane } from "lucide-react";
import { useLanguageSafe } from "../context/LanguageContext";
import { motion } from "motion/react";

/**
 * BottomNav avec design glassmorphism moderne
 * Version stable sans animations complexes
 */
export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const context = useLanguageSafe();
  
  // Si le contexte n'est pas disponible, utiliser des valeurs par défaut
  const t = context?.t || {
    nav: {
      home: "Accueil",
      alerts: "Alertes",
      profile: "Profil"
    }
  };

  const navItems = [
    { path: "/global-home", icon: Home, label: t.nav.home },
    { path: "/trips", icon: Plane, label: "Voyages" },
    { path: "/alerts", icon: Bell, label: t.nav.alerts },
    { path: "/community", icon: Users, label: "Social" },
    { path: "/profile", icon: User, label: t.nav.profile },
  ];

  const activeIndex = navItems.findIndex(
    (item) =>
      location.pathname === item.path ||
      (item.path === "/trips" && location.pathname.startsWith("/trips"))
  );

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Glassmorphism Background */}
      <div
        className="relative mx-3 mb-4 rounded-[28px] overflow-visible"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: `
            0 8px 32px rgba(15, 76, 129, 0.12),
            0 2px 8px rgba(6, 182, 212, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.8)
          `,
          border: "1px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        {/* Gradient subtil en fond */}
        <div
          className="absolute inset-0 opacity-[0.03] rounded-[28px]"
          style={{
            background: "linear-gradient(135deg, #0F4C81 0%, #06B6D4 50%, #8B5CF6 100%)",
          }}
        />

        <div className="relative px-2 py-2">
          {/* Grille avec 5 colonnes égales */}
          <div className="relative flex items-center justify-between">
            {/* Indicateur de sélection animé en arrière-plan */}
            {activeIndex !== -1 && (
              <motion.div
                className="absolute rounded-[20px] pointer-events-none"
                initial={false}
                animate={{
                  left: `${activeIndex * 20}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                  mass: 0.8,
                }}
                style={{
                  top: "0",
                  bottom: "0",
                  width: "20%",
                  background: "linear-gradient(135deg, #0F4C81 0%, #134074 100%)",
                  boxShadow: `
                    0 4px 12px rgba(15, 76, 129, 0.25),
                    0 2px 4px rgba(6, 182, 212, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `,
                }}
              />
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === "/trips" && location.pathname.startsWith("/trips"));

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative flex flex-col items-center justify-center gap-[6px] py-3"
                  style={{
                    width: "20%",
                    zIndex: 1,
                  }}
                >
                  {/* Petit indicateur supérieur pour l'item actif */}
                  <div className="h-1 flex items-center justify-center">
                    {isActive && (
                      <motion.div
                        className="w-1 h-1 rounded-full"
                        style={{
                          background: "#06B6D4",
                          boxShadow: "0 0 8px rgba(6, 182, 212, 0.6)",
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 25,
                        }}
                      />
                    )}
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-center">
                    <Icon
                      className="h-[22px] w-[22px]"
                      style={{
                        color: isActive ? "#ffffff" : "#64748b",
                        strokeWidth: isActive ? 2.5 : 2,
                        filter: isActive
                          ? "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
                          : "none",
                        transition: "all 200ms ease",
                      }}
                    />
                  </div>

                  {/* Label */}
                  <div className="flex items-center justify-center w-full">
                    <span
                      className="text-[10px] font-semibold leading-tight"
                      style={{
                        color: isActive ? "#ffffff" : "#475569",
                        textShadow: isActive ? "0 1px 2px rgba(0, 0, 0, 0.1)" : "none",
                        transition: "all 200ms ease",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}