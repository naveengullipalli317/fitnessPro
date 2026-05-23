const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'abs', 'cardio', 'full_body']
  },
  equipmentNeeded: [{
    type: String,
    enum: ['none', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'pull_up_bar', 'bench', 'machine', 'other']
  }],
  muscleGroups: [{
    type: String,
    enum: ['chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'abs', 'glutes', 'calves']
  }],
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  instructions: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    match: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exercise', exerciseSchema);