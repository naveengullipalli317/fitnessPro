import { useState, useEffect } from 'react';
import api from '../utils/api';

const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGoals = async (filters = {}) => {
    setIsLoading(true);
    try {
      const response = await api.get('/goals', { params: filters });
      setGoals(response.data.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch goals');
      setGoals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createGoal = async (goalData) => {
    setIsLoading(true);
    try {
      const response = await api.post('/goals', goalData);
      await fetchGoals(); // Refresh list
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoal = async (id, goalData) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/goals/${id}`, goalData);
      await fetchGoals(); // Refresh list
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    setIsLoading(true);
    try {
      await api.delete(`/goals/${id}`);
      await fetchGoals(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete goal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load goals on initial mount
  useEffect(() => {
    fetchGoals();
  }, []);

  return {
    goals,
    isLoading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal
  };
};

export default useGoals;
export { useGoals };
