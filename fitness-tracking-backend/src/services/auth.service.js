// Auth service - acts as an intermediary between controllers and utils
// For now, it's mostly pass-through but provides a place for business logic

const { generateToken } = require('../utils/jwt.utils');
const { hashPassword, comparePassword } = require('../utils/password.utils');

const registerUser = async (userData) => {
  const { name, email, password, age, gender, height, weight, fitnessLevel } = userData;

  // Hash password
  const hashedPassword = await hashPassword(password);

  return {
    name,
    email,
    password: hashedPassword,
    age,
    gender,
    height,
    weight,
    fitnessLevel: fitnessLevel || 'beginner'
  };
};

const loginUser = async (email, password) => {
  // This service would typically fetch the user and compare passwords
  // But since we need the user object, we'll keep the logic in controller
  // This service is more for additional validation/business logic
  return { email, password };
};

const generateAuthToken = (userId) => {
  return generateToken(userId);
};

module.exports = {
  registerUser,
  loginUser,
  generateAuthToken
};