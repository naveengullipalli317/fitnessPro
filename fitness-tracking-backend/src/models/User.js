const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: {
    type: Number,
    min: 13,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  height: {
    type: Number, // in cm
    min: 50,
    max: 300
  },
  weight: {
    type: Number, // in kg
    min: 20,
    max: 500
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  goals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],
  routines: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine'
  }],
  // Authorization. Default 'user' — admins are minted via the
  // promote-admin CLI on the server, never via self-signup.
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true,
    index: true
  },
  // Soft delete. Deactivated users can't log in and are hidden from
  // social surfaces, but their data stays so workouts/communities they
  // own retain referential integrity.
  isDeactivated: {
    type: Boolean,
    default: false
  },
  // Marks the last time the user's password changed (registration counts
  // as the first change). Used to invalidate JWTs issued before a reset —
  // the protect middleware rejects tokens whose iat predates this stamp.
  passwordChangedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);