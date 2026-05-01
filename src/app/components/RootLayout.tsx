import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { NetworkStatus } from "./NetworkStatus";

/**
 * Routes en mode "plein écran" — la TopBar et la BottomNav sont masquées
 * pour ne pas gêner l'utilisateur (utile pour les écrans avec carte
 * interactive, drawer ou wizard nécessitant tout l'espace).
 */
const FULLSCREEN_ROUTES = ['/trips/map-planner'];

function isFullscreenRoute(pathname: string): boolean {
  return FULLSCREEN_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Layout racine responsive :
 * - Mobile (< md) : BottomNav (ancienne nav)
 * - Tablette/Desktop (md+) : TopBar sticky style Airbnb, pleine largeur
 * - Container fluide : mobile full-width, tablette max-w-3xl, desktop max-w-7xl
 *
 * Sur les routes plein écran (carte interactive, etc.), les barres de
 * navigation sont retirées pour libérer toute la surface utile.
 */
export function RootLayout() {
  const location = useLocation();
  const fullscreen = isFullscreenRoute(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (fullscreen) {
    return (
      <div className="bg-white min-h-screen">
        <NetworkStatus />
        <Outlet />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <NetworkStatus />
      <TopBar />

      {/* Conteneur responsive :
          - mobile : full width (max-w-md centré historique)
          - md : max-w-3xl pour tablette
          - lg+ : max-w-7xl site complet */}
      <div className="mx-auto w-full max-w-md md:max-w-3xl lg:max-w-7xl pb-24 md:pb-12">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}
