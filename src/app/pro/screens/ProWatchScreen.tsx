/**
 * ProWatchScreen — veille par pays suivi et carte « qui est où ».
 *
 * Promesse tenue à l'écran : ZÉRO BRUIT. La file d'alertes ne contient que
 * des CHANGEMENTS constatés sur des pays où l'organisation a des personnes.
 * Un pays suivi sans personne sur place est affiché comme tel — il ne
 * générera rien tant que personne n'y sera.
 *
 * La carte distingue explicitement la présence déclarée (mission) du
 * dernier point connu (position transmise volontairement lors d'un
 * check-in), avec son ancienneté. Aucun suivi continu, jamais.
 */
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Eye, Plus, Trash2, RefreshCw, CheckCircle2, AlertTriangle, Radio,
  Siren, MapPin, Users,
} from 'lucide-react';
import { useOrg } from '../OrgContext';
import { useAuth } from '../../context/AuthContext';
import {
  fetchWatchedCountries, fetchWatchAlerts, watchCountry, unwatchCountry,
  acknowledgeWatchAlert, runWatchScan, fetchMissions, fetchCheckins,
  fetchCheckinResponses, isMissionActiveToday,
  type WatchedCountry, type WatchAlert, type MissionWithCompliance,
} from '../proService';
import { hasFeature } from '../entitlements';
import { destinationCoordinates } from '../../data/destinationCoordinates';
import type { PresencePoint } from '../components/PresenceMap';

const PresenceMap = lazy(() => import('../components/PresenceMap'));

const SEVERITY_META: Record<string, { label: string; color: string; bg: string; Icon: typeof Radio }> = {
  info: { label: 'Information', color: '#0369A1', bg: 'rgba(14,165,233,0.12)', Icon: Radio },
  vigilance: { label: 'Vigilance', color: 'var(--lokadia-warning)', bg: 'rgba(245,158,11,0.14)', Icon: AlertTriangle },
  urgent: { label: 'Urgence', color: 'var(--lokadia-danger)', bg: 'rgba(220,38,38,0.14)', Icon: Siren },
};

function WatchLocked() {
  return (
    <div className="mx-auto max-w-xl rounded-3xl bg-white p-10 text-center" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
      <Eye className="mx-auto mb-3" size={32} style={{ color: 'var(--lokadia-gray-300)' }} />
      <h1 className="text-lg font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
        La veille par pays est incluse à partir de l'offre Pro
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed" style={{ color: 'var(--lokadia-gray-600)' }}>
        Notification uniquement quand la situation change dans un pays où vous avez
        des personnes, et carte « qui est où » avec l'ancienneté du dernier point connu.
      </p>
    </div>
  );
}

