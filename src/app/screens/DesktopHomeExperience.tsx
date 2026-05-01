import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Compass,
  Filter,
  LocateFixed,
  Map,
  MapPin,
  Route,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  TicketPercent,
} from 'lucide-react';
import { DesktopLocalMap, getPlacePriceLabel, getPlaceTypeLabel } from '../components/DesktopLocalMap';
import {
  DESKTOP_FILTERS,
  LIVE_LOCAL_SIGNALS,
  LOCAL_PLACES,
  SMART_ROUTE,
  type DesktopMode,
} from '../data/desktopLocalExperience';

const MODE_OPTIONS: Array<{ id: DesktopMode; label: string; helper: string }> = [
  { id: 'smart', label: 'Mix intelligent', helper: 'Tourisme + economie locale' },
  { id: 'tourism', label: 'Explorer', helper: 'Sites, musees, quartiers' },
  { id: 'local', label: 'Vie locale', helper: 'Commerces, offres, evenements' },
];

function filterPlaces(mode: DesktopMode) {
  if (mode === 'tourism') return LOCAL_PLACES.filter((place) => place.type === 'tourism');
  if (mode === 'local') return LOCAL_PLACES.filter((place) => place.type !== 'tourism');
  return LOCAL_PLACES;
}

export function DesktopHomeExperience() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<DesktopMode>('smart');
  const [activePlaceId, setActivePlaceId] = useState<string | null>(LOCAL_PLACES[0]?.id ?? null);

  const visiblePlaces = useMemo(() => filterPlaces(mode), [mode]);
  const activePlace = visiblePlaces.find((place) => place.id === activePlaceId) || visiblePlaces[0];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f7f9f8] px-6 py-5">
      <div className="grid min-h-[calc(100vh-120px)] grid-cols-[292px_minmax(0,1fr)_322px] gap-4">
        <aside className="flex min-h-0 flex-col rounded-lg border bg-white" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
          <div className="border-b p-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Accueil desktop</p>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">Paris Est</h1>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white transition hover:bg-slate-800"
                title="Centrer sur ma position"
              >
                <LocateFixed className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigate('/destination-count')}
              className="flex w-full items-center gap-3 rounded-lg border bg-slate-50 px-3 py-3 text-left transition hover:border-sky-300 hover:bg-white"
              style={{ borderColor: 'var(--lokadia-gray-200)' }}
            >
              <Search className="h-5 w-5 text-sky-700" />
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-950">Rechercher un quartier</p>
                <p className="truncate text-xs text-slate-500">Adresse, commerce, monument</p>
              </div>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <Compass className="h-4 w-4 text-sky-700" />
                Mode d'exploration
              </div>
              <div className="grid gap-2">
                {MODE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setMode(option.id);
                      const first = filterPlaces(option.id)[0];
                      if (first) setActivePlaceId(first.id);
                    }}
                    className="rounded-lg border px-3 py-2.5 text-left transition hover:border-sky-300"
                    style={{
                      borderColor: mode === option.id ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)',
                      background: mode === option.id ? 'var(--lokadia-info-bg)' : '#fff',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-950">{option.label}</span>
                      {mode === option.id && <Check className="h-4 w-4 text-sky-700" />}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{option.helper}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                Sejour
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" className="rounded-lg border px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Aujourd'hui
                </button>
                <button type="button" className="rounded-lg border px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  2 voyageurs
                </button>
              </div>
            </div>

            <div className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900">
                <SlidersHorizontal className="h-4 w-4 text-amber-600" />
                Filtres visibles
              </div>
              <div className="space-y-2">
                {DESKTOP_FILTERS.map((filter) => (
                  <label key={filter.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-semibold text-slate-700">
                    <span>{filter.label}</span>
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-sky-700" />
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-lg border bg-slate-50 p-3" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Distance</span>
                <span className="text-xs font-bold text-sky-700">2 km</span>
              </div>
              <input type="range" min="1" max="10" defaultValue="2" className="w-full accent-sky-700" />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input type="checkbox" defaultChecked className="accent-emerald-600" />
                  Ouvert
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <input type="checkbox" defaultChecked className="accent-amber-500" />
                  Offres
                </label>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-black uppercase text-emerald-700">
                  Quartier vivant
                </span>
                <span className="rounded-md bg-amber-100 px-2 py-1 text-xs font-black uppercase text-amber-700">
                  Donnees temps reel
                </span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-950">
                Explorer sans quitter la carte
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/trips/create')}
                className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                <Route className="h-4 w-4" />
                Parcours
              </button>
              <button
                type="button"
                onClick={() => navigate('/map')}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Map className="h-4 w-4" />
                Carte plein ecran
              </button>
            </div>
          </div>

          <div className="h-[52vh] min-h-[420px]">
            <DesktopLocalMap
              places={visiblePlaces}
              activePlaceId={activePlaceId}
              onHoverPlace={setActivePlaceId}
              onSelectPlace={setActivePlaceId}
            />
          </div>

          <section className="mt-4 grid grid-cols-3 gap-3">
            {visiblePlaces.slice(0, 3).map((place) => (
              <button
                key={place.id}
                type="button"
                onMouseEnter={() => setActivePlaceId(place.id)}
                onClick={() => setActivePlaceId(place.id)}
                className="group overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderColor: activePlace?.id === place.id ? place.color : 'var(--lokadia-gray-200)' }}
              >
                <div className="flex gap-3 p-3">
                  <img src={place.image} alt="" className="h-20 w-24 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold uppercase text-slate-500">
                        {getPlaceTypeLabel(place.type)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {place.rating}
                      </span>
                    </div>
                    <p className="truncate text-sm font-black text-slate-950">{place.name}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-500">{place.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </section>
        </main>

        <aside className="min-h-0 overflow-hidden rounded-lg border bg-white" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
          <div className="border-b p-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Signal local</p>
                <h2 className="text-xl font-black text-slate-950">Maintenant</h2>
              </div>
              <Store className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="grid gap-2">
              {LIVE_LOCAL_SIGNALS.map((signal) => (
                <div key={signal.label} className="rounded-lg border p-3" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-bold uppercase text-slate-500">{signal.label}</span>
                    <span className="text-2xl font-black" style={{ color: signal.tone }}>{signal.value}</span>
                  </div>
                  <p className="text-xs text-slate-500">{signal.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-b p-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-black text-slate-950">Parcours mix intelligent</h3>
            </div>
            <div className="space-y-2">
              {SMART_ROUTE.map((step) => (
                <div key={`${step.time}-${step.title}`} className="flex gap-3">
                  <div className="w-11 shrink-0 text-xs font-black text-slate-400">{step.time}</div>
                  <div className="min-w-0 flex-1 border-l border-slate-200 pb-2 pl-3">
                    <p className="truncate text-sm font-bold text-slate-950">{step.title}</p>
                    <p className="text-xs text-slate-500">{step.kind}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {activePlace && (
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4 text-sky-700" />
                <h3 className="text-sm font-black text-slate-950">Selection rapide</h3>
              </div>
              <img src={activePlace.image} alt="" className="mb-3 h-28 w-full rounded-lg object-cover" />
              <div className="mb-2 flex items-center justify-between">
                <p className="text-lg font-black text-slate-950">{activePlace.name}</p>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                  {getPlacePriceLabel(activePlace.price)}
                </span>
              </div>
              <p className="text-sm leading-snug text-slate-600">{activePlace.insight}</p>
              <div className="mt-3 flex items-center gap-3 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {activePlace.distance}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {activePlace.walkingTime}
                </span>
                {activePlace.offer && (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <TicketPercent className="h-3.5 w-3.5" />
                    Offre
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate('/map')}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Ouvrir le panneau detail
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
