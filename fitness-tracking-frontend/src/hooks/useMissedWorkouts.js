import { useEffect, useMemo, useState } from 'react';
import { useWorkouts } from './useWorkouts';
import { useRoutines } from './useRoutines';

// Look back this many days. We never include "today" because the day isn't done.
const LOOKBACK_DAYS = 7;
const DISMISSED_KEY = 'ng:dismissedMisses';

const dayKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const loadDismissed = () => {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveDismissed = (set) => {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    /* storage full / disabled — silently ignore */
  }
};

/**
 * Returns a list of missed sessions over the last LOOKBACK_DAYS.
 * A session is "missed" when a user routine schedules a workout type on
 * day-of-week D but no workout of that type was logged that day.
 *
 * Item shape: { id, date: Date, dateKey, type, routineName }
 */
export const useMissedWorkouts = () => {
  const { workouts } = useWorkouts();
  const { routines } = useRoutines();
  const [dismissed, setDismissed] = useState(loadDismissed);

  // Sync to localStorage whenever the set changes.
  useEffect(() => {
    saveDismissed(dismissed);
  }, [dismissed]);

  const missed = useMemo(() => {
    if (!routines?.length) return [];

    // Map dayOfWeek -> [{ type, routineName }]
    const plannedByDow = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const r of routines) {
      for (const slot of r.workoutSchedule || []) {
        const ref = (workouts || []).find((w) => w._id === slot.workoutId);
        if (ref?.type) {
          plannedByDow[slot.dayOfWeek].push({ type: ref.type, routineName: r.name });
        }
      }
    }

    // Workouts grouped by local day -> set of types logged.
    const loggedByDay = {};
    for (const w of workouts || []) {
      if (!w?.date) continue;
      const key = dayKey(new Date(w.date));
      (loggedByDay[key] ||= new Set()).add(w.type);
    }

    const out = [];
    const now = new Date();
    // i=1 is yesterday, i=LOOKBACK_DAYS is the oldest day we check.
    for (let i = 1; i <= LOOKBACK_DAYS; i += 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = dayKey(d);
      const planned = plannedByDow[d.getDay()] || [];
      const loggedTypes = loggedByDay[key] || new Set();
      for (const p of planned) {
        if (loggedTypes.has(p.type)) continue;
        const id = `${key}:${p.type}:${p.routineName}`;
        if (dismissed.has(id)) continue;
        out.push({ id, date: d, dateKey: key, type: p.type, routineName: p.routineName });
      }
    }
    // Most recent first.
    return out.sort((a, b) => b.date - a.date);
  }, [workouts, routines, dismissed]);

  const dismiss = (id) => {
    setDismissed((cur) => {
      const next = new Set(cur);
      next.add(id);
      return next;
    });
  };

  const dismissAll = () => {
    setDismissed((cur) => {
      const next = new Set(cur);
      for (const m of missed) next.add(m.id);
      return next;
    });
  };

  return { missed, count: missed.length, dismiss, dismissAll };
};

export default useMissedWorkouts;
