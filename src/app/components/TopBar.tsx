import { useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { Shield, Search, Menu, X, Globe, User as UserIcon, Route as RouteIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthSafe } from "../context/AuthContext";
import { useLanguageSafe } from "../context/LanguageContext";
import { CommandPaletteTrigger } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

/**
 * TopBar responsive style Airbnb — affichée sur tablette (md+) et desktop (lg+).
 * Masquée sur mobile (< md) au profit de la BottomNav.
 */
export function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const auth = useAuthSafe();
  const isAuth = !!auth?.user;
  const { t } = useLanguageSafe();

  const navLinks: Array<{ id: string; label: string; onClick: () => void; active: boolean }> = [
    { id: "home", label: t.topnav.home, onClick: () => navigate("/global-home"), active: location.pathname === "/global-home" },
    { id: "trips", label: t.topnav.trips, onClick: () => navigate("/trips"), active: location.pathname.startsWith("/trips") },
    { id: "services", label: t.topnav.services, onClick: () => navigate("/services"), active: location.pathname === "/services" },
    { id: "lokascore", label: "Lokascore", onClick: () => navigate("/lokascore"), active: location.pathname === "/lokascore" },
    { id: "pro", label: "Pro", onClick: () => navigate("/pro"), active: location.pathname === "/pro" },
  ];

  return (
    <header
      className="hidden md:block sticky top-0 z-40 bg-white/95 backdrop-blur-md"
      style={{
        borderBottom: "1px solid var(--lokadia-gray-100)",
        boxShadow: "0 1px 3px 0 rgb(15 23 42 / 0.04), 0 4px 16px -8px rgb(15 23 42 / 0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Logo */}
          <button
            onClick={() => navigate(isAuth ? "/global-home" : "/")}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--lokadia-gray-900)" }}>
              Lokadia
            </span>
          </button>

          <button
            onClick={() => navigate("/destination-count")}
            className="hidden lg:flex flex-1 max-w-2xl items-center gap-3 rounded-full border bg-white px-4 py-2.5 text-left transition-all hover:border-sky-300 hover:shadow-md"
            style={{ borderColor: "var(--lokadia-gray-200)" }}
          >
            <Search className="h-4 w-4" style={{ color: "var(--lokadia-primary)" }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold" style={{ color: "var(--lokadia-gray-900)" }}>
                {t.topnav.search}
              </p>
              <p className="truncate text-[11px]" style={{ color: "var(--lokadia-gray-500)" }}>
                {t.topnav.searchHint}
              </p>
            </div>
          </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* CTA création voyage — driver de commission */}
            <button
              onClick={() => navigate("/trips/map-planner")}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <RouteIcon className="h-4 w-4" />
              {t.topnav.planTrip}
            </button>

            {/* Recherche globale au clavier — l'indice visible évite que
                le raccourci reste connu des seuls initiés. */}
            <CommandPaletteTrigger />

            {/* Thème clair / sombre */}
            <ThemeToggle />

            {/* Language */}
            <button
              className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center transition-all"
              style={{ color: "var(--lokadia-gray-700)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--lokadia-gray-100)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              title="Langue"
            >
              <Globe className="h-5 w-5" />
            </button>

            {/* Profile / Login */}
            {isAuth ? (
              <button
                onClick={() => navigate("/profile")}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--lokadia-gray-100)" }}
              >
                <UserIcon className="h-5 w-5" style={{ color: "var(--lokadia-gray-700)" }} />
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="hidden md:block px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  border: "1px solid var(--lokadia-gray-200)",
                  color: "var(--lokadia-gray-900)",
                }}
              >
                {t.topnav.signIn}
              </button>
            )}

            {/* Burger (tablette uniquement, lg+ montre les liens) */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--lokadia-gray-100)" }}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Barre de navigation — juste sous la top bar (desktop) */}
        <nav className="hidden lg:flex items-center gap-1 -mt-1 pb-2">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={link.onClick}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                color: link.active ? "var(--lokadia-primary)" : "var(--lokadia-gray-700)",
                background: link.active ? "var(--lokadia-info-bg)" : "transparent",
              }}
              onMouseEnter={(e) => { if (!link.active) e.currentTarget.style.background = "var(--lokadia-gray-100)"; }}
              onMouseLeave={(e) => { if (!link.active) e.currentTarget.style.background = "transparent"; }}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Mobile/tablet dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden pb-4"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => {
                      link.onClick();
                      setMenuOpen(false);
                    }}
                    className="text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      color: link.active ? "var(--lokadia-primary)" : "var(--lokadia-gray-700)",
                      background: link.active ? "var(--lokadia-info-bg)" : "transparent",
                    }}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
