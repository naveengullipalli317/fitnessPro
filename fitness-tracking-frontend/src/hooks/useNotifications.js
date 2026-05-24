import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';

/**
 * Bell-list notifications fetched from the server. Different shape from
 * useMissedWorkouts (which is client-derived) and useStreak (which is a
 * single summary record) — this one is an actual paginated list of
 * persistent rows.
 *
 * `unreadCount` returns alongside `items` from one request so the bell
 * badge doesn't need a second round-trip.
 */
export const useNotifications = () => {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications');
      setItems(res.data?.data?.items || []);
      setUnreadCount(res.data?.data?.unreadCount || 0);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const markRead = useCallback(async (id) => {
    // Optimistic: flip the in-memory row before the round-trip so the
    // bell shows the change immediately.
    setItems((prev) => prev.map((n) => (n._id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try { await api.patch(`/notifications/${id}/read`); }
    catch { refetch(); /* revert via authoritative fetch */ }
  }, [refetch]);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    try { await api.patch('/notifications/read-all'); }
    catch { refetch(); }
  }, [refetch]);

  const dismiss = useCallback(async (id) => {
    // Optimistic remove from list. If the API fails the refetch reinstates it.
    const before = items;
    setItems((prev) => prev.filter((n) => n._id !== id));
    setUnreadCount((prev) =>
      Math.max(0, prev - (before.find((n) => n._id === id && !n.readAt) ? 1 : 0))
    );
    try { await api.delete(`/notifications/${id}`); }
    catch { refetch(); }
  }, [items, refetch]);

  return { items, unreadCount, isLoading, error, refetch, markRead, markAllRead, dismiss };
};

export default useNotifications;
