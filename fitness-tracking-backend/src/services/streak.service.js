// Workout-streak computation. A "streak" is the number of consecutive
// CALENDAR DAYS, ending today or yesterday, on which the user logged
// at least one workout (any type, any duration). We use workout.date
// (the user-set day the workout happened) rather than createdAt — so
// users who back-log a workout get credit for the day they trained.
//
// All date math is in UTC. Day boundaries are 00:00:00 UTC. A future
// "user timezone" preference could shift this without changing the
// algorithm — the only place it'd plug in is `startOfUtcDay`.
const Workout = require('../models/Workout');

const DAY_MS = 24 * 60 * 60 * 1000;
const LOOKBACK_DAYS = 90; // we only care about streaks shorter than this

const startOfUtcDay = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};

const dayKey = (d) => startOfUtcDay(d).toISOString().slice(0, 10); // 'YYYY-MM-DD'

const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);

const formatHumanDate = (d) =>
  d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

/**
 * Build the user-facing message for the bell + banner. The status
 * decides the tone; numbers and dates get interpolated. Kept here
 * so the frontend just renders strings — no branching on policy.
 */
const buildMessage = ({ status, currentStreak, missedDate, lastWorkoutDate }) => {
  if (status === 'active') {
    return `🔥 You're on a ${currentStreak}-day streak. Log another workout tomorrow to extend it.`;
  }
  if (status === 'at-risk') {
    // Compound adjective takes the singular ("4-day streak", not "4-days streak")
    return `⚠️ Your ${currentStreak}-day streak ends at midnight UTC. Log a workout today to keep it alive.`;
  }
  if (status === 'broken') {
    const missDayName = missedDate ? formatHumanDate(missedDate) : 'recently';
    return `You missed ${missDayName}, breaking your ${currentStreak}-day streak. ` +
      `It happens — log a workout today to start a fresh one.`;
  }
  if (status === 'never-started') {
    return 'No streak yet. Log your first workout to begin one.';
  }
  return '';
};

/**
 * Walk backward from a starting day, counting how many consecutive days
 * appear in the `daysSet`. Used to compute the streak that ends at the
 * given anchor (today for an active streak, yesterday for at-risk, the
 * lastWorkoutDate for a broken streak).
 */
const countConsecutiveBack = (daysSet, anchor) => {
  let n = 0;
  let cursor = startOfUtcDay(anchor);
  while (daysSet.has(dayKey(cursor))) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
};

/**
 * Longest streak ever observed across the lookback window. Useful to
 * surface as a "personal best" alongside the current streak.
 */
const computeLongestStreak = (daysSet) => {
  if (daysSet.size === 0) return 0;
  // Sort day keys ascending then walk for runs.
  const sorted = Array.from(daysSet).sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + 'T00:00:00.000Z');
    const cur = new Date(sorted[i] + 'T00:00:00.000Z');
    if (cur.getTime() - prev.getTime() === DAY_MS) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
};

/**
 * Compute the full streak picture for one user.
 *
 * Returns a status object suitable for direct rendering on the frontend.
 * Cheap: one indexed query (userId + date range), in-memory grouping.
 */
const computeStreakForUser = async (userId) => {
  const today = startOfUtcDay(new Date());
  const yesterday = addDays(today, -1);
  const since = addDays(today, -(LOOKBACK_DAYS - 1));

  const rows = await Workout.find(
    { userId, date: { $gte: since } },
    { date: 1, _id: 0 }
  ).lean();

  // Group by UTC day. Set membership is O(1) per lookup later.
  const days = new Set(rows.map((r) => dayKey(r.date)));

  if (days.size === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
      missedDate: null,
      daysSinceLastWorkout: null,
      status: 'never-started',
      message: buildMessage({ status: 'never-started' }),
    };
  }

  const lastWorkoutKey = Array.from(days).sort().pop();
  const lastWorkoutDate = new Date(lastWorkoutKey + 'T00:00:00.000Z');
  const longestStreak = computeLongestStreak(days);

  const todayKey = dayKey(today);
  const yesterdayKey = dayKey(yesterday);

  // active: today is logged — streak counts back from today
  if (days.has(todayKey)) {
    const currentStreak = countConsecutiveBack(days, today);
    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastWorkoutDate,
      missedDate: null,
      daysSinceLastWorkout: 0,
      status: 'active',
      message: buildMessage({ status: 'active', currentStreak }),
    };
  }

  // at-risk: yesterday is logged but today isn't — extend by midnight
  if (days.has(yesterdayKey)) {
    const currentStreak = countConsecutiveBack(days, yesterday);
    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastWorkoutDate,
      missedDate: null,
      daysSinceLastWorkout: 1,
      status: 'at-risk',
      message: buildMessage({ status: 'at-risk', currentStreak }),
    };
  }

  // broken: missed at least the full day after lastWorkoutDate
  const currentStreak = countConsecutiveBack(days, lastWorkoutDate);
  // The "miss date" we surface to the user = the first day they didn't
  // log after lastWorkoutDate. That's the day they need to know about.
  const missedDate = addDays(lastWorkoutDate, 1);
  const daysSinceLastWorkout = Math.round(
    (today.getTime() - lastWorkoutDate.getTime()) / DAY_MS
  );

  return {
    currentStreak,
    longestStreak,
    lastWorkoutDate,
    missedDate,
    daysSinceLastWorkout,
    status: 'broken',
    message: buildMessage({
      status: 'broken',
      currentStreak,
      missedDate,
      lastWorkoutDate,
    }),
  };
};

module.exports = {
  computeStreakForUser,
  // Exported for tests / future reuse
  buildMessage,
  startOfUtcDay,
  dayKey,
};
