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
      className="min-h-screen pb-20"
      style={{ background: 'var(--lokadia-background)' }}
    >
      {/* ───────── HEADER plus compact (py-12 → py-8), tabs intégrés en bas ───────── */}
      <motion.div
        className="text-white px-5 pt-7 pb-6 relative overflow-hidden lk-fade-in-down"
        style={{
          borderBottomLeftRadius: '1.5rem',
          borderBottomRightRadius: '1.5rem',
        }}
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
            background: 'linear-gradient(135deg, rgba(15,76,129,0.55) 0%, rgba(0,0,0,0.55) 100%)',
          }}
        />
        {/* Contenu compact */}
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-1 tracking-tight drop-shadow-lg">
            Mes voyages
          </h1>
          <p className="text-white/90 text-sm md:text-base drop-shadow">
            Gérez vos itinéraires et préparations
          </p>
        </div>
      </motion.div>

      {/* ───────── TABS premium glass — segmented control style ───────── */}
      <div className="max-w-7xl mx-auto px-5 pt-4 pb-3">
        <div
          className="inline-flex p-1 rounded-2xl gap-1 lk-fade-in-up"
          style={{ background: 'var(--lokadia-gray-100)' }}
        >
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`lk-btn relative px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'upcoming' ? 'shadow-md' : ''
            }`}
            style={{
              background: activeTab === 'upcoming' ? 'white' : 'transparent',
              color: activeTab === 'upcoming' ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-600)',
            }}
          >
            À venir
            {upcomingTrips.length > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums"
                style={{
                  background: activeTab === 'upcoming' ? 'var(--lokadia-info-bg)' : 'rgba(255,255,255,0.6)',
                  color: 'var(--lokadia-primary)',
                }}
              >
                {upcomingTrips.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`lk-btn relative px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 ${
              activeTab === 'past' ? 'shadow-md' : ''
            }`}
            style={{
              background: activeTab === 'past' ? 'white' : 'transparent',
              color: activeTab === 'past' ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-600)',
            }}
          >
            Passés
            {pastTrips.length > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums"
                style={{
                  background: activeTab === 'past' ? 'var(--lokadia-gray-100)' : 'rgba(255,255,255,0.6)',
                  color: 'var(--lokadia-gray-700)',
                }}
              >
                {pastTrips.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ───────── LISTE des voyages — grille md+ pour densité ───────── */}
      <div className="max-w-7xl mx-auto px-5 pt-2 pb-4 space-y-3">
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
                <div className="flex flex-col gap-3 items-center">
                  <button
                    onClick={() => navigate("/trips/map-planner")}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 text-white"
                    style={{
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      boxShadow: '0 10px 40px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <MapPin size={24} strokeWidth={2.5} />
                    Planifier sur la carte
                  </button>
                  <button
                    onClick={() => navigate("/trips/create")}
                    className="inline-flex items-center gap-3 px-7 py-3 rounded-2xl font-semibold text-sm transition-all duration-300"
                    style={{
                      background: 'white',
                      color: 'var(--lokadia-deep-blue)',
                      boxShadow: '0 6px 20px rgba(15, 76, 129, 0.15)',
                      border: '2px solid var(--lokadia-deep-blue)',
                    }}
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    Créer via le formulaire
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : (
          <>
            {/* ⭐ HERO : Planificateur sur la carte (visible pour les 2 onglets,
                permet de relancer un voyage depuis "Passés") */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-2"
              >
                <button
                  onClick={() => navigate("/trips/map-planner")}
                  className="w-full rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] text-left relative"
                  style={{
                    background: 'linear-gradient(135deg, #0F4C81 0%, #10B981 60%, #059669 100%)',
                    boxShadow: '0 16px 40px rgba(15, 76, 129, 0.30)',
                    minHeight: 180,
                  }}
                >
                  {/* Décoration : grille de carte stylisée */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-20"
                    viewBox="0 0 400 200"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="400" height="200" fill="url(#mapGrid)" />
                    <path
                      d="M 40 160 Q 100 100 180 110 T 360 50"
                      stroke="white" strokeWidth="3" fill="none"
                      strokeDasharray="6 4" strokeLinecap="round" opacity="0.6"
                    />
                    <circle cx="40"  cy="160" r="6" fill="white" />
                    <circle cx="180" cy="110" r="6" fill="white" />
                    <circle cx="360" cy="50"  r="6" fill="white" />
                  </svg>

                  {/* Badge "NOUVEAU" */}
                  <span
                    className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider"
                    style={{ background: '#FCD34D', color: '#78350F' }}
                  >
                    NOUVEAU
                  </span>

                  <div className="relative p-6 flex items-center gap-5">
                    <div
                      className="rounded-2xl p-4 flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
                    >
                      <MapPin size={36} strokeWidth={2.5} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-extrabold text-white mb-1 leading-tight">
                        {activeTab === 'past' ? 'Planifier un nouveau voyage' : 'Planifie ton voyage sur la carte'}
                      </h3>
                      <p className="text-sm text-white/90 mb-2.5 leading-snug">
                        {activeTab === 'past'
                          ? "Inspire-toi d'un voyage passé pour en créer un nouveau directement sur la carte."
                          : 'Clique, recherche, choisis tes étapes et tes modes de transport — tout depuis une carte interactive.'}
                      </p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/25 text-white text-xs font-bold backdrop-blur-sm">
                        Commencer
                        <ChevronRight size={14} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>

            {/* Grille de cards — 1 col mobile, 2 col md+, 3 col lg+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayTrips.map((trip, index) => {
                const status = getTripStatus(trip);
                const delayClass = `lk-delay-${Math.min((index % 6) + 1, 6)}`;
                return (
                  <div
                    key={trip.id}
                    className={`relative lk-fade-in-up ${delayClass}`}
                  >
                    {/* Bouton de suppression — plus discret en haut à droite */}
                    <button
                      onClick={(e) => handleDeleteTrip(trip.id, trip.destinationName, e)}
                      className="lk-btn absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      }}
                      title="Supprimer le voyage"
                      data-touch="compact"
                    >
                      <Trash2 size={14} style={{ color: '#EF4444' }} strokeWidth={2.5} />
                    </button>

                    <button
                      onClick={() => navigate(`/trips/${trip.id}`)}
                      className="lk-card-hover block bg-white rounded-2xl p-4 border w-full text-left h-full"
                      style={{
                        borderColor: 'var(--lokadia-gray-200)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div className="flex items-start gap-2 mb-2 pr-9">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold tracking-tight truncate" style={{ color: 'var(--lokadia-gray-900)' }}>
                            {trip.destinationName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: 'var(--lokadia-gray-500)' }}>
                            <Calendar size={12} />
                            <span className="font-medium tabular-nums">{formatDateRange(trip.startDate, trip.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status badge sous le titre */}
                      <span
                        className="lk-badge inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider"
                        style={{
                          color: status.color,
                          backgroundColor: status.bgColor,
                        }}
                      >
                        {status.icon}
                        {status.label}
                      </span>

                      {/* Étapes — pastilles compactes */}
                      {trip.stops.length > 0 && (
                        <div className="flex items-center gap-1 mt-3 flex-wrap">
                          <MapPin size={12} className="flex-shrink-0" style={{ color: 'var(--lokadia-secondary)' }} />
                          {trip.stops.slice(0, 3).map((stop) => (
                            <span
                              key={stop.id}
                              className="text-[10px] px-2 py-0.5 rounded-full font-semibold truncate max-w-[120px]"
                              style={{
                                backgroundColor: 'var(--lokadia-category-accommodation-bg)',
                                color: 'var(--lokadia-category-accommodation)',
                              }}
                            >
                              {stop.destinationName}
                            </span>
                          ))}
                          {trip.stops.length > 3 && (
                            <span className="text-[10px] font-semibold" style={{ color: 'var(--lokadia-gray-500)' }}>
                              +{trip.stops.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Progression checklist */}
                      {activeTab === 'upcoming' && trip.checklistProgress.total > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                          <CheckCircle2 size={14} style={{ color: 'var(--lokadia-success)' }} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-semibold" style={{ color: 'var(--lokadia-gray-600)' }}>
                                Préparation
                              </span>
                              <span className="font-bold tabular-nums" style={{ color: 'var(--lokadia-success)' }}>
                                {trip.checklistProgress.completed}/{trip.checklistProgress.total}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--lokadia-gray-200)' }}>
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: 'var(--gradient-success)' }}
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${(trip.checklistProgress.completed / trip.checklistProgress.total) * 100}%`,
                                }}
                                transition={{ duration: 0.6, delay: index * 0.05 }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer chevron — discret */}
                      <div className="flex justify-end mt-2">
                        <ChevronRight
                          size={14}
                          className="transition-transform duration-200 group-hover:translate-x-0.5"
                          style={{ color: 'var(--lokadia-gray-400)' }}
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            
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