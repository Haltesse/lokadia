import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Edit, Share2, Download, Trash2 } from 'lucide-react';
import { getTripById, deleteTrip } from '../lib/tripService';
import { generateTripDashboard } from '../lib/tripBriefService';
import { BottomNav } from '../components/BottomNav';
import type { TripWithChecklist } from '../lib/tripService';
import type { TripDashboard } from '../lib/tripBriefService';
import TripOverviewTab from '../components/TripOverviewTab';
import TripPreparationTab from '../components/TripPreparationTab';
import TripOnLocationTab from '../components/TripOnLocationTab';
import TripItineraryMapTab from '../components/TripItineraryMapTab';

type TabType = 'overview' | 'preparation' | 'location' | 'itinerary';

export default function TripDetailScreen() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState<TripWithChecklist | null>(null);
  const [dashboard, setDashboard] = useState<TripDashboard | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tripId) {
      loadTrip();
    }
  }, [tripId]);

  async function loadTrip() {
    try {
      if (!tripId) return;
      
      const tripData = await getTripById(tripId);
      if (!tripData) {
        navigate('/trips');
        return;
      }
      
      setTrip(tripData);
      
      // Générer le dashboard
      const checklistCompleted = tripData.checklistItems?.filter(i => i.completed).length || 0;
      const checklistTotal = tripData.checklistItems?.length || 0;
      
      const dashboardData = await generateTripDashboard(tripData, checklistCompleted, checklistTotal);
      setDashboard(dashboardData);
    } catch (error) {
      console.error('Erreur chargement voyage:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrip() {
    if (!trip || !tripId) return;
    
    if (!confirm(`Voulez-vous vraiment supprimer le voyage "${trip.destinationName}" ?\n\nCette action est irréversible.`)) {
      return;
    }
    
    try {
      await deleteTrip(tripId);
      navigate('/trips');
    } catch (error) {
      console.error('Erreur suppression voyage:', error);
      alert('Erreur lors de la suppression du voyage');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!trip || !dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Voyage introuvable</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--lokadia-background)' }}>
      {/* Header */}
      <div 
        className="text-white px-6 py-8"
        style={{ background: 'var(--gradient-primary)' }}
      >
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 mb-6 text-white/90 hover:text-white font-medium text-base"
        >
          <ArrowLeft size={22} />
          <span>Retour</span>
        </button>

        <h1 className="text-3xl font-bold mb-3">{trip.destinationName}</h1>
        <p className="text-white/90 text-lg mb-6">
          {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/trips/${trip.id}/edit`)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-3 rounded-full text-base font-semibold transition-colors backdrop-blur-sm"
          >
            <Edit size={18} />
            Modifier
          </button>
          <button 
            onClick={handleDeleteTrip}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 px-5 py-3 rounded-full text-base font-semibold transition-colors backdrop-blur-sm"
          >
            <Trash2 size={18} />
            Supprimer
          </button>
          <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-3 rounded-full text-base font-semibold transition-colors backdrop-blur-sm">
            <Share2 size={18} />
            Partager
          </button>
          {trip.travelerProfile && (
            <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-3 rounded-full text-base font-semibold transition-colors backdrop-blur-sm">
              <Download size={18} />
              Offline
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-2 flex gap-2 overflow-x-auto" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-4 font-semibold text-base whitespace-nowrap relative transition-colors ${
            activeTab === 'overview' ? '' : ''
          }`}
          style={{ 
            color: activeTab === 'overview' ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-600)'
          }}
        >
          Aperçu
          {activeTab === 'overview' && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
              style={{ backgroundColor: 'var(--lokadia-primary)' }}
            ></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('preparation')}
          className={`px-5 py-4 font-semibold text-base whitespace-nowrap relative transition-colors ${
            activeTab === 'preparation' ? '' : ''
          }`}
          style={{ 
            color: activeTab === 'preparation' ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-600)'
          }}
        >
          Avant le départ
          {activeTab === 'preparation' && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
              style={{ backgroundColor: 'var(--lokadia-primary)' }}
            ></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`px-5 py-4 font-semibold text-base whitespace-nowrap relative transition-colors ${
            activeTab === 'location' ? '' : ''
          }`}
          style={{ 
            color: activeTab === 'location' ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-600)'
          }}
        >
          Pendant
          {activeTab === 'location' && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
              style={{ backgroundColor: 'var(--lokadia-primary)' }}
            ></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('itinerary')}
          className={`px-5 py-4 font-semibold text-base whitespace-nowrap relative transition-colors ${
            activeTab === 'itinerary' ? '' : ''
          }`}
          style={{ 
            color: activeTab === 'itinerary' ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-600)'
          }}
        >
          Itinéraire / Carte
          {activeTab === 'itinerary' && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
              style={{ backgroundColor: 'var(--lokadia-primary)' }}
            ></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === 'overview' && <TripOverviewTab dashboard={dashboard} trip={trip} />}
        {activeTab === 'preparation' && <TripPreparationTab dashboard={dashboard} />}
        {activeTab === 'location' && <TripOnLocationTab dashboard={dashboard} trip={trip} />}
        {activeTab === 'itinerary' && (
          <TripItineraryMapTab
            trip={trip}
            stops={dashboard.stops}
            segments={dashboard.segments}
          />
        )}
      </div>

      <BottomNav />
    </div>
  );
}