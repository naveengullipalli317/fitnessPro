// User service - business logic for user operations
const User = require('../models/User');
const { hashPassword } = require('../utils/password.utils');

const getUserById = async (userId) => {
  return User.findById(userId).select('-password');
};

const updateUser = async (userId, updateData) => {
  // Hash password if it's being updated
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  return User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
};

const getUserWorkouts = async (userId) => {
  return User.findById(userId).populate('workouts', '-__v');
};

module.exports = {
  getUserById,
  updateUser,
  getUserWorkouts
};