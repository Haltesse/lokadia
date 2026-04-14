import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, X, Plane, CalendarDays } from 'lucide-react';

interface EmirateDatePickerProps {
  startDate: string; // ISO string YYYY-MM-DD
  endDate: string;   // ISO string YYYY-MM-DD
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];
const DAYS = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

function parseDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(str: string): string {
  if (!str) return '';
  const d = parseDate(str);
  if (!d) return '';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // 0=Sun..6=Sat → convert to Mon-first (0=Mon..6=Sun)
  const raw = new Date(year, month, 1).getDay();
  return raw === 0 ? 6 : raw - 1;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isBetween(d: Date, start: Date, end: Date) {
  const t = d.getTime();
  return t > start.getTime() && t < end.getTime();
}

function daysBetween(a: Date, b: Date) {
  return Math.round(Math.abs(b.getTime() - a.getTime()) / 86400000);
}

export function EmirateDatePicker({
  startDate, endDate, onStartDateChange, onEndDateChange
}: EmirateDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const openPicker = useCallback(() => {
    setOpen(true);
    setSelecting(startDate ? 'end' : 'start');
    if (start) {
      setViewYear(start.getFullYear());
      setViewMonth(start.getMonth());
    } else {
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
  }, [startDate, start]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day: Date) => {
    if (day < today) return;
    if (selecting === 'start') {
      onStartDateChange(formatDate(day));
      onEndDateChange('');
      setSelecting('end');
    } else {
      if (start && day < start) {
        // clicked before start → reset
        onStartDateChange(formatDate(day));
        onEndDateChange('');
        setSelecting('end');
      } else {
        onEndDateChange(formatDate(day));
        setSelecting('start');
        setOpen(false);
      }
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartDateChange('');
    onEndDateChange('');
  };

  // Build calendar grid for current view month
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (Date | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1))
  ];
  // pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const nights = start && end ? daysBetween(start, end) : null;
  const hasSelection = !!startDate || !!endDate;

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={openPicker}
        className="w-full rounded-2xl border-2 transition-all text-left overflow-hidden"
        style={{
          borderColor: open ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-200)',
          background: 'white',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {hasSelection ? (
          <div className="flex items-stretch">
            {/* Départ */}
            <div className="flex-1 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: 'var(--lokadia-primary)' }}>
                Départ
              </p>
              <p className="font-bold text-sm" style={{ color: 'var(--lokadia-gray-900)' }}>
                {startDate ? formatDisplay(startDate) : '—'}
              </p>
            </div>

            {/* Séparateur avion */}
            <div className="flex flex-col items-center justify-center px-3"
              style={{ borderLeft: '1px dashed var(--lokadia-gray-200)', borderRight: '1px dashed var(--lokadia-gray-200)' }}>
              <Plane className="h-4 w-4 rotate-90" style={{ color: 'var(--lokadia-primary)' }} />
              {nights !== null && (
                <span className="text-[9px] font-semibold mt-0.5" style={{ color: 'var(--lokadia-gray-500)' }}>
                  {nights}n
                </span>
              )}
            </div>

            {/* Retour */}
            <div className="flex-1 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: 'var(--lokadia-gray-500)' }}>
                Retour
              </p>
              <p className="font-bold text-sm" style={{ color: endDate ? 'var(--lokadia-gray-900)' : 'var(--lokadia-gray-400)' }}>
                {endDate ? formatDisplay(endDate) : 'Choisir'}
              </p>
            </div>

            {/* Clear */}
            <button
              type="button"
              onClick={handleReset}
              className="px-3 flex items-center justify-center"
              style={{ color: 'var(--lokadia-gray-400)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--lokadia-info-bg)' }}>
              <CalendarDays className="h-5 w-5" style={{ color: 'var(--lokadia-primary)' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--lokadia-gray-700)' }}>
                Sélectionner les dates
              </p>
              <p className="text-xs" style={{ color: 'var(--lokadia-gray-500)' }}>
                Départ · Retour
              </p>
            </div>
          </div>
        )}
      </button>

      {/* Full-screen Calendar Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'white' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-5 pt-6 pb-4"
              style={{ borderBottom: '1px solid var(--lokadia-gray-100)' }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {selecting === 'start' ? 'Date de départ' : 'Date de retour'}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--lokadia-gray-100)' }}
                >
                  <X className="h-5 w-5" style={{ color: 'var(--lokadia-gray-700)' }} />
                </button>
              </div>

              {/* Step pills */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelecting('start')}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: selecting === 'start' ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-100)',
                    color: selecting === 'start' ? 'white' : 'var(--lokadia-gray-600)'
                  }}
                >
                  {startDate ? formatDisplay(startDate) : 'Départ'}
                </button>
                <button
                  type="button"
                  onClick={() => startDate && setSelecting('end')}
                  className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: selecting === 'end' ? 'var(--lokadia-primary)' : 'var(--lokadia-gray-100)',
                    color: selecting === 'end' ? 'white' : 'var(--lokadia-gray-600)',
                    opacity: startDate ? 1 : 0.5
                  }}
                >
                  {endDate ? formatDisplay(endDate) : 'Retour'}
                </button>
              </div>
            </div>

            {/* Calendar body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-5">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--lokadia-gray-100)' }}
                >
                  <ChevronLeft className="h-5 w-5" style={{ color: 'var(--lokadia-gray-700)' }} />
                </button>
                <span className="text-base font-bold" style={{ color: 'var(--lokadia-gray-900)' }}>
                  {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--lokadia-gray-100)' }}
                >
                  <ChevronRight className="h-5 w-5" style={{ color: 'var(--lokadia-gray-700)' }} />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold py-1"
                    style={{ color: 'var(--lokadia-gray-400)' }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} />;

                  const isPast = day < today;
                  const isStart = start && sameDay(day, start);
                  const isEnd = end && sameDay(day, end);
                  const isInRange = start && end && isBetween(day, start, end);
                  const isHoverRange = start && !end && hoverDate && selecting === 'end' &&
                    isBetween(day, start, hoverDate);
                  const isHoverEnd = start && !end && hoverDate && sameDay(day, hoverDate) && selecting === 'end';
                  const isSelected = isStart || isEnd;

                  let bg = 'transparent';
                  let textColor = isPast ? 'var(--lokadia-gray-300)' : 'var(--lokadia-gray-900)';
                  let fontWeight = '400';

                  if (isSelected) {
                    bg = 'var(--lokadia-primary)';
                    textColor = 'white';
                    fontWeight = '700';
                  } else if (isInRange || isHoverRange) {
                    bg = 'rgba(10, 132, 255, 0.12)';
                    textColor = 'var(--lokadia-primary)';
                  } else if (isHoverEnd) {
                    bg = 'rgba(10, 132, 255, 0.25)';
                    textColor = 'var(--lokadia-primary)';
                  }

                  // Round corners for range edges
                  const isRangeStart = isStart || (isInRange && day.getDay() === 1) || (isHoverRange && day.getDay() === 1);
                  const isRangeEnd = isEnd || isHoverEnd || (isInRange && day.getDay() === 0) || (isHoverRange && day.getDay() === 0);
                  let borderRadius = '50%';
                  if ((isInRange || isHoverRange) && !isSelected) {
                    if (isRangeStart) borderRadius = '50% 0 0 50%';
                    else if (isRangeEnd) borderRadius = '0 50% 50% 0';
                    else borderRadius = '0';
                  }

                  return (
                    <div key={day.getTime()} className="flex items-center justify-center py-0.5">
                      <button
                        type="button"
                        disabled={isPast}
                        onClick={() => handleDayClick(day)}
                        onMouseEnter={() => !isPast && setHoverDate(day)}
                        onMouseLeave={() => setHoverDate(null)}
                        className="w-10 h-10 flex items-center justify-center text-sm transition-all select-none"
                        style={{
                          background: bg,
                          color: textColor,
                          fontWeight,
                          borderRadius,
                          cursor: isPast ? 'default' : 'pointer'
                        }}
                      >
                        {day.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom summary + confirm */}
            {startDate && endDate && (
              <motion.div
                className="flex-shrink-0 px-5 pb-8 pt-4"
                style={{ borderTop: '1px solid var(--lokadia-gray-100)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--lokadia-gray-900)' }}>
                      {formatDisplay(startDate)} → {formatDisplay(endDate)}
                    </p>
                    {nights !== null && (
                      <p className="text-xs mt-0.5" style={{ color: 'var(--lokadia-gray-500)' }}>
                        {nights} nuit{nights > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-6 py-3 rounded-2xl font-semibold text-sm text-white"
                    style={{ background: 'var(--lokadia-primary)', boxShadow: 'var(--shadow-md)' }}
                  >
                    Confirmer
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
