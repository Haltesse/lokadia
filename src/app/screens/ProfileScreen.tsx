import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Mail,
  Camera,
  Edit3,
  Lock,
  Trash2,
  MapPin,
  Heart,
  Bookmark,
  Bell,
  CheckSquare,
  FileText,
  RefreshCw,
  Crown,
  Shield,
  Download,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  MessageSquare,
  MessageCircle,
  Flag,
  Award,
  HelpCircle,
  Phone,
  Bug,
  Lightbulb,
  Star,
  ChevronRight,
  Calendar,
  AlertCircle,
  Globe,
  Volume2,
  VolumeX,
  Plane,
  ArrowLeft,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { useLanguageSafe, SUPPORTED_LANGUAGES } from "../context/LanguageContext";
import type { Language as LanguageType } from "../translations";
import { useAuth } from "../context/AuthContext";
import { useUserData } from "../hooks/useUserData";
import { useComments } from "../hooks/useComments";
import { getUserTrips, deleteTrip as deleteTripService, type Trip } from "../lib/tripService";
import { getChecklistItemsForTrip } from "../lib/checklistService";

export function ProfileScreen() {
  const navigate = useNavigate();
  const context = useLanguageSafe();
  
  // Protection contre contexte non disponible
  const t = context?.t || { profile: {} };
  const language = context?.language || 'fr';
  const setLanguage = context?.setLanguage || (() => {});
  const translate = context?.translate || ((text: string) => text);
  const { user: authUser, signOut, updateProfile: updateAuthProfile } = useAuth();
  const { 
    favorites, 
    getStats,
  } = useUserData();
  const { stats: commentStats } = useComments();
  
  // Charger les voyages depuis Supabase
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  
  // États des modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangeNameModal, setShowChangeNameModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDownloadDataModal, setShowDownloadDataModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // États des préférences
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [alertRadius, setAlertRadius] = useState(50);
  const [communityVisibility, setCommunityVisibility] = useState<"public" | "anonymous">("public");
  const [allowPrivateMessages, setAllowPrivateMessages] = useState(true);
  const [alertTypes, setAlertTypes] = useState({
    security: true,
    health: true,
    transport: false,
    politics: false,
    weather: true,
  });

  // Formulaires
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [improvementSuggestion, setImprovementSuggestion] = useState("");
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Charger les voyages de l'utilisateur
  useEffect(() => {
    loadUserTrips();
  }, [authUser]);

  async function loadUserTrips() {
    try {
      if (!authUser) return;
      setTripsLoading(true);
      const userTrips = await getUserTrips(authUser.id);
      setTrips(userTrips);
    } catch (error) {
      console.error('Erreur chargement voyages:', error);
    } finally {
      setTripsLoading(false);
    }
  }

  // Calculer les statistiques de l'utilisateur
  const stats = getStats();
  const activeTripsCount = trips.filter(t => t.status === 'active' || t.status === 'upcoming' || t.status === 'planned').length;

  // Adapter les trips pour l'affichage
  const displayTrips = trips.map(trip => {
    // Note: La checklist sera chargée plus tard si nécessaire
    return {
      ...trip,
      destination: trip.destinationName,
      dates: `${new Date(trip.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${new Date(trip.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`,
      image: `https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300`,
      checklistCompleted: 0,
      checklistTotal: 0,
    };
  });

  // Charger les préférences sauvegardées
  useEffect(() => {
    // Charger les préférences de notifications
    const savedNotifPrefs = localStorage.getItem("lokadia_notification_prefs");
    if (savedNotifPrefs) {
      try {
        const prefs = JSON.parse(savedNotifPrefs);
        setNotificationsEnabled(prefs.enabled ?? true);
        setAlertRadius(prefs.radius ?? 50);
        setAlertTypes(prefs.types ?? alertTypes);
      } catch (e) {
        console.error('Erreur lors du chargement des préférences de notifications:', e);
      }
    }

    // Charger les paramètres communauté
    const savedCommunitySettings = localStorage.getItem("lokadia_community_settings");
    if (savedCommunitySettings) {
      try {
        const settings = JSON.parse(savedCommunitySettings);
        setCommunityVisibility(settings.visibility ?? "public");
        setAllowPrivateMessages(settings.allowMessages ?? true);
      } catch (e) {
        console.error('Erreur lors du chargement des paramètres communauté:', e);
      }
    }

    setTimeout(() => setIsInitialLoad(false), 500);
  }, []);

  // Sync avec auth user
  useEffect(() => {
    if (authUser) {
      setNewName(authUser.name);
      setNewEmail(authUser.email);
    }
  }, [authUser]);

  // Sauvegarder les préférences de notifications
  function saveNotificationPreferences() {
    localStorage.setItem("lokadia_notification_prefs", JSON.stringify({
      enabled: notificationsEnabled,
      radius: alertRadius,
      types: alertTypes,
    }));
    showSuccess("Préférences de notifications sauvegardées");
  }

  // Sauvegarder les paramètres communauté
  function saveCommunitySettings() {
    localStorage.setItem("lokadia_community_settings", JSON.stringify({
      visibility: communityVisibility,
      allowMessages: allowPrivateMessages,
    }));
    showSuccess("Paramètres communauté sauvegardés");
  }

  // Changer le nom
  async function handleChangeName() {
    if (!newName.trim()) return;
    setIsLoading(true);

    try {
      await updateAuthProfile({ name: newName });
      setShowChangeNameModal(false);
      showSuccess("Nom modifié avec succès");
    } catch (error) {
      console.error('Erreur lors de la modification du nom:', error);
      alert("Erreur lors de la modification du nom");
    } finally {
      setIsLoading(false);
    }
  }

  // Changer l'email - NOTE: Email ne peut pas être changé pour des raisons de sécurité
  function handleChangeEmail() {
    alert("Pour des raisons de sécurité, l'email ne peut pas être modifié. Créez un nouveau compte si nécessaire.");
    setShowChangeEmailModal(false);
  }

  // Changer le mot de passe
  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);
    try {
      const { changePassword } = await import('../lib/auth');
      await changePassword(authUser!.id, currentPassword, newPassword);
      setShowChangePasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showSuccess("Mot de passe modifié avec succès");
    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      if (error.message === 'INVALID_PASSWORD') {
        alert("Mot de passe actuel incorrect");
      } else {
        alert("Erreur lors du changement de mot de passe");
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Changer la photo
  async function handleChangePhoto() {
    if (!photoURL.trim()) return;
    setIsLoading(true);

    try {
      await updateAuthProfile({ photo: photoURL });
      setShowPhotoModal(false);
      setPhotoURL("");
      showSuccess("Photo de profil modifiée");
    } catch (error) {
      console.error('Erreur lors de la modification de la photo:', error);
      alert("Erreur lors de la modification de la photo");
    } finally {
      setIsLoading(false);
    }
  }

  // Supprimer le compte
  async function handleDeleteAccount() {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      return;
    }

    try {
      // Effacer toutes les données utilisateur
      const { resetUserData } = await import('../lib/demo');
      if (authUser) {
        await resetUserData(authUser.id);
      }
      
      // Se déconnecter
      signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      alert("Erreur lors de la suppression du compte");
    }
  }

  // Télécharger les données (RGPD)
  async function handleDownloadData() {
    if (!authUser) return;

    const stats = getStats();
    
    const userData = {
      profile: {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        photo: authUser.photo,
        isPremium: authUser.isPremium,
        premiumExpiry: authUser.premiumExpiry,
      },
      statistics: stats,
      trips: trips.map(t => ({
        destination: t.destinationName,
        startDate: t.startDate,
        endDate: t.endDate,
        travelers: t.travelers,
        status: t.status,
        notes: t.notes,
      })),
      favorites: favorites.map(f => ({ destinationId: f.destinationId })),
      checklist: [], // TODO: Charger depuis Supabase
      preferences: {
        notifications: {
          enabled: notificationsEnabled,
          radius: alertRadius,
          types: alertTypes,
        },
        community: {
          visibility: communityVisibility,
          allowMessages: allowPrivateMessages,
        }
      },
      exportDate: new Date().toISOString(),
    };

    // Créer un fichier JSON téléchargeable
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lokadia-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setShowDownloadDataModal(false);
    showSuccess("Données téléchargées avec succès");
  }

  // Envoyer un message au support
  function handleContactSupport() {
    if (!contactMessage.trim()) return;
    setIsLoading(true);

    setTimeout(() => {
      // Dans une vraie app, on enverrait à une API
      console.log("Support message:", contactMessage);
      setContactMessage("");
      setShowContactModal(false);
      showSuccess("Message envoyé au support");
      setIsLoading(false);
    }, 500);
  }

  // Signaler un bug
  function handleReportBug() {
    if (!bugDescription.trim()) return;
    setIsLoading(true);

    setTimeout(() => {
      console.log("Bug report:", bugDescription);
      setBugDescription("");
      setShowBugReportModal(false);
      showSuccess("Bug signalé avec succès");
      setIsLoading(false);
    }, 500);
  }

  // Suggérer une amélioration
  function handleSuggestImprovement() {
    if (!improvementSuggestion.trim()) return;
    setIsLoading(true);

    setTimeout(() => {
      console.log("Improvement suggestion:", improvementSuggestion);
      setImprovementSuggestion("");
      setShowImprovementModal(false);
      showSuccess("Suggestion envoyée");
      setIsLoading(false);
    }, 500);
  }

  // Supprimer un voyage
  async function handleDeleteTrip(tripId: string) {
    if (confirm("Voulez-vous vraiment supprimer ce voyage ?")) {
      try {
        await deleteTripService(tripId);
        await loadUserTrips(); // Recharger la liste
        showSuccess("Voyage supprimé");
      } catch (error) {
        console.error('Erreur lors de la suppression du voyage:', error);
        alert("Erreur lors de la suppression du voyage");
      }
    }
  }

  // Afficher un message de succès
  function showSuccess(message: string) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  // Sauvegarder les préférences quand elles changent
  useEffect(() => {
    if (isInitialLoad) return;
    const timer = setTimeout(() => {
      saveNotificationPreferences();
    }, 1000);
    return () => clearTimeout(timer);
  }, [notificationsEnabled, alertRadius, alertTypes]);

  useEffect(() => {
    if (isInitialLoad) return;
    const timer = setTimeout(() => {
      saveCommunitySettings();
    }, 1000);
    return () => clearTimeout(timer);
  }, [communityVisibility, allowPrivateMessages]);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
      {/* Message de succès */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/global-home")}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold flex-1" style={{ color: "var(--lokadia-text-dark)" }}>
            {t.profile.title}
          </h1>
          <button
            onClick={() => setShowEditModal(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            <Edit3 className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Header Profil */}
      <div className="px-6 pt-6 pb-4">
        <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-gray-200">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <ImageWithFallback
                src={authUser?.photo || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200"}
                alt={authUser?.name || "User"}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-lg"
              />
              <button
                onClick={() => setShowPhotoModal(true)}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95"
                style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#1a1a1a" }}>
                {authUser?.name || "Utilisateur"}
              </h2>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4" style={{ color: "#666666" }} />
                <span className="text-sm font-medium" style={{ color: "#666666" }}>
                  {authUser?.email || ""}
                </span>
              </div>
              {authUser?.isPremium ? (
                <Badge variant="safe" size="sm">
                  <Crown className="h-3 w-3 mr-1" />
                  {t.profile.premiumBadge}
                </Badge>
              ) : (
                <Badge variant="info" size="sm">
                  {t.profile.freeBadge}
                </Badge>
              )}
            </div>
          </div>

          {authUser?.isPremium && authUser?.premiumExpiry && (
            <div className="p-4 rounded-xl bg-blue-50 flex items-center justify-between border-2 border-blue-200">
              <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                {t.profile.expiresOn}
              </span>
              <span className="text-sm font-bold" style={{ color: "var(--lokadia-deep-blue)" }}>
                {new Date(authUser.premiumExpiry).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}

          {/* Résumé rapide */}
          <div className="mt-5 pt-5 border-t-2 border-gray-200">
            <h3 className="text-sm font-bold mb-4" style={{ color: "#1a1a1a" }}>
              {t.profile.quickSummary}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                <div className="text-3xl font-bold mb-2" style={{ color: "var(--lokadia-deep-blue)" }}>
                  {activeTripsCount}
                </div>
                <div className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>
                  {t.profile.activeTrips}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                <div className="text-3xl font-bold mb-2" style={{ color: "var(--lokadia-emergency-orange)" }}>
                  0
                </div>
                <div className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>
                  {t.profile.importantAlerts}
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-50 border-2 border-gray-200">
                <div className="text-3xl font-bold mb-2" style={{ color: "#1a1a1a" }}>
                  0
                </div>
                <div className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>
                  {t.profile.checklistItemsRemaining}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mes Voyages */}
      <Section title={t.profile.myTrips} icon={Plane}>
        <div className="space-y-3">
          {displayTrips.length === 0 ? (
            <div className="text-center py-8">
              <Plane className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--lokadia-text-light)" }} />
              <p className="text-sm mb-4" style={{ color: "var(--lokadia-text-light)" }}>
                {t.profile.noTrips}
              </p>
              <button
                onClick={() => navigate("/trip/create")}
                className="px-6 py-3 rounded-xl font-semibold text-white"
                style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
              >
                {t.profile.createFirstTrip}
              </button>
            </div>
          ) : (
            <>
              {displayTrips.slice(0, 2).map((trip) => (
                <TripCard 
                  key={trip.id} 
                  trip={trip}
                  onOpen={() => {
                    // Debug: afficher les données du voyage
                    console.log("🚀 ProfileScreen - Ouverture du voyage:", {
                      destinationId: trip.destinationId,
                      destinationName: trip.destinationName,
                      dates: { start: trip.startDate, end: trip.endDate },
                      travelers: trip.travelers,
                    });
                    
                    // Naviguer vers la checklist du voyage avec les vraies données
                    navigate(`/checklist/${trip.destinationId}`, {
                      state: {
                        trip: {
                          destination_id: trip.destinationId,
                          destination_name: trip.destinationName,
                          destination: trip.destinationName,
                          start_date: trip.startDate,
                          end_date: trip.endDate,
                          travelers_count: trip.travelers,
                          notes: trip.notes,
                        },
                      },
                    });
                  }}
                  onDelete={() => handleDeleteTrip(trip.id)}
                />
              ))}
              <button
                onClick={() => navigate("/trips")}
                className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2"
                style={{
                  color: "var(--lokadia-deep-blue)",
                  backgroundColor: "var(--lokadia-soft-white)",
                }}
              >
                {t.profile.viewAllTrips}
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </Section>

      {/* Mes Sélections */}
      <Section title={t.profile.mySelections} icon={Bookmark}>
        <div className="grid grid-cols-2 gap-3">
          <SelectionCard 
            icon={Heart} 
            label={t.profile.favorites} 
            count={favorites.length}
            onClick={() => navigate("/favorites")}
          />
          <SelectionCard 
            icon={MapPin} 
            label={t.profile.followedDestinations} 
            count={0}
            onClick={() => navigate("/followed")}
          />
          <SelectionCard 
            icon={Bell} 
            label={t.profile.savedAlerts} 
            count={0}
            onClick={() => navigate("/alerts")}
          />
          <SelectionCard 
            icon={CheckSquare} 
            label={t.profile.customChecklist} 
            count={0}
            onClick={() => navigate("/checklist")}
          />
        </div>
      </Section>

      {/* Alertes & Notifications */}
      <Section title={t.profile.alertsNotifications} icon={Bell}>
        <div className="space-y-4">
          <ToggleRow
            label={t.profile.enableNotifications}
            enabled={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />

          {notificationsEnabled && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold" style={{ color: "var(--lokadia-primary-dark)" }}>
                    {t.profile.alertsAroundMe}
                  </label>
                  <span className="text-base font-bold px-3 py-1 rounded-lg" style={{ 
                    color: "white",
                    backgroundColor: "var(--lokadia-secondary)"
                  }}>
                    {alertRadius} km
                  </span>
                </div>
                <div className="px-3 py-4 rounded-xl" style={{ 
                  background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)"
                }}>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={alertRadius}
                    onChange={(e) => setAlertRadius(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--lokadia-secondary) 0%, var(--lokadia-secondary) ${
                        ((alertRadius - 10) / 190) * 100
                      }%, var(--lokadia-accent-light) ${((alertRadius - 10) / 190) * 100}%, var(--lokadia-accent-light) 100%)`,
                    }}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
                  {t.profile.alertTypes}
                </h4>
                <div className="space-y-2">
                  <ToggleRow 
                    label={t.profile.security} 
                    enabled={alertTypes.security} 
                    onChange={(val) => setAlertTypes({...alertTypes, security: val})}
                  />
                  <ToggleRow 
                    label={t.profile.health} 
                    enabled={alertTypes.health} 
                    onChange={(val) => setAlertTypes({...alertTypes, health: val})}
                  />
                  <ToggleRow 
                    label={t.profile.transport} 
                    enabled={alertTypes.transport} 
                    onChange={(val) => setAlertTypes({...alertTypes, transport: val})}
                  />
                  <ToggleRow 
                    label={t.profile.politics} 
                    enabled={alertTypes.politics} 
                    onChange={(val) => setAlertTypes({...alertTypes, politics: val})}
                  />
                  <ToggleRow 
                    label={t.profile.weather} 
                    enabled={alertTypes.weather} 
                    onChange={(val) => setAlertTypes({...alertTypes, weather: val})}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Langue & Traduction */}
      <Section title={translate("Langue & Traduction")} icon={Globe}>
        <div className="space-y-3">
          <button
            onClick={() => setShowLanguageModal(true)}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl">
                {SUPPORTED_LANGUAGES[language].flag}
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm" style={{ color: "var(--lokadia-deep-blue)" }}>
                  {translate("Langue actuelle")}
                </p>
                <p className="text-xs" style={{ color: "var(--lokadia-text-light)" }}>
                  {SUPPORTED_LANGUAGES[language].name}
                </p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5" style={{ color: "var(--lokadia-text-light)" }} />
          </button>
          
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-2">
              <Globe className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                {translate("L'application se traduit automatiquement dans votre langue via une API de traduction en temps réel.")}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Premium */}
      <Section title={t.profile.premiumSection} icon={Crown}>
        {authUser?.isPremium ? (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">{t.profile.premiumBadge}</span>
              </div>
              {authUser?.premiumExpiry && (
                <p className="text-sm opacity-90 mb-3">
                  {t.profile.renewalDate}: {new Date(authUser.premiumExpiry).toLocaleDateString('fr-FR')}
                </p>
              )}
              <button 
                onClick={() => navigate("/premium")}
                className="w-full py-2 rounded-lg bg-white/20 backdrop-blur-sm font-medium text-sm"
              >
                {t.profile.manageSubscription}
              </button>
            </div>
            <MenuButton
              icon={RefreshCw}
              label={t.profile.restorePurchase}
              onClick={() => showSuccess("Achat restauré")}
            />
          </div>
        ) : (
          <div className="text-center py-6">
            <Crown className="h-12 w-12 mx-auto mb-3" style={{ color: "var(--lokadia-warning-orange)" }} />
            <p className="text-sm mb-4" style={{ color: "var(--lokadia-text-light)" }}>
              Débloquez toutes les fonctionnalités Premium
            </p>
            <button
              onClick={() => navigate("/premium")}
              className="px-6 py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
            >
              {t.profile.upgradeToPremium}
            </button>
          </div>
        )}
      </Section>

      {/* Confidentialité & Sécurité */}
      <Section title={t.profile.privacySecurity} icon={Shield}>
        <div className="space-y-2">
          <MenuButton 
            icon={Download} 
            label={t.profile.downloadMyData} 
            onClick={() => setShowDownloadDataModal(true)} 
          />
          <MenuButton 
            icon={Lock} 
            label={t.profile.changePassword} 
            onClick={() => setShowChangePasswordModal(true)} 
          />
          <MenuButton 
            icon={FileText} 
            label={t.profile.privacyPolicy} 
            onClick={() => setShowPrivacyModal(true)} 
          />
          <MenuButton 
            icon={SettingsIcon} 
            label={t.profile.manageCookies} 
            onClick={() => showSuccess("Paramètres cookies mis à jour")} 
          />
          <MenuButton
            icon={Trash2}
            label={t.profile.deleteMyAccount}
            onClick={() => setShowDeleteModal(true)}
            danger
          />
        </div>
      </Section>

      {/* Communauté */}
      <Section title={t.profile.communitySection} icon={MessageCircle}>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: "var(--lokadia-text-dark)" }}>
              {t.profile.communityVisibility}
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => setCommunityVisibility("public")}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-colors flex flex-col items-center gap-1 ${
                  communityVisibility === "public" ? "text-white" : "bg-gray-100"
                }`}
                style={
                  communityVisibility === "public"
                    ? { backgroundColor: "var(--lokadia-deep-blue)" }
                    : { color: "var(--lokadia-text-light)" }
                }
              >
                <Eye className="h-4 w-4" />
                {t.profile.visibilityPublic}
              </button>
              <button
                onClick={() => setCommunityVisibility("anonymous")}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-colors flex flex-col items-center gap-1 ${
                  communityVisibility === "anonymous" ? "text-white" : "bg-gray-100"
                }`}
                style={
                  communityVisibility === "anonymous"
                    ? { backgroundColor: "var(--lokadia-deep-blue)" }
                    : { color: "var(--lokadia-text-light)" }
                }
              >
                <EyeOff className="h-4 w-4" />
                {t.profile.visibilityAnonymous}
              </button>
            </div>
          </div>

          <ToggleRow
            label={t.profile.allowPrivateMessages}
            enabled={allowPrivateMessages}
            onChange={setAllowPrivateMessages}
          />

          <div className="grid grid-cols-2 gap-2">
            <MenuButton 
              icon={MessageSquare} 
              label={t.profile.myPosts} 
              count={0} 
              onClick={() => navigate("/my-posts")} 
              compact 
            />
            <MenuButton 
              icon={MessageCircle} 
              label={t.profile.myComments} 
              count={commentStats.totalComments} 
              onClick={() => navigate("/my-comments")} 
              compact 
            />
          </div>
        </div>
      </Section>

      {/* Support & Aide */}
      <Section title={t.profile.supportHelp} icon={HelpCircle}>
        <div className="space-y-2">
          <MenuButton 
            icon={HelpCircle} 
            label={t.profile.faq} 
            onClick={() => setShowFAQModal(true)} 
          />
          <MenuButton 
            icon={Phone} 
            label={t.profile.contactSupport} 
            onClick={() => setShowContactModal(true)} 
          />
          <MenuButton 
            icon={Bug} 
            label={t.profile.reportBug} 
            onClick={() => setShowBugReportModal(true)} 
          />
          <MenuButton 
            icon={Lightbulb} 
            label={t.profile.suggestImprovement} 
            onClick={() => setShowImprovementModal(true)} 
          />
          <MenuButton 
            icon={Star} 
            label={t.profile.rateApp} 
            onClick={() => window.open('https://lokadia.com/rate', '_blank')} 
          />
        </div>
      </Section>

      {/* Section Déconnexion */}
      <div className="px-6 pb-6 pt-4">
        <button
          onClick={async () => {
            console.log('🚪 Déconnexion initiée...');
            try {
              await signOut();
              navigate('/login');
            } catch (error) {
              console.error('❌ Erreur lors de la déconnexion:', error);
            }
          }}
          className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: "#EF4444" }}
        >
          <ArrowLeft className="h-5 w-5" />
          Se déconnecter
        </button>
      </div>

      {/* MODALS */}

      {/* Modal Éditer Profil (menu principal) */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Éditer le profil">
        <div className="space-y-3">
          <button
            onClick={() => {
              setShowEditModal(false);
              setShowChangeNameModal(true);
            }}
            className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3"
          >
            <User className="h-5 w-5" style={{ color: "var(--lokadia-deep-blue)" }} />
            <span className="font-medium" style={{ color: "var(--lokadia-text-dark)" }}>
              Changer le pseudo
            </span>
          </button>
          <button
            onClick={() => {
              setShowEditModal(false);
              setShowPhotoModal(true);
            }}
            className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3"
          >
            <Camera className="h-5 w-5" style={{ color: "var(--lokadia-deep-blue)" }} />
            <span className="font-medium" style={{ color: "var(--lokadia-text-dark)" }}>
              Changer la photo
            </span>
          </button>
          <button
            onClick={() => {
              setShowEditModal(false);
              setShowChangeEmailModal(true);
            }}
            className="w-full p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-3"
          >
            <Mail className="h-5 w-5" style={{ color: "var(--lokadia-deep-blue)" }} />
            <span className="font-medium" style={{ color: "var(--lokadia-text-dark)" }}>
              Changer l'email
            </span>
          </button>
        </div>
      </Modal>

      {/* Modal Changer le Pseudo */}
      <Modal isOpen={showChangeNameModal} onClose={() => setShowChangeNameModal(false)} title="Changer le pseudo">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Nouveau pseudo
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Entrez votre nouveau pseudo"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--lokadia-deep-blue)" } as any}
            />
          </div>
          <button
            onClick={handleChangeName}
            disabled={isLoading || !newName.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            {isLoading ? "Modification..." : "Confirmer"}
          </button>
        </div>
      </Modal>

      {/* Modal Changer la Photo */}
      <Modal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} title="Changer la photo de profil">
        <div className="space-y-4">
          <div className="text-center">
            <ImageWithFallback
              src={photoURL || authUser?.photo || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200"}
              alt="Aperçu"
              className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border-4 border-gray-100"
            />
          </div>

          {/* Upload depuis l'appareil */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Choisir une photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Vérifier la taille (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    alert("L'image est trop grande. Taille maximale : 5MB");
                    return;
                  }
                  
                  // Convertir en base64
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPhotoURL(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold hover:file:bg-gray-100 cursor-pointer"
              style={{ 
                color: "var(--lokadia-text-dark)",
                backgroundColor: "var(--lokadia-soft-white)"
              }}
            />
            <p className="text-xs mt-2" style={{ color: "var(--lokadia-text-light)" }}>
              Formats acceptés : JPG, PNG, GIF (max 5MB)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--lokadia-text-light)", opacity: 0.2 }} />
            <span className="text-xs" style={{ color: "var(--lokadia-text-light)" }}>OU</span>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--lokadia-text-light)", opacity: 0.2 }} />
          </div>

          {/* URL d'une image */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              URL de la photo
            </label>
            <input
              type="url"
              value={photoURL.startsWith('data:') ? '' : photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--lokadia-deep-blue)" } as any}
            />
            <p className="text-xs mt-2" style={{ color: "var(--lokadia-text-light)" }}>
              Collez l'URL d'une image depuis Internet
            </p>
          </div>
          
          <div>
            <p className="text-xs mb-2" style={{ color: "var(--lokadia-text-light)" }}>
              Photos d'exemple :
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPhotoURL("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200")}
                className="p-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200"
              >
                Photo 1
              </button>
              <button
                onClick={() => setPhotoURL("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200")}
                className="p-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200"
              >
                Photo 2
              </button>
              <button
                onClick={() => setPhotoURL("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200")}
                className="p-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200"
              >
                Photo 3
              </button>
              <button
                onClick={() => setPhotoURL("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200")}
                className="p-2 rounded-lg text-xs bg-gray-100 hover:bg-gray-200"
              >
                Photo 4
              </button>
            </div>
          </div>

          <button
            onClick={handleChangePhoto}
            disabled={isLoading || !photoURL.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            {isLoading ? "Modification..." : "Confirmer"}
          </button>
        </div>
      </Modal>

      {/* Modal Changer l'Email */}
      <Modal isOpen={showChangeEmailModal} onClose={() => setShowChangeEmailModal(false)} title="Changer l'email">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Nouvel email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="nouveau@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--lokadia-deep-blue)" } as any}
            />
          </div>
          <button
            onClick={handleChangeEmail}
            disabled={isLoading || !newEmail.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            {isLoading ? "Modification..." : "Confirmer"}
          </button>
        </div>
      </Modal>

      {/* Modal Changer le Mot de Passe */}
      <Modal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} title="Changer le mot de passe">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--lokadia-deep-blue)" } as any}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--lokadia-deep-blue)" } as any}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2"
              style={{ "--tw-ring-color": "var(--lokadia-deep-blue)" } as any}
            />
          </div>
          <button
            onClick={handleChangePassword}
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            {isLoading ? "Modification..." : "Confirmer"}
          </button>
        </div>
      </Modal>

      {/* Modal Supprimer le Compte */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Supprimer le compte">
        <div className="space-y-4">
          <div className="p-4 rounded-xl" style={{ backgroundColor: "#fee" }}>
            <div className="flex gap-3 mb-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: "var(--lokadia-emergency-orange)" }} />
              <div>
                <h3 className="font-semibold mb-1" style={{ color: "var(--lokadia-emergency-orange)" }}>
                  Action irréversible
                </h3>
                <p className="text-sm" style={{ color: "var(--lokadia-text-dark)" }}>
                  Cette action supprimera définitivement votre compte et toutes vos données (voyages, alertes, préférences).
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-3 rounded-xl font-semibold"
              style={{ backgroundColor: "var(--lokadia-soft-white)", color: "var(--lokadia-text-dark)" }}
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteAccount}
              className="flex-1 py-3 rounded-xl font-semibold text-white"
              style={{ backgroundColor: "var(--lokadia-emergency-orange)" }}
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Télécharger les Données */}
      <Modal isOpen={showDownloadDataModal} onClose={() => setShowDownloadDataModal(false)} title="Télécharger mes données">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
            Conformément au RGPD, vous pouvez télécharger toutes vos données personnelles au format JSON.
          </p>
          <div className="p-4 rounded-xl bg-blue-50">
            <h3 className="font-semibold mb-2" style={{ color: "var(--lokadia-deep-blue)" }}>
              Données incluses :
            </h3>
            <ul className="text-sm space-y-1" style={{ color: "var(--lokadia-text-dark)" }}>
              <li>• Informations de profil</li>
              <li>• Préférences et paramètres</li>
              <li>• Voyages et checklists</li>
              <li>• Alertes sauvegardées</li>
            </ul>
          </div>
          <button
            onClick={handleDownloadData}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            <Download className="h-5 w-5" />
            Télécharger (JSON)
          </button>
        </div>
      </Modal>

      {/* Modal Contact Support */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Contacter le support">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Votre message
            </label>
            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              placeholder="Décrivez votre problème ou question..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 resize-none"
              style={{ "--tw-ring-color": "var(--lokadia-deep-blue)" } as any}
            />
          </div>
          <button
            onClick={handleContactSupport}
            disabled={isLoading || !contactMessage.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            {isLoading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </Modal>

      {/* Modal Signaler un Bug */}
      <Modal isOpen={showBugReportModal} onClose={() => setShowBugReportModal(false)} title="Signaler un bug">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Description du bug
            </label>
            <textarea
              value={bugDescription}
              onChange={(e) => setBugDescription(e.target.value)}
              placeholder="Décrivez le bug rencontré..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 resize-none"
              style={{ "--tw-ring-color": "var(--lokadia-deep-blue)" } as any}
            />
          </div>
          <button
            onClick={handleReportBug}
            disabled={isLoading || !bugDescription.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            {isLoading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </Modal>

      {/* Modal Suggérer une Amélioration */}
      <Modal isOpen={showImprovementModal} onClose={() => setShowImprovementModal(false)} title="Suggérer une amélioration">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
              Votre suggestion
            </label>
            <textarea
              value={improvementSuggestion}
              onChange={(e) => setImprovementSuggestion(e.target.value)}
              placeholder="Partagez votre idée d'amélioration..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 resize-none"
              style={{ "--tw-ring-color": "var(--lokadia-deep-blue)" } as any}
            />
          </div>
          <button
            onClick={handleSuggestImprovement}
            disabled={isLoading || !improvementSuggestion.trim()}
            className="w-full py-3 rounded-xl font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
          >
            {isLoading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </Modal>

      {/* Modal FAQ */}
      <Modal isOpen={showFAQModal} onClose={() => setShowFAQModal(false)} title="Questions fréquentes">
        <div className="space-y-3">
          <FAQItem
            question="Comment fonctionne le GoSafe Score ?"
            answer="Le GoSafe Score est un indice de sécurité calculé en temps réel basé sur les données locales, les alertes gouvernementales, et les retours de la communauté."
          />
          <FAQItem
            question="Puis-je utiliser Lokadia hors connexion ?"
            answer="Les données de vos voyages et checklists sont disponibles hors ligne. Les alertes en temps réel nécessitent une connexion Internet."
          />
          <FAQItem
            question="Comment annuler mon abonnement Premium ?"
            answer="Rendez-vous dans Profil > Premium > Gérer l'abonnement pour annuler à tout moment."
          />
          <FAQItem
            question="Mes données sont-elles sécurisées ?"
            answer="Oui, toutes vos données sont chiffrées et stockées de manière sécurisée. Nous respectons le RGPD."
          />
        </div>
      </Modal>

      {/* Modal Politique de Confidentialité */}
      <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Politique de confidentialité">
        <div className="space-y-4 text-sm" style={{ color: "var(--lokadia-text-dark)" }}>
          <section>
            <h3 className="font-semibold mb-2">1. Collecte des données</h3>
            <p style={{ color: "var(--lokadia-text-light)" }}>
              Nous collectons uniquement les données nécessaires au fonctionnement de l'application : email, préférences de voyage, et données de localisation (avec votre consentement).
            </p>
          </section>
          <section>
            <h3 className="font-semibold mb-2">2. Utilisation des données</h3>
            <p style={{ color: "var(--lokadia-text-light)" }}>
              Vos données sont utilisées pour personnaliser votre expérience, vous envoyer des alertes pertinentes, et améliorer nos services.
            </p>
          </section>
          <section>
            <h3 className="font-semibold mb-2">3. Partage des données</h3>
            <p style={{ color: "var(--lokadia-text-light)" }}>
              Nous ne vendons jamais vos données. Elles peuvent être partagées avec nos partenaires de sécurité uniquement pour améliorer les alertes.
            </p>
          </section>
          <section>
            <h3 className="font-semibold mb-2">4. Vos droits (RGPD)</h3>
            <p style={{ color: "var(--lokadia-text-light)" }}>
              Vous avez le droit d'accéder, modifier, ou supprimer vos données à tout moment depuis votre profil.
            </p>
          </section>
        </div>
      </Modal>

      {/* Modal Sélection de Langue */}
      <Modal 
        isOpen={showLanguageModal} 
        onClose={() => setShowLanguageModal(false)} 
        title={translate("Choisir la langue")}
      >
        <div className="space-y-2">
          <p className="text-xs mb-4 px-1" style={{ color: "var(--lokadia-text-light)" }}>
            {translate("Sélectionnez votre langue préférée. L'interface sera automatiquement traduite.")}
          </p>
          
          {(Object.keys(SUPPORTED_LANGUAGES) as LanguageType[]).map((lang) => {
            const langInfo = SUPPORTED_LANGUAGES[lang];
            const isSelected = language === lang;
            
            return (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setShowLanguageModal(false);
                }}
                className={`w-full p-4 rounded-xl transition-all flex items-center justify-between ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{langInfo.flag}</span>
                  <span className={`font-semibold ${isSelected ? 'text-white' : ''}`} style={!isSelected ? { color: "var(--lokadia-text-dark)" } : {}}>
                    {langInfo.name}
                  </span>
                </div>
                {isSelected && (
                  <Check className="h-5 w-5 text-white" />
                )}
              </button>
            );
          })}
          
          <div className="mt-4 p-3 rounded-lg bg-cyan-50 border border-cyan-100">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-cyan-600 flex-shrink-0" />
              <div className="text-xs text-cyan-700 leading-relaxed">
                <p className="font-semibold mb-1">{translate("Traduction automatique")}</p>
                <p>{translate("Powered by MyMemory Translation API. Les traductions sont mises en cache pour une meilleure performance.")}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Continuing with helper components and modals...
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 pb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5" style={{ color: "var(--lokadia-deep-blue)" }} />
        <h2 className="text-lg font-bold" style={{ color: "#1a1a1a" }}>
          {title}
        </h2>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-md border-2 border-gray-200">{children}</div>
    </div>
  );
}

