import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';

const DISMISS_KEY = 'ng:streakDismissed'; // value = ISO date of the missedDate that was dismissed

const loadDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) || null;
  } catch {
    return null;
  }
};

const saveDismissed = (iso) => {
  try {
    if (iso) localStorage.setItem(DISMISS_KEY, iso);
    else localStorage.removeItem(DISMISS_KEY);
  } catch {
    /* storage off — silently ignore */
  }
};

/**
 * Fetches the user's streak status. Returns:
 *   data: { currentStreak, longestStreak, lastWorkoutDate, missedDate,
 *           daysSinceLastWorkout, status, message }
 *   shouldNotify: boolean — true when status is at-risk OR broken AND
 *                 the current missedDate hasn't been dismissed
 *   dismiss(): marks the current notification as seen until status changes
 */
export const useStreak = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dismissedFor, setDismissedFor] = useState(() => loadDismissed());

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/streaks/me');
      setData(res.data?.data || null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load streak');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  // The "dismiss key" is the missedDate for broken, or 'today' for at-risk.
  // Status changing back to active clears it implicitly (no more banner).
  const currentDismissKey = data
    ? data.status === 'broken'
      ? `broken:${data.missedDate}`
      : data.status === 'at-risk'
        ? `at-risk:${new Date().toISOString().slice(0, 10)}`
        : null
    : null;

  const shouldNotify =
    data &&
    (data.status === 'at-risk' || data.status === 'broken') &&
    dismissedFor !== currentDismissKey;

  const dismiss = useCallback(() => {
    if (!currentDismissKey) return;
    saveDismissed(currentDismissKey);
    setDismissedFor(currentDismissKey);
  }, [currentDismissKey]);

  return { data, isLoading, error, refetch, shouldNotify, dismiss };
};

export default useStreak;
