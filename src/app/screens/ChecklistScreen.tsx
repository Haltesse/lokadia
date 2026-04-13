import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  FileText,
  Syringe,
  CreditCard,
  Smartphone,
  ShoppingBag,
  Shield,
  Trash2,
  Share2,
  Save,
  Download,
  RefreshCw,
} from "lucide-react";
import { Badge } from "../components/Badge";
import { EmptyState } from "../components/EmptyState";
import { SaveTripModal } from "../components/SaveTripModal";
import { getDestinationData } from "../data/destinationData";
import {
  generateChecklistForDestination,
  saveChecklistToStorage,
  loadChecklistFromStorage,
  ChecklistItem,
} from "../lib/checklist-generator";

interface TripData {
  id: string;
  destination: string;
  destination_id?: string;
  destination_name?: string;
  startDate: string;
  endDate: string;
  travelers: string[];
}

export function ChecklistScreen() {
  const navigate = useNavigate();
  const { destinationId } = useParams<{ destinationId: string }>();
  const location = useLocation();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showSaveTripModal, setShowSaveTripModal] = useState(false);
  const [newItemText, setNewItemText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Documents");

  // Récupérer les données de voyage depuis state ou params
  const tripDataFromState = location.state?.trip;
  
  // Debug: afficher les données reçues
  useEffect(() => {
    console.log("📥 ChecklistScreen - Données reçues (useEffect):", tripDataFromState);
    console.log("📅 ChecklistScreen - Dates brutes:", {
      start_date: tripDataFromState?.start_date,
      end_date: tripDataFromState?.end_date,
    });
  }, [tripDataFromState]);
  
  // Déterminer l'ID de destination (peut venir de l'URL ou du state)
  const actualDestinationId = destinationId || tripDataFromState?.destination_id;
  
  // Récupérer les données de destination
  const destinationData = actualDestinationId ? getDestinationData(actualDestinationId) : null;

  // Utiliser useState pour forcer le re-render lors des changements
  const [trip, setTrip] = useState<TripData>(() => {
    if (tripDataFromState) {
      console.log("🔄 Initialisation avec tripDataFromState");
      return {
        id: tripDataFromState.destination_id || actualDestinationId || "default-trip",
        destination: tripDataFromState.destination || (destinationData ? `${destinationData.name}, ${destinationData.country}` : "Destination inconnue"),
        destination_id: tripDataFromState.destination_id,
        destination_name: tripDataFromState.destination_name,
        startDate: tripDataFromState.start_date 
          ? new Date(tripDataFromState.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
          : new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        endDate: tripDataFromState.end_date
          ? new Date(tripDataFromState.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        travelers: tripDataFromState.travelers_count 
          ? Array.from({ length: tripDataFromState.travelers_count }, (_, i) => i === 0 ? "Vous" : `Voyageur ${i + 1}`)
          : ["Vous"],
      };
    }
    
    console.log("🔄 Initialisation avec données par défaut");
    return {
      id: actualDestinationId || "default-trip",
      destination: destinationData ? `${destinationData.name}, ${destinationData.country}` : "Destination inconnue",
      startDate: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
      travelers: ["Vous"],
    };
  });

  // Mettre à jour le trip quand tripDataFromState change
  useEffect(() => {
    if (tripDataFromState) {
      console.log("🔄 Mise à jour du trip avec nouvelles données");
      setTrip({
        id: tripDataFromState.destination_id || actualDestinationId || "default-trip",
        destination: tripDataFromState.destination || (destinationData ? `${destinationData.name}, ${destinationData.country}` : "Destination inconnue"),
        destination_id: tripDataFromState.destination_id,
        destination_name: tripDataFromState.destination_name,
        startDate: tripDataFromState.start_date 
          ? new Date(tripDataFromState.start_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
          : new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        endDate: tripDataFromState.end_date
          ? new Date(tripDataFromState.end_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
        travelers: tripDataFromState.travelers_count 
          ? Array.from({ length: tripDataFromState.travelers_count }, (_, i) => i === 0 ? "Vous" : `Voyageur ${i + 1}`)
          : ["Vous"],
      });
    }
  }, [tripDataFromState, actualDestinationId, destinationData]);

  console.log("✅ ChecklistScreen - Trip affiché:", trip);

  // Initialiser la checklist depuis le localStorage ou générer une nouvelle
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    if (actualDestinationId) {
      // Essayer de charger depuis le localStorage
      const savedChecklist = loadChecklistFromStorage(actualDestinationId);
      if (savedChecklist) {
        console.log('📋 Checklist chargée depuis le localStorage pour', actualDestinationId);
        return savedChecklist;
      }
      
      // Sinon, générer une nouvelle checklist adaptée
      console.log('✨ Génération d\'une nouvelle checklist pour', actualDestinationId);
      return generateChecklistForDestination(actualDestinationId);
    }
    
    // Checklist par défaut si pas de destination
    return generateChecklistForDestination('');
  });

  // Sauvegarder automatiquement la checklist quand elle change
  useEffect(() => {
    if (actualDestinationId && items.length > 0) {
      saveChecklistToStorage(actualDestinationId, items);
      console.log('💾 Checklist sauvegardée pour', actualDestinationId);
    }
  }, [items, actualDestinationId]);

  // Fonction de navigation pour le retour
  const handleBack = () => {
    // Retourner à la page précédente dans l'historique
    navigate(-1);
  };

  const categories = [
    { name: "Documents", icon: FileText, color: "#134074" },
    { name: "Santé", icon: Syringe, color: "#10B981" },
    { name: "Argent", icon: CreditCard, color: "#F59E0B" },
    { name: "Tech", icon: Smartphone, color: "#3B82F6" },
    { name: "Bagages", icon: ShoppingBag, color: "#8B5CF6" },
    { name: "Sécurité", icon: Shield, color: "#EF4444" },
  ];

  const toggleItem = (id: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, isDone: !item.isDone } : item)));
  };

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now(),
        category: selectedCategory,
        label: newItemText.trim(),
        isDone: false,
      };
      setItems([...items, newItem]);
      setNewItemText("");
      setShowAddItem(false);
    }
  };

  const deleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const completedCount = items.filter((item) => item.isDone).length;
  const completionPercentage = Math.round((completedCount / items.length) * 100);

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  return (
    <div className="min-h-screen" style={{ background: 'var(--lokadia-background)' }}>
      {/* Header */}
      <div
        className="px-6 pt-12 pb-8"
        style={{
          background: 'var(--gradient-primary)',
        }}
      >
        <motion.button
          onClick={handleBack}
          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6"
          whileTap={{ scale: 0.95 }}
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          <ArrowLeft className="h-6 w-6 text-white" />
        </motion.button>

        <motion.h1 
          className="text-3xl font-bold text-white mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Checklist voyage
        </motion.h1>
        <p className="text-white/90 text-base mb-6">
          {trip.destination} • {trip.startDate} - {trip.endDate}
        </p>

        {/* Progress Card */}
        <motion.div 
          className="bg-white/15 backdrop-blur-md rounded-3xl p-6 border border-white/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          style={{ boxShadow: 'var(--shadow-xl)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-white text-base font-semibold">Progression</span>
            <span className="text-white font-bold text-2xl">{completionPercentage}%</span>
          </div>
          <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ 
                background: 'linear-gradient(90deg, var(--lokadia-warning) 0%, var(--lokadia-secondary) 100%)'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
          <p className="text-white/90 text-sm mt-3">
            {completedCount} sur {items.length} tâches complétées
          </p>
        </motion.div>
      </div>

      {/* Actions Bar */}
      <div className="px-6 py-5 bg-white flex gap-3" style={{ boxShadow: 'var(--shadow-md)' }}>
        <motion.button
          onClick={() => setShowAddItem(true)}
          className="flex-1 py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2"
          style={{ 
            background: 'var(--gradient-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-5 w-5" />
          Ajouter un item
        </motion.button>
        <motion.button
          className="px-5 py-4 rounded-2xl border-2"
          style={{ 
            borderColor: 'var(--lokadia-primary)', 
            color: 'var(--lokadia-primary)' 
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Share2 className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItem && (
          <>
            <motion.div 
              className="fixed inset-0 z-50 bg-black/50 flex items-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddItem(false)}
            />
            <motion.div 
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl p-6"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ boxShadow: 'var(--shadow-2xl)' }}
            >
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--lokadia-gray-900)' }}>
                Ajouter un item
              </h3>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--lokadia-gray-700)' }}>
                  Catégorie
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedCategory === cat.name
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                      style={{
                        backgroundColor: selectedCategory === cat.name 
                          ? cat.color 
                          : 'var(--lokadia-gray-100)',
                        boxShadow: selectedCategory === cat.name ? 'var(--shadow-sm)' : 'none'
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {cat.name}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Item Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--lokadia-gray-700)' }}>
                  Description
                </label>
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Ex: Réserver un taxi"
                  className="w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition-all"
                  style={{ 
                    borderColor: newItemText ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)',
                    color: 'var(--lokadia-gray-900)'
                  }}
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 py-3 rounded-2xl font-semibold border-2"
                  style={{ 
                    borderColor: 'var(--lokadia-gray-300)', 
                    color: 'var(--lokadia-gray-700)' 
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Annuler
                </motion.button>
                <motion.button
                  onClick={addItem}
                  disabled={!newItemText.trim()}
                  className="flex-1 py-3 rounded-2xl font-semibold text-white"
                  style={{ 
                    background: newItemText.trim() ? 'var(--gradient-primary)' : 'var(--lokadia-gray-300)',
                    cursor: newItemText.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: newItemText.trim() ? 'var(--shadow-md)' : 'none'
                  }}
                  whileTap={newItemText.trim() ? { scale: 0.98 } : {}}
                >
                  Ajouter
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checklist by Category */}
      <div className="px-6 py-6 space-y-4">
        {categories.map((category, catIndex) => {
          const categoryItems = groupedItems[category.name] || [];
          if (categoryItems.length === 0) return null;

          const CategoryIcon = category.icon;
          const completedInCategory = categoryItems.filter((item) => item.isDone).length;

          return (
            <motion.div 
              key={category.name} 
              className="bg-white rounded-3xl p-5"
              style={{ boxShadow: 'var(--shadow-lg)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <CategoryIcon className="h-6 w-6" style={{ color: category.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--lokadia-gray-900)' }}>
                      {category.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--lokadia-gray-600)' }}>
                      {completedInCategory}/{categoryItems.length} complété{completedInCategory > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {categoryItems.map((item, itemIndex) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors group"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: catIndex * 0.1 + itemIndex * 0.05 }}
                  >
                    <motion.button
                      onClick={() => toggleItem(item.id)}
                      className="flex-shrink-0"
                      whileTap={{ scale: 0.9 }}
                    >
                      {item.isDone ? (
                        <CheckCircle2
                          className="h-6 w-6"
                          style={{ color: category.color }}
                        />
                      ) : (
                        <Circle className="h-6 w-6" style={{ color: 'var(--lokadia-gray-300)' }} />
                      )}
                    </motion.button>
                    <span
                      className={`flex-1 text-sm ${item.isDone ? "line-through" : ""}`}
                      style={{
                        color: item.isDone ? 'var(--lokadia-gray-500)' : 'var(--lokadia-gray-900)',
                      }}
                    >
                      {item.label}
                    </span>
                    <motion.button
                      onClick={() => deleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-xl"
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="px-6 pb-8 space-y-3">
        <motion.button
          onClick={() => setShowSaveTripModal(true)}
          className="w-full py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2"
          style={{ 
            background: 'var(--gradient-success)',
            boxShadow: 'var(--shadow-lg)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Save className="h-5 w-5" />
          Sauvegarder dans "Mes Voyages"
        </motion.button>
        <motion.button
          className="w-full py-4 rounded-2xl font-semibold border-2"
          style={{
            borderColor: 'var(--lokadia-primary)',
            color: 'var(--lokadia-primary)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <RefreshCw className="h-5 w-5 inline mr-2" />
          Réinitialiser la checklist
        </motion.button>
        <motion.button
          className="w-full py-4 rounded-2xl font-semibold text-white"
          style={{ 
            background: 'var(--gradient-danger)',
            boxShadow: 'var(--shadow-md)'
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Download className="h-5 w-5 inline mr-2" />
          Exporter en PDF
        </motion.button>
      </div>

      {/* Save Trip Modal */}
      <SaveTripModal
        isOpen={showSaveTripModal}
        onClose={() => setShowSaveTripModal(false)}
        destinationId={actualDestinationId || "unknown"}
        destinationName={destinationData?.name || "Destination inconnue"}
        destinationCountry={destinationData?.country || "Pays inconnu"}
        checklistItems={items.map(item => ({
          id: item.id.toString(),
          title: item.label,
          category: item.category,
          completed: item.isDone,
        }))}
        initialStartDate={tripDataFromState?.start_date || ""}
        initialEndDate={tripDataFromState?.end_date || ""}
        initialTravelers={tripDataFromState?.travelers_count || tripDataFromState?.travelers?.length || 1}
        initialNotes={tripDataFromState?.notes || ""}
        initialStatus="planned"
        onSaved={() => {
          setShowSaveTripModal(false);
          navigate('/trips');
        }}
      />
    </div>
  );
}