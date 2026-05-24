import { Link } from 'react-router-dom';

// Inline streak banner for the dashboard. Renders nothing for never-started
// (no point pestering brand-new users) and for active streaks shows a
// quiet celebratory pill. The at-risk and broken cases are the actionable
// states that get full-width, attention-grabbing chrome.
const StreakBanner = ({ streak, onDismiss }) => {
  if (!streak) return null;
  const { status, message, currentStreak, longestStreak, missedDate, daysSinceLastWorkout } = streak;

  if (status === 'never-started') return null;

  // Active = small, celebratory, not a banner.
  if (status === 'active') {
    return (
      <div className="inline-flex items-center gap-3 rounded-full border border-volt-500/30 bg-volt-500/10 px-4 py-2 text-sm">
        <span className="text-xl leading-none">🔥</span>
        <span className="text-volt-300 font-semibold">
          {currentStreak}-day streak
        </span>
        {longestStreak > currentStreak && (
          <span className="text-ink-500 text-xs">best: {longestStreak}</span>
        )}
      </div>
    );
  }

  // at-risk and broken — full banners.
  const isBroken = status === 'broken';
  const borderColor = isBroken ? 'border-rose-500/40' : 'border-amber-500/40';
  const bgColor = isBroken ? 'bg-rose-500/10' : 'bg-amber-500/10';
  const accentColor = isBroken ? 'text-rose-300' : 'text-amber-300';
  const icon = isBroken ? '💔' : '⚠️';

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-5 flex flex-wrap items-center gap-4`}>
      <span className="text-3xl leading-none">{icon}</span>
      <div className="flex-1 min-w-[260px]">
        {/* h3 keeps page outline sensible and lets a11y / tests address it */}
        <h3 className="font-semibold text-ink-100 text-base">
          {isBroken ? 'Streak broken' : 'Streak at risk'}
        </h3>
        <p className="text-sm text-ink-300 mt-1">{message}</p>
        {isBroken && missedDate && (
          <p className={`text-xs ${accentColor} mt-2`}>
            Missed on {new Date(missedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            {daysSinceLastWorkout > 1 && ` · ${daysSinceLastWorkout} days since last workout`}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/workouts"
          className="text-sm font-semibold uppercase tracking-wider text-volt-500 hover:text-volt-400"
        >
          {isBroken ? 'Start a new streak →' : 'Log a workout →'}
        </Link>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm text-ink-400 hover:text-ink-200"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default StreakBanner;
