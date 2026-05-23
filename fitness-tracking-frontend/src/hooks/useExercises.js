import { useState, useEffect } from 'react';
import api from '../utils/api';

const useExercises = () => {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExercises = async (filters = {}) => {
    setIsLoading(true);
    try {
      const response = await api.get('/exercises', { params: filters });
      setExercises(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exercises');
      setExercises([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getExerciseById = async (id) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/exercises/${id}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exercise');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load exercises on initial mount
  useEffect(() => {
    fetchExercises();
  }, []);

  return {
    exercises,
    isLoading,
    error,
    fetchExercises,
    getExerciseById
  };
};

export default useExercises;
export { useExercises };
