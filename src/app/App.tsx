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
import { Community } from "./screens/Community";
import { Premium } from "./screens/Premium";
import { ProfileScreen } from "./screens/ProfileScreen";
import { MyPostsScreen } from "./screens/MyPostsScreen";
import { MyCommentsScreen } from "./screens/MyCommentsScreen";
import { FavoritesScreen } from "./screens/FavoritesScreen";
import { FollowedScreen } from "./screens/FollowedScreen";
import { AllDestinationsScreen } from "./screens/AllDestinationsScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { RootLayout } from "./components/RootLayout";
import { CurrencyProvider } from "./context/CurrencyContext";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AutoTranslate } from "./components/AutoTranslate";
import { TranslationIndicator } from "./components/TranslationIndicator";
import { GoSafeCacheInitializer } from "./components/GoSafeCacheInitializer";
import { SplashScreen } from "./screens/SplashScreen";
import { AuthErrorBoundary } from "./components/AuthErrorBoundary";
import { checkMissingMappings } from "./utils/checkDestinationMappings";

// Vérifier les mappings manquants au démarrage
if (typeof window !== 'undefined') {
  console.log('\n🔍 === VÉRIFICATION DES MAPPINGS NUMBEO ===\n');
  const missingMappings = checkMissingMappings();
  console.log('\n===========================================\n');
  
  // Exposer une fonction globale pour forcer le rechargement des scores
  (window as any).refreshAllGoSafeScores = async () => {
    console.log('🔄 RECHARGEMENT MANUEL FORCÉ de tous les scores GoSafe...');
    const { refreshGoSafeScoresCache } = await import('./services/goSafeUpdateService');
    const { invalidateNumbeoCache } = await import('./services/numbeoService');
    
    // Invalider tous les caches
    invalidateNumbeoCache();
    
    // Forcer le rechargement
    await refreshGoSafeScoresCache();
    console.log('✅ Rechargement terminé !');
  };
  
  console.log('💡 TIP: Pour forcer un rechargement manuel, tapez: refreshAllGoSafeScores()');
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
              {/* Traduction automatique de toute l'application */}
              <AutoTranslate />
              <TranslationIndicator />
              
              {/* Initialisation du cache GoSafe Index (Numbeo) en arrière-plan */}
              <GoSafeCacheInitializer />
              
              <MemoryRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/login" element={<LoginScreen />} />
              
              {/* Routes avec layout */}
              <Route element={<RootLayout />}>
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
                <Route path="/trips/:tripId" element={<TripDetailScreen />} />
                <Route path="/trips/:tripId/edit" element={<TripWizardScreen />} />
                <Route path="/community" element={<Community />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/my-posts" element={<MyPostsScreen />} />
                <Route path="/my-comments" element={<MyCommentsScreen />} />
                <Route path="/favorites" element={<FavoritesScreen />} />
                <Route path="/followed" element={<FollowedScreen />} />
                <Route path="/all-destinations" element={<AllDestinationsScreen />} />
                </Route>
              </Routes>
            </MemoryRouter>
            </CurrencyProvider>
          </LanguageProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;