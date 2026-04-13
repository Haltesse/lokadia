import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { NetworkStatus } from "./NetworkStatus";

/**
 * Layout racine qui gère :
 * - Le scroll automatique vers le haut à chaque changement de route
 * - Le statut réseau
 * - La navigation mobile avec BottomNav
 */
export function RootLayout() {
  const location = useLocation();

  // Scroll automatique vers le haut lors du changement de route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <NetworkStatus />
      {/* Container avec padding-bottom fixe pour la BottomNav */}
      <div className="pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}