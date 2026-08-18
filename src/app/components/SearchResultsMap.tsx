import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { destinationCoordinates } from '../data/destinationCoordinates';
import type { DestinationDetails } from '../data/types';

/**
 * Carte des résultats de recherche — volet droit de la vue desktop.
 *
 * Chargée en `lazy` par l'écran de recherche : Leaflet pèse 45 ko gzip et
 * n'a aucune raison d'être dans le bundle d'un mobile qui ne verra jamais
 * cette colonne.
 *
 * Les points n'affichent **pas** de score : un Lokascore sur une carte,
 * sans sa mention « indicatif », ses sources ni sa date, sortirait de son
 * cadre. La carte sert à situer, la liste à décider.
 */

export interface MapPoint {
  destination: DestinationDetails;
  lat: number;
  lon: number;
}

/** Ne garde que les destinations dont on connaît réellement la position. */
export function toMapPoints(destinations: DestinationDetails[]): MapPoint[] {
  return destinations.flatMap((destination) => {
    const coords = destinationCoordinates[destination.id];
    return coords ? [{ destination, lat: coords.lat, lon: coords.lon }] : [];
  });
}

/** Recentre la carte quand la sélection ou la liste change. */
function Recenter({ points, selectedId }: { points: MapPoint[]; selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    const selected = points.find((p) => p.destination.id === selectedId);
    if (selected) {
      map.setView([selected.lat, selected.lon], 6, { animate: true });
      return;
    }
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 5, { animate: true });
      return;
    }
    if (points.length > 1) {
      const lats = points.map((p) => p.lat);
      const lons = points.map((p) => p.lon);
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lons)],
          [Math.max(...lats), Math.max(...lons)],
        ],
        { padding: [40, 40], animate: true },
      );
    }
  }, [map, points, selectedId]);
  return null;
}

export default function SearchResultsMap({
  points,
  selectedId,
  onSelect,
  height = 520,
}: {
  points: MapPoint[];
  selectedId: string | null;
  onSelect: (destinationId: string) => void;
  height?: number;
}) {
  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl px-6 text-center"
        style={{ height, background: 'var(--lokadia-gray-100)' }}
      >
        <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
          Aucun résultat à situer sur la carte.
        </p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[points[0].lat, points[0].lon]}
      zoom={4}
      scrollWheelZoom={false}
      style={{ height, width: '100%', borderRadius: 24 }}
      aria-label="Carte des résultats"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter points={points} selectedId={selectedId} />
      {points.map((point) => {
        const active = point.destination.id === selectedId;
        return (
          <CircleMarker
            key={point.destination.id}
            center={[point.lat, point.lon]}
            radius={active ? 11 : 7}
            pathOptions={{
              color: 'var(--lokadia-surface)',
              weight: active ? 3 : 2,
              fillColor: 'var(--lokadia-primary)',
              fillOpacity: active ? 1 : 0.75,
            }}
            eventHandlers={{ click: () => onSelect(point.destination.id) }}
          >
            <Popup>
              <strong>{point.destination.name}</strong>
              <br />
              {point.destination.country}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
