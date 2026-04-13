import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, MapPin, Calendar, CheckCircle2, ChevronRight, Plane, Clock, Trophy, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { getUserTrips, deleteTrip, type Trip } from '../lib/tripService';
import { useAuth } from '../context/AuthContext';
import { getTripStops, type TripStop } from '../lib/tripService';

interface TripWithStops extends Trip {
  stops: TripStop[];
  checklistProgress: { completed: number; total: number };
}

export default function TripsScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<TripWithStops[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [currentSlide, setCurrentSlide] = useState(0);

  const headerImages = [
    'https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzcyMzQ0MTczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1673505413397-0cd0dc4f5854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NzIzODAzMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyJTIwc3Vuc2V0fGVufDF8fHx8MTc3MjM1MTM2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1639128918430-e5090476e2d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGNpdHklMjBuaWdodCUyMGxpZ2h0c3xlbnwxfHx8fDE3NzI0NTM5MDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1671760085670-2be5869f38dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2UlMjBibHVlJTIwZG9tZXN8ZW58MXx8fHwxNzcyMzg1MDYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  ];

  useEffect(() => {
    loadTrips();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % headerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadTrips() {
    try {
      if (!user) return;
      
      const allTrips = await getUserTrips(user.id);
      
      // Enrichir avec les stops
      const enrichedTrips: TripWithStops[] = await Promise.all(
        allTrips.map(async (trip) => {
          const stops = await getTripStops(trip.id);
          return {
            ...trip,
            stops,
            checklistProgress: { completed: 0, total: 0 }, // TODO: calculer vraiment
          };
        })
      );
      
      setTrips(enrichedTrips);
    } catch (error) {
      console.error('Erreur chargement voyages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTrip(tripId: string, tripName: string, event: React.MouseEvent) {
    // Empêcher la navigation vers les détails
    event.stopPropagation();
    
    if (!confirm(`Voulez-vous vraiment supprimer le voyage "${tripName}" ?\n\nCette action est irréversible.`)) {
      return;
    }
    
    try {
      await deleteTrip(tripId);
      // Recharger la liste des voyages
      await loadTrips();
    } catch (error) {
      console.error('Erreur suppression voyage:', error);
      alert('Erreur lors de la suppression du voyage');
    }
  }

  // Fonction pour déterminer le status réel basé sur les dates
  function getActualStatus(trip: Trip): 'planned' | 'active' | 'completed' {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    if (now > end) {
      return 'completed';
    } else if (now >= start && now <= end) {
      return 'active';
    } else {
      return 'planned';
    }
  }

  const upcomingTrips = trips.filter(t => {
    const actualStatus = getActualStatus(t);
    return actualStatus === 'planned' || actualStatus === 'active';
  });
  
  const pastTrips = trips.filter(t => {
    const actualStatus = getActualStatus(t);
    return actualStatus === 'completed';
  });

  const displayTrips = activeTab === 'upcoming' ? upcomingTrips : pastTrips;

  function getTripStatus(trip: Trip): { label: string; color: string; bgColor: string; icon: JSX.Element } {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);

    if (now >= start && now <= end) {
      return { 
        label: 'En cours', 
        color: 'var(--lokadia-warning)', 
        bgColor: 'var(--lokadia-warning-bg)',
        icon: <Plane size={14} className="animate-pulse" />
      };
    }
    if (now < start) {
      const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { 
        label: `Dans ${days}j`, 
        color: 'var(--lokadia-primary)', 
        bgColor: 'var(--lokadia-info-bg)',
        icon: <Clock size={14} />
      };
    }
    return { 
      label: 'Terminé', 
      color: 'var(--lokadia-gray-500)', 
      bgColor: 'var(--lokadia-gray-100)',
      icon: <Trophy size={14} />
    };
  }

  function formatDateRange(start: string, end: string): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
    return `${startDate.toLocaleDateString('fr-FR', options)} → ${endDate.toLocaleDateString('fr-FR', options)}`;
  }

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--lokadia-background)' }}
      >
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="rounded-full h-16 w-16 mx-auto mb-4"
            style={{ 
              border: '3px solid var(--lokadia-primary)',
              borderTopColor: 'transparent'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p style={{ color: 'var(--lokadia-gray-600)' }} className="font-medium">
            Chargement de vos voyages...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-24"
      style={{ background: 'var(--lokadia-background)' }}
    >
      {/* Header avec dégradé subtil */}
      <motion.div 
        className="text-white px-6 py-12 relative overflow-hidden"
        style={{ 
          borderBottomLeftRadius: '2rem',
          borderBottomRightRadius: '2rem',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Images du diaporama */}
        {headerImages.map((img, index) => (
          <motion.div
            key={img}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={false}
            animate={{ 
              opacity: index === currentSlide ? 1 : 0,
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        ))}
        {/* Overlay sombre pour lisibilité du texte */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.5) 100%)',
          }}
        />
        {/* Contenu */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3">Mes Voyages</h1>
          <p className="text-white/90 text-lg">Gérez vos itinéraires et préparations</p>
        </div>
      </motion.div>

      {/* Tabs élégants */}
      <div 
        className="px-6 pt-6 pb-4 flex gap-4"
        style={{ background: 'var(--lokadia-background)' }}
      >
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-4 px-5 text-base font-bold rounded-2xl transition-all duration-300 ${
            activeTab === 'upcoming' 
              ? 'text-white shadow-xl'
              : 'bg-white'
          }`}
          style={{ 
            background: activeTab === 'upcoming' ? 'var(--gradient-primary)' : 'white',
            color: activeTab === 'upcoming' ? 'white' : 'var(--lokadia-gray-600)',
          }}
        >
          À venir
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-4 px-5 text-base font-bold rounded-2xl transition-all duration-300 ${
            activeTab === 'past' 
              ? 'text-white shadow-xl'
              : 'bg-white'
          }`}
          style={{ 
            background: activeTab === 'past' ? 'var(--gradient-primary)' : 'white',
            color: activeTab === 'past' ? 'white' : 'var(--lokadia-gray-600)',
          }}
        >
          Passés
        </button>
      </div>

      {/* Liste des voyages avec animations */}
      <div className="px-6 py-4 space-y-4">
        {displayTrips.length === 0 ? (
          <motion.div 
            className="mt-4 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Illustration visuelle élégante */}
            <div className="relative mx-auto mb-6" style={{ width: '180px', height: '180px' }}>
              {/* Cercles décoratifs en arrière-plan */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{ 
                  top: '20%',
                  left: '20%',
                  width: '60%',
                  height: '60%',
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)',
                }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              
              {/* Icône centrale stylisée */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.3 
                }}
              >
                <div 
                  className="rounded-full p-6 shadow-xl"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--lokadia-deep-blue) 0%, #1E40AF 100%)',
                  }}
                >
                  <Plane size={40} style={{ color: 'white' }} />
                </div>
              </motion.div>
            </div>

            {/* Texte et CTA */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--lokadia-text-dark)' }}
              >
                {activeTab === 'upcoming' ? 'Aucun voyage prévu' : 'Aucun voyage passé'}
              </h3>
              <p 
                className="text-sm mb-6 max-w-xs mx-auto leading-relaxed"
                style={{ color: 'var(--lokadia-text-light)' }}
              >
                {activeTab === 'upcoming' 
                  ? 'Créez votre premier voyage et profitez de tous nos outils pour une expérience sereine'
                  : 'Vos voyages complétés apparaîtront ici avec tous vos souvenirs'
                }
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={() => navigate("/trips/create")}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300"
                  style={{ 
                    background: 'white',
                    color: 'var(--lokadia-deep-blue)',
                    boxShadow: '0 10px 40px rgba(15, 76, 129, 0.25)',
                    border: '2px solid var(--lokadia-deep-blue)',
                  }}
                >
                  <Plus size={24} strokeWidth={2.5} />
                  Créer mon premier voyage
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <>
            {displayTrips.map((trip, index) => {
              const status = getTripStatus(trip);
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.08
                  }}
                  className="relative"
                >
                  {/* Bouton de suppression */}
                  <button
                    onClick={(e) => handleDeleteTrip(trip.id, trip.destinationName, e)}
                    className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{ 
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid rgba(239, 68, 68, 0.3)'
                    }}
                    title="Supprimer le voyage"
                  >
                    <Trash2 size={18} style={{ color: '#EF4444' }} />
                  </button>

                  <button
                    onClick={() => navigate(`/trips/${trip.id}`)}
                    className="block bg-white rounded-3xl p-6 border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full text-left"
                    style={{ 
                      borderColor: 'var(--lokadia-gray-200)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-4 pr-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 
                            className="text-xl font-bold"
                            style={{ color: 'var(--lokadia-gray-900)' }}
                          >
                            {trip.destinationName}
                          </h3>
                          <span 
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                            style={{ 
                              color: status.color,
                              backgroundColor: status.bgColor
                            }}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </div>
                        <div 
                          className="flex items-center gap-2 text-sm mb-3"
                          style={{ color: 'var(--lokadia-gray-600)' }}
                        >
                          <Calendar size={16} />
                          <span className="font-medium">{formatDateRange(trip.startDate, trip.endDate)}</span>
                        </div>
                      </div>
                      <ChevronRight 
                        size={24} 
                        style={{ color: 'var(--lokadia-gray-400)' }}
                        className="flex-shrink-0"
                      />
                    </div>

                    {/* Étapes avec design amélioré */}
                    {trip.stops.length > 0 && (
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <MapPin 
                          size={16} 
                          style={{ color: 'var(--lokadia-secondary)' }}
                          className="flex-shrink-0"
                        />
                        {trip.stops.slice(0, 4).map((stop) => (
                          <span
                            key={stop.id}
                            className="text-xs px-3 py-1.5 rounded-full font-medium"
                            style={{ 
                              backgroundColor: 'var(--lokadia-category-accommodation-bg)',
                              color: 'var(--lokadia-category-accommodation)'
                            }}
                          >
                            {stop.destinationName}
                          </span>
                        ))}
                        {trip.stops.length > 4 && (
                          <span 
                            className="text-xs font-medium"
                            style={{ color: 'var(--lokadia-gray-500)' }}
                          >
                            +{trip.stops.length - 4} autres
                          </span>
                        )}
                      </div>
                    )}

                    {/* Progression checklist élégante */}
                    {activeTab === 'upcoming' && trip.checklistProgress.total > 0 && (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 
                          size={18} 
                          style={{ color: 'var(--lokadia-success)' }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span 
                              className="font-medium"
                              style={{ color: 'var(--lokadia-gray-700)' }}
                            >
                              Préparation
                            </span>
                            <span 
                              className="font-semibold"
                              style={{ color: 'var(--lokadia-success)' }}
                            >
                              {trip.checklistProgress.completed}/{trip.checklistProgress.total}
                            </span>
                          </div>
                          <div 
                            className="h-2.5 rounded-full overflow-hidden"
                            style={{ backgroundColor: 'var(--lokadia-gray-200)' }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: 'var(--gradient-success)' }}
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${(trip.checklistProgress.completed / trip.checklistProgress.total) * 100}%`
                              }}
                              transition={{ duration: 0.6, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
            
            {/* Bouton pour ajouter un nouveau voyage */}
            {activeTab === 'upcoming' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  delay: displayTrips.length * 0.08
                }}
              >
                <button
                  onClick={() => navigate("/trips/create")}
                  className="w-full bg-white rounded-3xl p-6 border-2 border-dashed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ 
                    borderColor: 'var(--lokadia-primary)',
                    backgroundColor: 'rgba(15, 76, 129, 0.02)',
                  }}
                >
                  <div className="flex flex-col items-center justify-center gap-3 py-4">
                    <div 
                      className="rounded-full p-4"
                      style={{ 
                        background: 'var(--gradient-primary)',
                      }}
                    >
                      <Plus size={28} strokeWidth={2.5} className="text-white" />
                    </div>
                    <div className="text-center">
                      <h3 
                        className="text-lg font-bold mb-1"
                        style={{ color: 'var(--lokadia-deep-blue)' }}
                      >
                        Créer un nouveau voyage
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--lokadia-text-light)' }}
                      >
                        Planifiez votre prochaine destination
                      </p>
                    </div>
                  </div>
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}