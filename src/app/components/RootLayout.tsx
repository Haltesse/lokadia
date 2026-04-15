import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { TopBar } from "./TopBar";
import { NetworkStatus } from "./NetworkStatus";

/**
 * Layout racine responsive :
 * - Mobile (< md) : BottomNav (ancienne nav)
 * - Tablette/Desktop (md+) : TopBar sticky style Airbnb, pleine largeur
 * - Container fluide : mobile full-width, tablette max-w-3xl, desktop max-w-7xl
 */
export function RootLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
