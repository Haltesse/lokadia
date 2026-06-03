/**
 * ProDemoMap — carte mondiale du tableau de bord Lokadia Pro (démo).
 *
 * Affiche la position de chaque groupe/personne sur une carte Leaflet,
 * colorée par le Lokascore (live ou simulé). La destination touchée par
 * une simulation de crise pulse en rouge. Pensée pour l'effet "salle de
 * contrôle" lors d'une démo investisseur.
 */
import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getLokascoreLevel } from '../lib/lokascore';

export interface DemoMapPoint {
  destinationId: string;
  city: string;
  count: number;          // nb de personnes sur cette destination
  names: string[];        // noms (pour le popup)
  score: number | null;   // score affiché (live ou simulé)
  affected: boolean;      // touché par la simulation en cours
}

interface Props {
  points: DemoMapPoint[];
  accent: string;
}

// Coordonnées des villes utilisées dans la démo (fiables, autonomes)
const CITY_COORDS: Record<string, [number, number]> = {
  'barcelona-spain': [41.3851, 2.1734],
  'berlin-germany': [52.52, 13.405],
  'lisbon-portugal': [38.7223, -9.1393],
  'prague-czech': [50.0755, 14.4378],
  'tokyo-japan': [35.6762, 139.6503],
  'istanbul-turkey': [41.0082, 28.9784],
  'cairo-egypt': [30.0444, 31.2357],
  'marrakech-morocco': [31.6295, -7.9811],
  'mumbai-india': [19.076, 72.8777],
  'bangkok-thailand': [13.7563, 100.5018],
  'mexico-city-mexico': [19.4326, -99.1332],
  'rio-de-janeiro-brazil': [-22.9068, -43.1729],
  'bali-indonesia': [-8.4095, 115.1889],
  'rome-italy': [41.9028, 12.4964],
  'new-york-usa': [40.7128, -74.006],
  'dubai-uae': [25.2048, 55.2708],
  'london-uk': [51.5074, -0.1278],
  'singapore-singapore': [1.3521, 103.8198],
  'shanghai-china': [31.2304, 121.4737],
};

function FitBounds({ coords }: { coords: Array<[number, number]> }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (coords.length === 1) {
        map.setView(coords[0], 4);
      } else if (coords.length > 1) {
        map.fitBounds(coords as any, { padding: [40, 40], maxZoom: 5 });
      }
    }, 200);
    return () => clearTimeout(t);
  }, [map, coords]);
  return null;
}

export function ProDemoMap({ points, accent }: Props) {
  const located = points
    .map((p) => ({ ...p, coords: CITY_COORDS[p.destinationId] }))
    .filter((p) => p.coords);
  const coords = located.map((p) => p.coords as [number, number]);

  if (located.length === 0) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center" style={{ border: '1px solid var(--lokadia-gray-100)', minHeight: 280 }}>
        <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>Carte indisponible</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
      <div className="relative" style={{ height: 360 }}>
        <MapContainer center={[25, 15]} zoom={2} minZoom={1} maxZoom={7} scrollWheelZoom={false} worldCopyJump style={{ height: '100%', width: '100%', background: '#f1f5f9' }} attributionControl={false}>
          <FitBounds coords={coords} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" subdomains="abcd" />
          {located.map((p) => {
            const lvl = getLokascoreLevel(p.score);
            const isAlert = p.affected;
            const radius = Math.min(22, 8 + p.count * 0.6) * (isAlert ? 1.3 : 1);
            return (
              <CircleMarker
                key={p.destinationId}
                center={p.coords as [number, number]}
                radius={radius}
                pathOptions={{
                  color: isAlert ? '#dc2626' : lvl.fillColor,
                  fillColor: isAlert ? '#ef4444' : lvl.fillColor,
                  fillOpacity: isAlert ? 0.55 : 0.7,
                  weight: isAlert ? 3 : 1.5,
                }}
              >
                <Popup>
                  <div className="text-sm" style={{ minWidth: 180 }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{p.city}</span>
                      <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white tabular-nums" style={{ background: isAlert ? '#dc2626' : lvl.fillColor }}>
                        {p.score ?? '…'}
                      </span>
                    </div>
                    {isAlert && <p className="mt-1 flex items-center gap-1 text-[10px] font-bold" style={{ color: '#dc2626' }}><span className="inline-block h-2 w-2 rounded-full" style={{ background: '#dc2626' }} /> ALERTE EN COURS</p>}
                    <p className="mt-1 text-[11px] font-bold" style={{ color: accent }}>{p.count} personne{p.count > 1 ? 's' : ''}</p>
                    <p className="mt-0.5 text-[10px] leading-snug" style={{ color: 'var(--lokadia-gray-500)' }}>{p.names.slice(0, 4).join(', ')}{p.names.length > 4 ? '…' : ''}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Légende */}
        <div className="absolute bottom-3 left-3 z-[400] rounded-xl bg-white p-2.5 shadow-md" style={{ border: '1px solid var(--lokadia-gray-100)' }}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--lokadia-gray-600)' }}>Vos personnes</p>
          <div className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#22c55e' }} /><span className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-600)' }}>Zone sûre</span></div>
          <div className="flex items-center gap-1.5 mt-0.5"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 0 2px #dc2626' }} /><span className="text-[10px] font-bold" style={{ color: '#991b1b' }}>Alerte / risque</span></div>
        </div>
      </div>
    </div>
  );
}
