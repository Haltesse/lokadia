import {
  CalendarDays,
  Landmark,
  MapPin,
  Pill,
  ShoppingBag,
  Store,
  Utensils,
} from 'lucide-react';
import type { LocalPlace, LocalPlaceType } from '../data/desktopLocalExperience';

const TYPE_ICON: Record<LocalPlaceType, typeof Landmark> = {
  tourism: Landmark,
  restaurant: Utensils,
  shop: ShoppingBag,
  event: CalendarDays,
  service: Pill,
};

const TYPE_LABEL: Record<LocalPlaceType, string> = {
  tourism: 'Tourisme',
  restaurant: 'Table locale',
  shop: 'Commerce',
  event: 'Evenement',
  service: 'Service',
};

const PRICE_LABEL: Record<LocalPlace['price'], string> = {
  free: 'Gratuit',
  low: 'EUR',
  medium: 'EUR EUR',
  high: 'EUR EUR EUR',
};

interface DesktopLocalMapProps {
  places: LocalPlace[];
  activePlaceId?: string | null;
  selectedPlaceId?: string | null;
  onHoverPlace?: (id: string | null) => void;
  onSelectPlace?: (id: string) => void;
  compact?: boolean;
}

export function getPlaceTypeLabel(type: LocalPlaceType) {
  return TYPE_LABEL[type];
}

export function getPlacePriceLabel(price: LocalPlace['price']) {
  return PRICE_LABEL[price];
}

export function DesktopLocalMap({
  places,
  activePlaceId,
  selectedPlaceId,
  onHoverPlace,
  onSelectPlace,
  compact = false,
}: DesktopLocalMapProps) {
  const previewPlace = places.find((place) => place.id === activePlaceId || place.id === selectedPlaceId) || null;

  return (
    <div
      className="relative h-full min-h-[420px] overflow-hidden rounded-lg border bg-[#eef5f3]"
      style={{ borderColor: 'var(--lokadia-gray-200)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(15,76,129,.06) 1px, transparent 1px), linear-gradient(0deg, rgba(15,76,129,.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="absolute left-[6%] top-[22%] h-10 w-[88%] -rotate-6 rounded-full bg-white/80 shadow-sm" />
      <div className="absolute left-[12%] top-[58%] h-10 w-[82%] rotate-3 rounded-full bg-white/80 shadow-sm" />
      <div className="absolute left-[30%] top-[-8%] h-[116%] w-12 rotate-[16deg] rounded-full bg-white/70 shadow-sm" />
      <div className="absolute left-[64%] top-[4%] h-[95%] w-10 -rotate-[18deg] rounded-full bg-white/70 shadow-sm" />

      <div className="absolute left-[8%] top-[10%] rounded-md bg-white/80 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
        Canal
      </div>
      <div className="absolute bottom-[10%] right-[9%] rounded-md bg-white/80 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
        Le Marais
      </div>
      <div className="absolute bottom-[20%] left-[9%] rounded-md bg-white/80 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm">
        Republique
      </div>

      <div className="absolute left-[18%] top-[20%] h-28 w-36 rounded-full bg-emerald-200/55 blur-sm" />
      <div className="absolute right-[14%] bottom-[18%] h-32 w-40 rounded-full bg-amber-200/45 blur-sm" />

      {places.map((place) => {
        const isActive = place.id === activePlaceId || place.id === selectedPlaceId;
        const Icon = TYPE_ICON[place.type] || Store;

        return (
          <button
            key={place.id}
            type="button"
            aria-label={place.name}
            onMouseEnter={() => onHoverPlace?.(place.id)}
            onMouseLeave={() => onHoverPlace?.(null)}
            onClick={() => onSelectPlace?.(place.id)}
            className="absolute z-20 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-white shadow-lg transition-all duration-200 hover:scale-125 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-white/80"
            style={{
              left: `${place.x}%`,
              top: `${place.y}%`,
              background: place.color,
              transform: `translate(-50%, -50%) scale(${isActive ? 1.2 : 1})`,
              boxShadow: isActive ? `0 0 0 8px ${place.color}24, var(--shadow-xl)` : 'var(--shadow-lg)',
            }}
          >
            <Icon className="h-5 w-5" strokeWidth={2.5} />
          </button>
        );
      })}

      {previewPlace && (
        <div
          className="pointer-events-none absolute z-30 w-72 rounded-lg border bg-white p-3 shadow-2xl"
          style={{
            left: `min(calc(${previewPlace.x}% + 18px), calc(100% - 300px))`,
            top: `min(calc(${previewPlace.y}% + 18px), calc(100% - 156px))`,
            borderColor: 'var(--lokadia-gray-100)',
          }}
        >
          <div className="flex gap-3">
            <img
              src={previewPlace.image}
              alt=""
              className="h-16 w-20 rounded-md object-cover"
              draggable={false}
            />
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: previewPlace.color }}
                />
                <span className="text-[11px] font-bold uppercase text-slate-500">
                  {TYPE_LABEL[previewPlace.type]}
                </span>
              </div>
              <p className="truncate text-sm font-bold text-slate-950">{previewPlace.name}</p>
              <p className="truncate text-xs text-slate-500">{previewPlace.neighborhood}</p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span>{previewPlace.walkingTime}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{PRICE_LABEL[previewPlace.price]}</span>
                {previewPlace.openNow && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-emerald-600">Ouvert</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {!compact && previewPlace.offer && (
            <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              {previewPlace.offer}
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-lg border bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
        <MapPin className="h-4 w-4 text-sky-600" />
        Paris Est - donnees locales en direct
      </div>
    </div>
  );
}
