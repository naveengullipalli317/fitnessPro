const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['strength', 'cardio', 'yoga', 'hiit', 'pilates', 'crossfit', 'other']
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  distance: {
    type: Number, // in kilometers, optional for non-cardio
    min: 0
  },
  caloriesBurned: {
    type: Number,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

workoutSchema.virtual('details', {
  ref: 'WorkoutDetail',
  localField: '_id',
  foreignField: 'workoutId'
});

// Index for faster querying by user and date
workoutSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Workout', workoutSchema);