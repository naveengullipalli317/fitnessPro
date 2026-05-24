const mongoose = require('mongoose');

// One row per outstanding reset request. We never store the raw token —
// only sha256(token). The TTL index lets MongoDB auto-prune expired rows
// roughly every 60s so we don't need a cleanup job.
const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true, // sha256 collisions are vanishingly unlikely
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index: documents auto-delete once expiresAt is in the past.
// `expireAfterSeconds: 0` means "use the date in this field as the deadline".
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordReset', passwordResetSchema);
