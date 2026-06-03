/**
 * TripMapPlannerScreen — planificateur de voyage 100% carte interactive.
 *
 * L'utilisateur peut TOUT faire depuis la carte :
 *   - Chercher n'importe quelle ville/lieu au monde (Nominatim/OSM)
 *   - Cliquer la carte → reverse geocode pour récupérer le lieu exact
 *   - Cliquer un marqueur → l'ouvrir en popup pour réordonner / supprimer
 *   - Choisir le mode de transport pour chaque trajet (uniquement modes faisables)
 *   - Régler dates (calendrier range plein écran), départ, voyageurs
 *   - Voir le budget total estimé en live
 *   - Enregistrer → crée Trip + TripStops + TripSegments en BDD
 */
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft, Search, Plane, Train, Bus, Car, Ship, X, ArrowUp, ArrowDown,
  Save, Trash2, Users, MapPin, Plus, Check, Info, Loader2,
} from 'lucide-react';
import { motion, useMotionValue, useMotionValueEvent, type PanInfo } from 'motion/react';
import { STOP_CITIES, type StopCity } from '../data/stopCities';
import { calculateTransportOptions, type TransportOption } from '../lib/transportService';
import { computeBudgetEstimate, DEPARTURE_CITIES } from '../lib/travelOffers';
import { createTrip } from '../lib/tripService';
import { addStopToTrip, createTripSegment } from '../lib/tripStopService';
import { useAuth } from '../context/AuthContext';
import { EmirateDatePicker } from '../components/EmirateDatePicker';
import { PlannerSuggestions } from '../components/PlannerSuggestions';

// ────── Modes & helpers ──────

const MODE_META = {
  flight: { label: 'Avion',   color: '#6366F1', bg: '#EEF2FF', Icon: Plane, dashed: true  },
  train:  { label: 'Train',   color: '#10B981', bg: '#ECFDF5', Icon: Train, dashed: false },
  bus:    { label: 'Bus',     color: '#F59E0B', bg: '#FFFBEB', Icon: Bus,   dashed: false },
  car:    { label: 'Voiture', color: '#EF4444', bg: '#FEF2F2', Icon: Car,   dashed: false },
  ferry:  { label: 'Ferry',   color: '#0EA5E9', bg: '#F0F9FF', Icon: Ship,  dashed: true  },
} as const;
type ModeKey = keyof typeof MODE_META;

function haversine(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat);
  const dLon = toR(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

// Marqueur numéroté (étape sélectionnée)
function makeStopIcon(label: string, isOrigin: boolean, isEnd: boolean) {
  const bg = isOrigin ? '#10B981' : isEnd ? '#6366F1' : '#F59E0B';
  return L.divIcon({
    html: `<div style="width:36px;height:36px;background:${bg};border:3px solid #fff;border-radius:50%;
      box-shadow:0 4px 12px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;
      font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;font-weight:800;font-size:15px;color:#fff">${label}</div>`,
    className: 'lokadia-stop',
    iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20],
  });
}

// Mini marqueur pour les villes suggérées (non sélectionnées)
function makeSuggestionIcon() {
  return L.divIcon({
    html: `<div style="width:14px;height:14px;background:#94A3B8;border:2px solid #fff;border-radius:50%;
      box-shadow:0 2px 4px rgba(0,0,0,.25);cursor:pointer"></div>`,
    className: 'lokadia-suggestion',
    iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -8],
  });
}

// ────── Nominatim (OpenStreetMap geocoder, gratuit, sans clé) ──────

interface GeoResult {
  id: string;          // identifiant stable
  name: string;        // nom court (ville/lieu)
  fullName: string;    // nom détaillé pour affichage
  country: string;
  countryCode?: string;
  lat: number;
  lon: number;
  source: 'stop' | 'osm';
}

interface NominatimItem {
  place_id: number;
  osm_id: number;
  osm_type: string;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
  address?: {
    city?: string; town?: string; village?: string; municipality?: string;
    hamlet?: string; suburb?: string; county?: string; state?: string;
    country?: string; country_code?: string;
  };
}

const slug = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function nominatimToResult(item: NominatimItem): GeoResult {
  const a = item.address || {};
  const name =
    a.city || a.town || a.village || a.municipality || a.hamlet ||
    a.suburb || a.county || a.state ||
    item.display_name.split(',')[0];
  const country = a.country || '';
  return {
    id: `osm-${item.osm_type}-${item.osm_id}`,
    name: name.trim(),
    fullName: item.display_name,
    country: country.trim(),
    countryCode: a.country_code,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    source: 'osm',
  };
}

function stopCityToResult(c: StopCity): GeoResult {
  return {
    id: `stop-${c.id}`,
    name: c.name,
    fullName: `${c.name}, ${c.country}`,
    country: c.country,
    lat: c.lat!,
    lon: c.lon!,
    source: 'stop',
  };
}

