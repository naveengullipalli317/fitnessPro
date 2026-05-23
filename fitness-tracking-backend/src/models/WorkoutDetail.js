const mongoose = require('mongoose');

const workoutDetailSchema = new mongoose.Schema({
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout',
    required: true
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  setNumber: {
    type: Number,
    required: true,
    min: 1
  },
  reps: {
    type: Number,
    required: true,
    min: 1
  },
  weight: {
    type: Number, // in kg, optional for bodyweight exercises
    min: 0
  },
  duration: {
    type: Number, // in seconds, for timed exercises like planks
    min: 0
  },
  restPeriod: {
    type: Number, // in seconds
    min: 0,
    default: 60
  }
}, {
  timestamps: true
});

// Index for faster querying by workout
workoutDetailSchema.index({ workoutId: 1 });

module.exports = mongoose.model('WorkoutDetail', workoutDetailSchema);