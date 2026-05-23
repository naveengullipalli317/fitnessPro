import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMissedWorkouts } from '../../hooks/useMissedWorkouts';
import { workoutImage } from '../../utils/images';

const formatRelative = (d) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((today - target) / 86400000);
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return target.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const NotificationBell = () => {
  const { missed, count, dismiss, dismissAll } = useMissedWorkouts();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close on outside click / escape.
  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={count > 0 ? `${count} missed workouts` : 'Notifications'}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-ink-700 bg-ink-900 text-ink-200 hover:border-volt-500 hover:text-volt-500 transition-colors"
      >
        {/* Bell glyph */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold leading-none ring-2 ring-ink-950">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-ink-700 bg-ink-900/95 backdrop-blur shadow-2xl z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-800">
            <div>
              <span className="eyebrow">Notifications</span>
              <h4 className="text-ink-100 text-sm font-semibold mt-0.5">
                {count > 0 ? `${count} missed session${count === 1 ? '' : 's'}` : "You're all caught up"}
              </h4>
            </div>
            {count > 0 && (
              <button
                type="button"
                onClick={dismissAll}
                className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 hover:text-volt-500"
              >
                Mark all read
              </button>
            )}
          </div>

          {count === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-ink-400">
              <div className="text-3xl mb-2">🎯</div>
              No missed workouts in the last 7 days. Keep the streak alive.
            </div>
          ) : (
            <ul className="max-h-[60vh] overflow-y-auto divide-y divide-ink-800">
              {missed.map((m) => (
                <li key={m.id} className="px-4 py-3 hover:bg-ink-800/60 transition-colors">
                  <div className="flex items-start gap-3">
                    <img
                      src={workoutImage(m.type)}
                      alt=""
                      className="h-10 w-10 rounded-md object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-100 capitalize font-medium">
                        Missed {m.type}
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {formatRelative(m.date)} · from <span className="text-ink-300">{m.routineName}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <Link
                          to={`/dashboard/calendar?date=${m.dateKey}`}
                          onClick={() => setOpen(false)}
                          className="text-[11px] font-semibold uppercase tracking-wider text-volt-500 hover:text-volt-400"
                        >
                          Log now →
                        </Link>
                        <button
                          type="button"
                          onClick={() => dismiss(m.id)}
                          className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 hover:text-ink-200"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