async function nominatimSearch(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&accept-language=fr&q=' +
    encodeURIComponent(query);
  try {
    const r = await fetch(url, { signal });
    if (!r.ok) return [];
    const data: NominatimItem[] = await r.json();
    return data.map(nominatimToResult);
  } catch {
    return [];
  }
}

async function nominatimReverse(lat: number, lon: number, signal?: AbortSignal): Promise<GeoResult | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&zoom=12&accept-language=fr&lat=${lat}&lon=${lon}`;
  try {
    const r = await fetch(url, { signal });
    if (!r.ok) return null;
    const data: NominatimItem = await r.json();
    if (!data || !data.lat) return null;
    return nominatimToResult(data);
  } catch {
    return null;
  }
}

// Helper FitBounds (auto-fit après chaque ajout)
function FitBoundsOnUpdate({
  points,
  enabled,
}: {
  points: Array<{ lat: number; lon: number }>;
  enabled: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lon], 6);
      return;
    }
    map.fitBounds(
      L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number])),
      { padding: [60, 60], maxZoom: 7 }
    );
  }, [points.length, enabled]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function FocusDepartureOnChange({
  departure,
}: {
  departure: { id: string; lat: number; lon: number };
}) {
  const map = useMap();
  const previousDepartureIdRef = useRef(departure.id);

  useEffect(() => {
    if (previousDepartureIdRef.current === departure.id) return;
    previousDepartureIdRef.current = departure.id;

    map.closePopup();
    map.flyTo([departure.lat, departure.lon], Math.max(map.getZoom(), 8), {
      duration: 0.85,
      easeLinearity: 0.25,
    });
  }, [departure.id, departure.lat, departure.lon, map]);

  return null;
}

// Capture des clics sur la carte
function MapClickHandler({ onClick }: { onClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) { onClick(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

// ────── Types internes ──────

interface PlannerStop {
  id: string;          // identifiant interne (slug ou osm-{id})
  destinationId: string; // pour calculateTransportOptions: "name-country" slug
  name: string;
  country: string;
  lat: number;
  lon: number;
}

function geoResultToStop(g: GeoResult): PlannerStop {
  const nameSlug = slug(g.name) || 'lieu';
  const countrySlug = slug(g.country) || 'world';
  return {
    id: g.id,
    destinationId: `${nameSlug}-${countrySlug}`,
    name: g.name,
    country: g.country,
    lat: g.lat,
    lon: g.lon,
  };
}

// ────── Écran ──────

export default function TripMapPlannerScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── État du planificateur ──
  const [departureCityId, setDepartureCityId] = useState('paris');
  const [stops, setStops] = useState<PlannerStop[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [travelers, setTravelers] = useState(1);

  // Mode choisi par leg, indexé par "fromId=>toId"
  const [legModes, setLegModes] = useState<Record<string, ModeKey>>({});

  // UI state
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestionsOnMap, setShowSuggestionsOnMap] = useState(true);
  const [autoFit, setAutoFit] = useState(true);
  const [pendingClick, setPendingClick] = useState<{ lat: number; lon: number; result: GeoResult | null; loading: boolean } | null>(null);
  // ── Drawer drag-to-resize : pure position, AUCUN snap, AUCUN auto-expand ──
  // Le drawer suit le doigt à l'identique et reste exactement où l'utilisateur
  // le relâche. Pas de logique de "cran", pas de snap, pas de saut, pas de
  // mouvement automatique après ajout d'une étape.
  // Min: 56 px (juste le handle visible) — Max: 78 vh.
  const [saving, setSaving] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const initialHeight = typeof window !== 'undefined' ? window.innerHeight * 0.45 : 400;
  const heightMV = useMotionValue(initialHeight);
  const dragStartHeightRef = useRef(0);
  const isDraggingRef = useRef(false);
  const invalidateRafRef = useRef<number | null>(null);

  // Note volontairement PAS de re-clamp sur resize : iOS Safari déclenche un
  // resize quand son URL bar apparaît/disparaît, et le clamp tirait alors le
  // drawer brutalement vers le bas (« saut vers le bas » signalé en prod).
  // Le drag handler clamp déjà à chaque frame.

  // Invalide Leaflet UNIQUEMENT hors drag : pendant le drag actif, le coût de
  // re-rendu des tuiles à chaque frame provoquait des chutes de frame visibles
  // sous forme d'à-coups. Le map garde donc sa taille initiale pendant le drag,
  // et est recalibré à la fin (le user voit éventuellement un fin liseré gris
  // pendant le mouvement, mais le drawer reste fluide).
  useMotionValueEvent(heightMV, 'change', () => {
    if (isDraggingRef.current) return;
    if (invalidateRafRef.current != null) return;
    invalidateRafRef.current = requestAnimationFrame(() => {
      invalidateRafRef.current = null;
      mapRef.current?.invalidateSize();
    });
  });

  const handleDrawerPanStart = () => {
    isDraggingRef.current = true;
    dragStartHeightRef.current = heightMV.get();
  };

  const handleDrawerPan = (_: unknown, info: PanInfo) => {
    const vh = window.innerHeight;
    // Max 78vh pour laisser de la place aux toggles flottants de la carte
    // (sinon ils sont obscurcis par le drawer en pleine extension).
    const next = Math.max(56, Math.min(vh * 0.78, dragStartHeightRef.current - info.offset.y));
    heightMV.set(next);
  };

  const handleDrawerPanEnd = () => {
    // AUCUN SNAP — le drawer reste exactement où le doigt l'a laissé.
    isDraggingRef.current = false;
    // Recalibre Leaflet une seule fois à la fin (skippé pendant le drag pour fluidité)
    requestAnimationFrame(() => mapRef.current?.invalidateSize());
  };

  // Auto-expand RETIRÉ : l'utilisateur préfère contrôler la hauteur lui-même
  // au doigt. Aucun mouvement automatique du drawer après ajout d'une étape.

  // Departure resolution
  const departure = DEPARTURE_CITIES.find((c) => c.id === departureCityId) || DEPARTURE_CITIES[0];

  // ── Points complets (départ + stops) pour la carte & le calcul ──
  const points = useMemo(() => {
    const list: Array<{ id: string; destinationId: string; name: string; lat: number; lon: number; isOrigin: boolean }> = [];
    list.push({
      id: `dep-${departure.id}`,
      destinationId: `${slug(departure.label)}-${slug(departure.country)}`,
      name: departure.label,
      lat: departure.lat, lon: departure.lon, isOrigin: true,
    });
    for (const s of stops) {
      list.push({
        id: s.id, destinationId: s.destinationId,
        name: s.name, lat: s.lat, lon: s.lon, isOrigin: false,
      });
    }
    return list;
  }, [departure, stops]);

  // ── Legs avec modes faisables ──
  const legs = useMemo(() => {
    const out: Array<{
      key: string; fromId: string; toId: string; fromName: string; toName: string;
      distanceKm: number;
      alternatives: TransportOption[];
      recommendedMode: ModeKey;
      selectedMode: ModeKey;
    }> = [];
    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i], to = points[i + 1];
      const distanceKm = haversine({ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon });
      // Pseudo-stops pour calculateTransportOptions
      const fromStop = { id: from.id, destinationId: from.destinationId, latitude: from.lat, longitude: from.lon } as any;
      const toStop = { id: to.id, destinationId: to.destinationId, latitude: to.lat, longitude: to.lon } as any;
      const calc = calculateTransportOptions(fromStop, toStop, distanceKm);
      const recommended = calc.recommendedMode as ModeKey;
      const key = `${from.id}=>${to.id}`;
      const userMode = legModes[key];
      const selected: ModeKey = userMode && calc.alternatives.some((a) => a.mode === userMode)
        ? userMode : recommended;
      out.push({
        key, fromId: from.id, toId: to.id,
        fromName: from.name, toName: to.name,
        distanceKm,
        alternatives: calc.alternatives,
        recommendedMode: recommended,
        selectedMode: selected,
      });
    }
    return out;
  }, [points, legModes]); // eslint-disable-line

  // ── Suggestions de recherche (combinaison STOP_CITIES instantanné + Nominatim debouncé) ──
  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    // Étape 1 : résultats locaux instantanés depuis STOP_CITIES
    const local = STOP_CITIES
      .filter((c) => c.lat != null && c.lon != null)
      .filter((c) =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.country.toLowerCase().includes(q.toLowerCase())
      )
      .slice(0, 5)
      .map(stopCityToResult);
    setSearchResults(local);

    // Étape 2 : Nominatim debouncé après 350ms
    setSearching(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      const remote = await nominatimSearch(q, ctrl.signal);
      // Fusion : locaux d'abord, puis Nominatim (sans doublons sur mêmes coordonnées approx.)
      const seen = new Set(local.map((r) => `${r.lat.toFixed(2)},${r.lon.toFixed(2)}`));
      const merged = [
        ...local,
        ...remote.filter((r) => {
          const k = `${r.lat.toFixed(2)},${r.lon.toFixed(2)}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        }),
      ].slice(0, 10);
      setSearchResults(merged);
      setSearching(false);
    }, 350);

    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [search]);

  // ── Suggestions sur la carte (toutes les villes connues, en mini gris) ──
  const mapSuggestions = useMemo(() => {
    const selectedIds = new Set(stops.map((s) => s.id));
    return STOP_CITIES.filter(
      (c) => c.lat != null && c.lon != null && !selectedIds.has(c.id)
    );
  }, [stops]);

  // ── Actions ──
  const addStop = useCallback((g: GeoResult) => {
    const stop = geoResultToStop(g);
    setStops((prev) => {
      if (prev.some((s) => s.id === stop.id)) return prev;
      return [...prev, stop];
    });
    setSearch('');
    setSearchResults([]);
    setPendingClick(null);
    if (mapRef.current) {
      mapRef.current.flyTo([stop.lat, stop.lon], Math.max(mapRef.current.getZoom(), 6), { duration: 0.6 });
    }
  }, []);

  const removeStop = useCallback((id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveStop = useCallback((id: string, dir: -1 | 1) => {
    setStops((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  }, []);

  const clearAll = useCallback(() => {
    if (!confirm('Effacer toutes les étapes ?')) return;
    setStops([]);
    setLegModes({});
  }, []);

  const handleMapClick = useCallback(async (lat: number, lon: number) => {
    setPendingClick({ lat, lon, result: null, loading: true });
    const result = await nominatimReverse(lat, lon);
    setPendingClick({ lat, lon, result, loading: false });
  }, []);

  const handlePickMode = (legKey: string, mode: ModeKey) => {
    setLegModes((prev) => ({ ...prev, [legKey]: mode }));
  };

  // ── Budget live ──
  const nights = startDate && endDate
    ? Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 0;

  const budget = useMemo(() => {
    if (legs.length === 0 || !startDate || !endDate) return null;
    // Per-person price = somme des prix moyens des legs (selon mode choisi)
    const legPrices = legs.map((leg) => {
      const alt = leg.alternatives.find((a) => a.mode === leg.selectedMode);
      if (!alt?.cost) return 0;
      // alt.cost est une string genre "€80-150" → on prend la moyenne
      const m = alt.cost.match(/(\d+)\D+(\d+)/);
      if (m) return Math.round((parseInt(m[1]) + parseInt(m[2])) / 2);
      const single = alt.cost.match(/(\d+)/);
      return single ? parseInt(single[1]) : 0;
    });
    // Hôtel estimé : 90€/nuit × nights (moyenne confort)
    const hotelTotal = 90 * nights;
    return computeBudgetEstimate({ legPrices, hotelTotal, travelers, nights });
  }, [legs, nights, travelers, startDate, endDate]);

  // ── Sauvegarde ──
  const canSave = stops.length >= 1 && startDate && endDate && !!user;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const mainStop = stops[0];
      const trip = await createTrip({
        userId: user!.id,
        destinationId: mainStop.destinationId,
        destinationName: mainStop.name,
        countryDestinationId: slug(mainStop.country) || 'world',
        startDate, endDate, travelers,
        travelerProfile: null,
        status: 'planned',
        notes: null,
        activeCityDestinationId: null,
      });

      // Ajout des étapes (toutes, ordre = ordre du planificateur)
      const stopRecords: Array<{ id: string; plannerId: string }> = [];
      for (const s of stops) {
        const rec = await addStopToTrip(trip.id, s.destinationId, s.name, s.lat, s.lon);
        stopRecords.push({ id: rec.id, plannerId: s.id });
      }

      // Création des segments avec le mode choisi (inter-stops uniquement)
      for (let i = 0; i < stopRecords.length - 1; i++) {
        const fromRec = stopRecords[i];
        const toRec = stopRecords[i + 1];
        const fromStop = stops[i];
        const toStop = stops[i + 1];
        const distanceKm = haversine({ lat: fromStop.lat, lon: fromStop.lon }, { lat: toStop.lat, lon: toStop.lon });
        const calc = calculateTransportOptions(
          { id: fromRec.id, destinationId: fromStop.destinationId, latitude: fromStop.lat, longitude: fromStop.lon } as any,
          { id: toRec.id, destinationId: toStop.destinationId, latitude: toStop.lat, longitude: toStop.lon } as any,
          distanceKm
        );
        const legKey = `${fromStop.id}=>${toStop.id}`;
        const userMode = legModes[legKey];
        const selectedMode = userMode && calc.alternatives.some((a) => a.mode === userMode)
          ? userMode : (calc.recommendedMode as ModeKey);

        await createTripSegment({
          tripId: trip.id,
          fromStopId: fromRec.id,
          toStopId: toRec.id,
          recommendedMode: calc.recommendedMode,
          alternatives: calc.alternatives,
          distanceKm: calc.distanceKm,
          durationMinEstimated: calc.alternatives.find((a) => a.mode === calc.recommendedMode)?.duration ?? 180,
          metadata: { ...(calc.metadata || {}), selectedMode },
          source: 'planner-map',
        });
      }

      // Handoff vers le funnel de réservation guidé (vol → hébergement → eSIM → activités)
      const params = new URLSearchParams({
        dest: mainStop.destinationId,
        name: mainStop.name,
        country: mainStop.country || '',
        start: startDate,
        end: endDate,
        travelers: String(travelers),
        from: departure.iata,
      });
      navigate(`/trips/${trip.id}/book?${params.toString()}`);
    } catch (e) {
      console.error('❌ Sauvegarde voyage planifié:', e);
      alert('Erreur lors de la sauvegarde du voyage');
    } finally {
      setSaving(false);
    }
  };

  // ── Rendu ──
  const totalDuration = legs.reduce(
    (s, l) => s + (l.alternatives.find((a) => a.mode === l.selectedMode)?.duration ?? 0), 0
  );

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#F8FAFC' }}>

      {/* ══ HEADER VISUEL — photo paysage iconique en arrière-plan ══ */}
      <div className="relative z-[1000] overflow-hidden px-4 py-3 text-white lg:px-8 lg:py-4">
        {/* Image paysage iconique (Santorin / Cinque Terre — couleur méditerranéenne, voyageuse) */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600&q=80&auto=format&fit=crop')",
            transform: 'scale(1.05)',
          }}
          aria-hidden="true"
        />
        {/* Gradient overlay : sombre en bas pour lisibilité texte, teinte voyage */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(15,76,129,0.85) 0%, rgba(29,99,161,0.65) 45%, rgba(16,185,129,0.55) 100%)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3 lg:mx-auto lg:max-w-7xl">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md flex items-center justify-center transition-colors flex-shrink-0 shadow-lg"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-extrabold leading-tight drop-shadow-md sm:text-lg lg:text-2xl">
              Planifier sur la carte
            </h1>
            <p className="text-[11px] sm:text-xs text-white/95 leading-snug drop-shadow">
              Clique la carte ou cherche un lieu pour ajouter une étape
            </p>
          </div>
          {/* Compteur d'étapes — badge glassy */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/25 backdrop-blur-md text-xs font-bold flex-shrink-0 shadow-lg"
            title={`${stops.length} étape${stops.length > 1 ? 's' : ''}`}
          >
            <MapPin size={13} />
            {stops.length}
          </div>
        </div>
      </div>

      {/* ══ SEARCH BAR ══ */}
      <div className="relative z-[999] border-b border-gray-200 bg-white px-4 py-2 lg:px-8">
        <div className="relative lg:mx-auto lg:max-w-4xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher n'importe quel lieu (ville, monument, quartier…)"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-300 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />
          {searching && (
            <Loader2 size={16} className="absolute right-9 top-1/2 -translate-y-1/2 text-blue-500 animate-spin" />
          )}
          {search && (
            <button onClick={() => { setSearch(''); setSearchResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Résultats autocomplete : on filtre les étapes déjà ajoutées
            (sinon une ligne semi-transparente apparaît avec juste l'icône
            visible — perçu comme un bug d'UI). */}
        {(() => {
          const visibleResults = searchResults.filter(
            (r) => !stops.some((s) => s.id === r.id),
          );
          const showDropdown =
            search.trim().length >= 2 && (visibleResults.length > 0 || !searching);
          if (!showDropdown) return null;
          return (
            <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto z-[1001]">
              {visibleResults.length === 0 && !searching && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  {searchResults.length > 0
                    ? 'Toutes les correspondances sont déjà dans ton itinéraire.'
                    : `Aucun lieu trouvé pour « ${search} »`}
                </div>
              )}
              {visibleResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => addStop(r)}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <MapPin
                    size={16}
                    className={
                      r.source === 'stop'
                        ? 'text-emerald-500 flex-shrink-0'
                        : 'text-blue-500 flex-shrink-0'
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{r.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {r.source === 'osm' ? r.fullName : r.country}
                    </p>
                  </div>
                  <Plus size={16} className="text-blue-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          );
        })()}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* ══ CARTE ══ */}
      <div className="relative flex-1 lg:min-w-0">
        <MapContainer
          center={[departure.lat, departure.lon]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          ref={(m) => { if (m) mapRef.current = m; }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBoundsOnUpdate points={points} enabled={autoFit} />
          <FocusDepartureOnChange departure={departure} />
          <MapClickHandler onClick={handleMapClick} />

          {/* Polylines */}
          {legs.map((leg, i) => {
            const from = points[i], to = points[i + 1];
            const meta = MODE_META[leg.selectedMode];
            return (
              <Polyline
                key={leg.key}
                positions={[[from.lat, from.lon], [to.lat, to.lon]]}
                pathOptions={{ color: meta.color, weight: 4, opacity: 0.95, dashArray: meta.dashed ? '10 6' : undefined }}
              />
            );
          })}

          {/* Marqueurs sélectionnés (départ + stops) */}
          {points.map((p, idx) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lon]}
              icon={makeStopIcon(String(idx + 1), p.isOrigin, !p.isOrigin && idx === points.length - 1)}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{idx + 1}. {p.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    {p.isOrigin ? 'Point de départ' : `Étape ${idx}`}
                  </div>
                  {!p.isOrigin && (
                    <button
                      onClick={() => removeStop(p.id)}
                      style={{
                        marginTop: 8, padding: '4px 10px', background: '#FEE2E2',
                        color: '#B91C1C', border: 'none', borderRadius: 6,
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Suggestions sur la carte (villes connues) */}
          {showSuggestionsOnMap && mapSuggestions.map((c) => {
            const g = stopCityToResult(c);
            return (
              <Marker
                key={`s-${c.id}`}
                position={[c.lat!, c.lon!]}
                icon={makeSuggestionIcon()}
                eventHandlers={{ click: () => addStop(g) }}
              >
                <Popup>
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{c.country}</div>
                    <button
                      onClick={() => addStop(g)}
                      style={{
                        marginTop: 6, padding: '4px 10px', background: '#3B82F6',
                        color: '#fff', border: 'none', borderRadius: 6,
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      + Ajouter à mon voyage
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Popup au clic libre sur la carte (reverse geocoding) */}
          {pendingClick && (
            <Popup
              position={[pendingClick.lat, pendingClick.lon] as any}
              eventHandlers={{ remove: () => setPendingClick(null) }}
            >
              <div style={{ minWidth: 200 }}>
                {pendingClick.loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3B82F6', animation: 'pulse 1s infinite' }} />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>Identification du lieu…</span>
                  </div>
                ) : pendingClick.result ? (
                  <>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>Lieu identifié :</div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginTop: 2 }}>{pendingClick.result.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, lineHeight: 1.3 }}>
                      {pendingClick.result.country}
                    </div>
                    <button
                      onClick={() => addStop(pendingClick.result!)}
                      style={{
                        marginTop: 8, padding: '6px 12px', background: '#3B82F6',
                        color: '#fff', border: 'none', borderRadius: 6,
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', width: '100%',
                      }}
                    >
                      + Ajouter ce lieu
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Aucun lieu trouvé ici</div>
                    <button
                      onClick={() => {
                        const fallback: GeoResult = {
                          id: `coord-${pendingClick.lat.toFixed(4)}-${pendingClick.lon.toFixed(4)}`,
                          name: `${pendingClick.lat.toFixed(3)}, ${pendingClick.lon.toFixed(3)}`,
                          fullName: `Coordonnées ${pendingClick.lat.toFixed(3)}, ${pendingClick.lon.toFixed(3)}`,
                          country: '',
                          lat: pendingClick.lat, lon: pendingClick.lon,
                          source: 'osm',
                        };
                        addStop(fallback);
                      }}
                      style={{
                        marginTop: 8, padding: '6px 12px', background: '#6B7280',
                        color: '#fff', border: 'none', borderRadius: 6,
                        fontSize: 11, fontWeight: 700, cursor: 'pointer', width: '100%',
                      }}
                    >
                      Ajouter par coordonnées
                    </button>
                  </>
                )}
              </div>
            </Popup>
          )}
        </MapContainer>

        {/* Toggles flottants — disposition horizontale pour rester compacts
            même quand le drawer est ouvert au max (78 vh). */}
        <div className="absolute top-2 right-2 z-[400] flex flex-row gap-1.5">
          <button
            onClick={() => setShowSuggestionsOnMap((v) => !v)}
            className="px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-[11px] font-semibold flex items-center gap-1"
            style={{ color: showSuggestionsOnMap ? '#10B981' : '#6B7280' }}
            data-touch="compact"
            title={showSuggestionsOnMap ? 'Villes visibles' : 'Villes masquées'}
          >
            {showSuggestionsOnMap ? '● Villes' : '○ Villes'}
          </button>
          <button
            onClick={() => setAutoFit((v) => !v)}
            className="px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg text-[11px] font-semibold flex items-center gap-1"
            style={{ color: autoFit ? '#10B981' : '#6B7280' }}
            data-touch="compact"
            title={autoFit ? 'Auto-zoom activé' : 'Zoom libre'}
          >
            {autoFit ? '● Auto-zoom' : '○ Libre'}
          </button>
        </div>
      </div>

      {/* ══ PANNEAU INFÉRIEUR (drawer drag-to-resize) ══ */}
      <motion.div
        className="z-[800] flex flex-col overflow-hidden border-t border-gray-200 bg-white lg:w-[420px] lg:shrink-0 lg:self-stretch lg:!h-auto lg:border-l lg:border-t-0"
        style={{
          boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
          height: heightMV,
        }}
      >
        {/* Handle / résumé — toute la barre est draggable au doigt */}
        <motion.div
          onPanStart={handleDrawerPanStart}
          onPan={handleDrawerPan}
          onPanEnd={handleDrawerPanEnd}
          className="relative flex shrink-0 cursor-grab select-none items-center gap-3 border-b border-gray-100 px-4 pt-4 pb-3 active:cursor-grabbing lg:cursor-default lg:pt-5"
          style={{ touchAction: 'none' }}
          data-touch="no-feedback"
        >
          {/* Barre de drag visible (plus grosse, type iOS) */}
          <div className="pointer-events-none absolute left-1/2 top-2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-gray-300 lg:hidden" />

          <div className="flex-1 text-left mt-1 pointer-events-none">
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              <span className="lg:hidden">Glisse pour redimensionner</span>
              <span className="hidden lg:inline">Itinéraire de travail</span>
            </p>
            <p className="text-sm font-bold text-gray-900">
              {stops.length === 0
                ? 'Aucune étape — clique la carte'
                : `${stops.length} étape${stops.length > 1 ? 's' : ''} · ${legs.length} trajet${legs.length > 1 ? 's' : ''}${totalDuration ? ` · ${formatDuration(totalDuration)}` : ''}`}
            </p>
          </div>
          {budget && (
            <div className="text-right pointer-events-none">
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Budget</p>
              <p className="font-bold text-blue-600">{budget.total}€</p>
            </div>
          )}
        </motion.div>

        {/* Contenu (scrollable) — toujours monté, clippé par overflow-hidden du parent
            pour éviter tout saut visuel quand on baisse le drawer */}
        {true && (
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 lg:px-5 lg:py-4">

            {/* ── Réglages compacts : départ + voyageurs sur la même ligne avec
                EXACTEMENT le même style (icône inline + contenu), puis dates en dessous. ── */}
            <div className="grid grid-cols-2 gap-2">
              {/* Départ — même structure que voyageurs : flex inline icône + select transparent */}
              <label className="flex items-center gap-1.5 px-2 py-1 rounded-xl border border-gray-300 bg-white cursor-pointer" title="Point de départ">
                <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                <select
                  value={departureCityId}
                  onChange={(e) => setDepartureCityId(e.target.value)}
                  className="flex-1 min-w-0 bg-transparent outline-none text-sm font-bold tabular-nums appearance-none cursor-pointer truncate"
                  aria-label="Point de départ"
                >
                  {DEPARTURE_CITIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </label>

              {/* Voyageurs — compact, icône + valeur + +/- */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl border border-gray-300 bg-white" title="Voyageurs">
                <Users size={14} className="text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                  className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-sm"
                  data-touch="compact"
                  aria-label="Moins de voyageurs"
                >−</button>
                <span className="flex-1 text-center font-bold text-sm tabular-nums">{travelers}</span>
                <button
                  onClick={() => setTravelers((t) => Math.min(20, t + 1))}
                  className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-sm"
                  data-touch="compact"
                  aria-label="Plus de voyageurs"
                >+</button>
              </div>
            </div>

            {/* Dates : ligne dédiée (le picker a son propre composant visuel large) */}
            <EmirateDatePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />

            {/* ── Liste des étapes (réordonnable) ── */}
            {stops.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-sm font-bold text-gray-900">
                    Étapes du voyage <span className="text-gray-400 font-normal">({stops.length})</span>
                  </h3>
                  {/* Bouton "Tout effacer" relocalisé ici, à côté des étapes individuelles.
                      Label explicite sur le contenu effacé. */}
                  <button
                    onClick={() => {
                      if (confirm('Effacer toutes les étapes de la carte ?\n\nCela supprimera les villes ajoutées, les modes de transport choisis et l\'itinéraire calculé. Tes dates et voyageurs sont conservés.')) {
                        clearAll();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 text-[11px] font-bold transition-colors border border-red-200"
                    title="Effacer toutes les étapes ajoutées sur la carte"
                  >
                    <Trash2 size={13} />
                    Tout effacer
                  </button>
                </div>
                <div className="space-y-1.5">
                  {/* Départ (figé) */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{departure.label}</p>
                      <p className="text-[10px] text-emerald-700 uppercase font-semibold">Départ</p>
                    </div>
                  </div>

                  {/* Stops */}
                  {stops.map((s, idx) => {
                    const num = idx + 2;
                    const isLast = idx === stops.length - 1;
                    return (
                      <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200">
                        <div
                          className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: isLast ? '#6366F1' : '#F59E0B' }}
                        >{num}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{s.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{s.country}</p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button
                            onClick={() => moveStop(s.id, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          ><ArrowUp size={14} /></button>
                          <button
                            onClick={() => moveStop(s.id, 1)}
                            disabled={isLast}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                          ><ArrowDown size={14} /></button>
                          <button
                            onClick={() => removeStop(s.id)}
                            className="p-1 rounded hover:bg-red-50 text-red-500"
                          ><X size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Trajets avec sélecteur de mode ── */}
            {legs.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Modes de transport</h3>
                <div className="space-y-2">
                  {legs.map((leg) => {
                    const meta = MODE_META[leg.selectedMode];
                    const Icon = meta.Icon;
                    const sel = leg.alternatives.find((a) => a.mode === leg.selectedMode);
                    return (
                      <div key={leg.key} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                        <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100 bg-gray-50">
                          <span className="text-xs font-semibold text-gray-700 truncate">
                            {leg.fromName} → {leg.toName}
                          </span>
                          <span className="ml-auto text-[10px] text-gray-500">{leg.distanceKm} km</span>
                        </div>
                        <div className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {leg.alternatives.map((alt) => {
                              const m = MODE_META[alt.mode as ModeKey];
                              if (!m) return null;
                              const AltIcon = m.Icon;
                              const isSelected = alt.mode === leg.selectedMode;
                              const isRecommended = alt.mode === leg.recommendedMode;
                              return (
                                <button
                                  key={alt.mode}
                                  onClick={() => handlePickMode(leg.key, alt.mode as ModeKey)}
                                  className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all border-2"
                                  style={{
                                    borderColor: isSelected ? m.color : '#E5E7EB',
                                    background:  isSelected ? m.bg : '#fff',
                                    color: isSelected ? m.color : '#374151',
                                  }}
                                  title={`${formatDuration(alt.duration)}${alt.cost ? ` · ${alt.cost}` : ''}`}
                                >
                                  <AltIcon size={13} />
                                  {m.label}
                                  {isSelected && <Check size={11} />}
                                  {!isSelected && isRecommended && (
                                    <span className="text-[9px] bg-blue-100 text-blue-700 px-1 rounded">★</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {sel && (
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-600">
                              <Icon size={11} style={{ color: meta.color }} />
                              <span style={{ color: meta.color, fontWeight: 700 }}>{meta.label}</span>
                              <span>· {formatDuration(sel.duration)}</span>
                              {sel.cost && <span>· {sel.cost}/pers</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Suggestions partenaires (hôtels / vols / eSIM) ── */}
            {stops.length > 0 && (
              <PlannerSuggestions
                city={stops[0].name}
                country={stops[0].country}
                fromCity={departure.label}
                fromIata={departure.iata}
                startDate={startDate}
                endDate={endDate}
                travelers={travelers}
              />
            )}

            {/* ── Budget ── */}
            {budget && (
              <div className="rounded-2xl p-4 text-white" style={{ background: 'linear-gradient(135deg,#0F4C81,#3B82F6)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">Budget estimé</h3>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">indicatif</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="opacity-85">Transports ({budget.legCount}× × {travelers})</span><span className="font-semibold">{budget.flights}€</span></div>
                  <div className="flex justify-between"><span className="opacity-85">Hôtels (~{nights} nuits)</span><span className="font-semibold">{budget.hotel}€</span></div>
                  <div className="flex justify-between"><span className="opacity-85">Resto/activités</span><span className="font-semibold">{budget.food + budget.activities}€</span></div>
                  <div className="flex justify-between text-base mt-1.5 pt-1.5 border-t border-white/25">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-2xl">{budget.total}€</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Bouton sauvegarde ── */}
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold transition-all"
              style={{
                background: canSave && !saving ? 'linear-gradient(135deg,#10B981,#059669)' : '#E5E7EB',
                color: canSave && !saving ? '#fff' : '#9CA3AF',
                cursor: canSave && !saving ? 'pointer' : 'not-allowed',
                boxShadow: canSave && !saving ? '0 8px 20px rgba(16,185,129,0.3)' : 'none',
              }}
            >
              <Save size={18} />
              {saving
                ? 'Enregistrement…'
                : !user
                  ? 'Connecte-toi pour enregistrer'
                  : !startDate || !endDate
                    ? 'Choisis tes dates'
                    : stops.length === 0
                      ? 'Ajoute au moins une étape'
                      : 'Continuer vers la réservation'}
            </button>

            <p className="text-[11px] text-center text-gray-500 flex items-center justify-center gap-1">
              <Info size={11} />
              Modes affichés : uniquement ceux faisables pour la distance du trajet.
            </p>
          </div>
        )}
      </motion.div>
      </div>
    </div>
  );
}
