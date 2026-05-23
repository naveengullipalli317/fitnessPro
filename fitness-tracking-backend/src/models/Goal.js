const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalType: {
    type: String,
    required: true,
    enum: ['weightLoss', 'muscleGain', 'distance', 'duration', 'frequency', 'other']
  },
  targetValue: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },
  deadline: {
    type: Date,
    required: true
  },
  achieved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster querying by user and deadline
goalSchema.index({ userId: 1, deadline: 1 });

module.exports = mongoose.model('Goal', goalSchema);