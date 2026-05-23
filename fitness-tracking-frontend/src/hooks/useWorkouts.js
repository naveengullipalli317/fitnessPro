import { useState, useEffect } from 'react';
import api from '../utils/api';

const useWorkouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/workouts');
      setWorkouts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workouts');
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createWorkout = async (workoutData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/workouts', workoutData);
      await fetchWorkouts(); // Refresh list
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkout = async (id, workoutData) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/workouts/${id}`, workoutData);
      await fetchWorkouts(); // Refresh list
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update workout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkout = async (id) => {
    setIsLoading(true);
    try {
      await api.delete(`/workouts/${id}`);
      await fetchWorkouts(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load workouts on initial mount
  useEffect(() => {
    fetchWorkouts();
  }, []);

  return {
    workouts,
    isLoading,
    error,
    fetchWorkouts,
    createWorkout,
    updateWorkout,
    deleteWorkout
  };
};

export default useWorkouts;
export { useWorkouts };
