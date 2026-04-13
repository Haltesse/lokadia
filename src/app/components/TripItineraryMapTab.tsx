import { MapPin, Navigation, ArrowRight, Plus, Clock, Info, DollarSign, CreditCard, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { generateStopSuggestions } from '../lib/tripBriefService';
import type { TripStop, TripSegment } from '../lib/tripStopService';

// Helper function pour les emojis de transport
function getTransportEmoji(mode: string): string {
  const emojis: Record<string, string> = {
    train: 'Train',
    bus: 'Bus',
    flight: 'Flight',
    car: 'Car',
    ferry: 'Ferry',
  };
  return emojis[mode] || 'Car';
}

// Helper function pour formater la durée
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins.toString().padStart(2, '0')}`;
}

interface Props {
  stops: TripStop[];
  segments: TripSegment[];
}

export default function TripItineraryMapTab({ stops, segments }: Props) {
  const [selectedSegment, setSelectedSegment] = useState<TripSegment | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Calculer durée du voyage en jours
  const tripDuration = Math.ceil(
    (new Date(stops[stops.length - 1].endDate).getTime() - new Date(stops[0].startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Générer suggestions
  const suggestions = generateStopSuggestions(
    stops,
    tripDuration,
    []
  );

  const handleSegmentClick = (segment: TripSegment) => {
    setSelectedSegment(segment);
  };

  const closeSegmentModal = () => {
    setSelectedSegment(null);
  };

  const handleAddSuggestion = (destinationId: string) => {
    console.log('Ajouter suggestion:', destinationId);
    // TODO: Implémenter l'ajout de suggestion
  };

  if (stops.length === 0) {
    return (
      <div className="text-center py-16">
        <MapPin className="mx-auto mb-4 text-gray-400" size={64} />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Pas d'étapes encore</h3>
        <p className="text-gray-600 mb-6">Créez votre itinéraire pour voir la carte</p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
          Créer mon itinéraire
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Carte simplifiée (timeline visuelle) */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Votre itinéraire</h2>
        
        <div className="relative">
          {stops.map((stop, index) => {
            const segment = segments.find(s => s.fromStopId === stop.id);
            const isLast = index === stops.length - 1;

            return (
              <div key={stop.id} className="relative">
                {/* Étape */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg z-10">
                      {index + 1}
                    </div>
                    {!isLast && (
                      <div className="w-1 h-20 bg-blue-300 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pt-2">
                    <h3 className="text-lg font-bold text-gray-900">{stop.destinationName}</h3>
                    {stop.startDate && stop.endDate && (
                      <p className="text-sm text-gray-600">
                        {new Date(stop.startDate).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}{' '}
                        →{' '}
                        {new Date(stop.endDate).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    )}
                    {stop.notes && (
                      <p className="text-sm text-gray-500 mt-1">{stop.notes}</p>
                    )}
                  </div>
                </div>

                {/* Segment de transport */}
                {segment && !isLast && (
                  <div className="ml-14 -mt-2 mb-6">
                    <button
                      onClick={() => handleSegmentClick(segment)}
                      className="w-full text-left bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getTransportEmoji(segment.recommendedMode)}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 capitalize">
                            {segment.recommendedMode === 'train' ? 'Train' : 
                             segment.recommendedMode === 'bus' ? 'Bus' :
                             segment.recommendedMode === 'flight' ? 'Avion' :
                             segment.recommendedMode === 'car' ? 'Voiture' : 'Ferry'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {formatDuration(segment.durationMinEstimated)}
                            </span>
                            <span>•</span>
                            <span>{segment.distanceKm} km</span>
                            {segment.alternatives[0]?.cost && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <DollarSign size={14} />
                                  {segment.alternatives[0].cost}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Info size={20} className="text-blue-600" />
                      </div>
                      {segment.metadata?.passRecommended && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <p className="text-xs text-blue-800 flex items-center gap-1">
                            <CreditCard size={14} className="flex-shrink-0" />
                            <span>Pass conseillé: {segment.metadata.passRecommended}</span>
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Suggestions d'étapes */}
      {suggestions.length > 0 && (
        <section className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="text-purple-600" size={22} />
              Suggestions d'étapes
            </h2>
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-sm text-purple-700 font-medium hover:underline"
            >
              {showSuggestions ? 'Masquer' : 'Voir tout'}
            </button>
          </div>

          {showSuggestions && (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="bg-white border border-purple-200 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{suggestion.destinationName}</h3>
                      {suggestion.dayTripFrom && (
                        <p className="text-xs text-purple-700 font-medium mt-1">
                          Day trip depuis {suggestion.dayTripFrom}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddSuggestion(suggestion.destinationId)}
                      className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-purple-700 transition-colors"
                    >
                      <Plus size={14} />
                      Ajouter
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{suggestion.reason}</p>
                </div>
              ))}
            </div>
          )}

          {!showSuggestions && (
            <p className="text-sm text-gray-700">
              {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} basée{suggestions.length > 1 ? 's' : ''} sur votre itinéraire
            </p>
          )}
        </section>
      )}

      {/* Modal détails segment */}
      {selectedSegment && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-0"
          onClick={closeSegmentModal}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Options de transport</h2>
                <button
                  onClick={closeSegmentModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Infos générales */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Distance:</strong> {selectedSegment.distanceKm} km
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Durée estimée:</strong> {formatDuration(selectedSegment.durationMinEstimated)}
                </p>
              </div>

              {/* Options classées */}
              <h3 className="font-bold text-gray-900 mb-3">Toutes les options</h3>
              <div className="space-y-3 mb-6">
                {selectedSegment.alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-xl p-4 ${
                      alt.mode === selectedSegment.recommendedMode
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{getTransportEmoji(alt.mode)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 capitalize">
                            {alt.mode === 'train' ? 'Train' :
                             alt.mode === 'bus' ? 'Bus' :
                             alt.mode === 'flight' ? 'Avion' :
                             alt.mode === 'car' ? 'Voiture' : 'Ferry'}
                          </p>
                          {alt.mode === selectedSegment.recommendedMode && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                              Recommandé
                            </span>
                          )}
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-medium capitalize">
                            {alt.ranking === 'practical' ? 'Pratique' :
                             alt.ranking === 'fast' ? 'Rapide' : 'Économique'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDuration(alt.duration)}
                          </span>
                          {alt.cost && (
                            <span className="flex items-center gap-1">
                              <DollarSign size={14} />
                              {alt.cost}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {alt.notes && (
                      <p className="text-sm text-gray-600 mt-2">{alt.notes}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Conseils */}
              {selectedSegment.metadata && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="text-yellow-600" size={20} />
                    Conseils
                  </h3>
                  {selectedSegment.metadata.passRecommended && (
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Pass recommandé:</strong> {selectedSegment.metadata.passRecommended}
                    </p>
                  )}
                  {selectedSegment.metadata.bookingAdvice && (
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Réservation:</strong> {selectedSegment.metadata.bookingAdvice}
                    </p>
                  )}
                  {selectedSegment.metadata.tips && (
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      {selectedSegment.metadata.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-2">
                <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  Ajouter un rappel
                </button>
                <button
                  onClick={closeSegmentModal}
                  className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}