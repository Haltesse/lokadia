/**
 * WorldAlertsMap — carte mondiale interactive des alertes catastrophes
 * en temps réel (USGS séismes + ReliefWeb catastrophes).
 *
 * Affichage : marqueurs circulaires sur les pays affectés, colorés selon
 * la sévérité (rouge = alertes red, orange = orange seulement). Popup au
 * clic avec détail des alertes + lien vers les destinations Lokadia.
 *
 * Basé sur Leaflet + OpenStreetMap, sans clé API.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, MapPin } from 'lucide-react';
import {
  subscribeToLiveAlerts,
  getLiveAlertsSnapshot,
  type LiveAlert,
  type LiveAlertsSnapshot,
} from '../lib/liveAlertsService';
import { COUNTRY_CENTROIDS } from '../data/countryCentroids';
import { DESTINATION_TO_COUNTRY_ISO } from '../data/countryRiskData';

interface CountryMarker {
  iso: string;
  lat: number;
  lon: number;
  name: string;
  alerts: LiveAlert[];
  severity: 'orange' | 'red';
  destinations: string[];
}

// Mapping inverse ISO → destinations Lokadia
const ISO_TO_DESTINATIONS = (() => {
  const map = new Map<string, string[]>();
  for (const [destId, iso] of Object.entries(DESTINATION_TO_COUNTRY_ISO)) {
    const existing = map.get(iso) ?? [];
    existing.push(destId);
    map.set(iso, existing);
  }
  return map;
})();

function isoToFlag(iso: string): string {
  if (iso.length !== 2) return '🌍';
  return String.fromCodePoint(...iso.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0)));
}

// Force la carte à se recalculer correctement après le mount (Leaflet bug
// quand le container est initialement caché ou de taille indéterminée).
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export function WorldAlertsMap() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<LiveAlertsSnapshot | null>(getLiveAlertsSnapshot());

  useEffect(() => {
    const unsub = subscribeToLiveAlerts((s) => setSnapshot(s));
    return () => unsub();
  }, []);

  const markers = useMemo<CountryMarker[]>(() => {
    if (!snapshot) return [];
    const result: CountryMarker[] = [];
    snapshot.byCountry.forEach((alerts, iso) => {
      const centroid = COUNTRY_CENTROIDS[iso];
      if (!centroid) return; // Pays non géolocalisé dans notre dataset
      result.push({
        iso,
        lat: centroid.lat,
        lon: centroid.lon,
        name: centroid.name,
        alerts,
        severity: alerts.some((a) => a.severity === 'red') ? 'red' : 'orange',
        destinations: ISO_TO_DESTINATIONS.get(iso) ?? [],
      });
    });
    return result;
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div
        className="rounded-2xl bg-white p-8 text-center"
        style={{ border: '1px solid var(--lokadia-gray-100)', minHeight: '320px' }}
      >
        <div className="animate-pulse text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
          Chargement de la carte mondiale…
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl bg-white relative"
      style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="relative" style={{ height: '420px' }}>
        <MapContainer
          center={[20, 10]}
          zoom={2}
          minZoom={2}
          maxZoom={6}
          scrollWheelZoom={false}
          worldCopyJump={true}
          style={{ height: '100%', width: '100%', background: '#f1f5f9' }}
          attributionControl={false}
        >
          <MapResizer />
          {/* Tuiles OSM allégées (CartoDB Positron = fond très neutre) */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
            subdomains="abcd"
          />

          {/* Marqueurs : un cercle par pays affecté */}
          {markers.map((m) => {
            const isRed = m.severity === 'red';
            const radius = Math.min(20, 6 + m.alerts.length * 2);
            return (
              <CircleMarker
                key={m.iso}
                center={[m.lat, m.lon]}
                radius={radius}
                pathOptions={{
                  color: isRed ? '#dc2626' : '#f59e0b',
                  fillColor: isRed ? '#ef4444' : '#fbbf24',
                  fillOpacity: 0.75,
                  weight: 2,
                }}
              >
                <Popup maxWidth={260} className="lokadia-alert-popup">
                  <div className="text-sm" style={{ minWidth: '220px' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{isoToFlag(m.iso)}</span>
                      <div className="flex-1">
                        <p className="font-black" style={{ color: 'var(--lokadia-gray-900)' }}>
                          {m.name}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: isRed ? '#dc2626' : '#d97706' }}>
                          {m.alerts.length} alerte{m.alerts.length > 1 ? 's' : ''} {isRed && '🚨'}
                        </p>
                      </div>
                    </div>
                    {/* Liste des alertes */}
                    <ul className="mb-2 space-y-1 max-h-32 overflow-y-auto">
                      {m.alerts.slice(0, 4).map((a, i) => (
                        <li
                          key={i}
                          className="text-[10px] leading-snug rounded p-1"
                          style={{
                            background: a.severity === 'red' ? 'rgba(239, 68, 68, 0.07)' : 'rgba(245, 158, 11, 0.07)',
                            color: 'var(--lokadia-gray-700)',
                          }}
                        >
                          <span className="font-bold">[{a.source}]</span> {a.description}
                        </li>
                      ))}
                      {m.alerts.length > 4 && (
                        <li className="text-[10px] italic text-center" style={{ color: 'var(--lokadia-gray-500)' }}>
                          +{m.alerts.length - 4} autres…
                        </li>
                      )}
                    </ul>
                    {/* Destinations Lokadia affectées */}
                    {m.destinations.length > 0 && (
                      <div className="pt-2 border-t" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                        <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--lokadia-gray-600)' }}>
                          Destinations affectées :
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {m.destinations.slice(0, 3).map((destId) => {
                            const niceLabel = destId.split('-').slice(0, -1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                            return (
                              <button
                                key={destId}
                                onClick={() => navigate(`/destination/${destId}`)}
                                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                                style={{ background: 'var(--lokadia-info-bg)', color: 'var(--lokadia-primary)' }}
                              >
                                <MapPin className="h-2.5 w-2.5" />
                                {niceLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Légende fixe (en bas à gauche) */}
        <div
          className="absolute bottom-3 left-3 z-[400] rounded-xl bg-white p-2.5 shadow-md"
          style={{ border: '1px solid var(--lokadia-gray-100)' }}
        >
          <p className="text-[10px] font-black uppercase tracking-wider mb-1.5" style={{ color: 'var(--lokadia-gray-600)' }}>
            Légende
          </p>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 0 1.5px #dc2626' }} />
            <span className="text-[10px] font-bold" style={{ color: '#991b1b' }}>Alerte rouge (M≥7)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full" style={{ background: '#fbbf24', boxShadow: '0 0 0 1.5px #f59e0b' }} />
            <span className="text-[10px] font-bold" style={{ color: '#92400e' }}>Alerte orange</span>
          </div>
        </div>

        {/* Compteur fixe (en haut à droite) */}
        <div
          className="absolute top-3 right-3 z-[400] rounded-xl bg-white p-2.5 shadow-md"
          style={{ border: '1px solid var(--lokadia-gray-100)' }}
        >
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--lokadia-gray-600)' }}>
            En direct
          </p>
          <p className="text-xl font-black tabular-nums leading-none mt-0.5" style={{ color: 'var(--lokadia-gray-900)' }}>
            {markers.length}
          </p>
          <p className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>
            pays affectés
          </p>
        </div>

        {/* Empty state overlay */}
        {markers.length === 0 && (
          <div
            className="absolute inset-0 z-[300] flex items-center justify-center backdrop-blur-sm"
            style={{ background: 'rgba(255, 255, 255, 0.85)' }}
          >
            <div className="text-center">
              <div className="text-5xl mb-2">✅</div>
              <p className="text-sm font-black" style={{ color: '#15803d' }}>
                Aucune alerte majeure dans le monde
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--lokadia-gray-600)' }}>
                Sources : {snapshot.sources.join(' + ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer avec sources + timestamp */}
      <div
        className="flex items-center justify-between px-4 py-2 text-[10px]"
        style={{ background: '#f8fafc', borderTop: '1px solid var(--lokadia-gray-100)', color: 'var(--lokadia-gray-600)' }}
      >
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" style={{ color: '#dc2626' }} />
          <span className="font-bold">Sources :</span> {snapshot.sources.join(' · ')}
        </span>
        <span className="font-bold tabular-nums">
          MAJ {new Date(snapshot.lastFetch).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
        </span>
      </div>
    </div>
  );
}
