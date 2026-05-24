import { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';

/**
 * Communities list hook. Mirrors useRoutines' shape so the page components
 * follow a familiar pattern. The `scope` argument is forwarded as a query
 * string — backend honors 'mine', 'explore', or undefined (visible-to-me).
 */
export const useCommunities = (scope) => {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCommunities = useCallback(
    async (overrides = {}) => {
      setIsLoading(true);
      try {
        const params = { ...(scope ? { scope } : {}), ...overrides };
        const res = await api.get('/communities', { params });
        setCommunities(res.data?.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch communities');
        setCommunities([]);
      } finally {
        setIsLoading(false);
      }
    },
    [scope]
  );

  const createCommunity = async (data) => {
    const res = await api.post('/communities', data);
    await fetchCommunities();
    return res.data?.data;
  };

  const joinCommunity = async (id) => {
    const res = await api.post(`/communities/${id}/join`);
    await fetchCommunities();
    return res.data?.data;
  };

  const leaveCommunity = async (id) => {
    await api.post(`/communities/${id}/leave`);
    await fetchCommunities();
  };

  const deleteCommunity = async (id) => {
    await api.delete(`/communities/${id}`);
    await fetchCommunities();
  };

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return {
    communities,
    isLoading,
    error,
    refetch: fetchCommunities,
    createCommunity,
    joinCommunity,
    leaveCommunity,
    deleteCommunity,
  };
};

export default useCommunities;
