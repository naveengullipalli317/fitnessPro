import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';

// All analytics endpoints fetched in one parallel burst on dashboard load.
// Each returns the chart-ready shape so no transform is needed on the FE.
const ANALYTICS_ENDPOINTS = [
  ['signups',     '/admin/analytics/signups'],
  ['activeUsers', '/admin/analytics/active-users'],
  ['topActive',   '/admin/analytics/top-active'],
  ['communities', '/admin/analytics/communities'],
  ['workouts',    '/admin/analytics/workouts'],
  ['roles',       '/admin/analytics/roles'],
];

/**
 * Thin client for the /admin/* endpoints. Separate hook (not folded into
 * useAuth) so non-admin code paths never load this bundle / make these calls.
 */
export const useAdmin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState({ items: [], total: 0, page: 1, pageSize: 25 });
  const [communities, setCommunities] = useState({ items: [], total: 0, page: 1, pageSize: 25 });
  const [analytics, setAnalytics] = useState(null); // { signups, activeUsers, topActive, communities, workouts, roles }
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stats');
    }
  }, []);

  const fetchUsers = useCallback(async (params = {}) => {
    try {
      const res = await api.get('/admin/users', { params });
      const d = res.data?.data || {};
      setUsers({ items: d.users || [], total: d.total || 0, page: d.page || 1, pageSize: d.pageSize || 25 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    }
  }, []);

  const fetchCommunities = useCallback(async (params = {}) => {
    try {
      const res = await api.get('/admin/communities', { params });
      const d = res.data?.data || {};
      setCommunities({
        items: d.communities || [],
        total: d.total || 0,
        page: d.page || 1,
        pageSize: d.pageSize || 25,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load communities');
    }
  }, []);

  const updateUser = async (id, updates) => {
    await api.patch(`/admin/users/${id}`, updates);
    await Promise.all([fetchUsers(), fetchStats()]);
  };

  const deleteUser = async (id) => {
    await api.delete(`/admin/users/${id}`);
    await Promise.all([fetchUsers(), fetchStats(), fetchCommunities()]);
  };

  // Community detail (single community + member list) — used by the
  // /admin/communities/:id page. Returned directly, not stored in state,
  // because only one detail view is open at a time.
  const fetchCommunityDetail = async (id) => {
    const res = await api.get(`/admin/communities/${id}`);
    return res.data?.data;
  };

  const kickCommunityMember = async (communityId, userId) => {
    await api.delete(`/admin/communities/${communityId}/members/${userId}`);
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      const results = await Promise.all(
        ANALYTICS_ENDPOINTS.map(([_, url]) => api.get(url).then((r) => r.data?.data))
      );
      const next = {};
      ANALYTICS_ENDPOINTS.forEach(([key], i) => { next[key] = results[i]; });
      setAnalytics(next);
    } catch (err) {
      // Analytics is non-fatal — the page still shows tables. Surface a
      // banner if we can't load it but don't crash the dashboard.
      setError(err.response?.data?.message || 'Failed to load analytics');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchStats(), fetchUsers(), fetchCommunities(), fetchAnalytics()]);
        setLastFetchedAt(new Date());
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fetchStats, fetchUsers, fetchCommunities, fetchAnalytics]);

  return {
    stats,
    users,
    communities,
    analytics,
    lastFetchedAt,
    isLoading,
    error,
    fetchUsers,
    fetchCommunities,
    fetchAnalytics,
    updateUser,
    deleteUser,
    fetchCommunityDetail,
    kickCommunityMember,
  };
};

export default useAdmin;
