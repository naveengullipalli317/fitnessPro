const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workoutSchedule: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    },
    workoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true
    }
  }]
}, {
  timestamps: true
});

// Index for faster querying by creator and public status
routineSchema.index({ createdBy: 1, isPublic: 1 });

module.exports = mongoose.model('Routine', routineSchema);