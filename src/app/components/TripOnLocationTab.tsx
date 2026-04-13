import { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  AlertTriangle, 
  ShieldAlert, 
  Bus, 
  StickyNote,
  CircleAlert,
  Hospital,
  AlertCircle,
  Ban,
  LucideIcon
} from 'lucide-react';
import { generateOnLocationInfo } from '../lib/tripBriefService';
import { setActiveCityForTrip } from '../lib/tripService';
import type { TripDashboard } from '../lib/tripBriefService';
import type { TripWithChecklist } from '../lib/tripService';

interface Props {
  dashboard: TripDashboard;
  trip: TripWithChecklist;
}

// Mapping des emojis d'urgence vers les composants Lucide
const getEmergencyIcon = (emoji: string): LucideIcon => {
  if (emoji.includes('AlertCircle')) return CircleAlert;
  if (emoji.includes('Shield')) return ShieldAlert;
  if (emoji.includes('Hospital')) return Hospital;
  return Phone;
};

export default function TripOnLocationTab({ dashboard, trip }: Props) {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(
    trip.activeCityDestinationId || (dashboard.stops[0]?.id ?? null)
  );
  const [personalNotes, setPersonalNotes] = useState('');

  const locationInfo = generateOnLocationInfo(selectedStopId, dashboard.stops);

  const handleCityChange = async (stopId: string) => {
    setSelectedStopId(stopId);
    try {
      await setActiveCityForTrip(trip.id, stopId);
      console.log('✅ Ville active mise à jour');
    } catch (error) {
      console.error('Erreur mise à jour ville active:', error);
    }
  };

  if (!locationInfo) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Aucune information disponible pour cette étape</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélection de ville */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-5">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <MapPin size={22} />
          Je suis à...
        </h2>
        <div className="flex flex-wrap gap-2">
          {dashboard.stops.map((stop) => (
            <button
              key={stop.id}
              onClick={() => handleCityChange(stop.id)}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                selectedStopId === stop.id
                  ? 'bg-white text-blue-700'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {stop.destinationName}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline du voyage */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="text-blue-600" size={22} />
          Mes étapes
        </h2>
        <div className="space-y-3">
          {dashboard.stops.map((stop, index) => (
            <div
              key={stop.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                selectedStopId === stop.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{stop.destinationName}</p>
                {stop.startDate && stop.endDate && (
                  <p className="text-xs text-gray-600">
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
              </div>
              {selectedStopId === stop.id && (
                <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold">
                  Ici
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Urgences */}
      <section className="bg-red-50 border-2 border-red-300 rounded-xl overflow-hidden">
        <div className="bg-red-600 text-white px-5 py-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Phone size={22} />
            Urgences - {locationInfo.cityName}
          </h2>
        </div>
        <div className="p-5 space-y-2">
          {locationInfo.emergencyNumbers.map((contact, index) => {
            const EmergencyIcon = getEmergencyIcon(contact.icon);
            return (
              <a
                key={index}
                href={`tel:${contact.number}`}
                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                <EmergencyIcon className="text-red-600 flex-shrink-0" size={28} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{contact.name}</p>
                  <p className="text-red-700 font-bold">{contact.number}</p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Conseils de sécurité */}
      {locationInfo.safetyTips.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={22} />
            Conseils de sécurité
          </h2>
          <ul className="space-y-2">
            {locationInfo.safetyTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <AlertCircle className="text-orange-600 mt-0.5 flex-shrink-0" size={18} />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Arnaques fréquentes */}
      {locationInfo.commonScams.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="text-red-600" size={22} />
            Arnaques fréquentes
          </h2>
          <div className="space-y-3">
            {locationInfo.commonScams.map((scam, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Ban className="flex-shrink-0" size={20} />
                  {scam.title}
                </h3>
                <p className="text-sm text-red-800">{scam.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Zones sensibles */}
      {locationInfo.dangerousAreas.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="text-yellow-600" size={22} />
            Zones à éviter
          </h2>
          <ul className="space-y-2">
            {locationInfo.dangerousAreas.map((area, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <AlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" size={18} />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Transports locaux */}
      {locationInfo.localTransport && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Bus className="text-blue-600" size={22} />
            Transports locaux
          </h2>
          <p className="text-sm text-gray-700">{locationInfo.localTransport}</p>
        </section>
      )}

      {/* Notes personnelles */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <StickyNote className="text-purple-600" size={22} />
          Mes notes / Phrases utiles
        </h2>
        <textarea
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          placeholder="Notez ici les informations importantes, phrases utiles, adresses, etc."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
          Enregistrer mes notes
        </button>
      </section>
    </div>
  );
}