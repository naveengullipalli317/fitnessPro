import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkouts } from '../hooks/useWorkouts';
import { useRoutines } from '../hooks/useRoutines';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import { images, workoutImage } from '../utils/images';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WORKOUT_TYPES = ['strength', 'cardio', 'yoga', 'hiit', 'pilates', 'crossfit', 'other'];

// One colour per workout type so cells become a quick visual legend.
const TYPE_COLOR = {
  strength: 'bg-volt-500',
  cardio: 'bg-rose-500',
  yoga: 'bg-sky-400',
  hiit: 'bg-amber-400',
  pilates: 'bg-fuchsia-400',
  crossfit: 'bg-lime-500',
  other: 'bg-ink-400',
};

// Local YYYY-MM-DD key (no UTC drift).
const dayKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const sameLocalDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const Calendar = () => {
  const { workouts, isLoading, createWorkout } = useWorkouts();
  const { routines } = useRoutines();

  const today = useMemo(() => new Date(), []);
  const [searchParams] = useSearchParams();
  const initialKey = useMemo(() => {
    const fromQuery = searchParams.get('date');
    return /^\d{4}-\d{2}-\d{2}$/.test(fromQuery || '') ? fromQuery : dayKey(today);
  }, [searchParams, today]);
  const initialCursor = useMemo(() => {
    const [y, m] = initialKey.split('-').map(Number);
    return new Date(y, m - 1, 1);
  }, [initialKey]);

  const [cursor, setCursor] = useState(initialCursor);
  const [selectedKey, setSelectedKey] = useState(initialKey);

  // Re-sync when the `?date=` param changes (e.g. opening from the bell).
  useEffect(() => {
    const param = searchParams.get('date');
    if (param && /^\d{4}-\d{2}-\d{2}$/.test(param) && param !== selectedKey) {
      const [y, m] = param.split('-').map(Number);
      setCursor(new Date(y, m - 1, 1));
      setSelectedKey(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [showQuickLog, setShowQuickLog] = useState(false);
  const [quickType, setQuickType] = useState('strength');
  const [quickDuration, setQuickDuration] = useState(30);
  const [logging, setLogging] = useState(false);
  const [logError, setLogError] = useState('');

  // Group workouts by local YYYY-MM-DD.
  const workoutsByDay = useMemo(() => {
    const map = {};
    for (const w of workouts || []) {
      if (!w?.date) continue;
      const key = dayKey(new Date(w.date));
      (map[key] ||= []).push(w);
    }
    return map;
  }, [workouts]);

  // Planned types from active routines, keyed by day-of-week (0-6).
  const plannedByDow = useMemo(() => {
    const map = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const r of routines || []) {
      for (const slot of r.workoutSchedule || []) {
        const w = (workouts || []).find((x) => x._id === slot.workoutId);
        if (w?.type) map[slot.dayOfWeek].push({ type: w.type, routineName: r.name });
      }
    }
    return map;
  }, [routines, workouts]);

  // Build the 6x7 grid for the current month view (Sunday-start).
  const grid = useMemo(() => {
    const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const startOffset = firstOfMonth.getDay(); // 0=Sun
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - startOffset);
    const days = [];
    for (let i = 0; i < 42; i += 1) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [cursor]);

  const selectedDate = useMemo(() => {
    const [y, m, d] = selectedKey.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedKey]);

  const selectedWorkouts = workoutsByDay[selectedKey] || [];
  const selectedPlanned = plannedByDow[selectedDate.getDay()] || [];
  const completedTypes = new Set(selectedWorkouts.map((w) => w.type));
  // Planned tasks that have no matching logged workout type that day.
  const pendingTasks = selectedPlanned.filter((p) => !completedTypes.has(p.type));

  // Stats for the visible month.
  const monthStats = useMemo(() => {
    const inMonth = (workouts || []).filter((w) => {
      const d = new Date(w.date);
      return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth();
    });
    const totalMins = inMonth.reduce((s, w) => s + (w.duration || 0), 0);
    const daysWith = new Set(inMonth.map((w) => dayKey(new Date(w.date)))).size;
    return { count: inMonth.length, totalMins, daysWith };
  }, [workouts, cursor]);

  const prevMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const nextMonth = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const jumpToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedKey(dayKey(today));
  };

  const handleQuickLog = async (e) => {
    e.preventDefault();
    setLogging(true);
    setLogError('');
    try {
      await createWorkout({
        type: quickType,
        duration: parseInt(quickDuration, 10) || 30,
        caloriesBurned: 0,
        date: selectedKey,
      });
      setShowQuickLog(false);
      setQuickDuration(30);
    } catch (err) {
      setLogError(err.response?.data?.message || 'Failed to log workout');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-700">
        <img src={images.routine} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative p-8 sm:p-10 flex flex-wrap justify-between items-end gap-4">
          <div>
            <span className="eyebrow">Daily tracker</span>
            <h2 className="headline text-4xl sm:text-5xl mt-2">Training Calendar</h2>
            <p className="text-ink-300 mt-2 max-w-xl">
              See what you crushed — and what's left. Each logged workout counts as a completed task.
            </p>
          </div>
          <div className="flex gap-6 sm:gap-8 text-right">
            {[
              { v: monthStats.daysWith, l: 'Days active' },
              { v: monthStats.count, l: 'Workouts' },
              { v: monthStats.totalMins, l: 'Minutes' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl sm:text-4xl gradient-text leading-none">{s.v}</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-widest2 text-ink-300 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Month controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="h-10 w-10 rounded-md border border-ink-700 bg-ink-900 text-ink-200 hover:border-volt-500 hover:text-volt-500 transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <h3 className="headline text-2xl px-2">
            {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
          </h3>
          <button
            type="button"
            onClick={nextMonth}
            className="h-10 w-10 rounded-md border border-ink-700 bg-ink-900 text-ink-200 hover:border-volt-500 hover:text-volt-500 transition-colors"
            aria-label="Next month"
          >
            →
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={jumpToday}>
          Today
        </Button>
      </div>

      {isLoading && (workouts || []).length === 0 ? (
        <div className="text-center py-12 text-ink-400">Loading calendar…</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar grid */}
          <Card className="lg:col-span-2 p-4 sm:p-6">
            {/* Weekday header */}
            <div className="grid grid-cols-7 mb-3">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] uppercase tracking-widest2 text-ink-500 py-2"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {grid.map((d) => {
                const key = dayKey(d);
                const isCurrentMonth = d.getMonth() === cursor.getMonth();
                const isToday = sameLocalDay(d, today);
                const isSelected = key === selectedKey;
                const dayWorkouts = workoutsByDay[key] || [];
                const plannedToday = plannedByDow[d.getDay()] || [];
                const pendingCount = plannedToday.filter(
                  (p) => !dayWorkouts.some((w) => w.type === p.type)
                ).length;
                const done = dayWorkouts.length > 0;

                const baseClass = [
                  'group relative h-14 sm:h-16 rounded-md border text-left transition-all flex flex-col justify-between p-1.5',
                  isSelected
                    ? 'border-volt-500 bg-volt-500/10 ring-1 ring-volt-500/40'
                    : done
                    ? 'border-lime-500/40 bg-lime-500/5 hover:border-lime-400'
                    : 'border-ink-800 bg-ink-900/40 hover:border-ink-600 hover:bg-ink-900',
                  !isCurrentMonth && 'opacity-35',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={baseClass}
                    aria-label={`${d.toDateString()}${done ? `, ${dayWorkouts.length} workouts logged` : ''}`}
                  >
                    {/* Date row */}
                    <div className="flex items-start justify-between">
                      {isToday ? (
                        <span className="h-5 w-5 inline-flex items-center justify-center rounded-full bg-grad-volt text-ink-950 text-[11px] font-bold">
                          {d.getDate()}
                        </span>
                      ) : (
                        <span
                          className={
                            'text-[12px] font-semibold leading-none px-0.5 ' +
                            (isCurrentMonth ? 'text-ink-100' : 'text-ink-500')
                          }
                        >
                          {d.getDate()}
                        </span>
                      )}
                      {done && (
                        <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-lime-500 text-ink-950 text-[10px] font-bold leading-none">
                          {dayWorkouts.length}
                        </span>
                      )}
                    </div>

                    {/* Bottom indicator row — coloured dots per workout type */}
                    <div className="flex items-center gap-0.5 h-1.5">
                      {dayWorkouts.slice(0, 4).map((w, i) => (
                        <span
                          key={w._id || i}
                          className={`h-1.5 w-1.5 rounded-full ${TYPE_COLOR[w.type] || TYPE_COLOR.other}`}
                          title={`${w.type} · ${w.duration}m`}
                        />
                      ))}
                      {dayWorkouts.length > 4 && (
                        <span className="text-[9px] text-ink-400 ml-0.5 leading-none">
                          +{dayWorkouts.length - 4}
                        </span>
                      )}
                      {dayWorkouts.length === 0 && pendingCount > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full border border-volt-400/70" title={`${pendingCount} planned`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-ink-400">
              {WORKOUT_TYPES.map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${TYPE_COLOR[t]}`} />
                  <span className="capitalize">{t}</span>
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 ml-auto">
                <span className="h-2 w-2 rounded-full border border-volt-400/70" />
                <span>planned</span>
              </span>
            </div>
          </Card>

          {/* Selected day detail */}
          <Card className="p-6 lg:sticky lg:top-24 lg:self-start">
            <span className="eyebrow">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}
            </span>
            <h3 className="headline text-2xl mt-1">
              {selectedDate.toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-widest2 text-ink-500 mb-3">Daily tasks</p>

              {selectedWorkouts.length === 0 && pendingTasks.length === 0 && (
                <p className="text-sm text-ink-400">
                  No tasks for this day. {' '}
                  <button
                    type="button"
                    onClick={() => setShowQuickLog(true)}
                    className="text-volt-500 hover:text-volt-400 font-semibold"
                  >
                    Log one →
                  </button>
                </p>
              )}

              <ul className="space-y-2">
                {/* Completed (logged workouts) */}
                {selectedWorkouts.map((w) => (
                  <li
                    key={w._id}
                    className="flex items-center gap-3 rounded-lg border border-lime-500/30 bg-lime-500/5 px-3 py-2"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-lime-500 text-ink-950 text-sm font-bold">
                      ✓
                    </span>
                    <img
                      src={workoutImage(w.type)}
                      alt=""
                      className="h-9 w-9 rounded-md object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-100 capitalize font-medium truncate">
                        {w.type}
                      </p>
                      <p className="text-xs text-ink-400">
                        {w.duration} min{w.caloriesBurned ? ` · ${w.caloriesBurned} kcal` : ''}
                      </p>
                    </div>
                  </li>
                ))}

                {/* Pending (planned via routine, not yet done) */}
                {pendingTasks.map((p, i) => (
                  <li
                    key={`p-${i}`}
                    className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-900/40 px-3 py-2"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border-2 border-ink-600 text-ink-600 text-sm">
                      ○
                    </span>
                    <img
                      src={workoutImage(p.type)}
                      alt=""
                      className="h-9 w-9 rounded-md object-cover shrink-0 opacity-60"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-200 capitalize truncate">{p.type}</p>
                      <p className="text-xs text-ink-500 truncate">From {p.routineName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickType(p.type);
                        setShowQuickLog(true);
                      }}
                      className="text-xs font-semibold uppercase tracking-wider text-volt-500 hover:text-volt-400"
                    >
                      Log
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick log form */}
            <div className="mt-6 border-t border-ink-800 pt-5">
              {showQuickLog ? (
                <form onSubmit={handleQuickLog} className="space-y-3">
                  <p className="text-xs uppercase tracking-widest2 text-ink-500">Quick log</p>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest2 text-ink-400 mb-1">
                      Type
                    </label>
                    <select
                      value={quickType}
                      onChange={(e) => setQuickType(e.target.value)}
                      className="ink-input"
                    >
                      {WORKOUT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t[0].toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest2 text-ink-400 mb-1">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={quickDuration}
                      onChange={(e) => setQuickDuration(e.target.value)}
                      className="ink-input"
                      required
                    />
                  </div>
                  {logError && (
                    <p className="text-xs text-rose-400">{logError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={logging} className="flex-1">
                      {logging ? 'Saving…' : '＋ Mark done'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowQuickLog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowQuickLog(true)}
                >
                  ＋ Log workout for this day
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Calendar;
