const WORKOUT_TYPES = ['strength', 'cardio', 'yoga', 'hiit', 'pilates', 'crossfit', 'other'];
const EXERCISE_CATEGORIES = ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body'];
const MUSCLE_GROUPS = ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'glutes', 'calves'];
const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'];
const GOAL_TYPES = ['weightLoss', 'muscleGain', 'distance', 'duration', 'frequency', 'other'];
const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EQUIPMENT_OPTIONS = ['none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'bench', 'machine', 'other'];
const AVATAR_OPTIONS = ['avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png'];

const DEFAULT_VALUES = {
  fitnessLevel: 'beginner',
  difficultyLevel: 'beginner',
  restPeriod: 60,
  weightIncrement: 2.5,
  repRange: { strength: [8, 12], hypertrophy: [12, 15], endurance: [15, 20] },
};

const API_CONSTANTS = {
  PAGE_SIZE: 10,
  MAX_WORKOUT_DURATION: 480,
  MAX_SETS_PER_WORKOUT: 20,
  MAX_REPS_PER_SET: 100,
  MAX_WEIGHT: 500,
  MIN_WEIGHT: 0,
  MAX_DISTANCE: 1000,
  MIN_DISTANCE: 0,
  MAX_CALORIES: 2000,
  MIN_CALORIES: 0,
};

const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  passwordMinLength: 'Password must be at least 6 characters',
  passwordStrength: 'Password must contain at least one letter and one number',
  ageRange: 'Age must be between 13 and 120',
  heightRange: 'Height must be between 50 and 300 cm',
  weightRange: 'Weight must be between 20 and 500 kg',
  durationMin: 'Duration must be at least 1 minute',
  caloriesMin: 'Calories burned cannot be negative',
  distanceMin: 'Distance cannot be negative',
  futureDate: 'Date cannot be in the future',
  pastDate: 'Date must be today or in the future',
};

const ROLES = { USER: 'user', TRAINER: 'trainer', ADMIN: 'admin' };

const NOTIFICATION_TYPES = {
  GOAL_ACHIEVED: 'goal_achieved',
  WORKOUT_REMINDER: 'workout_reminder',
  NEW_FOLLOWER: 'new_follower',
  MESSAGE: 'message',
  SYSTEM_UPDATE: 'system_update',
};

module.exports = {
  WORKOUT_TYPES,
  EXERCISE_CATEGORIES,
  MUSCLE_GROUPS,
  DIFFICULTY_LEVELS,
  GOAL_TYPES,
  DAYS_OF_WEEK,
  EQUIPMENT_OPTIONS,
  AVATAR_OPTIONS,
  DEFAULT_VALUES,
  API_CONSTANTS,
  VALIDATION_MESSAGES,
  ROLES,
  NOTIFICATION_TYPES,
};
