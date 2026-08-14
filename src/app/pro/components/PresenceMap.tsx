/**
 * PresenceMap — carte « qui est où, maintenant ».
 *
 * Deux natures de données, distinguées visuellement parce qu'elles n'ont
 * pas la même valeur probante :
 *   · Présence déclarée (mission en cours) — cercle plein. C'est du
 *     déclaratif : la personne est censée être là.
 *   · Dernier point connu (position jointe volontairement à un check-in)
 *     — cercle cerclé de blanc, avec son ANCIENNETÉ affichée.
 *
 * On ne promet jamais du temps réel : la règle produit est d'afficher
 * l'âge de la donnée plutôt que de laisser croire à un suivi continu.
 */
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getLokascoreLevel } from '../../lib/lokascore';

export interface PresencePoint {
  key: string;
  lat: number;
  lon: number;
  label: string;
  countryName: string;
  /** Nombre de personnes rattachées à ce point */
  count: number;
  names: string[];
  score: number | null;
  /** Position issue d'un check-in consenti (sinon : présence déclarée) */
  isKnownPosition: boolean;
  /** Ancienneté du point, en minutes — uniquement si isKnownPosition */
  ageMinutes: number | null;
}

interface Props {
  points: PresencePoint[];
  height?: number;
}

function formatAge(minutes: number): string {
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export default function PresenceMap({ points, height = 420 }: Props) {
  if (points.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl px-6 text-center"
        style={{ height, background: 'var(--lokadia-gray-100)' }}
      >
        <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
          Personne à l'étranger aujourd'hui. La carte se remplit dès qu'une
          mission est en cours.
        </p>
      </div>
    );
  }

  // Cadrage : centré sur le barycentre des personnes présentes
  const avgLat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const avgLon = points.reduce((s, p) => s + p.lon, 0) / points.length;

  return (
    <div className="overflow-hidden rounded-2xl" style={{ height }}>
      <MapContainer
        center={[avgLat, avgLon]}
        zoom={points.length === 1 ? 5 : 2}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => {
          const level = getLokascoreLevel(p.score);
          return (
            <CircleMarker
              key={p.key}
              center={[p.lat, p.lon]}
              radius={Math.min(9 + p.count * 2, 22)}
              pathOptions={{
                color: p.isKnownPosition ? '#ffffff' : level.fillColor,
                weight: p.isKnownPosition ? 3 : 1.5,
                fillColor: level.fillColor,
                fillOpacity: 0.75,
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <p style={{ fontWeight: 700, margin: 0 }}>{p.label}</p>
                  <p style={{ margin: '2px 0 6px', fontSize: 12, color: '#525252' }}>
                    {p.count} personne{p.count > 1 ? 's' : ''} · {p.countryName}
                  </p>
                  <p style={{ margin: 0, fontSize: 12 }}>
                    {p.isKnownPosition && p.ageMinutes !== null ? (
                      <>
                        <strong>Dernier point connu</strong> {formatAge(p.ageMinutes)}
                        <br />
                        <span style={{ color: '#737373' }}>
                          Position transmise volontairement lors d'un check-in.
                        </span>
                      </>
                    ) : (
                      <>
                        <strong>Présence déclarée</strong>
                        <br />
                        <span style={{ color: '#737373' }}>
                          D'après la mission en cours, pas d'une position transmise.
                        </span>
                      </>
                    )}
                  </p>
                  {p.score !== null && (
                    <p style={{ margin: '6px 0 0', fontSize: 12 }}>
                      Lokascore {p.score}/100 — {level.label} <em>(indicatif)</em>
                    </p>
                  )}
                  {p.names.length > 0 && (
                    <p style={{ margin: '6px 0 0', fontSize: 11, color: '#525252' }}>
                      {p.names.slice(0, 6).join(', ')}
                      {p.names.length > 6 ? `… (+${p.names.length - 6})` : ''}
                    </p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
