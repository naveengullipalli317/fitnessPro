const User = require('../models/User');
const { generateToken } = require('../utils/jwt.utils');
const { hashPassword, comparePassword } = require('../utils/password.utils');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight, fitnessLevel } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user - password will be hashed by pre-save hook in User model
    const user = await User.create({
      name,
      email,
      password, // Will be hashed by pre-save hook
      age,
      gender,
      height,
      weight,
      fitnessLevel: fitnessLevel || 'beginner'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user (clear token on client side)
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, age, gender, height, weight, fitnessLevel } = req.body;

    // Check if email is taken by another user
    if (email) {
      const userExists = await User.findOne({ email });
      if (userExists && userExists._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
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

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile
};