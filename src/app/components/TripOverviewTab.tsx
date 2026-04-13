import { useNavigate } from 'react-router';
import { 
  FileCheck, 
  Syringe, 
  AlertTriangle, 
  Shield, 
  Smartphone, 
  Download, 
  Ticket,
  CircleAlert,
  ShieldAlert,
  Hospital,
  Phone,
  CheckCircle2,
  Train,
  Clock,
  type LucideIcon
} from 'lucide-react';
import type { TripDashboard } from '../lib/tripBriefService';
import type { TripWithChecklist } from '../lib/tripService';
import { useGoSafeScore } from '../hooks/useGoSafeScore';

interface Props {
  dashboard: TripDashboard;
  trip: TripWithChecklist;
}

// Mapping des noms d'icônes vers les composants Lucide
const actionIconMap: Record<string, LucideIcon> = {
  FileCheck,
  Syringe,
  AlertTriangle,
  Shield,
  Smartphone,
  Download,
  Ticket,
};

// Mapping des emojis d'urgence vers les composants Lucide
const getEmergencyIcon = (emoji: string): LucideIcon => {
  if (emoji.includes('AlertCircle')) return CircleAlert;
  if (emoji.includes('Shield')) return ShieldAlert;
  if (emoji.includes('Hospital')) return Hospital;
  return Phone;
};

export default function TripOverviewTab({ dashboard, trip }: Props) {
  const navigate = useNavigate();
  const { priorityActions, alerts, checklistProgress, transportSummary, destination } = dashboard;
  const { score: liveGoSafeScore, loading: scoreLoading } = useGoSafeScore(trip.destinationId);

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'border-l-red-500 bg-red-50';
    if (priority === 'medium') return 'border-l-orange-500 bg-orange-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const getAlertColor = (type: string) => {
    if (type === 'danger') return 'bg-red-100 border-red-300 text-red-800';
    if (type === 'warning') return 'bg-orange-100 border-orange-300 text-orange-800';
    if (type === 'vigilance') return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-blue-100 border-blue-300 text-blue-800';
  };

  return (
    <div className="space-y-6">
      {/* Actions prioritaires */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">À faire maintenant</h2>
        <div className="space-y-3">
          {priorityActions.length === 0 ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle2 className="mx-auto text-green-600 mb-2" size={32} />
              <p className="text-green-800 font-medium">Vous êtes prêt ! 🎉</p>
            </div>
          ) : (
            priorityActions.map((action) => {
              const IconComponent = actionIconMap[action.icon] || FileCheck;
              return (
                <div
                  key={action.id}
                  className={`border-l-4 rounded-r-xl p-4 ${getPriorityColor(action.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    <IconComponent className="flex-shrink-0 mt-0.5" size={28} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-700">{action.description}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Alertes importantes */}
      {alerts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="text-orange-600" size={24} />
            Alertes importantes
          </h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`border rounded-xl p-4 ${getAlertColor(alert.type)}`}
              >
                <h3 className="font-semibold mb-1">{alert.title}</h3>
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Progression checklist */}
      {checklistProgress.total > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={22} />
              Checklist de préparation
            </h2>
            <button 
              onClick={() => navigate(`/checklist/${trip.destinationId}`)}
              className="text-blue-600 font-medium text-sm hover:underline"
            >
              Ouvrir
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{
                  width: `${(checklistProgress.completed / checklistProgress.total) * 100}%`,
                }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {checklistProgress.completed}/{checklistProgress.total}
            </span>
          </div>
        </section>
      )}

      {/* Résumé transport */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Train className="text-blue-600" size={22} />
          Résumé transport
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nombre d'étapes</p>
            <p className="text-2xl font-bold text-gray-900">{transportSummary.totalStops}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Durée totale estimée</p>
            <p className="text-2xl font-bold text-gray-900 flex items-center gap-1">
              <Clock size={20} />
              {transportSummary.totalDuration}
            </p>
          </div>
        </div>
        {transportSummary.recommendedPass && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Pass conseillé:</strong> {transportSummary.recommendedPass}
            </p>
          </div>
        )}
      </section>

      {/* Contacts utiles */}
      {destination?.emergencyNumbers && destination.emergencyNumbers.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="text-red-600" size={22} />
            Contacts d'urgence
          </h2>
          <div className="space-y-2">
            {destination.emergencyNumbers.slice(0, 3).map((contact, index) => {
              const EmergencyIcon = getEmergencyIcon(contact.icon);
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <EmergencyIcon className="text-red-600 flex-shrink-0" size={28} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{contact.name}</p>
                    <a
                      href={`tel:${contact.number}`}
                      className="text-blue-600 font-semibold text-sm hover:underline"
                    >
                      {contact.number}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Info destination */}
      {destination && (
        <section className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Informations générales</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Fuseau horaire</span>
              <span className="font-medium text-gray-900">{destination.timezone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Langue</span>
              <span className="font-medium text-gray-900">{destination.language}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Devise</span>
              <span className="font-medium text-gray-900">{destination.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Score GoSafe</span>
              <span className={`font-bold ${(liveGoSafeScore || destination.goSafeScore) >= 70 ? 'text-green-600' : (liveGoSafeScore || destination.goSafeScore) >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                {scoreLoading ? '...' : (liveGoSafeScore || destination.goSafeScore)}/100
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}