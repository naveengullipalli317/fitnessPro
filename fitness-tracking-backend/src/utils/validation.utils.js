// Validation utility functions
const Joi = require('joi');

// Auth validation schemas.
// Password policy mirrors the PasswordStrength helper on the frontend:
// at least 8 chars, contains at least one letter and one number.
// Login does not enforce these (legacy accounts may have weaker passwords).
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[A-Za-z]/, 'letter')
    .pattern(/\d/, 'number')
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.name': 'Password must include at least one {#name}.',
    }),
  age: Joi.number().integer().min(13).max(120),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
  height: Joi.number().min(50).max(300),
  weight: Joi.number().min(20).max(500),
  fitnessLevel: Joi.string().valid('beginner', 'intermediate', 'advanced'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

// Forgot-password: only the email. No "user exists" check at the schema
// level — handled in the service with a generic response either way.
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
});

// Reset-password: token + new password. Password rules MUST mirror the
// registerSchema policy or users would get a weaker-password sneak path
// via the reset flow.
const resetPasswordSchema = Joi.object({
  token: Joi.string().length(64).hex().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[A-Za-z]/, 'letter')
    .pattern(/\d/, 'number')
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.name': 'Password must include at least one {#name}.',
    }),
});

// User validation schemas
const userIdSchema = Joi.string().hex().length(24);

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  email: Joi.string().email().trim().lowercase(),
  age: Joi.number().integer().min(13).max(120),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
  height: Joi.number().min(50).max(300),
  weight: Joi.number().min(20).max(500),
  fitnessLevel: Joi.string().valid('beginner', 'intermediate', 'advanced')
});

// Workout validation schemas
const workoutCreateSchema = Joi.object({
  type: Joi.string().valid('strength', 'cardio', 'yoga', 'hiit', 'pilates', 'crossfit', 'other').required(),
  duration: Joi.number().integer().min(1).required(),
  distance: Joi.number().min(0).allow(null),
  caloriesBurned: Joi.number().min(0).default(0),
  date: Joi.date(),
  notes: Joi.string().max(500).allow(''),
  sets: Joi.array().items(
    Joi.object({
      exerciseId: Joi.string().hex().length(24).required(),
      setNumber: Joi.number().integer().min(1).required(),
      reps: Joi.number().integer().min(1).required(),
      weight: Joi.number().min(0).allow(null),
      duration: Joi.number().min(0).allow(null),
      restPeriod: Joi.number().min(0).default(60)
    })
  )
});

const workoutUpdateSchema = Joi.object({
  type: Joi.string().valid('strength', 'cardio', 'yoga', 'hiit', 'pilates', 'crossfit', 'other'),
  duration: Joi.number().integer().min(1),
  distance: Joi.number().min(0).allow(null),
  caloriesBurned: Joi.number().min(0),
  date: Joi.date(),
  notes: Joi.string().max(500).allow('')
});

// Exercise validation schemas
const exerciseCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  category: Joi.string().valid('chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body').required(),
  equipmentNeeded: Joi.array().items(
    Joi.string().valid('none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'bench', 'machine', 'other')
  ),
  muscleGroups: Joi.array().items(
    Joi.string().valid('chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'glutes', 'calves')
  ),
  difficultyLevel: Joi.string().valid('beginner', 'intermediate', 'advanced').default('beginner'),
  instructions: Joi.string().min(10).required(),
  videoUrl: Joi.string().uri().allow(null, '')
});

const exerciseUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  category: Joi.string().valid('chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body'),
  equipmentNeeded: Joi.array().items(
    Joi.string().valid('none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'bench', 'machine', 'other')
  ),
  muscleGroups: Joi.array().items(
    Joi.string().valid('chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'glutes', 'calves')
  ),
  difficultyLevel: Joi.string().valid('beginner', 'intermediate', 'advanced'),
  instructions: Joi.string().min(10),
  videoUrl: Joi.string().uri().allow(null, '')
});

// Goal validation schemas
const goalCreateSchema = Joi.object({
  goalType: Joi.string().valid('weightLoss', 'muscleGain', 'distance', 'duration', 'frequency', 'other').required(),
  targetValue: Joi.number().min(0).required(),
  deadline: Joi.date().greater('now').required()
});

const goalUpdateSchema = Joi.object({
  goalType: Joi.string().valid('weightLoss', 'muscleGain', 'distance', 'duration', 'frequency', 'other'),
  targetValue: Joi.number().min(0),
  currentValue: Joi.number().min(0),
  deadline: Joi.date().greater('now'),
  achieved: Joi.boolean()
});

// Routine validation schemas
const routineCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().trim(),
  description: Joi.string().max(1000).allow(''),
  isPublic: Joi.boolean().default(false),
  workoutSchedule: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().integer().min(0).max(6).required(), // 0 = Sunday, 6 = Saturday
      workoutId: Joi.string().hex().length(24).required()
    })
  )
});

const routineUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim(),
  description: Joi.string().max(1000).allow(''),
  isPublic: Joi.boolean(),
  workoutSchedule: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().integer().min(0).max(6).required(),
      workoutId: Joi.string().hex().length(24).required()
    })
  )
});

// Community schemas. bannerUrl is a plain URL string in phase 1 — phase 2
// will swap in real upload handling without breaking this contract.
const communityCreateSchema = Joi.object({
  name: Joi.string().min(2).max(60).trim().required(),
  description: Joi.string().max(1000).allow('').default(''),
  type: Joi.string().valid('public', 'private').default('public'),
  bannerUrl: Joi.string().uri().max(500).allow('').default(''),
});

const communityUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(60).trim(),
  description: Joi.string().max(1000).allow(''),
  type: Joi.string().valid('public', 'private'),
  bannerUrl: Joi.string().uri().max(500).allow(''),
});

// Validation middleware wrapper
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  next();
};

module.exports = {
  // Schemas
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  userIdSchema,
  userUpdateSchema,
  workoutCreateSchema,
  workoutUpdateSchema,
  exerciseCreateSchema,
  exerciseUpdateSchema,
  goalCreateSchema,
  goalUpdateSchema,
  routineCreateSchema,
  routineUpdateSchema,
  communityCreateSchema,
  communityUpdateSchema,
  // Validation middleware
  validate
};