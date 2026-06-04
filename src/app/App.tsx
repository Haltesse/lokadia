import { Component, ReactNode } from "react";
import { Routes, Route, MemoryRouter } from "react-router";
import { GlobalHome } from "./screens/GlobalHome";
import { SearchScreen } from "./screens/SearchScreen";
import { DestinationCountScreen } from "./screens/DestinationCountScreen";
import { DestinationScreen } from "./screens/DestinationScreen";
import { AlertCenterScreen } from "./screens/AlertCenterScreen";
import { ChecklistScreen } from "./screens/ChecklistScreen";
import { TripCreateScreen } from "./screens/TripCreateScreen";
import TripsScreen from "./screens/TripsScreen";
import TripWizardScreen from "./screens/TripWizardScreen";
import TripDetailScreen from "./screens/TripDetailScreen";
import TripMapPlannerScreen from "./screens/TripMapPlannerScreen";
import TripBookingFunnel from "./screens/TripBookingFunnel";
import { Premium } from "./screens/Premium";
import LandingScreen from "./screens/LandingScreen";
import LokascorePage from "./screens/LokascorePage";
import NosServicesPage from "./screens/NosServicesPage";
import ProPage from "./screens/ProPage";
import ProDemoScreen from "./screens/ProDemoScreen";
import BookingScreen from "./screens/BookingScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { FavoritesScreen } from "./screens/FavoritesScreen";
import { AllDestinationsScreen } from "./screens/AllDestinationsScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RootLayout } from "./components/RootLayout";
import { CurrencyProvider } from "./context/CurrencyContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { TravelProfileProvider } from "./context/TravelProfileContext";
import { CartProvider } from "./lib/cart";
import { AutoTranslate } from "./components/AutoTranslate";
import { TranslationIndicator } from "./components/TranslationIndicator";
import { LokascoreCacheInitializer } from "./components/LokascoreCacheInitializer";
import { SplashScreen } from "./screens/SplashScreen";
import { AuthErrorBoundary } from "./components/AuthErrorBoundary";
import { checkMissingMappings } from "./utils/checkDestinationMappings";

// Vérifier les mappings manquants au démarrage
if (typeof window !== 'undefined') {
  console.log('\n🔍 === VÉRIFICATION DES MAPPINGS NUMBEO ===\n');
  const missingMappings = checkMissingMappings();
  console.log('\n===========================================\n');
  
  // Vider le cache de scores (les scores sont calculés côté serveur ;
  // ici on ne fait que purger le cache de session local pour reforcer un fetch)
  (window as any).refreshAllLokascores = () => {
    try {
      sessionStorage.removeItem('lokadia_lokascore_api_v1');
      console.log('✅ Cache Lokascore local vidé. Rechargez la page pour refetch.');
    } catch { /* ignore */ }
  };
}

// Error Boundary Component
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

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("❌ ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: "20px", 
          textAlign: "center",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <h1 style={{ color: "#e74c3c" }}>Oups ! Une erreur s'est produite</h1>
          <p style={{ color: "#555" }}>
            {this.state.error?.message || "Erreur inconnue"}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              marginTop: "20px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Recharger l'application
          </button>
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
              
              {/* Initialisation du cache Lokascore (Numbeo) en arrière-plan */}
              <LokascoreCacheInitializer />
              
              <MemoryRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  <Route path="/splash" element={<SplashScreen />} />
                  <Route path="/login" element={<LoginScreen />} />

              {/* Routes avec layout (TopBar desktop + BottomNav mobile) */}
              <Route element={<RootLayout />}>
                <Route path="/" element={<LandingScreen />} />
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
                </Route>
              </Routes>
            </MemoryRouter>
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
