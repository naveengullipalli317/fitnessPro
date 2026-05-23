// Goal service - business logic for goal operations
const Goal = require('../models/Goal');

const getUserGoals = async (userId, filters = {}) => {
  // Build filter object
  const filter = { userId };
  if (filters.goalType) filter.goalType = filters.goalType;
  if (filters.achieved !== undefined) filter.achieved = filters.achieved === 'true';

  return Goal.find(filter).sort({ createdAt: -1 });
};

const getGoalById = async (goalId, userId) => {
  const goal = await Goal.findById(goalId);

  // Check authorization
  if (!goal) {
    throw new Error('Goal not found');
  }

  if (goal.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  return goal;
};

const createGoal = async (userId, goalData) => {
  // Validate goalType
  const validGoalTypes = ['weightLoss', 'muscleGain', 'distance', 'duration', 'frequency', 'other'];
  if (!validGoalTypes.includes(goalData.goalType)) {
    throw new Error('Invalid goal type');
  }

  return Goal.create({
    userId,
    ...goalData
  });
};

const updateGoal = async (goalId, userId, updateData) => {
  // Find goal
  const goal = await Goal.findById(goalId);
  if (!goal) {
    throw new Error('Goal not found');
  }

  // Check authorization
  if (goal.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  // Validate goalType if provided
  if (updateData.goalType) {
    const validGoalTypes = ['weightLoss', 'muscleGain', 'distance', 'duration', 'frequency', 'other'];
    if (!validGoalTypes.includes(updateData.goalType)) {
      throw new Error('Invalid goal type');
    }
  }

  // Update goal
  return Goal.findByIdAndUpdate(
    goalId,
    updateData,
    { new: true, runValidators: true }
  );
};

const deleteGoal = async (goalId, userId) => {
  // Find goal
  const goal = await Goal.findById(goalId);
  if (!goal) {
    throw new Error('Goal not found');
  }

  // Check authorization
  if (goal.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  return Goal.findByIdAndDelete(goalId);
};

module.exports = {
  getUserGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal
};