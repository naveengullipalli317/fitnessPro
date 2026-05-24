// Utility helper functions for date formatting, calculations, etc.

/**
 * Format date to local string
 * @param {string|Date} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }).format(dateObj);
};

/**
 * Format time duration in minutes to readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "1h 30m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes === 0) return '0m';

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Calculate calories burned based on workout type and duration
 * @param {string} type - Workout type
 * @param {number} duration - Duration in minutes
 * @param {number} weight - User weight in kg (optional)
 * @returns {number} Estimated calories burned
 */
export const estimateCaloriesBurned = (type, duration, weight = 70) => {
  // MET values for different activities (Metabolic Equivalent of Task)
  const metValues = {
    strength: 3.5,
    cardio: 8.0,
    yoga: 2.5,
    hiit: 8.0,
    pilates: 3.0,
    crossfit: 8.0,
    other: 5.0
  };

  const met = metValues[type] || 5.0;
  // Formula: Calories/minute = MET * weight in kg * 3.5 / 200
  const caloriesPerMinute = met * weight * 3.5 / 200;
  return Math.round(caloriesPerMinute * duration);
};

/**
 * Generate random ID for mock data
 * @returns {string} Random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add when truncated
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100, suffix = '...') => {
  if (!text || text.length <= length) return text;
  return text.slice(0, length) + suffix;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter'
    };
  }

  return {
    isValid: true,
    message: 'Password is strong'
  };
};

export const constants = {
  // API endpoints
  API_ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile'
    },
    USERS: '/users',
    WORKOUTS: '/workouts',
    EXERCISES: '/exercises',
    GOALS: '/goals',
    ROUTINES: '/routines'
  },

  // Workout types
  WORKOUT_TYPES: [
    'strength',
    'cardio',
    'yoga',
    'hiit',
    'pilates',
    'crossfit',
    'other'
  ],

  // Exercise categories
  EXERCISE_CATEGORIES: [
    'chest',
    'back',
    'legs',
    'shoulders',
    'arms',
    'abs',
    'cardio',
    'full_body'
  ],

  // Muscle groups
  MUSCLE_GROUPS: [
    'chest',
    'back',
    'legs',
    'shoulders',
    'biceps',
    'triceps',
    'abs',
    'glutes',
    'calves'
  ],

  // Difficulty levels
  DIFFICULTY_LEVELS: [
    'beginner',
    'intermediate',
    'advanced'
  ],

  // Goal types
  GOAL_TYPES: [
    'weightLoss',
    'muscleGain',
    'distance',
    'duration',
    'frequency',
    'other'
  ],

  // Days of week
  DAYS_OF_WEEK: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ]
};