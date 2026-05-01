/**
 * TripItineraryMapTab — onglet "Itinéraire / Carte" d'un voyage.
 *
 * - Carte Leaflet interactive avec marqueurs numérotés + lignes colorées par mode
 * - Sélecteur de mode (avion/train/bus/voiture/ferry) par trajet
 *   → uniquement les modes faisables selon distance & contexte géographique
 * - Mode choisi persisté dans la BDD (metadata.selectedMode sur trip_segments)
 *   avec fallback localStorage pour les segments non encore en BDD
 * - Auto-création des segments manquants au premier affichage
 */
import { useState, useMemo, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, Plus, Clock, Lightbulb,
  Plane, Train, Bus, Car, Ship, Check, Map as MapIcon, Info,
} from 'lucide-react';
import { generateStopSuggestions } from '../lib/tripBriefService';
import type { TripStop, TripSegment } from '../lib/tripStopService';
import {
  updateTripSegmentMode,
  ensureTripSegments,
  createTripSegment as createSegmentInDb,
} from '../lib/tripStopService';
import type { Trip } from '../lib/tripService';
import { calculateTransportOptions, type TransportOption } from '../lib/transportService';
import { destinationCoordinates } from '../data/destinationCoordinates';
import { STOP_CITIES } from '../data/stopCities';

// ────── Config modes ──────

const MODE_META: Record<
  'train' | 'bus' | 'flight' | 'car' | 'ferry',
  { label: string; color: string; bg: string; Icon: typeof Plane; dashed: boolean }
> = {
  flight: { label: 'Avion',    color: '#6366F1', bg: '#EEF2FF', Icon: Plane, dashed: true  },
  train:  { label: 'Train',    color: '#10B981', bg: '#ECFDF5', Icon: Train, dashed: false },
  bus:    { label: 'Bus',      color: '#F59E0B', bg: '#FFFBEB', Icon: Bus,   dashed: false },
  car:    { label: 'Voiture',  color: '#EF4444', bg: '#FEF2F2', Icon: Car,   dashed: false },
  ferry:  { label: 'Ferry',    color: '#0EA5E9', bg: '#F0F9FF', Icon: Ship,  dashed: true  },
};

type ModeKey = keyof typeof MODE_META;

// ────── Helpers ──────

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

function makeNumberedIcon(label: string, kind: 'origin' | 'stop' | 'end') {
  const bg = kind === 'origin' ? '#10B981' : kind === 'end' ? '#6366F1' : '#F59E0B';
  return L.divIcon({
    html: `<div style="
      width:34px;height:34px;background:${bg};border:3px solid #fff;border-radius:50%;
      box-shadow:0 3px 10px rgba(0,0,0,.3);display:flex;align-items:center;
      justify-content:center;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;
      font-weight:800;font-size:14px;color:#fff">${label}</div>`,
    className: 'lokadia-numbered-marker',
    iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18],
  });
}

function FitBounds({ points }: { points: Array<{ lat: number; lon: number }> }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) { map.setView([points[0].lat, points[0].lon], 6); return; }
    map.fitBounds(
      L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number])),
      { padding: [40, 40], maxZoom: 8 }
    );
  }, [points, map]);
  return null;
}

