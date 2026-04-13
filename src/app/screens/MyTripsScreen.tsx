import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Trash2,
  Eye,
  Plus,
  Plane,
  PackageCheck,
} from "lucide-react";
import { getCompletedTrips, getActiveTrips, deleteTrip, type TripWithChecklist } from "../lib/tripService";
import { getDestinationData } from "../data/destinationData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

type TabType = "active" | "completed";

export function MyTripsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tr = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [activeTrips, setActiveTrips] = useState<TripWithChecklist[]>([]);
  const [completedTrips, setCompletedTrips] = useState<TripWithChecklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, [user]);

  const loadTrips = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [active, completed] = await Promise.all([
        getActiveTrips(user.id),
        getCompletedTrips(user.id),
      ]);

      // Enrichir avec les données de destination
      const enrichTrips = (trips: any[]) => {
        return trips.map((trip) => {
          const destination = getDestinationData(trip.destinationId);
          return {
            ...trip,
            destinationCountry: destination?.country || tr("Pays inconnu"),
            destinationImage: destination?.image || "",
          };
        });
      };

      setActiveTrips(enrichTrips(active));
      setCompletedTrips(enrichTrips(completed));
    } catch (error) {
      console.error("Erreur lors du chargement des voyages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!window.confirm(tr("Êtes-vous sûr de vouloir supprimer ce voyage ?"))) {
      return;
    }

    try {
      await deleteTrip(tripId);
      await loadTrips();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getChecklistProgress = (trip: TripWithChecklist) => {
    if (!trip.checklistItems || trip.checklistItems.length === 0) return null;
    const completed = trip.checklistItems.filter((item) => item.completed).length;
    const total = trip.checklistItems.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const renderTripCard = (trip: TripWithChecklist, isCompleted: boolean) => {
    const duration = calculateDuration(trip.startDate, trip.endDate);
    const progress = getChecklistProgress(trip);

    // Debug: afficher les données du voyage
    console.log("🎫 Voyage affiché:", {
      id: trip.id,
      destinationId: trip.destinationId,
      destinationName: trip.destinationName,
      dates: { start: trip.startDate, end: trip.endDate },
      travelers: trip.travelers,
    });

    return (
      <div
        key={trip.id}
        className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <ImageWithFallback
            src={trip.destinationImage || ""}
            alt={trip.destinationName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Badge statut */}
          <div className="absolute top-3 right-3">
            {isCompleted ? (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {tr("Passé")}
              </div>
            ) : (
              <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {tr("À venir")}
              </div>
            )}
          </div>

          {/* Titre destination */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white text-xl font-bold mb-1">{trip.destinationName}</h3>
            <p className="text-white/90 text-sm">{trip.destinationCountry}</p>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 space-y-3">
          {/* Dates */}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
            <span className="text-xs text-gray-500">({duration} {tr("jours")})</span>
          </div>

          {/* Voyageurs */}
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm">{trip.travelers} {trip.travelers > 1 ? tr("voyageurs") : tr("voyageur")}</span>
          </div>

          {/* Progress checklist */}
          {progress && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <PackageCheck className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{tr("Checklist")}</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {progress.completed}/{progress.total} ({progress.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Notes */}
          {trip.notes && (
            <p className="text-sm text-gray-600 line-clamp-2 italic">"{trip.notes}"</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                // Naviguer vers la checklist avec toutes les données du voyage
                navigate(`/checklist/${trip.destinationId}`, {
                  state: {
                    trip: {
                      destination_id: trip.destinationId,
                      destination_name: trip.destinationName,
                      destination: `${trip.destinationName}, ${trip.destinationCountry}`,
                      start_date: trip.startDate,
                      end_date: trip.endDate,
                      travelers_count: trip.travelers,
                      notes: trip.notes,
                    },
                  },
                });
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              {tr("Ouvrir le voyage")}
            </button>
            <button
              onClick={() => handleDeleteTrip(trip.id)}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{tr("Connexion requise")}</h2>
          <p className="text-gray-600 mb-4">{tr("Connectez-vous pour voir vos voyages")}</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            {tr("Se connecter")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{tr("Mes Voyages")}</h1>
              <p className="text-white/80 text-sm">{tr("Gérez vos voyages passés et à venir")}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "active"
                  ? "bg-white text-blue-700"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{tr("À venir")} ({activeTrips.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "completed"
                  ? "bg-white text-blue-700"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{tr("Passés")} ({completedTrips.length})</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">{tr("Chargement...")}</p>
          </div>
        ) : (
          <>
            {activeTab === "active" ? (
              <>
                {activeTrips.length === 0 ? (
                  <div className="text-center py-12">
                    <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tr("Aucun voyage à venir")}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {tr("Planifiez votre prochain voyage pour le voir apparaître ici")}
                    </p>
                    <button
                      onClick={() => navigate("/")}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      {tr("Découvrir les destinations")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeTrips.map((trip) => renderTripCard(trip, false))}
                      
                      {/* Bouton Ajouter un Voyage - Dans la grille comme une carte */}
                      <button
                        onClick={() => navigate("/")}
                        className="group bg-transparent rounded-2xl border-2 border-dashed border-blue-400 hover:border-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer min-h-[400px]"
                      >
                        <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-10 h-10 text-white" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {tr("Nouveau voyage")}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {tr("Planifiez votre prochaine aventure")}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {completedTrips.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {tr("Aucun voyage passé")}
                    </h3>
                    <p className="text-gray-600">
                      {tr("Vos voyages passés apparaîtront ici")}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {completedTrips.map((trip) => renderTripCard(trip, true))}
                      
                      {/* Bouton Ajouter un Voyage - Dans la grille comme une carte */}
                      <button
                        onClick={() => navigate("/")}
                        className="group bg-transparent rounded-2xl border-2 border-dashed border-blue-400 hover:border-blue-600 hover:bg-blue-50/50 transition-all cursor-pointer min-h-[400px]"
                      >
                        <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus className="w-10 h-10 text-white" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {tr("Nouveau voyage")}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {tr("Planifiez votre prochaine aventure")}
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}