function TripCard({ 
  trip, 
  onOpen, 
  onDuplicate, 
  onDelete 
}: { 
  trip: any;
  onOpen: () => void;
  onDuplicate?: () => void;
  onDelete: () => void;
}) {
  const { t } = useLanguage();
  const statusColors = {
    planned: "var(--lokadia-info)",
    active: "var(--lokadia-success-green)",
    completed: "var(--lokadia-text-light)",
    cancelled: "var(--lokadia-text-light)",
  };

  const statusLabels = {
    planned: t.profile.tripStatusUpcoming,
    active: t.profile.tripStatusOngoing,
    completed: t.profile.tripStatusCompleted,
    cancelled: "Annulé",
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <ImageWithFallback src={trip.image} alt={trip.destination} className="w-28 h-28 object-cover" />
        <div className="flex-1 p-3">
          <h3 className="font-bold text-base mb-2" style={{ color: "#1a1a1a" }}>
            {trip.destination}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4" style={{ color: "#666666" }} />
            <span className="text-xs font-medium" style={{ color: "#666666" }}>
              {trip.dates}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-lg"
              style={{
                color: statusColors[trip.status],
                backgroundColor: `${statusColors[trip.status]}20`,
              }}
            >
              {statusLabels[trip.status]}
            </span>
            <span className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>
              {trip.checklistCompleted}/{trip.checklistTotal} ✓
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 p-3 border-t-2 border-gray-200">
        <button
          onClick={onOpen}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ backgroundColor: "var(--lokadia-deep-blue)", color: "white" }}
        >
          {t.profile.open}
        </button>
        {onDuplicate && (
          <button
            onClick={onDuplicate}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 border-2 border-gray-200"
            style={{ backgroundColor: "white", color: "var(--lokadia-deep-blue)" }}
          >
            {t.profile.duplicate}
          </button>
        )}
        <button
          onClick={onDelete}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-red-200 transition-all active:scale-95"
          style={{ backgroundColor: "#fee", color: "#c00" }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function SelectionCard({
  icon: Icon,
  label,
  count,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left">
      <Icon className="h-5 w-5 mb-2" style={{ color: "var(--lokadia-deep-blue)" }} />
      <div className="text-2xl font-bold mb-1" style={{ color: "var(--lokadia-text-dark)" }}>
        {count}
      </div>
      <div className="text-xs" style={{ color: "var(--lokadia-text-light)" }}>
        {label}
      </div>
    </button>
  );
}

function ToggleRow({
  label,
  enabled,
  onChange,
}: {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium" style={{ color: "var(--lokadia-primary-dark)" }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!enabled)}
        className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
        style={{ backgroundColor: enabled ? "var(--lokadia-success)" : "#cbd5e1" }}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-md ${
            enabled ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger,
  count,
  compact,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
  count?: number;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between ${
        compact ? "p-3" : "p-4"
      } rounded-xl bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all active:scale-98`}
    >
      <div className="flex items-center gap-3">
        <Icon
          className={`${compact ? "h-5 w-5" : "h-5 w-5"}`}
          style={{ color: danger ? "var(--lokadia-emergency-orange)" : "var(--lokadia-deep-blue)" }}
        />
        <span
          className={`${compact ? "text-sm" : "text-sm"} font-semibold`}
          style={{ color: danger ? "var(--lokadia-emergency-orange)" : "#1a1a1a" }}
        >
          {label}
        </span>
      </div>
      {count !== undefined ? (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "var(--lokadia-deep-blue)", color: "white" }}
        >
          {count}
        </span>
      ) : (
        <ChevronRight
          className="h-5 w-5"
          style={{ color: danger ? "var(--lokadia-emergency-orange)" : "#666666" }}
        />
      )}
    </button>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 pb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium text-sm" style={{ color: "var(--lokadia-text-dark)" }}>
          {question}
        </span>
        <ChevronRight
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
          style={{ color: "var(--lokadia-text-light)" }}
        />
      </button>
      {isOpen && (
        <p className="mt-2 text-sm" style={{ color: "var(--lokadia-text-light)" }}>
          {answer}
        </p>
      )}
    </div>
  );
}