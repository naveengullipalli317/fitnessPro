import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';

/**
 * Thin client for the /admin/* endpoints. Separate hook (not folded into
 * useAuth) so non-admin code paths never load this bundle / make these calls.
 */
export const useAdmin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState({ items: [], total: 0, page: 1, pageSize: 25 });
  const [communities, setCommunities] = useState({ items: [], total: 0, page: 1, pageSize: 25 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        await Promise.all([fetchStats(), fetchUsers(), fetchCommunities()]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fetchStats, fetchUsers, fetchCommunities]);

  return {
    stats,
    users,
    communities,
    isLoading,
    error,
    fetchUsers,
    fetchCommunities,
    updateUser,
    deleteUser,
  };
};

export default useAdmin;