function resolveCoords(destinationId: string): { lat: number; lon: number } | null {
  const d = destinationCoordinates[destinationId];
  if (d) return { lat: d.lat, lon: d.lon };
  const s = STOP_CITIES.find((c) => c.id === destinationId);
  if (s?.lat != null && s.lon != null) return { lat: s.lat, lon: s.lon };
  return null;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

// Persistence mixte : DB d'abord, localStorage en fallback (segments sans ID BDD)
const LS_KEY = (tripId: string, fromId: string, toId: string) =>
  `lokadia:trip:${tripId}:leg:${fromId}=>${toId}:mode`;

function lsGet(tripId: string, fromId: string, toId: string): string | null {
  try { return localStorage.getItem(LS_KEY(tripId, fromId, toId)); } catch { return null; }
}
function lsSet(tripId: string, fromId: string, toId: string, mode: string) {
  try { localStorage.setItem(LS_KEY(tripId, fromId, toId), mode); } catch { /* quota */ }
}

// ────── Types ──────

interface EnrichedPoint {
  id: string;
  destinationId: string;
  name: string;
  lat: number;
  lon: number;
  kind: 'origin' | 'stop' | 'end';
  startDate?: string | null;
  endDate?: string | null;
}

interface EnrichedLeg {
  key: string;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  distanceKm: number;
  alternatives: TransportOption[];
  recommendedMode: ModeKey;
  selectedMode: ModeKey;
  dbSegmentId: string | null;   // null → segment pas encore en BDD
  dbMetadata: any;
}

interface Props {
  trip: Trip;
  stops: TripStop[];
  segments: TripSegment[];
}

// ────── Composant ──────

export default function TripItineraryMapTab({ trip, stops, segments: initialSegments }: Props) {
  const [segments, setSegments] = useState<TripSegment[]>(initialSegments);
  const [expandedLeg, setExpandedLeg] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // forceRender après update localStorage pour recalculer legs sans rechargement
  const [tick, setTick] = useState(0);

  // ── Auto-création des segments manquants ──
  useEffect(() => {
    if (segments.length === 0 && stops.length >= 2) {
      ensureTripSegments(trip.id, stops)
        .then((created) => { if (created.length > 0) setSegments(created); })
        .catch((e) => console.warn('Segments auto-création échouée:', e));
    }
  }, [trip.id, stops.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Points de la carte ──
  const points = useMemo<EnrichedPoint[]>(() => {
    const list: EnrichedPoint[] = [];
    const mainCoords = resolveCoords(trip.destinationId);
    const firstStopIsMain = stops[0]?.destinationId === trip.destinationId;

    if (mainCoords && !firstStopIsMain) {
      list.push({
        id: `main-${trip.destinationId}`,
        destinationId: trip.destinationId,
        name: trip.destinationName,
        lat: mainCoords.lat, lon: mainCoords.lon,
        kind: 'origin',
        startDate: trip.startDate,
        endDate: stops[0]?.startDate || trip.endDate,
      });
    }

    stops.forEach((s, idx) => {
      const coords = (s.latitude && s.longitude)
        ? { lat: s.latitude, lon: s.longitude }
        : resolveCoords(s.destinationId);
      if (!coords) return;
      list.push({
        id: s.id,
        destinationId: s.destinationId,
        name: s.destinationName,
        lat: coords.lat, lon: coords.lon,
        kind: list.length === 0 ? 'origin' : 'stop',
        startDate: s.startDate, endDate: s.endDate,
      });
    });

    if (list.length > 1) list[list.length - 1].kind = 'end';
    return list;
  }, [trip, stops]);

  // ── Legs ──
  const legs = useMemo<EnrichedLeg[]>(() => {
    const out: EnrichedLeg[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i];
      const to = points[i + 1];

      // Chercher un segment BDD correspondant
      const dbSeg = segments.find(
        (seg) => seg.fromStopId === from.id && seg.toStopId === to.id
      );

      let distanceKm: number;
      let alternatives: TransportOption[];
      let recommendedMode: ModeKey;
      let dbSegmentId: string | null = null;
      let dbMetadata: any = null;

      if (dbSeg && Array.isArray(dbSeg.alternatives) && dbSeg.alternatives.length > 0) {
        distanceKm = dbSeg.distanceKm;
        alternatives = dbSeg.alternatives as TransportOption[];
        recommendedMode = dbSeg.recommendedMode as ModeKey;
        dbSegmentId = dbSeg.id;
        dbMetadata = dbSeg.metadata;
      } else {
        distanceKm = haversine(from.lat, from.lon, to.lat, to.lon);
        const fromStop = { id: from.id, destinationId: from.destinationId, latitude: from.lat, longitude: from.lon } as TripStop;
        const toStop   = { id: to.id,   destinationId: to.destinationId,   latitude: to.lat,   longitude: to.lon   } as TripStop;
        const calc = calculateTransportOptions(fromStop, toStop, distanceKm);
        alternatives = calc.alternatives;
        recommendedMode = calc.recommendedMode as ModeKey;
      }

      // Mode choisi : DB > localStorage > recommandé
      const dbSelected = dbMetadata?.selectedMode as ModeKey | undefined;
      const lsSelected = lsGet(trip.id, from.id, to.id) as ModeKey | null;
      const savedMode = dbSelected || lsSelected;
      const selectedMode = savedMode && alternatives.some((a) => a.mode === savedMode)
        ? savedMode
        : recommendedMode;

      out.push({
        key: `${from.id}=>${to.id}`,
        fromId: from.id, toId: to.id,
        fromName: from.name, toName: to.name,
        distanceKm, alternatives, recommendedMode, selectedMode,
        dbSegmentId, dbMetadata,
      });
    }
    return out;
  }, [points, segments, trip.id, tick]); // tick pour forcer recalcul après ls update

  const totalDuration = legs.reduce((sum, leg) => {
    const alt = leg.alternatives.find((a) => a.mode === leg.selectedMode);
    return sum + (alt?.duration ?? 0);
  }, 0);

  // ── Choix de mode ──
  const handlePickMode = useCallback(async (leg: EnrichedLeg, mode: ModeKey) => {
    if (leg.dbSegmentId) {
      // Segment en BDD → update metadata.selectedMode
      try {
        await updateTripSegmentMode(leg.dbSegmentId, mode, leg.dbMetadata);
        // Met à jour le state local pour re-render immédiat
        setSegments((prev) =>
          prev.map((s) =>
            s.id === leg.dbSegmentId
              ? { ...s, metadata: { ...(s.metadata || {}), selectedMode: mode } }
              : s
          )
        );
      } catch {
        // Fallback localStorage si erreur réseau
        lsSet(trip.id, leg.fromId, leg.toId, mode);
        setTick((t) => t + 1);
      }
    } else {
      // Pas de segment BDD → localStorage
      lsSet(trip.id, leg.fromId, leg.toId, mode);
      setTick((t) => t + 1);
    }
    // Ferme le panneau d'options après sélection
    setExpandedLeg(null);
  }, [trip.id]);

  // ── Suggestions ──
  const tripDuration = Math.max(1, Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000
  ));
  const suggestions = stops.length > 0 ? generateStopSuggestions(stops, tripDuration, []) : [];

  // ── État vide ──
  if (points.length === 0) {
    return (
      <div className="text-center py-16">
        <MapPin className="mx-auto mb-4 text-gray-400" size={64} />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucune étape localisée</h3>
        <p className="text-gray-600">
          Les villes de ce voyage n'ont pas encore de coordonnées.<br />
          Modifie le voyage pour ajouter des étapes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ══ CARTE ══ */}
      <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapIcon size={18} /> Votre itinéraire
            </h2>
            <p className="text-sm text-gray-500">
              {points.length} point{points.length > 1 ? 's' : ''} · {legs.length} trajet{legs.length > 1 ? 's' : ''}
              {totalDuration > 0 && <> · ≈ {formatDuration(totalDuration)} au total</>}
            </p>
          </div>
        </div>

        <div style={{ height: 380 }}>
          <MapContainer
            center={[points[0].lat, points[0].lon]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={points} />

            {legs.map((leg, i) => {
              const from = points[i];
              const to = points[i + 1];
              const meta = MODE_META[leg.selectedMode];
              return (
                <Polyline
                  key={leg.key}
                  positions={[[from.lat, from.lon], [to.lat, to.lon]]}
                  pathOptions={{ color: meta.color, weight: 3, opacity: 0.9, dashArray: meta.dashed ? '8 6' : undefined }}
                />
              );
            })}

            {points.map((p, idx) => (
              <Marker key={p.id} position={[p.lat, p.lon]} icon={makeNumberedIcon(String(idx + 1), p.kind)}>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{idx + 1}. {p.name}</div>
                    {p.startDate && p.endDate && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                        {new Date(p.startDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        {' → '}
                        {new Date(p.endDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Légende */}
        <div className="px-5 py-3 flex flex-wrap gap-x-5 gap-y-2 text-xs border-t border-gray-200">
          {(Object.keys(MODE_META) as ModeKey[]).map((m) => {
            const meta = MODE_META[m];
            const Icon = meta.Icon;
            return (
              <span key={m} className="flex items-center gap-1.5 text-gray-700">
                <Icon size={13} style={{ color: meta.color }} />
                <span className="inline-block w-6" style={{ borderTop: `2px ${meta.dashed ? 'dashed' : 'solid'} ${meta.color}` }} />
                {meta.label}
              </span>
            );
          })}
          <span className="ml-auto flex items-center gap-1.5 text-gray-500">
            <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" /> Départ
            <span className="inline-block w-3 h-3 rounded-full bg-amber-400 ml-2" /> Étape
            <span className="inline-block w-3 h-3 rounded-full bg-indigo-500 ml-2" /> Fin
          </span>
        </div>
      </section>

      {/* ══ TRAJETS + SÉLECTEUR DE MODE ══ */}
      {legs.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Modes de transport</h2>
          <div className="space-y-3">
            {legs.map((leg, idx) => {
              const selMeta = MODE_META[leg.selectedMode];
              const selAlt  = leg.alternatives.find((a) => a.mode === leg.selectedMode);
              const SelIcon = selMeta.Icon;
              const isOpen  = expandedLeg === leg.key;

              return (
                <div key={leg.key} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                  {/* Résumé cliquable */}
                  <button
                    onClick={() => setExpandedLeg(isOpen ? null : leg.key)}
                    className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: selMeta.bg }}>
                      <SelIcon size={18} style={{ color: selMeta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                        Trajet {idx + 1}
                      </p>
                      <p className="font-semibold text-gray-900 truncate text-sm">
                        {leg.fromName} → {leg.toName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                        <span style={{ color: selMeta.color, fontWeight: 700 }}>{selMeta.label}</span>
                        {selAlt && <><span className="flex items-center gap-0.5"><Clock size={11} />{formatDuration(selAlt.duration)}</span></>}
                        <span>{leg.distanceKm} km</span>
                        {selAlt?.cost && <span>{selAlt.cost}</span>}
                        {leg.dbSegmentId
                          ? <span className="ml-auto text-[10px] text-emerald-600 font-semibold">✓ Sauvegardé</span>
                          : <span className="ml-auto text-[10px] text-gray-400">Local</span>}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 flex-shrink-0 pl-2">
                      {isOpen ? 'Fermer ↑' : 'Changer ↓'}
                    </span>
                  </button>

                  {/* Panneau de choix */}
                  {isOpen && (
                    <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <Info size={12} />
                        {leg.alternatives.length} mode{leg.alternatives.length > 1 ? 's' : ''} possible{leg.alternatives.length > 1 ? 's' : ''} pour {leg.distanceKm} km
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {leg.alternatives.map((alt) => {
                          const meta = MODE_META[alt.mode as ModeKey];
                          if (!meta) return null;
                          const Icon = meta.Icon;
                          const isSelected = alt.mode === leg.selectedMode;
                          const isRecommended = alt.mode === leg.recommendedMode;
                          return (
                            <button
                              key={alt.mode}
                              onClick={() => handlePickMode(leg, alt.mode as ModeKey)}
                              className="text-left p-3 rounded-xl border-2 transition-all active:scale-95"
                              style={{
                                borderColor: isSelected ? meta.color : '#E5E7EB',
                                background:  isSelected ? meta.bg    : '#FFFFFF',
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Icon size={16} style={{ color: meta.color }} />
                                <span className="font-bold text-sm text-gray-900">{meta.label}</span>
                                {isSelected && (
                                  <span className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: meta.color }}>
                                    <Check size={10} /> Choisi
                                  </span>
                                )}
                                {!isSelected && isRecommended && (
                                  <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Recommandé</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-600">
                                <span className="flex items-center gap-1"><Clock size={11} />{formatDuration(alt.duration)}</span>
                                {alt.cost && <span>{alt.cost}</span>}
                              </div>
                              {alt.notes && <p className="text-[11px] text-gray-500 mt-1.5">{alt.notes}</p>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Modes impossibles */}
                      {(() => {
                        const impossible = (['train','bus','car','flight','ferry'] as ModeKey[])
                          .filter((m) => !leg.alternatives.some((a) => a.mode === m));
                        if (!impossible.length) return null;
                        return (
                          <p className="text-[11px] text-gray-400 mt-3">
                            <Info size={11} className="inline mr-1" />
                            Non adapté à ce trajet : {impossible.map((m) => MODE_META[m].label).join(', ')}
                          </p>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ══ SUGGESTIONS D'ÉTAPES ══ */}
      {suggestions.length > 0 && (
        <section className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="text-purple-600" size={20} />
              Suggestions d'étapes
            </h2>
            <button onClick={() => setShowSuggestions(!showSuggestions)} className="text-sm text-purple-700 font-medium hover:underline">
              {showSuggestions ? 'Masquer' : `Voir les ${suggestions.length}`}
            </button>
          </div>
          {showSuggestions && (
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <div key={i} className="bg-white border border-purple-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{s.destinationName}</h3>
                      {s.dayTripFrom && <p className="text-xs text-purple-700 font-medium mt-0.5">Day trip depuis {s.dayTripFrom}</p>}
                    </div>
                    <button className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-purple-700 transition-colors">
                      <Plus size={13} /> Ajouter
                    </button>
                  </div>
                  <p className="text-sm text-gray-700">{s.reason}</p>
                </div>
              ))}
            </div>
          )}
          {!showSuggestions && (
            <p className="text-sm text-gray-600">
              {suggestions.length} suggestion{suggestions.length > 1 ? 's' : ''} basée{suggestions.length > 1 ? 's' : ''} sur votre itinéraire
            </p>
          )}
        </section>
      )}

      {/* ══ CONSEIL PASS ══ */}
      {segments[0]?.metadata?.passRecommended && (
        <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Lightbulb className="text-yellow-600" size={18} />
            Conseil pass transport
          </h3>
          <p className="text-sm text-gray-700">
            <strong>Pass recommandé :</strong> {segments[0].metadata.passRecommended}
          </p>
        </section>
      )}
    </div>
  );
}
