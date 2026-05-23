import { useState, useEffect } from 'react';
import api from '../utils/api';

const useRoutines = () => {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoutines = async (filters = {}) => {
    setIsLoading(true);
    try {
      const response = await api.get('/routines', { params: filters });
      setRoutines(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch routines');
      setRoutines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createRoutine = async (routineData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/routines', routineData);
      await fetchRoutines(); // Refresh list
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create routine');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRoutine = async (id, routineData) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/routines/${id}`, routineData);
      await fetchRoutines(); // Refresh list
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update routine');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRoutine = async (id) => {
    setIsLoading(true);
    try {
      await api.delete(`/routines/${id}`);
      await fetchRoutines(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete routine');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load routines on initial mount
  useEffect(() => {
    fetchRoutines();
  }, []);

  return {
    routines,
    isLoading,
    error,
    fetchRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine
  };
};

export default useRoutines;
export { useRoutines };
