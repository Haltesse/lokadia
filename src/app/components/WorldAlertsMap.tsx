/**
 * WorldAlertsMap — carte mondiale interactive des alertes temps réel.
 *
 * Affiche UN marqueur par alerte, géolocalisé à ses coordonnées exactes
 * (GDACS/USGS) ou au centroïde pays (épidémies, guerres, crises). Couleur
 * par sévérité, icône/label par type. Popup détaillé au clic.
 *
 * Sources agrégées : GDACS · USGS · ReliefWeb · OMS · géopolitique.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCw, Search, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  subscribeToLiveAlerts,
  getLiveAlertsSnapshot,
  fetchLiveAlerts,
  ALERT_TYPE_META,
  type LiveAlert,
  type LiveAlertsSnapshot,
} from '../lib/liveAlertsService';
import { DESTINATION_TO_COUNTRY_ISO } from '../data/countryRiskData';

const ISO_TO_DESTINATIONS = (() => {
  const m = new Map<string, string[]>();
  for (const [d, iso] of Object.entries(DESTINATION_TO_COUNTRY_ISO)) {
    (m.get(iso) ?? m.set(iso, []).get(iso)!).push(d);
  }
  return m;
})();

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

const niceLabel = (destId: string) =>
  destId.split('-').slice(0, -1).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export function WorldAlertsMap() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<LiveAlertsSnapshot | null>(getLiveAlertsSnapshot());
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToLiveAlerts((s) => setSnapshot(s));
    return () => unsub();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { setSnapshot(await fetchLiveAlerts(true)); } finally { setRefreshing(false); }
  };

  // Alertes géolocalisables (avec lat/lon)
  const located = useMemo<LiveAlert[]>(() => {
    if (!snapshot) return [];
    let list = snapshot.alerts.filter((a) => a.lat !== null && a.lon !== null);
    if (typeFilter) list = list.filter((a) => a.type === typeFilter);
    return list;
  }, [snapshot, typeFilter]);

  // Types présents (pour les filtres)
  const presentTypes = useMemo(() => {
    if (!snapshot) return [];
    const set = new Set(snapshot.alerts.map((a) => a.type));
    return [...set].filter((t) => ALERT_TYPE_META[t]);
  }, [snapshot]);

  if (!snapshot) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center" style={{ border: '1px solid var(--lokadia-gray-100)', minHeight: '320px' }}>
        <div className="animate-pulse text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>Chargement de la carte mondiale…</div>
      </div>
    );
  }

  const redCount = snapshot.alerts.filter((a) => a.severity === 'red').length;

  return (
    <div className="isolate overflow-hidden rounded-2xl bg-white" style={{ border: '1px solid var(--lokadia-gray-100)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Filtres par type */}
      <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-2.5 scrollbar-hide" style={{ borderBottom: '1px solid var(--lokadia-gray-100)' }}>
        <button
          onClick={() => setTypeFilter(null)}
          className="flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-bold transition-colors"
          style={{ background: typeFilter === null ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-100)', color: typeFilter === null ? 'white' : 'var(--lokadia-gray-700)' }}
        >
          Tout ({snapshot.alerts.length})
        </button>
        {presentTypes.map((t) => {
          const meta = ALERT_TYPE_META[t];
          const count = snapshot.stats[t] ?? 0;
          const active = typeFilter === t;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(active ? null : t)}
              className="flex-shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-colors"
              style={{ background: active ? meta.color : `${meta.color}15`, color: active ? 'white' : meta.color }}
            >
              <meta.Icon className="h-3.5 w-3.5" /> {meta.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="relative" style={{ height: '440px' }}>
        <MapContainer center={[25, 15]} zoom={2} minZoom={2} maxZoom={7} scrollWheelZoom={false} worldCopyJump style={{ height: '100%', width: '100%', background: '#f1f5f9' }} attributionControl={false}>
          <MapResizer />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap &copy; CARTO" subdomains="abcd" />

          {located.map((a, i) => {
            const meta = ALERT_TYPE_META[a.type] ?? ALERT_TYPE_META.other;
            const isRed = a.severity === 'red';
            const radius = isRed ? 9 : 7;
            const destinations = a.countryIso ? ISO_TO_DESTINATIONS.get(a.countryIso) ?? [] : [];
            return (
              <CircleMarker
                key={`${a.source}-${i}`}
                center={[a.lat!, a.lon!]}
                radius={radius}
                pathOptions={{
                  color: isRed ? '#dc2626' : meta.color,
                  fillColor: meta.color,
                  fillOpacity: 0.7,
                  weight: isRed ? 2.5 : 1.5,
                }}
              >
                <Popup maxWidth={260}>
                  <div className="text-sm" style={{ minWidth: '210px' }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <meta.Icon className="h-5 w-5" style={{ color: meta.color }} />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide flex items-center gap-1" style={{ color: meta.color }}>
                          {meta.label} {isRed && <><span>·</span><AlertTriangle className="h-3 w-3" /></>}
                        </p>
                        <p className="text-xs font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{a.countryIso || '—'}</p>
                      </div>
                    </div>
                    <p className="text-[11px] leading-snug mb-1.5" style={{ color: 'var(--lokadia-gray-700)' }}>{a.description}</p>
                    <p className="text-[9px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                      {a.source} · {new Date(a.detectedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </p>
                    {destinations.length > 0 && (
                      <div className="mt-2 pt-2 border-t flex flex-wrap gap-1" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                        {destinations.slice(0, 3).map((d) => (
                          <button
                            key={d}
                            onClick={() => navigate(`/destination/${d}`)}
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{ background: 'var(--lokadia-info-bg)', color: 'var(--lokadia-primary)' }}
                          >
                            {niceLabel(d)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Compteur live */}
        <div className="absolute top-3 right-3 z-[400] rounded-xl bg-white p-2.5 shadow-md" style={{ border: '1px solid var(--lokadia-gray-100)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--lokadia-gray-600)' }}>En direct</p>
          <p className="text-xl font-bold tabular-nums leading-none mt-0.5" style={{ color: 'var(--lokadia-gray-900)' }}>{located.length}</p>
          <p className="text-[10px] font-bold" style={{ color: 'var(--lokadia-gray-500)' }}>
            alertes {redCount > 0 && <span style={{ color: '#dc2626' }}>· {redCount} critique{redCount > 1 ? 's' : ''}</span>}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="absolute bottom-3 right-3 z-[400] flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition-transform active:scale-90"
          aria-label="Actualiser"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: 'var(--lokadia-primary)' }} />
        </button>

        {located.length === 0 && (
          <div className="absolute inset-0 z-[300] flex items-center justify-center backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.85)' }}>
            <div className="text-center">
              <div className="mb-2 flex justify-center">{typeFilter ? <Search className="h-10 w-10" style={{ color: 'var(--lokadia-gray-400)' }} /> : <ShieldCheck className="h-10 w-10" style={{ color: '#15803d' }} />}</div>
              <p className="text-sm font-bold" style={{ color: typeFilter ? 'var(--lokadia-gray-700)' : '#15803d' }}>
                {typeFilter ? 'Aucune alerte de ce type' : 'Aucune alerte majeure'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-[10px]" style={{ background: '#f8fafc', borderTop: '1px solid var(--lokadia-gray-100)', color: 'var(--lokadia-gray-600)' }}>
        <span className="font-bold">Sources : {snapshot.sources.join(' · ')}</span>
        <span className="font-bold tabular-nums">MAJ {new Date(snapshot.lastFetch).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
      </div>
    </div>
  );
}