export default function ProWatchScreen() {
  const { user } = useAuth();
  const { org, membership } = useOrg();
  const canWrite = membership?.role === 'admin' || membership?.role === 'manager';
  const actor = user ? { id: user.id, email: user.email } : null;

  const [watched, setWatched] = useState<WatchedCountry[]>([]);
  const [alerts, setAlerts] = useState<WatchAlert[]>([]);
  const [missions, setMissions] = useState<MissionWithCompliance[]>([]);
  const [positions, setPositions] = useState<Map<string, { lat: number; lon: number; at: string }>>(new Map());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [scanMsg, setScanMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!org) return;
    setStatus('loading');
    try {
      const [w, a, m] = await Promise.all([
        fetchWatchedCountries(org.id), fetchWatchAlerts(org.id), fetchMissions(org.id),
      ]);
      setWatched(w); setAlerts(a); setMissions(m);

      // Derniers points connus : positions transmises lors des check-ins
      const checkins = await fetchCheckins(org.id);
      const map = new Map<string, { lat: number; lon: number; at: string }>();
      for (const c of checkins.slice(0, 5)) {
        const responses = await fetchCheckinResponses(c.id);
        for (const r of responses) {
          if (r.position_lat === null || r.position_lon === null || !r.responded_at) continue;
          const existing = map.get(r.traveler_id);
          if (!existing || existing.at < r.responded_at) {
            map.set(r.traveler_id, { lat: r.position_lat, lon: r.position_lon, at: r.responded_at });
          }
        }
      }
      setPositions(map);
      setStatus('ready');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Chargement impossible.');
      setStatus('error');
    }
  }, [org]);

  useEffect(() => { load(); }, [load]);

  /** Pays où l'organisation a des personnes aujourd'hui. */
  const presence = useMemo(() => {
    const byCountry = new Map<string, { name: string; iso: string; travelers: Set<string> }>();
    for (const m of missions) {
      if (!isMissionActiveToday(m)) continue;
      const iso = m.country_iso.toUpperCase();
      if (!byCountry.has(iso)) byCountry.set(iso, { name: m.country_name, iso, travelers: new Set() });
      byCountry.get(iso)!.travelers.add(m.traveler_id);
    }
    return byCountry;
  }, [missions]);

  /** Points de la carte : présence déclarée + derniers points connus. */
  const mapPoints = useMemo<PresencePoint[]>(() => {
    const points: PresencePoint[] = [];
    const placed = new Set<string>();

    // 1. Positions transmises volontairement — elles priment
    for (const m of missions) {
      if (!isMissionActiveToday(m)) continue;
      const pos = positions.get(m.traveler_id);
      if (!pos) continue;
      placed.add(m.traveler_id);
      const name = m.travelers ? `${m.travelers.first_name} ${m.travelers.last_name}` : 'Voyageur';
      points.push({
        key: `pos-${m.traveler_id}`,
        lat: pos.lat, lon: pos.lon,
        label: name,
        countryName: m.country_name,
        count: 1,
        names: [name],
        score: null,
        isKnownPosition: true,
        ageMinutes: Math.round((Date.now() - new Date(pos.at).getTime()) / 60000),
      });
    }

    // 2. Présence déclarée, regroupée par destination du catalogue
    const groups = new Map<string, { names: string[]; countryName: string; city: string | null }>();
    for (const m of missions) {
      if (!isMissionActiveToday(m) || placed.has(m.traveler_id)) continue;
      const key = m.destination_id ?? m.country_iso.toUpperCase();
      const name = m.travelers ? `${m.travelers.first_name} ${m.travelers.last_name}` : 'Voyageur';
      if (!groups.has(key)) groups.set(key, { names: [], countryName: m.country_name, city: m.city });
      groups.get(key)!.names.push(name);
    }

    for (const [key, g] of groups) {
      const coords = destinationCoordinates[key];
      // Sans coordonnées connues, on n'invente pas un point sur la carte
      if (!coords) continue;
      points.push({
        key: `decl-${key}`,
        lat: coords.lat, lon: coords.lon,
        label: g.city ?? g.countryName,
        countryName: g.countryName,
        count: g.names.length,
        names: g.names,
        score: null,
        isKnownPosition: false,
        ageMinutes: null,
      });
    }

    return points;
  }, [missions, positions]);

  /** Destinations en mission mais hors catalogue : signalées, pas masquées. */
  const unmappable = useMemo(() => {
    const missing = new Set<string>();
    for (const m of missions) {
      if (!isMissionActiveToday(m)) continue;
      if (positions.has(m.traveler_id)) continue;
      const key = m.destination_id ?? m.country_iso.toUpperCase();
      if (!destinationCoordinates[key]) missing.add(m.country_name);
    }
    return [...missing];
  }, [missions, positions]);

  const openAlerts = alerts.filter((a) => a.status === 'open');
  const watchedIso = new Set(watched.map((w) => w.country_iso.toUpperCase()));
  const suggestions = [...presence.values()].filter((p) => !watchedIso.has(p.iso));

  if (!hasFeature(org?.tier, 'watchlist')) return <WatchLocked />;

  async function addCountry(iso: string, name: string) {
    if (!org || !actor) return;
    try {
      await watchCountry(org.id, actor, iso, name);
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Ajout impossible.');
    }
  }

  async function removeCountry(w: WatchedCountry) {
    if (!org || !actor) return;
    if (!window.confirm(`Ne plus suivre ${w.country_name} ? Les alertes déjà reçues restent dans l'historique.`)) return;
    await unwatchCountry(org.id, actor, w.id, w.country_name);
    await load();
  }

  async function acknowledge(a: WatchAlert) {
    if (!org || !actor) return;
    await acknowledgeWatchAlert(org.id, actor, a.id, a.country_name);
    setAlerts((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: 'acknowledged' } : x)));
  }

  async function scan() {
    if (!org) return;
    setBusy(true);
    setScanMsg(null);
    try {
      const r = await runWatchScan(org.id);
      const parts = [`${r.scanned} pays analysé(s)`];
      if (r.alerts_created > 0) parts.push(`${r.alerts_created} changement(s) signalé(s)`);
      else parts.push('aucun changement significatif');
      if (r.skipped_no_people > 0) parts.push(`${r.skipped_no_people} pays sans personne sur place (non analysé)`);
      setScanMsg(parts.join(' · '));
      await load();
    } catch (err) {
      setScanMsg(err instanceof Error ? err.message : 'Analyse impossible.');
    } finally {
      setBusy(false);
    }
  }

  if (status === 'loading') {
    return (
      <div aria-busy="true">
        <div className="lk-skeleton mb-5 h-7 w-48 rounded-lg" />
        <div className="lk-skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>La veille n'a pas pu se charger</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--lokadia-gray-600)' }}>{errorMsg}</p>
        <button onClick={load} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: 'var(--lokadia-primary)' }}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Veille & présence</h1>
          <p className="text-sm" style={{ color: 'var(--lokadia-gray-500)' }}>
            {openAlerts.length > 0
              ? `${openAlerts.length} changement${openAlerts.length > 1 ? 's' : ''} à traiter`
              : 'Aucun changement à traiter'}
            {' · '}{watched.length} pays suivi{watched.length > 1 ? 's' : ''}
          </p>
        </div>
        {canWrite && (
          <button onClick={scan} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--lokadia-primary)' }}>
            <RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> {busy ? 'Analyse…' : 'Analyser maintenant'}
          </button>
        )}
      </div>

      {scanMsg && (
        <p className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: 'var(--lokadia-info-bg)', color: 'var(--lokadia-gray-700)' }}>
          {scanMsg}
        </p>
      )}

      {/* ─── Carte « qui est où » ─── */}
      <section className="rounded-2xl bg-white p-5" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
            <MapPin size={15} /> Qui est où, maintenant
          </h2>
          <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            Cercle plein = présence déclarée · cercle cerclé de blanc = position transmise lors d'un check-in
          </p>
        </div>
        <Suspense fallback={<div className="lk-skeleton h-96 rounded-2xl" />}>
          <PresenceMap points={mapPoints} />
        </Suspense>
        {unmappable.length > 0 && (
          <p className="mt-2.5 text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
            Non localisable sur la carte, faute de coordonnées au catalogue : {unmappable.join(', ')}.
            Ces personnes restent comptées dans les effectifs.
          </p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ─── File d'alertes ─── */}
        <section className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <div className="border-b px-5 py-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>Changements constatés</h2>
            <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
              Uniquement ce qui a changé, et uniquement là où vous avez des personnes.
            </p>
          </div>
          {alerts.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <CheckCircle2 className="mx-auto mb-2" size={28} style={{ color: 'var(--lokadia-gray-300)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--lokadia-gray-700)' }}>Rien à signaler</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-500)' }}>
                Une file vide est une bonne nouvelle : elle signifie qu'aucun pays où vous
                avez des personnes n'a changé d'état depuis la dernière analyse.
              </p>
            </div>
          ) : (
            <ul>
              {alerts.map((a) => {
                const meta = SEVERITY_META[a.severity] ?? SEVERITY_META.info;
                const isOpen = a.status === 'open';
                return (
                  <li key={a.id} className="border-t first:border-t-0 px-5 py-3.5" style={{ borderColor: 'var(--lokadia-gray-100)', opacity: isOpen ? 1 : 0.6 }}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: meta.bg }}>
                        <meta.Icon size={14} style={{ color: meta.color }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: meta.color }}>{meta.label}</span>
                          <span className="text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>{a.country_name}</span>
                          <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                            <Users size={11} /> {a.people_count} sur place
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm leading-snug" style={{ color: 'var(--lokadia-gray-700)' }}>{a.summary}</p>
                        <p className="mt-1 text-[11px]" style={{ color: 'var(--lokadia-gray-400)' }}>
                          {new Date(a.created_at).toLocaleString('fr-FR')}
                          {a.sources && a.sources.length > 0 && ` · Sources : ${a.sources.slice(0, 4).join(', ')}`}
                        </p>
                      </div>
                      {isOpen && canWrite && (
                        <button onClick={() => acknowledge(a)} className="flex-shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold" style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-gray-700)' }}>
                          Traiter
                        </button>
                      )}
                      {!isOpen && (
                        <span className="flex-shrink-0 text-[11px] font-semibold" style={{ color: 'var(--lokadia-success)' }}>Traité</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* ─── Pays suivis ─── */}
        <section className="rounded-2xl bg-white" style={{ boxShadow: 'var(--shadow-sm)', border: '1px solid var(--lokadia-gray-100)' }}>
          <div className="border-b px-4 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <h2 className="flex items-center gap-1.5 text-sm font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
              <Eye size={14} /> Pays suivis
            </h2>
          </div>

          {watched.length === 0 ? (
            <p className="px-4 py-5 text-xs leading-relaxed" style={{ color: 'var(--lokadia-gray-500)' }}>
              Aucun pays suivi. Ajoutez ceux où vous envoyez des personnes : vous ne serez
              notifié que si la situation y change.
            </p>
          ) : (
            <ul className="divide-y" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
              {watched.map((w) => {
                const people = presence.get(w.country_iso.toUpperCase())?.travelers.size ?? 0;
                return (
                  <li key={w.id} className="flex items-center justify-between gap-2 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>{w.country_name}</p>
                      <p className="text-[11px]" style={{ color: people > 0 ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-400)' }}>
                        {people > 0
                          ? `${people} personne${people > 1 ? 's' : ''} sur place — analysé`
                          : 'personne sur place — non analysé'}
                      </p>
                    </div>
                    {canWrite && (
                      <button onClick={() => removeCountry(w)} aria-label={`Ne plus suivre ${w.country_name}`} className="flex-shrink-0 rounded-lg p-1.5 text-red-500">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {canWrite && suggestions.length > 0 && (
            <div className="border-t px-4 py-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide" style={{ color: 'var(--lokadia-gray-500)' }}>
                Vous avez des personnes ici
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s.iso}
                    onClick={() => addCountry(s.iso, s.name)}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                    style={{ borderColor: 'var(--lokadia-gray-200)', color: 'var(--lokadia-primary)' }}
                  >
                    <Plus size={11} /> {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
