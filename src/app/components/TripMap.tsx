/**
 * TripMap — carte interactive pour visualiser la fiche de route du voyage.
 *
 * Fonctionnalités :
 *  - Marqueurs numérotés pour chaque étape (départ → étapes → retour)
 *  - Polyline reliant les étapes (pointillé = vol, plein = train/bus)
 *  - Popup par étape : ville, transport depuis l'étape précédente, lien "Où dormir ?"
 *  - Fit automatique sur l'ensemble des points
 *
 * Basé sur Leaflet + OpenStreetMap (gratuit, sans clé API).
 */
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plane, Train, Bus, Bed, ExternalLink } from 'lucide-react';
import type { LegEstimate } from '../lib/travelOffers';

export interface TripMapPoint {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  /** 'origin' pour le point de départ, 'stop' sinon. Le dernier point est un retour à l'origine. */
  kind: 'origin' | 'stop' | 'return';
}

interface TripMapProps {
  points: TripMapPoint[]; // ordonnés : départ → étape 1 → étape 2 … → retour (optionnel)
  legs: LegEstimate[];    // legs[i] = trajet point[i] → point[i+1]
  startDate: string;
  endDate: string;
  travelers: number;
}

// Icône numérotée en SVG inline
function makeNumberedIcon(label: string, kind: 'origin' | 'stop' | 'return') {
  const bg = kind === 'origin' ? '#10B981' : kind === 'return' ? '#6366F1' : '#F59E0B';
  const html = `
    <div style="
      width: 34px; height: 34px;
      background: ${bg};
      border: 3px solid #fff;
      border-radius: 50%;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      font-weight: 800; font-size: 14px; color: white;
    ">${label}</div>`;
  return L.divIcon({
    html,
    className: 'lokadia-numbered-marker',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function FitBounds({ points }: { points: TripMapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 6);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  }, [points, map]);
  return null;
}

function modeIcon(mode: 'plane' | 'train' | 'bus') {
  if (mode === 'plane') return <Plane className="h-3.5 w-3.5" />;
  if (mode === 'train') return <Train className="h-3.5 w-3.5" />;
  return <Bus className="h-3.5 w-3.5" />;
}

function modeLabel(mode: 'plane' | 'train' | 'bus') {
  return mode === 'plane' ? 'Vol' : mode === 'train' ? 'Train' : 'Bus';
}

export function TripMap({ points, legs, startDate, endDate, travelers }: TripMapProps) {
  const center: [number, number] = useMemo(() => {
    if (points.length === 0) return [20, 0];
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const lon = points.reduce((s, p) => s + p.lon, 0) / points.length;
    return [lat, lon];
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="rounded-3xl bg-gray-100 h-64 flex items-center justify-center text-sm text-gray-500">
        Ajoute au moins une étape pour voir la carte.
      </div>
    );
  }

  return (
    <div className="isolate rounded-3xl overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
      <MapContainer
        center={center}
        zoom={4}
        style={{ height: 360, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />

        {/* Polylines par leg (pointillé = avion, plein = sol) */}
        {legs.map((leg, i) => {
          const from = points[i];
          const to = points[i + 1];
          if (!from || !to) return null;
          const isAir = leg.mode === 'plane';
          return (
            <Polyline
              key={`${leg.fromId}-${leg.toId}-${i}`}
              positions={[
                [from.lat, from.lon],
                [to.lat, to.lon],
              ]}
              pathOptions={{
                color: isAir ? '#6366F1' : '#10B981',
                weight: 3,
                opacity: 0.85,
                dashArray: isAir ? '8 6' : undefined,
              }}
            />
          );
        })}

        {/* Marqueurs numérotés + popup */}
        {points.map((p, idx) => {
          const incomingLeg = idx > 0 ? legs[idx - 1] : null;
          const bookingUrl = `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(
            p.name
          )}&checkin=${startDate}&checkout=${endDate}&group_adults=${travelers}&group_children=0&no_rooms=1`;
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lon]}
              icon={makeNumberedIcon(String(idx + 1), p.kind)}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                    {idx + 1}. {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                    {p.country} ·{' '}
                    {p.kind === 'origin'
                      ? 'Point de départ'
                      : p.kind === 'return'
                        ? 'Retour'
                        : `Étape ${idx}`}
                  </div>
                  {incomingLeg && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 11,
                        padding: '6px 8px',
                        background: incomingLeg.mode === 'plane' ? '#EEF2FF' : '#ECFDF5',
                        color: incomingLeg.mode === 'plane' ? '#4F46E5' : '#047857',
                        borderRadius: 8,
                        marginBottom: 8,
                        fontWeight: 600,
                      }}
                    >
                      {modeIcon(incomingLeg.mode)}
                      <span>
                        {modeLabel(incomingLeg.mode)} · {incomingLeg.durationLabel} ·{' '}
                        {incomingLeg.pricePerPerson}€/pers
                      </span>
                    </div>
                  )}
                  {p.kind !== 'return' && (
                    <a
                      href={bookingUrl}
                      target="_blank"
                      rel="noopener nofollow sponsored"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#0F4C81',
                        textDecoration: 'none',
                      }}
                    >
                      <Bed size={13} /> Où dormir ici ?
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Légende */}
      <div
        className="px-4 py-2.5 text-xs flex items-center gap-4 flex-wrap bg-white"
        style={{ borderTop: '1px solid var(--lokadia-gray-200)' }}
      >
        <span className="flex items-center gap-1.5" style={{ color: 'var(--lokadia-gray-700)' }}>
          <Plane size={13} />
          <span className="inline-block w-6 h-[2px] bg-indigo-500" style={{ borderTop: '2px dashed #6366F1', background: 'transparent' }} />
          Vol
        </span>
        <span className="flex items-center gap-1.5" style={{ color: 'var(--lokadia-gray-700)' }}>
          <Train size={13} />
          <span className="inline-block w-6 h-[2px]" style={{ background: '#10B981' }} />
          Sol (train/bus)
        </span>
        <span className="flex items-center gap-1.5" style={{ color: 'var(--lokadia-gray-700)' }}>
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
          Départ
        </span>
        <span className="flex items-center gap-1.5" style={{ color: 'var(--lokadia-gray-700)' }}>
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
          Étape
        </span>
        <span className="flex items-center gap-1.5" style={{ color: 'var(--lokadia-gray-700)' }}>
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: '#6366F1' }} />
          Retour
        </span>
      </div>
    </div>
  );
}

export default TripMap;
