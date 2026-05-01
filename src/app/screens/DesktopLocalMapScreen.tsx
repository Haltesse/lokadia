import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  ExternalLink,
  Filter,
  Heart,
  LocateFixed,
  MapPin,
  Navigation,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Star,
  TicketPercent,
  X,
} from 'lucide-react';
import { DesktopLocalMap, getPlacePriceLabel, getPlaceTypeLabel } from '../components/DesktopLocalMap';
import {
  DESKTOP_FILTERS,
  LOCAL_PLACES,
  SMART_ROUTE,
  type DesktopMode,
} from '../data/desktopLocalExperience';

const MODES: Array<{ id: DesktopMode; label: string }> = [
  { id: 'smart', label: 'Mix' },
  { id: 'tourism', label: 'Tourisme' },
  { id: 'local', label: 'Local' },
];

function matchesMode(type: string, mode: DesktopMode) {
  if (mode === 'smart') return true;
  if (mode === 'tourism') return type === 'tourism';
  return type !== 'tourism';
}

export default function DesktopLocalMapScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<DesktopMode>('smart');
  const [query, setQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState(() => new Set(DESKTOP_FILTERS.map((filter) => filter.id)));
  const [openOnly, setOpenOnly] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [distance, setDistance] = useState(2);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(LOCAL_PLACES[0]?.id ?? null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(LOCAL_PLACES[0]?.id ?? null);

  const visiblePlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return LOCAL_PLACES.filter((place) => matchesMode(place.type, mode))
      .filter((place) => activeCategories.has(place.category))
      .filter((place) => !openOnly || place.openNow)
      .filter((place) => !offersOnly || Boolean(place.offer))
      .filter((place) => {
        if (!normalizedQuery) return true;
        return [place.name, place.neighborhood, place.description, ...place.tags]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      });
  }, [activeCategories, mode, offersOnly, openOnly, query]);

  const selectedPlace = visiblePlaces.find((place) => place.id === selectedPlaceId)
    || visiblePlaces.find((place) => place.id === activePlaceId)
    || visiblePlaces[0]
    || null;

  const toggleCategory = (id: string) => {
    setActiveCategories((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="hidden lg:flex w-screen -translate-x-1/2 relative left-1/2 min-h-[calc(100vh-80px)] bg-[#f7f9f8] text-slate-950">
        <aside className="flex w-[304px] shrink-0 flex-col border-r bg-white" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
          <div className="border-b p-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <button
              type="button"
              onClick={() => navigate('/global-home')}
              className="mb-4 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Accueil
            </button>

            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Carte Lokadia</p>
                <h1 className="text-2xl font-black tracking-tight">Paris Est</h1>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white transition hover:bg-slate-800"
                title="Centrer sur ma position"
              >
                <LocateFixed className="h-5 w-5" />
              </button>
            </div>

            <label className="flex items-center gap-3 rounded-lg border bg-slate-50 px-3 py-2.5" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
              <Search className="h-5 w-5 text-sky-700" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Lieu, offre, quartier"
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <section className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-black">
                <Compass className="h-4 w-4 text-sky-700" />
                Mode
              </div>
              <div className="grid grid-cols-3 overflow-hidden rounded-lg border bg-slate-50" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
                {MODES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMode(option.id)}
                    className="px-2 py-2 text-xs font-black transition hover:bg-white"
                    style={{
                      background: mode === option.id ? '#0F172A' : 'transparent',
                      color: mode === option.id ? '#fff' : '#475569',
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-black">
                <Filter className="h-4 w-4 text-amber-600" />
                Categories
              </div>
              <div className="grid gap-2">
                {DESKTOP_FILTERS.map((filter) => {
                  const checked = activeCategories.has(filter.id);
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => toggleCategory(filter.id)}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-bold transition hover:border-sky-300"
                      style={{
                        borderColor: checked ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)',
                        background: checked ? 'var(--lokadia-info-bg)' : '#fff',
                      }}
                    >
                      {filter.label}
                      {checked && <Check className="h-4 w-4 text-sky-700" />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-5 rounded-lg border bg-slate-50 p-3" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-black">
                  <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                  Rayon
                </span>
                <span className="text-xs font-black text-emerald-700">{distance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={distance}
                onChange={(event) => setDistance(Number(event.target.value))}
                className="w-full accent-emerald-600"
              />
            </section>

            <section className="mb-5 grid gap-2">
              <button
                type="button"
                onClick={() => setOpenOnly((value) => !value)}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-bold transition hover:bg-slate-50"
                style={{ borderColor: openOnly ? '#10B981' : 'var(--lokadia-gray-200)' }}
              >
                Ouvert maintenant
                <span className={`h-5 w-9 rounded-full p-0.5 transition ${openOnly ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition ${openOnly ? 'translate-x-4' : ''}`} />
                </span>
              </button>
              <button
                type="button"
                onClick={() => setOffersOnly((value) => !value)}
                className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-bold transition hover:bg-slate-50"
                style={{ borderColor: offersOnly ? '#F59E0B' : 'var(--lokadia-gray-200)' }}
              >
                Offres en cours
                <span className={`h-5 w-9 rounded-full p-0.5 transition ${offersOnly ? 'bg-amber-500' : 'bg-slate-200'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white transition ${offersOnly ? 'translate-x-4' : ''}`} />
                </span>
              </button>
            </section>

            <section className="rounded-lg border bg-white p-3" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-black">Parcours conseille</h2>
              </div>
              <div className="space-y-2">
                {SMART_ROUTE.slice(0, 3).map((step) => (
                  <div key={`${step.time}-${step.title}`} className="flex gap-2">
                    <span className="w-10 shrink-0 text-xs font-black text-slate-400">{step.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">{step.title}</p>
                      <p className="text-[11px] text-slate-500">{step.kind}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigate('/trips/create')}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Ajouter au voyage
              </button>
            </section>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b bg-white px-5" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                <MapPin className="h-4 w-4 text-sky-700" />
                {visiblePlaces.length} resultats dans le quartier
              </div>
              <p className="text-sm font-semibold text-slate-600">Survole une adresse pour synchroniser la carte et la liste.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                <CalendarDays className="h-4 w-4" />
                Aujourd'hui
                <ChevronDown className="h-4 w-4" />
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                Tri pertinence
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 p-4">
            <DesktopLocalMap
              places={visiblePlaces}
              activePlaceId={activePlaceId}
              selectedPlaceId={selectedPlace?.id}
              onHoverPlace={setActivePlaceId}
              onSelectPlace={(id) => {
                setSelectedPlaceId(id);
                setActivePlaceId(id);
              }}
            />
          </div>
        </main>

        <aside className="flex w-[384px] shrink-0 flex-col border-l bg-white" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
          <div className="border-b p-4" style={{ borderColor: 'var(--lokadia-gray-100)' }}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase text-slate-500">Resultats</p>
                <h2 className="text-xl font-black">Adresses locales</h2>
              </div>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                {visiblePlaces.length}
              </span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">Tous</button>
              <button type="button" className="rounded-lg border px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">Favoris</button>
              <button type="button" className="rounded-lg border px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50">Offres</button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {visiblePlaces.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onMouseEnter={() => setActivePlaceId(place.id)}
                  onMouseLeave={() => setActivePlaceId(null)}
                  onClick={() => {
                    setSelectedPlaceId(place.id);
                    setActivePlaceId(place.id);
                  }}
                  className="group w-full overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ borderColor: selectedPlace?.id === place.id ? place.color : 'var(--lokadia-gray-200)' }}
                >
                  <div className="flex gap-3 p-3">
                    <img src={place.image} alt="" className="h-24 w-24 shrink-0 rounded-md object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-black uppercase text-slate-500">
                          {getPlaceTypeLabel(place.type)}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {place.rating}
                        </span>
                      </div>
                      <p className="truncate text-base font-black text-slate-950">{place.name}</p>
                      <p className="truncate text-xs font-semibold text-slate-500">{place.neighborhood}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                          {place.walkingTime}
                        </span>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">
                          {getPlacePriceLabel(place.price)}
                        </span>
                        {place.offer && (
                          <span className="rounded-md bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-700">
                            Offre
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedPlace && (
            <div className="border-t bg-white p-4 shadow-2xl" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-slate-500">{getPlaceTypeLabel(selectedPlace.type)}</p>
                  <h3 className="text-xl font-black leading-tight text-slate-950">{selectedPlace.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPlaceId(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                  title="Fermer le panneau"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-3 grid grid-cols-[112px_minmax(0,1fr)] gap-3">
                <img src={selectedPlace.image} alt="" className="h-28 w-full rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="line-clamp-3 text-sm leading-snug text-slate-600">{selectedPlace.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs font-black text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {selectedPlace.walkingTime}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Navigation className="h-3.5 w-3.5" />
                      {selectedPlace.distance}
                    </span>
                  </div>
                </div>
              </div>

              {selectedPlace.offer && (
                <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
                  <TicketPercent className="mt-0.5 h-4 w-4 shrink-0" />
                  {selectedPlace.offer}
                </div>
              )}

              <div className="mb-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-black text-slate-950">Signal Lokadia : </span>
                {selectedPlace.insight}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button type="button" className="flex flex-col items-center justify-center gap-1 rounded-lg bg-slate-950 px-2 py-2 text-xs font-black text-white transition hover:bg-slate-800">
                  <Navigation className="h-4 w-4" />
                  Y aller
                </button>
                <button type="button" className="flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50">
                  <Plus className="h-4 w-4" />
                  Ajouter
                </button>
                <button type="button" className="flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50">
                  <Heart className="h-4 w-4" />
                  Favori
                </button>
                <button type="button" className="flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50">
                  <Share2 className="h-4 w-4" />
                  Partager
                </button>
              </div>

              <button type="button" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50">
                {selectedPlace.nextAction}
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          )}
        </aside>
      </div>

      <div className="lg:hidden min-h-screen bg-white px-5 py-8">
        <div className="rounded-lg border bg-slate-50 p-5" style={{ borderColor: 'var(--lokadia-gray-200)' }}>
          <h1 className="text-2xl font-black text-slate-950">Carte desktop Lokadia</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Cette vue est optimisee pour les grands ecrans. La version mobile conserve son planificateur dedie.
          </p>
          <button
            type="button"
            onClick={() => navigate('/trips/map-planner')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white"
          >
            Ouvrir la carte mobile
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
