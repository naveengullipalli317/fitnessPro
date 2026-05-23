const Goal = require('../models/Goal');

// @desc    Get user's goals
// @route   GET /api/goals
// @access  Private
const getUserGoals = async (req, res) => {
  try {
    const { goalType, achieved } = req.query;

    // Build filter object
    const filter = { userId: req.user._id };
    if (goalType) filter.goalType = goalType;
    if (achieved !== undefined) filter.achieved = achieved === 'true';

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get goal by ID
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Check authorization
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    const { goalType, targetValue, deadline } = req.body;

    // Validate goalType
    const validGoalTypes = ['weightLoss', 'muscleGain', 'distance', 'duration', 'frequency', 'other'];
    if (!validGoalTypes.includes(goalType)) {
      return res.status(400).json({ success: false, message: 'Invalid goal type' });
    }

    // Create goal
    const goal = await Goal.create({
      userId: req.user._id,
      goalType,
      targetValue,
      deadline: new Date(deadline)
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      data: goal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const { goalType, targetValue, currentValue, deadline, achieved } = req.body;

    // Find goal
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Check authorization
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Validate goalType if provided
    if (goalType) {
      const validGoalTypes = ['weightLoss', 'muscleGain', 'distance', 'duration', 'frequency', 'other'];
      if (!validGoalTypes.includes(goalType)) {
        return res.status(400).json({ success: false, message: 'Invalid goal type' });
      }
    }

    // Update goal
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        goalType: goalType || goal.goalType,
        targetValue: targetValue !== undefined ? targetValue : goal.targetValue,
        currentValue: currentValue !== undefined ? currentValue : goal.currentValue,
        deadline: deadline ? new Date(deadline) : goal.deadline,
        achieved: achieved !== undefined ? achieved : goal.achieved
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Goal updated successfully',
      data: updatedGoal
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    // Check authorization
    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Goal.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal
};