import { useLocation, useNavigate } from "react-router";
import { Home, LayoutGrid, Plus, User, Plane } from "lucide-react";
import { useLanguageSafe } from "../context/LanguageContext";
import { motion } from "motion/react";

/**
 * BottomNav mobile (masquée sur md+).
 * 5 items : Accueil, Voyages, [CTA CENTRAL Créer], Nos services, Profil.
 * Le bouton central "Créer" est saillant car il est le driver de commissions.
 */
export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const context = useLanguageSafe();

  const t = context?.t || {
    nav: { home: "Accueil", alerts: "Alertes", profile: "Profil" }
  };

  const leftItems = [
    { path: "/global-home", icon: Home, label: t.nav.home },
    { path: "/trips", icon: Plane, label: "Voyages" },
  ];
  const rightItems = [
    { path: "/services", icon: LayoutGrid, label: "Nos services" },
    { path: "/profile", icon: User, label: t.nav.profile },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === "/trips" && location.pathname.startsWith("/trips") && !location.pathname.includes("create"));

  const renderItem = (item: { path: string; icon: any; label: string }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <button
        key={item.path}
        onClick={() => navigate(item.path)}
        className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2"
        style={{ zIndex: 1 }}
      >
        <Icon
          className="h-[22px] w-[22px]"
          style={{
            color: active ? "#ffffff" : "#64748b",
            strokeWidth: active ? 2.5 : 2,
          }}
        />
        <span
          className="text-[10px] font-semibold leading-tight"
          style={{ color: active ? "#ffffff" : "#475569" }}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className="relative mx-3 mb-4 rounded-[28px]"
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(15, 76, 129, 0.12), 0 2px 8px rgba(6, 182, 212, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        <div className="relative flex items-center px-2 py-2">
          {/* Slider indicateur pour items latéraux actifs */}
          <div
            className="absolute rounded-[20px] pointer-events-none transition-all duration-300"
            style={{
              top: 4,
              bottom: 4,
              width: "20%",
              background: isActive("/global-home") || isActive("/trips") || isActive("/services") || isActive("/profile")
                ? "linear-gradient(135deg, #0F4C81 0%, #134074 100%)"
                : "transparent",
              left: isActive("/global-home") ? "0.5%"
                : isActive("/trips") ? "20.5%"
                : isActive("/services") ? "60.5%"
                : isActive("/profile") ? "80.5%"
                : "-100%",
              opacity: isActive("/global-home") || isActive("/trips") || isActive("/services") || isActive("/profile") ? 1 : 0,
            }}
          />

          {/* Left items */}
          {leftItems.map(renderItem)}

          {/* CTA central — Créer un voyage (driver commission) */}
          <div className="flex-1 flex items-center justify-center">
            <motion.button
              onClick={() => navigate("/trips/map-planner")}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              className="relative -mt-8 w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "0 8px 24px rgba(15, 76, 129, 0.45), 0 2px 6px rgba(6, 182, 212, 0.3)",
                border: "3px solid white",
              }}
              aria-label="Créer un voyage"
            >
              <Plus className="h-6 w-6 text-white" strokeWidth={2.75} />
            </motion.button>
          </div>

          {/* Right items */}
          {rightItems.map(renderItem)}
        </div>
      </div>
    </nav>
  );
}
