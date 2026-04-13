import { useState } from "react";
import { X, Calendar, Users, Save, MapPin } from "lucide-react";
import { createTrip, saveChecklistForTrip } from "../lib/tripService";
import { useAuth } from "../context/AuthContext";

interface SaveTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationId: string;
  destinationName: string;
  destinationCountry: string;
  checklistItems: Array<{
    id: string;
    title: string;
    category: string;
    completed: boolean;
  }>;
  onSaved?: () => void;
  // Données pré-remplies si disponibles
  initialStartDate?: string;
  initialEndDate?: string;
  initialTravelers?: number;
  initialNotes?: string;
  initialStatus?: "planned" | "active" | "completed";
}

export function SaveTripModal({
  isOpen,
  onClose,
  destinationId,
  destinationName,
  destinationCountry,
  checklistItems,
  onSaved,
  initialStartDate = "",
  initialEndDate = "",
  initialTravelers = 1,
  initialNotes = "",
  initialStatus = "planned",
}: SaveTripModalProps) {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [travelers, setTravelers] = useState(initialTravelers);
  const [notes, setNotes] = useState(initialNotes);
  const [status, setStatus] = useState<"planned" | "active" | "completed">(initialStatus);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!user) {
      alert("Vous devez être connecté pour sauvegarder un voyage");
      return;
    }

    if (!startDate || !endDate) {
      alert("Veuillez renseigner les dates de voyage");
      return;
    }

    setSaving(true);
    try {
      // Créer le voyage
      const trip = await createTrip({
        userId: user.id,
        destinationId,
        destinationName,
        startDate,
        endDate,
        travelers,
        notes,
        status,
      });

      // Sauvegarder la checklist
      await saveChecklistForTrip(trip.id, user.id, checklistItems);

      alert("Voyage sauvegardé avec succès !");
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde du voyage");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Save className="w-6 h-6" />
              Sauvegarder le voyage
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4" />
            <p className="text-sm">
              {destinationName}, {destinationCountry}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Statut */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Statut du voyage
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setStatus("planned")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  status === "planned"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Planifié
              </button>
              <button
                onClick={() => setStatus("active")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  status === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                En cours
              </button>
              <button
                onClick={() => setStatus("completed")}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  status === "completed"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Terminé
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date de départ
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date de retour
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Voyageurs */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Nombre de voyageurs
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={travelers}
              onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notes personnelles (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Voyage en famille, anniversaire de mariage..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Résumé checklist */}
          {checklistItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Checklist sauvegardée
              </p>
              <div className="flex items-center gap-4 text-sm text-blue-700">
                <span>
                  {checklistItems.filter((item) => item.completed).length} complétés
                </span>
                <span>{checklistItems.filter((item) => !item.completed).length} restants</span>
                <span>{checklistItems.length} total</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !startDate || !endDate}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}