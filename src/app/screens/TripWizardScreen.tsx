import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Search, 
  Sparkles,
  User,
  Users,
  UsersRound,
  Heart,
  Palmtree,
  Scale,
  Zap,
  Landmark,
  Trees,
  UtensilsCrossed,
  Music,
  Mountain,
  ShoppingBag,
  BookOpen,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { allDestinations } from '../data/allDestinations';
import { destinationCoordinates } from '../data/destinationCoordinates';
import { createTrip, getTripById, updateTrip } from '../lib/tripService';
import { addStopToTrip, getTripStops } from '../lib/tripStopService';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../context/AuthContext';
import { EmirateDatePicker } from '../components/EmirateDatePicker';

type Step = 1 | 2 | 3 | 4 | 5;

export default function TripWizardScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEditMode = !!tripId;

  // Récupérer la destination passée depuis DestinationScreen
  const passedDestination = (location.state as { destination?: { id: string; name: string; country: string } })?.destination;

  // Données du formulaire
  const [mainDestination, setMainDestination] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [tripType, setTripType] = useState<'solo' | 'couple' | 'family' | 'friends'>('solo');
  const [pace, setPace] = useState<'relax' | 'normal' | 'intense'>('normal');
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);

  // États pour la recherche
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const allInterests = ['culture', 'nature', 'food', 'nightlife', 'adventure', 'shopping', 'history', 'art'];

  // Pré-remplir le formulaire avec la destination passée
  useEffect(() => {
    if (passedDestination && !isEditMode) {
      console.log('🎯 Destination pré-remplie depuis fiche destination:', passedDestination);
      setArrivalCity(passedDestination.id);
      setCitySearch(passedDestination.name);
      setMainDestination(passedDestination.country);
      setCountrySearch(passedDestination.country);
    }
  }, [passedDestination, isEditMode]);

  // Charger les données du voyage en mode édition
  useEffect(() => {
    if (isEditMode && tripId) {
      loadTripData();
    }
  }, [isEditMode, tripId]);

  async function loadTripData() {
    try {
      setLoading(true);
      const trip = await getTripById(tripId!);
      
      if (!trip) {
        alert('Voyage introuvable');
        navigate('/trips');
        return;
      }

      const stops = await getTripStops(tripId!);

      // Pré-remplir le formulaire avec les données existantes
      setMainDestination(allDestinations[trip.destinationId]?.country || '');
      setArrivalCity(trip.destinationId);
      setCountrySearch(allDestinations[trip.destinationId]?.country || '');
      setCitySearch(trip.destinationName);
      setStartDate(trip.startDate.split('T')[0]);
      setEndDate(trip.endDate.split('T')[0]);
      setTravelers(trip.travelers);
      
      if (trip.travelerProfile) {
        setTripType(trip.travelerProfile.type || 'solo');
        setPace(trip.travelerProfile.pace || 'normal');
        setInterests(trip.travelerProfile.interests || []);
      }
      
      setSelectedStops(stops.map(stop => stop.destinationId));
    } catch (error) {
      console.error('Erreur chargement voyage:', error);
      alert('Erreur lors du chargement du voyage');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  }

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleStop = (stopId: string) => {
    setSelectedStops(prev =>
      prev.includes(stopId) ? prev.filter(s => s !== stopId) : [...prev, stopId]
    );
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleCreateTrip = async () => {
    try {
      setCreating(true);
      if (!user) {
        alert('Veuillez vous connecter');
        return;
      }

      if (isEditMode && tripId) {
        // Mode édition: mettre à jour le voyage existant
        await updateTrip(tripId, {
          destinationId: arrivalCity,
          destinationName: allDestinations[arrivalCity]?.name || 'Voyage',
          countryDestinationId: arrivalCity,
          startDate,
          endDate,
          travelers,
          travelerProfile: {
            type: tripType,
            pace,
            interests,
          },
        });

        // TODO: Gérer la mise à jour des étapes
        // Pour l'instant, on conserve les étapes existantes
        
        console.log('✅ Voyage modifié avec succès:', tripId);
        navigate(`/trips/${tripId}`);
      } else {
        // Mode création: créer un nouveau voyage
        const trip = await createTrip({
          userId: user.id,
          destinationId: arrivalCity,
          destinationName: allDestinations[arrivalCity]?.name || 'Voyage',
          countryDestinationId: arrivalCity,
          startDate,
          endDate,
          travelers,
          travelerProfile: {
            type: tripType,
            pace,
            interests,
          },
          status: 'planned',
        });

        // Ajouter les étapes
        for (const stopId of selectedStops) {
          const coords = destinationCoordinates[stopId];
          await addStopToTrip(
            trip.id,
            stopId,
            allDestinations[stopId]?.name || stopId,
            coords?.lat,
            coords?.lon
          );
        }

        console.log('✅ Voyage créé avec succès:', trip.id);
        navigate(`/trips/${trip.id}`);
      }
    } catch (error) {
      console.error('Erreur création/modification voyage:', error);
      alert(`Erreur lors de la ${isEditMode ? 'modification' : 'création'} du voyage`);
    } finally {
      setCreating(false);
    }
  };

  // Extraire les pays uniques des destinations
  const availableDestinations = Object.entries(allDestinations).filter(
    ([id]) => destinationCoordinates[id]
  );

  // Créer une liste de pays uniques
  const uniqueCountries = Array.from(
    new Set(availableDestinations.map(([_, dest]) => dest.country))
  ).sort();

  // Obtenir les destinations d'un pays spécifique
  const getCountryDestinations = (country: string) => {
    return availableDestinations.filter(([_, dest]) => dest.country === country);
  };

  // Réinitialiser arrivalCity quand le pays change
  const handleCountryChange = (country: string) => {
    setMainDestination(country);
    setArrivalCity('');
    setSelectedStops([]);
  };

  const canProceed = () => {
    if (currentStep === 1) return mainDestination && arrivalCity;
    if (currentStep === 2) return startDate && endDate && travelers > 0;
    if (currentStep === 3) return interests.length > 0;
    if (currentStep === 4) return selectedStops.length > 0;
    return true;
  };

  // Afficher un loader pendant le chargement des données en mode édition
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
            Chargement du voyage...
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
      {/* Header avec dégradé premium */}
      <motion.div 
        className="text-white px-6 py-8"
        style={{ 
          background: 'var(--gradient-primary)',
          borderBottomLeftRadius: '2rem',
          borderBottomRightRadius: '2rem',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 mb-4 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Retour</span>
        </button>
        <h1 className="text-3xl font-bold mb-2">
          {isEditMode ? 'Modifier mon voyage' : 'Créer mon voyage'}
        </h1>
        <p className="text-white/90 text-base mb-4">Étape {currentStep} sur 5</p>

        {/* Progress bar élégant */}
        <div 
          className="h-2.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <motion.div
            className="h-full"
            style={{ background: 'var(--gradient-secondary)' }}
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 5) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      <div className="px-6 py-6">
        {/* Étape 1: Destination */}
        {currentStep === 1 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                Quelle est votre destination principale ?
              </h2>
              <p 
                className="text-sm mb-4"
                style={{ color: 'var(--lokadia-gray-600)' }}
              >
                Commencez par choisir votre pays de destination
              </p>
              <div className="relative">
                <div className="relative">
                  <Search 
                    className="absolute left-4 top-1/2 -translate-y-1/2" 
                    size={20}
                    style={{ color: 'var(--lokadia-gray-400)' }}
                  />
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => {
                      setCountrySearch(e.target.value);
                      setShowCountryDropdown(true);
                    }}
                    onFocus={() => setShowCountryDropdown(true)}
                    onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                    className="w-full pl-12 pr-4 py-4 border rounded-2xl text-lg focus:outline-none transition-all"
                    style={{ 
                      borderColor: 'var(--lokadia-gray-300)',
                      backgroundColor: 'white',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                    placeholder="Rechercher un pays..."
                  />
                </div>
                {showCountryDropdown && (
                  <motion.div 
                    className="absolute z-10 top-full left-0 right-0 mt-2 bg-white border rounded-2xl max-h-60 overflow-y-auto"
                    style={{ 
                      borderColor: 'var(--lokadia-gray-200)',
                      boxShadow: 'var(--shadow-lg)'
                    }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {uniqueCountries
                      .filter(country => 
                        countrySearch.length === 0 || 
                        country.toLowerCase().includes(countrySearch.toLowerCase())
                      )
                      .map(country => (
                        <button
                          key={country}
                          onClick={() => {
                            handleCountryChange(country);
                            setCountrySearch(country);
                            setCitySearch('');
                            setShowCountryDropdown(false);
                          }}
                          className={`w-full p-4 text-left transition-all border-b ${mainDestination === country ? 'font-semibold' : ''}`}
                          style={{
                            backgroundColor: mainDestination === country 
                              ? 'var(--lokadia-category-accommodation-bg)' 
                              : 'white',
                            color: mainDestination === country 
                              ? 'var(--lokadia-category-accommodation)' 
                              : 'var(--lokadia-gray-700)',
                            borderColor: 'var(--lokadia-gray-100)'
                          }}
                        >
                          {country}
                        </button>
                      ))}
                    {uniqueCountries.filter(country => 
                      countrySearch.length === 0 || 
                      country.toLowerCase().includes(countrySearch.toLowerCase())
                    ).length === 0 && (
                      <div 
                        className="p-4 text-center"
                        style={{ color: 'var(--lokadia-gray-500)' }}
                      >
                        Aucun pays trouvé
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>

            {mainDestination && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 
                  className="text-2xl font-bold mb-2"
                  style={{ color: 'var(--lokadia-gray-900)' }}
                >
                  Ville d'arrivée
                </h2>
                <p 
                  className="text-sm mb-4"
                  style={{ color: 'var(--lokadia-gray-600)' }}
                >
                  Sélectionnez votre ville d'arrivée en {mainDestination}
                </p>
                <div className="relative">
                  <div className="relative">
                    <Search 
                      className="absolute left-4 top-1/2 -translate-y-1/2" 
                      size={20}
                      style={{ color: 'var(--lokadia-gray-400)' }}
                    />
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                      className="w-full pl-12 pr-4 py-4 border rounded-2xl text-lg focus:outline-none transition-all"
                      style={{ 
                        borderColor: 'var(--lokadia-gray-300)',
                        backgroundColor: 'white',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      placeholder="Rechercher une ville..."
                    />
                  </div>
                  {showCityDropdown && (
                    <motion.div 
                      className="absolute z-10 top-full left-0 right-0 mt-2 bg-white border rounded-2xl max-h-60 overflow-y-auto"
                      style={{ 
                        borderColor: 'var(--lokadia-gray-200)',
                        boxShadow: 'var(--shadow-lg)'
                      }}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {getCountryDestinations(mainDestination)
                        .filter(([id, dest]) => 
                          citySearch.length === 0 || 
                          dest.name.toLowerCase().includes(citySearch.toLowerCase())
                        )
                        .map(([id, dest]) => (
                          <button
                            key={id}
                            onClick={() => {
                              setArrivalCity(id);
                              setCitySearch(dest.name);
                              setShowCityDropdown(false);
                            }}
                            className={`w-full p-4 text-left transition-all border-b ${arrivalCity === id ? 'font-semibold' : ''}`}
                            style={{
                              backgroundColor: arrivalCity === id 
                                ? 'var(--lokadia-category-accommodation-bg)' 
                                : 'white',
                              color: arrivalCity === id 
                                ? 'var(--lokadia-category-accommodation)' 
                                : 'var(--lokadia-gray-700)',
                              borderColor: 'var(--lokadia-gray-100)'
                            }}
                          >
                            {dest.name}
                          </button>
                        ))}
                      {getCountryDestinations(mainDestination)
                        .filter(([id, dest]) => 
                          citySearch.length === 0 || 
                          dest.name.toLowerCase().includes(citySearch.toLowerCase())
                        ).length === 0 && (
                        <div 
                          className="p-4 text-center"
                          style={{ color: 'var(--lokadia-gray-500)' }}
                        >
                          Aucune ville trouvée
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Étape 2: Dates et voyageurs */}
        {currentStep === 2 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                Quand partez-vous ?
              </h2>
              <EmirateDatePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>

            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                Combien de voyageurs ?
              </h2>
              <input
                type="number"
                min="1"
                max="20"
                value={travelers}
                onChange={(e) => setTravelers(parseInt(e.target.value) || 1)}
                className="w-full p-4 border rounded-2xl text-lg focus:outline-none transition-all"
                style={{ 
                  borderColor: 'var(--lokadia-gray-300)',
                  backgroundColor: 'white',
                  boxShadow: 'var(--shadow-sm)',
                  color: 'var(--lokadia-gray-900)'
                }}
              />
            </div>

            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                Type de voyage
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {(['solo', 'couple', 'family', 'friends'] as const).map((type) => (
                  <motion.button
                    key={type}
                    onClick={() => setTripType(type)}
                    className="p-4 rounded-2xl border-2 font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      borderColor: tripType === type ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)',
                      backgroundColor: tripType === type ? 'var(--lokadia-info-bg)' : 'white',
                      color: tripType === type ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-700)',
                      boxShadow: tripType === type ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {type === 'solo' && <User size={18} />}
                    {type === 'couple' && <Heart size={18} />}
                    {type === 'family' && <UsersRound size={18} />}
                    {type === 'friends' && <Users size={18} />}
                    {type === 'solo' ? 'Solo' :
                     type === 'couple' ? 'En couple' :
                     type === 'family' ? 'Famille' : 'Amis'}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Étape 3: Rythme et intérêts */}
        {currentStep === 3 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                Quel rythme de voyage ?
              </h2>
              <div className="space-y-3">
                {(['relax', 'normal', 'intense'] as const).map((p) => (
                  <motion.button
                    key={p}
                    onClick={() => setPace(p)}
                    className="w-full p-4 rounded-2xl border-2 font-semibold text-left transition-all flex items-center gap-3"
                    style={{
                      borderColor: pace === p ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)',
                      backgroundColor: pace === p ? 'var(--lokadia-info-bg)' : 'white',
                      color: pace === p ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-700)',
                      boxShadow: pace === p ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                    }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {p === 'relax' && <Palmtree size={20} />}
                    {p === 'normal' && <Scale size={20} />}
                    {p === 'intense' && <Zap size={20} />}
                    <span>
                      {p === 'relax' ? 'Relax - Profiter sans se presser' :
                       p === 'normal' ? 'Normal - Équilibre visites / repos' :
                       'Intense - Voir un maximum'}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                Vos centres d'intérêt
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {allInterests.map((interest) => {
                  const getInterestIcon = () => {
                    switch(interest) {
                      case 'culture': return <Landmark size={16} />;
                      case 'nature': return <Trees size={16} />;
                      case 'food': return <UtensilsCrossed size={16} />;
                      case 'nightlife': return <Music size={16} />;
                      case 'adventure': return <Mountain size={16} />;
                      case 'shopping': return <ShoppingBag size={16} />;
                      case 'history': return <BookOpen size={16} />;
                      case 'art': return <Palette size={16} />;
                      default: return null;
                    }
                  };

                  const getInterestLabel = () => {
                    switch(interest) {
                      case 'culture': return 'Culture';
                      case 'nature': return 'Nature';
                      case 'food': return 'Gastronomie';
                      case 'nightlife': return 'Vie nocturne';
                      case 'adventure': return 'Aventure';
                      case 'shopping': return 'Shopping';
                      case 'history': return 'Histoire';
                      case 'art': return 'Art';
                      default: return interest;
                    }
                  };

                  return (
                    <motion.button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className="p-3 rounded-2xl border-2 font-medium transition-all flex items-center justify-center gap-2"
                      style={{
                        borderColor: interests.includes(interest) ? 'var(--lokadia-secondary)' : 'var(--lokadia-gray-200)',
                        backgroundColor: interests.includes(interest) ? 'var(--lokadia-category-accommodation-bg)' : 'white',
                        color: interests.includes(interest) ? 'var(--lokadia-secondary)' : 'var(--lokadia-gray-700)',
                        boxShadow: interests.includes(interest) ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {getInterestIcon()}
                      <span>{getInterestLabel()}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Étape 4: Sélection des étapes */}
        {currentStep === 4 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                Sélectionnez vos étapes
              </h2>
              <p 
                className="mb-4"
                style={{ color: 'var(--lokadia-gray-600)' }}
              >
                Choisissez les villes que vous souhaitez visiter
              </p>
              <div className="space-y-3">
                {getCountryDestinations(mainDestination).map(([id, dest]) => (
                  <motion.button
                    key={id}
                    onClick={() => toggleStop(id)}
                    className="w-full p-4 rounded-2xl border-2 font-semibold text-left transition-all flex items-center justify-between"
                    style={{
                      borderColor: selectedStops.includes(id) ? 'var(--lokadia-secondary)' : 'var(--lokadia-gray-200)',
                      backgroundColor: selectedStops.includes(id) ? 'var(--lokadia-category-accommodation-bg)' : 'white',
                      color: selectedStops.includes(id) ? 'var(--lokadia-secondary)' : 'var(--lokadia-gray-700)',
                      boxShadow: selectedStops.includes(id) ? 'var(--shadow-md)' : 'var(--shadow-sm)'
                    }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span>{dest.name}</span>
                    {selectedStops.includes(id) && <Check size={20} />}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Étape 5: Récapitulatif */}
        {currentStep === 5 && (
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 
              className="text-2xl font-bold mb-4"
              style={{ color: 'var(--lokadia-gray-900)' }}
            >
              Récapitulatif
            </h2>
            
            <div 
              className="bg-white border rounded-3xl p-6 space-y-4"
              style={{ 
                borderColor: 'var(--lokadia-gray-200)',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ color: 'var(--lokadia-gray-600)' }}
                >
                  Destination
                </p>
                <p 
                  className="font-bold text-lg"
                  style={{ color: 'var(--lokadia-gray-900)' }}
                >
                  {allDestinations[arrivalCity]?.name}, {mainDestination}
                </p>
              </div>
              <div 
                className="h-px"
                style={{ backgroundColor: 'var(--lokadia-gray-200)' }}
              />
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ color: 'var(--lokadia-gray-600)' }}
                >
                  Dates
                </p>
                <p 
                  className="font-semibold"
                  style={{ color: 'var(--lokadia-gray-900)' }}
                >
                  {new Date(startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  {' → '}
                  {new Date(endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div 
                className="h-px"
                style={{ backgroundColor: 'var(--lokadia-gray-200)' }}
              />
              <div>
                <p 
                  className="text-sm mb-1"
                  style={{ color: 'var(--lokadia-gray-600)' }}
                >
                  Voyageurs
                </p>
                <p 
                  className="font-semibold"
                  style={{ color: 'var(--lokadia-gray-900)' }}
                >
                  {travelers} personne{travelers > 1 ? 's' : ''}
                </p>
              </div>
              <div 
                className="h-px"
                style={{ backgroundColor: 'var(--lokadia-gray-200)' }}
              />
              <div>
                <p 
                  className="text-sm mb-2"
                  style={{ color: 'var(--lokadia-gray-600)' }}
                >
                  Étapes ({selectedStops.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedStops.map(stopId => (
                    <span 
                      key={stopId} 
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: 'var(--lokadia-category-accommodation-bg)',
                        color: 'var(--lokadia-category-accommodation)'
                      }}
                    >
                      {allDestinations[stopId]?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <motion.button
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 border rounded-2xl font-semibold transition-colors"
              style={{
                borderColor: 'var(--lokadia-gray-300)',
                color: 'var(--lokadia-gray-700)',
                backgroundColor: 'white'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft size={20} />
              Retour
            </motion.button>
          )}
          
          {currentStep < 5 ? (
            <motion.button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all"
              style={{
                background: canProceed() ? 'var(--gradient-primary)' : 'var(--lokadia-gray-300)',
                color: canProceed() ? 'white' : 'var(--lokadia-gray-500)',
                cursor: canProceed() ? 'pointer' : 'not-allowed',
                boxShadow: canProceed() ? 'var(--shadow-lg)' : 'none'
              }}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
            >
              Suivant
              <ArrowRight size={20} />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleCreateTrip}
              disabled={creating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all"
              style={{
                background: creating ? 'var(--lokadia-gray-400)' : 'var(--gradient-success)',
                color: 'white',
                cursor: creating ? 'not-allowed' : 'pointer',
                boxShadow: creating ? 'none' : 'var(--shadow-lg)',
                opacity: creating ? 0.5 : 1
              }}
              whileTap={!creating ? { scale: 0.98 } : {}}
            >
              {creating ? (isEditMode ? 'Modification...' : 'Création...') : (
                <>
                  <Sparkles size={20} />
                  {isEditMode ? 'Enregistrer les modifications' : 'Créer mon voyage'}
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}