import { useMemo } from 'react';
import { MapPin, ArrowDown, Clock } from 'lucide-react';
import { estimateTravelMinutes, formatMinutes, type CheckableStop } from '../lib/itineraryChecks';

/**
 * ItineraryTimeline — l'itinéraire lu comme une suite d'événements.
 *
 * La liste répond à « qu'est-ce que je fais ce jour-là ? », la carte à
 * « où est-ce ? ». La timeline répond à « est-ce que ça tient dans la
 * journée ? » : elle intercale les temps de trajet entre les étapes, ce
 * que ni la liste ni la carte ne montrent.
 *
 * La sélection est partagée avec les autres vues : basculer de vue ne
 * fait pas perdre le contexte.
 */

export interface TimelineStop extends CheckableStop {
  /** Numéro de jour d'itinéraire (1 = premier jour) */
  day: number;
  country?: string;
}

interface Props {
  stops: TimelineStop[];
  /** Couleur associée à un jour, partagée avec la carte */
  dayColor: (day: number) => string;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
}

export function ItineraryTimeline({ stops, dayColor, selectedId, onSelect, className = '' }: Props) {
  const days = useMemo(() => {
    const ordered = [...stops].sort((a, b) => a.orderIndex - b.orderIndex);
    const grouped = new Map<number, TimelineStop[]>();
    for (const s of ordered) {
      if (!grouped.has(s.day)) grouped.set(s.day, []);
      grouped.get(s.day)!.push(s);
    }
    return [...grouped.entries()].sort((a, b) => a[0] - b[0]);
  }, [stops]);

  if (stops.length === 0) {
    return (
      <p className={`px-3 py-8 text-center text-sm ${className}`} style={{ color: 'var(--lokadia-gray-500)' }}>
        Ajoutez des étapes pour voir votre itinéraire heure par heure.
      </p>
    );
  }

  return (
    <div className={className}>
      {days.map(([day, dayStops]) => {
        const dayMinutes = dayStops.reduce((total, stop, i) => {
          if (i === dayStops.length - 1) return total;
          return total + (estimateTravelMinutes(stop, dayStops[i + 1]) ?? 0);
        }, 0);

        return (
          <section key={day} className="mb-4 last:mb-0">
            <header className="mb-2 flex items-center gap-2">
              <span
                className="inline-flex h-5 items-center rounded-full px-2 text-[10px] font-bold text-white"
                style={{ background: dayColor(day) }}
              >
                Jour {day}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                {dayStops.length} étape{dayStops.length > 1 ? 's' : ''}
                {dayMinutes > 0 && ` · ${formatMinutes(dayMinutes)} de trajet`}
              </span>
            </header>

            <ol className="relative">
              {dayStops.map((stop, i) => {
                const next = dayStops[i + 1];
                const legMinutes = next ? estimateTravelMinutes(stop, next) : null;
                const isSelected = selectedId === stop.id;

                return (
                  <li key={stop.id}>
                    <button
                      type="button"
                      onClick={() => onSelect?.(stop.id)}
                      aria-current={isSelected ? 'true' : undefined}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors"
                      style={{
                        background: isSelected ? 'rgba(15,76,129,0.07)' : 'transparent',
                        outline: isSelected ? '1px solid var(--lokadia-primary)' : 'none',
                      }}
                    >
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ background: dayColor(stop.day) }}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                          {stop.destinationName}
                        </span>
                        {stop.country && (
                          <span className="block truncate text-[10px]" style={{ color: 'var(--lokadia-gray-500)' }}>
                            {stop.country}
                          </span>
                        )}
                      </span>
                      <MapPin size={13} style={{ color: 'var(--lokadia-gray-300)' }} />
                    </button>

                    {/* Temps de trajet vers l'étape suivante — l'information
                        que ni la liste ni la carte ne donnent */}
                    {legMinutes !== null && (
                      <div className="flex items-center gap-1.5 py-0.5 pl-5">
                        <ArrowDown size={11} style={{ color: 'var(--lokadia-gray-300)' }} />
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{ background: 'var(--lokadia-gray-100)', color: 'var(--lokadia-gray-600)' }}
                        >
                          <Clock size={9} /> {formatMinutes(legMinutes)} estimées
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
