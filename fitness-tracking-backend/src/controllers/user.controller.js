const User = require('../models/User');
const Workout = require('../models/Workout');
const { protect } = require('../middleware/auth.middleware');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    // Check authorization
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, age, gender, height, weight, fitnessLevel } = req.body;

    // Check if email is taken by another user
    if (email) {
      const userExists = await User.findOne({ email });
      if (userExists && userExists._id.toString() !== req.params.id) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age, gender, height, weight, fitnessLevel },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's workouts
// @route   GET /api/users/:id/workouts
// @access  Private
const getUserWorkouts = async (req, res) => {
  try {
    // If user ID is in params, use that (for admin/trainer access)
    // Otherwise use the logged-in user's ID
    const userId = req.params.id || req.user._id;

    // Verify authorization - users can only access their own workouts
    // unless they are admin/trainer (simplified for now)
    if (req.params.id && req.params.id !== req.user._id.toString()) {
      // In a real app, you'd check for admin/trainer role here
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const workouts = await Workout.find({ userId })
      .sort({ date: -1 })
      .populate('userId', 'name email');

    res.json({ success: true, data: workouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserWorkouts
};