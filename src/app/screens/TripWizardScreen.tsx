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
import { BOOKING_PARTNERS } from '../components/PartnerBookingSection';
import { FlightOffers } from '../components/FlightOffers';
import { HotelOffers } from '../components/HotelOffers';
import { generateFlightOffers, generateHotelOffers, computeBudgetEstimate, DEPARTURE_CITIES } from '../lib/travelOffers';
import { getCoherentCountries } from '../data/countryNeighbors';

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
  const [arrivalCities, setArrivalCities] = useState<string[]>([]);
  // Ville principale = premier élément de arrivalCities (utilisée pour vols/hôtels)
  const arrivalCity = arrivalCities[0] || '';
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [tripType, setTripType] = useState<'solo' | 'couple' | 'family' | 'friends'>('solo');
  const [pace, setPace] = useState<'relax' | 'normal' | 'intense'>('normal');
  const [interests, setInterests] = useState<string[]>([]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [departureCityId, setDepartureCityId] = useState('paris');
  const [departureSearch, setDepartureSearch] = useState('Paris');
  const [showDepartureDropdown, setShowDepartureDropdown] = useState(false);

  // États pour la recherche
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const allInterests = ['culture', 'nature', 'food', 'nightlife', 'adventure', 'shopping', 'history', 'art'];

  // Pays cohérents = pays des villes d'arrivée + pays voisins (pour filtrer étapes)
  const itineraryCountries = arrivalCities.map(id => allDestinations[id]?.country).filter(Boolean);
  const coherentCountries = getCoherentCountries(itineraryCountries);

  // Pré-remplir le formulaire avec la destination passée
  useEffect(() => {
    if (passedDestination && !isEditMode) {
      console.log('🎯 Destination pré-remplie depuis fiche destination:', passedDestination);
      setArrivalCities([passedDestination.id]);
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
      setArrivalCities([trip.destinationId]);
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

        // Étapes = villes d'arrivée secondaires + étapes additionnelles (dédupliquées)
        const allStops = Array.from(new Set([
          ...arrivalCities.slice(1),
          ...selectedStops,
        ]));
        for (const stopId of allStops) {
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

  // Réinitialiser arrivalCities quand le pays change
  const handleCountryChange = (country: string) => {
    setMainDestination(country);
    setArrivalCities([]);
    setSelectedStops([]);
  };

  // Ajouter / retirer une ville d'arrivée (la première = destination principale)
  const toggleArrivalCity = (cityId: string) => {
    setArrivalCities((prev) =>
      prev.includes(cityId) ? prev.filter((c) => c !== cityId) : [...prev, cityId]
    );
  };

  const canProceed = () => {
    if (currentStep === 1) return mainDestination && arrivalCities.length > 0;
    if (currentStep === 2) return startDate && endDate && travelers > 0 && !!departureCityId;
    if (currentStep === 3) return interests.length > 0;
    if (currentStep === 4) return true; // étapes additionnelles optionnelles
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
        <p className="text-white/90 text-base mb-4">
          {['Destination', 'Dates & voyageurs', 'Profil', 'Étapes', 'Récapitulatif & offres'][currentStep - 1]}
          {' · '}
          <span className="text-white/70">Étape {currentStep} sur 5</span>
        </p>

        {/* Progress bar avec points d'étape */}
        <div className="relative">
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <motion.div
              className="h-full"
              style={{ background: 'var(--gradient-secondary)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-0.5">
            {[1, 2, 3, 4, 5].map((s) => {
              const done = s <= currentStep;
              return (
                <motion.div
                  key={s}
                  animate={{ scale: s === currentStep ? 1.25 : 1 }}
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: done ? '#fff' : 'rgba(255,255,255,0.35)',
                    boxShadow: s === currentStep ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
                  }}
                />
              );
            })}
          </div>
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
                  Villes visitées
                </h2>
                <p
                  className="text-sm mb-4"
                  style={{ color: 'var(--lokadia-gray-600)' }}
                >
                  Sélectionne une ou plusieurs villes en {mainDestination}. La 1ʳᵉ = destination principale.
                </p>

                {/* Chips des villes sélectionnées */}
                {arrivalCities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {arrivalCities.map((id, idx) => (
                      <motion.button
                        key={id}
                        onClick={() => toggleArrivalCity(id)}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
                        style={{
                          background: idx === 0 ? 'var(--gradient-primary)' : 'var(--lokadia-category-accommodation-bg)',
                          color: idx === 0 ? '#fff' : 'var(--lokadia-category-accommodation)',
                        }}
                      >
                        <span
                          className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                          style={{
                            background: idx === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(15,76,129,0.12)',
                          }}
                        >
                          {idx + 1}
                        </span>
                        {allDestinations[id]?.name || id}
                        {idx === 0 && <span className="text-[10px] uppercase opacity-80">Principale</span>}
                        <span className="ml-1 opacity-70">✕</span>
                      </motion.button>
                    ))}
                  </div>
                )}
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
                        .map(([id, dest]) => {
                          const selected = arrivalCities.includes(id);
                          return (
                          <button
                            key={id}
                            onClick={() => {
                              toggleArrivalCity(id);
                              setCitySearch('');
                            }}
                            className={`w-full p-4 text-left transition-all border-b flex items-center justify-between ${selected ? 'font-semibold' : ''}`}
                            style={{
                              backgroundColor: selected
                                ? 'var(--lokadia-category-accommodation-bg)'
                                : 'white',
                              color: selected
                                ? 'var(--lokadia-category-accommodation)'
                                : 'var(--lokadia-gray-700)',
                              borderColor: 'var(--lokadia-gray-100)'
                            }}
                          >
                            <span>{dest.name}</span>
                            {selected && <Check size={18} />}
                          </button>
                          );
                        })}
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
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--lokadia-gray-900)' }}
              >
                D'où partez-vous ?
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--lokadia-gray-600)' }}>
                Nécessaire pour calculer le prix des vols en temps réel.
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
                    value={departureSearch}
                    onChange={(e) => {
                      setDepartureSearch(e.target.value);
                      setShowDepartureDropdown(true);
                    }}
                    onFocus={() => setShowDepartureDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDepartureDropdown(false), 200)}
                    className="w-full pl-12 pr-4 py-4 border rounded-2xl text-lg focus:outline-none transition-all"
                    style={{
                      borderColor: 'var(--lokadia-gray-300)',
                      backgroundColor: 'white',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    placeholder="Ville de départ (Paris, Lyon, Londres...)"
                  />
                </div>
                {showDepartureDropdown && (
                  <motion.div
                    className="absolute z-10 top-full left-0 right-0 mt-2 bg-white border rounded-2xl max-h-60 overflow-y-auto"
                    style={{ borderColor: 'var(--lokadia-gray-200)', boxShadow: 'var(--shadow-lg)' }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {DEPARTURE_CITIES
                      .filter((c) =>
                        departureSearch.length === 0 ||
                        c.label.toLowerCase().includes(departureSearch.toLowerCase())
                      )
                      .map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setDepartureCityId(c.id);
                            setDepartureSearch(c.label);
                            setShowDepartureDropdown(false);
                          }}
                          className={`w-full p-4 text-left transition-all border-b flex items-center justify-between ${departureCityId === c.id ? 'font-semibold' : ''}`}
                          style={{
                            backgroundColor: departureCityId === c.id ? 'var(--lokadia-category-accommodation-bg)' : 'white',
                            color: departureCityId === c.id ? 'var(--lokadia-category-accommodation)' : 'var(--lokadia-gray-700)',
                            borderColor: 'var(--lokadia-gray-100)',
                          }}
                        >
                          <span>{c.label}</span>
                          <span className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-400)' }}>
                            {c.iata}
                          </span>
                        </button>
                      ))}
                  </motion.div>
                )}
              </div>
            </div>

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
                Complète ton itinéraire
              </h2>
              <p
                className="mb-4"
                style={{ color: 'var(--lokadia-gray-600)' }}
              >
                Villes proches de ta destination — même pays et pays voisins.
              </p>

              {/* Chips villes déjà dans l'itinéraire */}
              {(arrivalCities.length > 0 || selectedStops.length > 0) && (
                <div className="mb-4 p-3 rounded-2xl" style={{ background: 'var(--lokadia-gray-50, #F8FAFC)' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--lokadia-gray-500)' }}>
                    Ton itinéraire
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[...arrivalCities, ...selectedStops].map((id, idx) => (
                      <span
                        key={id}
                        className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                        style={{
                          background: idx === 0 ? 'var(--gradient-primary)' : 'var(--lokadia-category-accommodation-bg)',
                          color: idx === 0 ? '#fff' : 'var(--lokadia-category-accommodation)',
                        }}
                      >
                        <span className="text-[9px] opacity-80">{idx + 1}</span>
                        {allDestinations[id]?.name || id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recherche globale d'étapes */}
              <div className="relative mb-3">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={20}
                  style={{ color: 'var(--lokadia-gray-400)' }}
                />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border rounded-2xl text-base focus:outline-none transition-all"
                  style={{
                    borderColor: 'var(--lokadia-gray-300)',
                    backgroundColor: 'white',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                  placeholder="Rechercher une ville..."
                />
              </div>

              <div className="space-y-2">
                {availableDestinations
                  .filter(([id, dest]) =>
                    !arrivalCities.includes(id) &&
                    coherentCountries.has(dest.country) &&
                    (citySearch.length === 0 ||
                      dest.name.toLowerCase().includes(citySearch.toLowerCase()) ||
                      dest.country.toLowerCase().includes(citySearch.toLowerCase()))
                  )
                  .sort((a, b) => {
                    // Prioriser le même pays, puis voisins
                    const aOwn = itineraryCountries.includes(a[1].country) ? 0 : 1;
                    const bOwn = itineraryCountries.includes(b[1].country) ? 0 : 1;
                    return aOwn - bOwn || a[1].name.localeCompare(b[1].name);
                  })
                  .slice(0, citySearch.length > 0 ? 30 : 15)
                  .map(([id, dest]) => (
                    <motion.button
                      key={id}
                      onClick={() => toggleStop(id)}
                      className="w-full p-3 rounded-2xl border-2 font-semibold text-left transition-all flex items-center justify-between"
                      style={{
                        borderColor: selectedStops.includes(id) ? 'var(--lokadia-secondary)' : 'var(--lokadia-gray-200)',
                        backgroundColor: selectedStops.includes(id) ? 'var(--lokadia-category-accommodation-bg)' : 'white',
                        color: selectedStops.includes(id) ? 'var(--lokadia-secondary)' : 'var(--lokadia-gray-700)',
                        boxShadow: selectedStops.includes(id) ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                      }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm">{dest.name}</span>
                        <span className="text-[10px] font-normal" style={{ color: 'var(--lokadia-gray-500)' }}>
                          {dest.country}
                        </span>
                      </div>
                      {selectedStops.includes(id) && <Check size={18} />}
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
                  Destination principale
                </p>
                <p
                  className="font-bold text-lg"
                  style={{ color: 'var(--lokadia-gray-900)' }}
                >
                  {allDestinations[arrivalCity]?.name}, {mainDestination}
                  {arrivalCities.length > 1 && (
                    <span className="ml-2 text-sm font-semibold" style={{ color: 'var(--lokadia-secondary)' }}>
                      +{arrivalCities.length - 1} ville{arrivalCities.length > 2 ? 's' : ''}
                    </span>
                  )}
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
                  Itinéraire ({arrivalCities.length + selectedStops.length} ville{arrivalCities.length + selectedStops.length > 1 ? 's' : ''})
                </p>
                <div className="flex flex-wrap gap-2">
                  {[...arrivalCities, ...selectedStops].map((id, idx) => (
                    <span
                      key={id}
                      className="px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5"
                      style={{
                        background: idx === 0 ? 'var(--gradient-primary)' : 'var(--lokadia-category-accommodation-bg)',
                        color: idx === 0 ? '#fff' : 'var(--lokadia-category-accommodation)',
                      }}
                    >
                      <span className="text-[10px] opacity-80">{idx + 1}</span>
                      {allDestinations[id]?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Offres vols + hôtels + budget — driver de commission */}
            {(() => {
              if (!startDate || !endDate || !arrivalCity) return null;
              const destName = allDestinations[arrivalCity]?.name || arrivalCity;
              const depCity = DEPARTURE_CITIES.find((c) => c.id === departureCityId) || DEPARTURE_CITIES[0];
              const flights = generateFlightOffers({
                destinationId: arrivalCity,
                destinationName: destName,
                startDate,
                endDate,
                travelers,
                originIata: depCity.iata,
              });
              const hotels = generateHotelOffers({
                destinationId: arrivalCity,
                destinationName: destName,
                startDate,
                endDate,
                travelers,
              });
              const nights = Math.max(1, Math.round(
                (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000
              ));
              const budget = computeBudgetEstimate({
                flightPrice: flights[0].price,
                hotelTotal: hotels[0].totalPrice,
                travelers,
                nights,
              });

              return (
                <>
                  {/* Vols */}
                  <div className="mt-8">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                          ✈️ Vols suggérés
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                          {depCity.label} → {destName} · aller-retour
                        </p>
                      </div>
                    </div>
                    <FlightOffers offers={flights} travelers={travelers} />
                  </div>

                  {/* Hôtels */}
                  <div className="mt-8">
                    <div className="flex items-end justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                          🏨 Hôtels à {destName}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                          {nights} nuit{nights > 1 ? 's' : ''} · {travelers} voyageur{travelers > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <HotelOffers offers={hotels} nights={nights} />
                  </div>

                  {/* Budget estimé */}
                  <div
                    className="mt-8 rounded-3xl p-5 text-white"
                    style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-lg)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">💰 Budget estimé</h3>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">hors essentiels</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="opacity-85">Vols ({travelers}×)</span><span className="font-semibold">{budget.flights}€</span></div>
                      <div className="flex justify-between"><span className="opacity-85">Hôtel ({nights} nuits)</span><span className="font-semibold">{budget.hotel}€</span></div>
                      <div className="flex justify-between"><span className="opacity-85">Restauration</span><span className="font-semibold">{budget.food}€</span></div>
                      <div className="flex justify-between"><span className="opacity-85">Activités</span><span className="font-semibold">{budget.activities}€</span></div>
                      <div className="h-px my-2" style={{ background: 'rgba(255,255,255,0.25)' }} />
                      <div className="flex justify-between text-base">
                        <span className="font-bold">Total estimé</span>
                        <span className="font-bold text-2xl">{budget.total}€</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Essentiels sécurité — driver de commission */}
            <div className="mt-8">
              <div className="mb-4">
                <h3
                  className="text-lg font-bold"
                  style={{ color: 'var(--lokadia-gray-900)' }}
                >
                  🛡️ Sécurise les essentiels
                </h3>
                <p className="text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>
                  e-SIM, assurance et activités — en 2 clics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {BOOKING_PARTNERS.filter((p) => ['esim', 'insurance', 'activity'].includes(p.id)).map((p) => {
                  const Icon = p.icon;
                  return (
                    <a
                      key={p.id}
                      href={p.href}
                      target="_blank"
                      rel="noopener nofollow sponsored"
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white transition-all hover:-translate-y-0.5"
                      style={{
                        border: '1px solid var(--lokadia-gray-200)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: p.bg }}
                      >
                        <Icon className="h-4 w-4" style={{ color: p.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs leading-tight" style={{ color: 'var(--lokadia-gray-900)' }}>
                          {p.label}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: p.color }}>
                          {p.provider}
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--lokadia-gray-400)' }} />
                    </a>
                  );
                })}
              </div>

              <p className="mt-3 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                Lokadia reste 100 % gratuit. Liens partenaires — nous sommes rémunérés par nos partenaires.
              </p>
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