import { Component, Suspense, lazy, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route, Navigate } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { CurrencyProvider } from "./context/CurrencyContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { TravelProfileProvider } from "./context/TravelProfileContext";
import { CartProvider } from "./lib/cart";
import { AutoTranslate } from "./components/AutoTranslate";
import { TranslationIndicator } from "./components/TranslationIndicator";
import { LokascoreCacheInitializer } from "./components/LokascoreCacheInitializer";
import { AuthErrorBoundary } from "./components/AuthErrorBoundary";

// ─── Code splitting : chaque écran est un chunk chargé à la demande ─────────
const GlobalHome = lazy(() => import("./screens/GlobalHome").then((m) => ({ default: m.GlobalHome })));
const SearchScreen = lazy(() => import("./screens/SearchScreen").then((m) => ({ default: m.SearchScreen })));
const DestinationCountScreen = lazy(() => import("./screens/DestinationCountScreen").then((m) => ({ default: m.DestinationCountScreen })));
const DestinationScreen = lazy(() => import("./screens/DestinationScreen").then((m) => ({ default: m.DestinationScreen })));
const AlertCenterScreen = lazy(() => import("./screens/AlertCenterScreen").then((m) => ({ default: m.AlertCenterScreen })));
const ChecklistScreen = lazy(() => import("./screens/ChecklistScreen").then((m) => ({ default: m.ChecklistScreen })));
const TripCreateScreen = lazy(() => import("./screens/TripCreateScreen").then((m) => ({ default: m.TripCreateScreen })));
const TripsScreen = lazy(() => import("./screens/TripsScreen"));
const TripWizardScreen = lazy(() => import("./screens/TripWizardScreen"));
const TripDetailScreen = lazy(() => import("./screens/TripDetailScreen"));
const TripMapPlannerScreen = lazy(() => import("./screens/TripMapPlannerScreen"));
const TripBookingFunnel = lazy(() => import("./screens/TripBookingFunnel"));
const Premium = lazy(() => import("./screens/Premium").then((m) => ({ default: m.Premium })));
const LokascorePage = lazy(() => import("./screens/LokascorePage"));
const NosServicesPage = lazy(() => import("./screens/NosServicesPage"));
const ProPage = lazy(() => import("./screens/ProPage"));
const ProDemoScreen = lazy(() => import("./screens/ProDemoScreen"));
const BookingScreen = lazy(() => import("./screens/BookingScreen"));
const CheckoutScreen = lazy(() => import("./screens/CheckoutScreen"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreen").then((m) => ({ default: m.ProfileScreen })));
const FavoritesScreen = lazy(() => import("./screens/FavoritesScreen").then((m) => ({ default: m.FavoritesScreen })));
const AllDestinationsScreen = lazy(() => import("./screens/AllDestinationsScreen").then((m) => ({ default: m.AllDestinationsScreen })));
const LoginScreen = lazy(() => import("./screens/LoginScreen").then((m) => ({ default: m.LoginScreen })));
const NotFoundScreen = lazy(() => import("./screens/NotFoundScreen").then((m) => ({ default: m.NotFoundScreen })));

/** Fallback de chargement de route : squelette discret, pas de spinner plein écran. */
function RouteFallback() {
  return (
    <div className="max-w-md mx-auto px-4 pt-8 space-y-4" aria-busy="true" aria-label="Chargement de la page">
      <div className="lk-skeleton h-8 w-2/3 rounded-xl" />
      <div className="lk-skeleton h-40 w-full rounded-2xl" />
      <div className="lk-skeleton h-4 w-full rounded" />
      <div className="lk-skeleton h-4 w-5/6 rounded" />
      <div className="lk-skeleton h-24 w-full rounded-2xl" />
    </div>
  );
}

// Error Boundary racine : message humain + action de récupération.
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-white">
          <div className="text-center max-w-md">
            <h1 className="text-xl font-bold mb-3" style={{ color: "var(--lokadia-gray-900)" }}>
              L'application a rencontré un problème
            </h1>
            <p className="text-base leading-relaxed mb-6" style={{ color: "var(--lokadia-gray-600)" }}>
              Vos données sont intactes. Rechargez la page pour reprendre —
              si le problème persiste, revenez dans quelques minutes.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ background: "var(--lokadia-primary)" }}
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AuthErrorBoundary>
        <AuthProvider>
          <LanguageProvider>
            <CurrencyProvider>
            <TravelProfileProvider>
            <CartProvider>
              {/* Traduction automatique de toute l'application */}
              <AutoTranslate />
              <TranslationIndicator />

              {/* Polling des alertes live publiques en arrière-plan */}
              <LokascoreCacheInitializer />

              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    <Route path="/login" element={<LoginScreen />} />

                    {/* Routes avec layout (TopBar desktop + BottomNav mobile) */}
                    <Route element={<RootLayout />}>
                      <Route path="/" element={<Navigate to="/global-home" replace />} />
                      <Route path="/lokascore" element={<LokascorePage />} />
                      <Route path="/services" element={<NosServicesPage />} />
                      <Route path="/pro" element={<ProPage />} />
                      <Route path="/pro/demo" element={<ProDemoScreen />} />
                      <Route path="/booking/:destinationId" element={<BookingScreen />} />
                      <Route path="/checkout" element={<CheckoutScreen />} />
                      <Route path="/global-home" element={<GlobalHome />} />
                      <Route path="/search" element={<SearchScreen />} />
                      <Route path="/destination-count" element={<DestinationCountScreen />} />
                      <Route path="/destination" element={<DestinationScreen />} />
                      <Route path="/destination/:destinationId" element={<DestinationScreen />} />
                      <Route path="/alerts" element={<AlertCenterScreen />} />
                      <Route path="/checklist" element={<ChecklistScreen />} />
                      <Route path="/checklist/:destinationId" element={<ChecklistScreen />} />
                      <Route path="/trip/create" element={<TripCreateScreen />} />
                      <Route path="/trips" element={<TripsScreen />} />
                      <Route path="/trips/create" element={<TripWizardScreen />} />
                      <Route path="/trips/map-planner" element={<TripMapPlannerScreen />} />
                      <Route path="/trips/:tripId/book" element={<TripBookingFunnel />} />
                      <Route path="/trips/:tripId" element={<TripDetailScreen />} />
                      <Route path="/trips/:tripId/edit" element={<TripWizardScreen />} />
                      <Route path="/premium" element={<Premium />} />
                      <Route path="/profile" element={<ProfileScreen />} />
                      <Route path="/favorites" element={<FavoritesScreen />} />
                      <Route path="/all-destinations" element={<AllDestinationsScreen />} />
                      <Route path="*" element={<NotFoundScreen />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </CartProvider>
            </TravelProfileProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;
