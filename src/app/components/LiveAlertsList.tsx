/**
 * LiveAlertsList — liste détaillée de toutes les alertes live USGS + ReliefWeb
 * groupées par pays, avec recherche par destinations Lokadia.
 *
 * Utilisable dans AlertCenterScreen ou page dédiée.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Globe, MapPin, RefreshCw } from 'lucide-react';
import {
  fetchLiveAlerts,
  getLiveAlertsSnapshot,
  subscribeToLiveAlerts,
  ALERT_TYPE_META,
  type LiveAlert,
  type LiveAlertsSnapshot,
} from '../lib/liveAlertsService';
import { DESTINATION_TO_COUNTRY_ISO } from '../data/countryRiskData';

// Drapeaux par code ISO (emoji unicode)
function isoToFlag(iso: string): string {
  if (iso.length !== 2) return '🌍';
  const codePoints = iso
    .toUpperCase()
    .split('')
    .map((c) => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Mapping inverse ISO → liste destinations Lokadia
const ISO_TO_DESTINATIONS = (() => {
  const map = new Map<string, string[]>();
  for (const [destId, iso] of Object.entries(DESTINATION_TO_COUNTRY_ISO)) {
    const existing = map.get(iso) ?? [];
    existing.push(destId);
    map.set(iso, existing);
  }
  return map;
})();

interface CountryAlertGroup {
  iso: string;
  alerts: LiveAlert[];
  destinations: string[];
  hasRed: boolean;
}

export function LiveAlertsList() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<LiveAlertsSnapshot | null>(getLiveAlertsSnapshot());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = subscribeToLiveAlerts((s) => setSnapshot(s));
    return () => unsub();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const s = await fetchLiveAlerts(true);
      setSnapshot(s);
    } finally {
      setRefreshing(false);
    }
  };

  const groups = useMemo<CountryAlertGroup[]>(() => {
    if (!snapshot) return [];
    const result: CountryAlertGroup[] = [];
    snapshot.byCountry.forEach((alerts, iso) => {
      result.push({
        iso,
        alerts,
        destinations: ISO_TO_DESTINATIONS.get(iso) ?? [],
        hasRed: alerts.some((a) => a.severity === 'red'),
      });
    });
    // Trier : pays avec alerte rouge en premier, puis par nombre d'alertes
    return result.sort((a, b) => {
      if (a.hasRed !== b.hasRed) return a.hasRed ? -1 : 1;
      return b.alerts.length - a.alerts.length;
    });
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center" style={{ border: '1px solid var(--lokadia-gray-100)' }}>
        <div className="animate-pulse">Chargement des alertes mondiales…</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div
        className="rounded-2xl p-5 flex items-start gap-3"
        style={{
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.25)',
        }}
      >
        <div className="text-3xl">✅</div>
        <div>
          <h3 className="font-black text-sm" style={{ color: '#15803d' }}>
            Aucune alerte majeure dans le monde
          </h3>
          <p className="text-xs mt-1" style={{ color: '#166534' }}>
            Aucun séisme M≥6 ni catastrophe ReliefWeb active. Sources : {snapshot.sources.join(' + ')}
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
            style={{ background: 'white', color: '#15803d' }}
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>
      </div>
    );
  }

  // Stats globales
  let totalAlerts = 0;
  let redCount = 0;
  groups.forEach((g) => {
    totalAlerts += g.alerts.length;
    g.alerts.forEach((a) => {
      if (a.severity === 'red') redCount++;
    });
  });

  return (
    <div className="space-y-4">
      {/* Header global */}
      <div
        className="rounded-2xl p-4 flex items-center justify-between gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(245, 158, 11, 0.06))',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: 'rgba(239, 68, 68, 0.12)' }}
          >
            <Globe className="h-5 w-5" style={{ color: '#dc2626' }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black" style={{ color: '#991b1b' }}>
              {totalAlerts} alerte{totalAlerts > 1 ? 's' : ''} active{totalAlerts > 1 ? 's' : ''} dans {groups.length} pays
              {redCount > 0 && (
                <span
                  className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black text-white tabular-nums"
                  style={{ background: '#dc2626' }}
                >
                  {redCount} 🚨 critique
                </span>
              )}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#7f1d1d' }}>
              Sources temps réel : {snapshot.sources.join(' + ')} ·{' '}
              <span className="font-bold">
                MAJ {new Date(snapshot.lastFetch).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-transform active:scale-90"
          aria-label="Actualiser"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            style={{ color: '#dc2626' }}
          />
        </button>
      </div>

      {/* Groupes par pays */}
      <div className="space-y-3">
        {groups.map((group) => {
          const flag = isoToFlag(group.iso);
          return (
            <div
              key={group.iso}
              className="rounded-2xl bg-white p-4 transition-all hover:shadow-md"
              style={{
                border: `1px solid ${group.hasRed ? 'rgba(239, 68, 68, 0.3)' : 'var(--lokadia-gray-100)'}`,
              }}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">{flag}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black" style={{ color: 'var(--lokadia-gray-900)' }}>
                      {group.iso} · {group.alerts.length} alerte{group.alerts.length > 1 ? 's' : ''}
                    </h3>
                    {group.destinations.length > 0 && (
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--lokadia-gray-500)' }}>
                        Affecte : {group.destinations.length} destination{group.destinations.length > 1 ? 's' : ''} Lokadia
                      </p>
                    )}
                  </div>
                </div>
                {group.hasRed && (
                  <span
                    className="flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black text-white tabular-nums"
                    style={{ background: '#dc2626' }}
                  >
                    🚨 ROUGE
                  </span>
                )}
              </div>

              {/* Liste des alertes */}
              <ul className="space-y-2">
                {group.alerts.slice(0, 5).map((alert, i) => {
                  const meta = ALERT_TYPE_META[alert.type] ?? ALERT_TYPE_META.other;
                  return (
                    <li
                      key={i}
                      className="flex items-start gap-2 rounded-lg p-2"
                      style={{
                        background: alert.severity === 'red' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                      }}
                    >
                      <span className="text-sm flex-shrink-0 mt-0.5" aria-hidden="true">{meta.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold leading-snug" style={{ color: 'var(--lokadia-gray-900)' }}>
                          {alert.description}
                        </p>
                        <p className="text-[9px] mt-0.5" style={{ color: 'var(--lokadia-gray-500)' }}>
                          <span className="font-bold" style={{ color: meta.color }}>{meta.label}</span> · {alert.source} ·{' '}
                          {new Date(alert.detectedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </p>
                      </div>
                    </li>
                  );
                })}
                {group.alerts.length > 5 && (
                  <li className="text-[10px] italic text-center" style={{ color: 'var(--lokadia-gray-500)' }}>
                    +{group.alerts.length - 5} autres alertes…
                  </li>
                )}
              </ul>

              {/* Destinations affectées */}
              {group.destinations.length > 0 && (
                <div className="mt-3 pt-3 border-t flex flex-wrap gap-1.5" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                  {group.destinations.slice(0, 4).map((destId) => (
                    <button
                      key={destId}
                      onClick={() => navigate(`/destination/${destId}`)}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors hover:bg-blue-50"
                      style={{
                        background: 'var(--lokadia-info-bg)',
                        color: 'var(--lokadia-primary)',
                      }}
                    >
                      <MapPin className="h-2.5 w-2.5" />
                      {destId.split('-').slice(0, -1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                  {group.destinations.length > 4 && (
                    <span className="text-[10px] italic" style={{ color: 'var(--lokadia-gray-500)' }}>
                      +{group.destinations.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
