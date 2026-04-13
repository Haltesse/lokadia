import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  MapPin,
  Briefcase,
  Backpack,
  Coffee,
  Search,
} from "lucide-react";
import { destinationsDatabase, getDestinationData } from "../data/destinationData";

interface DestinationData {
  id: string;
  name: string;
  country: string;
}

// Récupérer toutes les destinations de la base de données
const getAllDestinations = (): DestinationData[] => {
  return Object.values(destinationsDatabase).map((dest) => ({
    id: dest.id,
    name: dest.name,
    country: dest.country,
  })).sort((a, b) => a.name.localeCompare(b.name));
};

export function TripCreateScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedDestination = (location.state as { destination?: DestinationData; formData?: any })?.destination;
  const savedFormData = (location.state as { destination?: DestinationData; formData?: any })?.formData;

  const [destination, setDestination] = useState<DestinationData | null>(passedDestination || null);
  const [showDestinationPicker, setShowDestinationPicker] = useState(!passedDestination);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(savedFormData?.startDate || "");
  const [endDate, setEndDate] = useState(savedFormData?.endDate || "");
  const [travelers, setTravelers] = useState(savedFormData?.travelers || 1);
  const [notes, setNotes] = useState(savedFormData?.notes || "");

  // Debug: afficher les données restaurées
  console.log("🔄 TripCreateScreen - Données restaurées:", {
    destination,
    formData: savedFormData,
    startDate,
    endDate,
    travelers,
    notes
  });

  const allDestinations = getAllDestinations();
  
  const filteredDestinations = searchQuery
    ? allDestinations.filter(
        (dest) =>
          dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dest.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allDestinations;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !startDate || !endDate) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Créer l'objet de données du voyage
    const tripData = {
      destination_id: destination.id,
      destination_name: destination.name,
      destination: `${destination.name}, ${destination.country}`,
      start_date: startDate,
      end_date: endDate,
      travelers_count: travelers,
      notes: notes,
    };

    console.log("🚀 TripCreateScreen - Soumission des données:", tripData);

    // Rediriger vers la liste des voyages après création
    navigate('/trips');
  };

  const handleBack = () => {
    // Retourner à la page précédente dans l'historique
    navigate(-1);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--lokadia-soft-white)" }}>
      {/* Header */}
      <div
        className="px-6 pt-12 pb-6"
        style={{
          background: "linear-gradient(135deg, var(--lokadia-deep-blue) 0%, var(--lokadia-blue) 100%)",
        }}
      >
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-transform active:scale-95 mb-4"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        <h1 className="text-2xl font-bold text-white mb-2">Créer un voyage</h1>
        {destination && (
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="h-5 w-5" />
            <span>
              {destination.name}, {destination.country}
            </span>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="px-6 py-6 space-y-6">
        {/* Destination Selection */}
        {!showDestinationPicker && destination && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--lokadia-text-dark)" }}>
              <MapPin className="h-5 w-5" style={{ color: "var(--lokadia-blue)" }} />
              Destination
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: "var(--lokadia-blue)" }} />
                <span style={{ color: "var(--lokadia-text-dark)" }}>
                  {destination.name}, {destination.country}
                </span>
              </div>
              <button
                onClick={() => setShowDestinationPicker(true)}
                className="text-sm font-medium px-3 py-1 rounded-lg"
                style={{ color: "var(--lokadia-blue)", backgroundColor: "rgba(30, 90, 142, 0.1)" }}
              >
                Modifier
              </button>
            </div>
          </div>
        )}

        {/* Destination Picker */}
        {showDestinationPicker && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--lokadia-text-dark)" }}>
              <MapPin className="h-5 w-5" style={{ color: "var(--lokadia-blue)" }} />
              Sélectionnez une destination
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
                  Recherchez une destination
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-lokadia-blue"
                  style={{ borderColor: searchQuery ? "var(--lokadia-blue)" : undefined }}
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => {
                      setDestination(dest);
                      setShowDestinationPicker(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 transition-colors hover:border-lokadia-blue hover:bg-blue-50 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" style={{ color: "var(--lokadia-blue)" }} />
                      <span style={{ color: "var(--lokadia-text-dark)" }}>
                        {dest.name}, {dest.country}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--lokadia-text-dark)" }}>
            <Calendar className="h-5 w-5" style={{ color: "var(--lokadia-blue)" }} />
            Dates du voyage
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
                Date de départ
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-lokadia-blue"
                style={{ borderColor: startDate ? "var(--lokadia-blue)" : undefined }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--lokadia-text-dark)" }}>
                Date de retour
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-lokadia-blue"
                style={{ borderColor: endDate ? "var(--lokadia-blue)" : undefined }}
              />
            </div>
          </div>
        </div>

        {/* Travelers Count */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--lokadia-text-dark)" }}>
            <Users className="h-5 w-5" style={{ color: "var(--lokadia-blue)" }} />
            Nombre de voyageurs
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: "var(--lokadia-text-light)" }}>
              Personnes
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors"
                style={{
                  borderColor: "var(--lokadia-blue)",
                  color: "var(--lokadia-blue)",
                }}
                disabled={travelers <= 1}
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center" style={{ color: "var(--lokadia-text-dark)" }}>
                {travelers}
              </span>
              <button
                onClick={() => setTravelers(Math.min(20, travelers + 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors"
                style={{
                  borderColor: "var(--lokadia-blue)",
                  color: "var(--lokadia-blue)",
                }}
                disabled={travelers >= 20}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--lokadia-text-dark)" }}>
            <FileText className="h-5 w-5" style={{ color: "var(--lokadia-blue)" }} />
            Notes (optionnel)
          </h3>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoutez des notes sur votre voyage..."
            className="w-full h-24 px-4 py-3 rounded-xl border-2 border-gray-200 resize-none focus:outline-none focus:border-lokadia-blue"
            style={{ borderColor: notes ? "var(--lokadia-blue)" : undefined }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!destination || !startDate || !endDate}
          className="w-full py-4 rounded-2xl font-semibold text-white transition-transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--lokadia-deep-blue)" }}
        >
          Créer mon voyage
        </button>

        <p className="text-center text-sm" style={{ color: "var(--lokadia-text-light)" }}>
          Vous pourrez ensuite accéder à votre checklist et préparer votre départ
        </p>
      </div>
    </div>
  );
}