const mongoose = require('mongoose');

// One row per "session" — a contiguous run of authenticated requests
// with no >15-minute gap. `lastBeatAt` is bumped (via the trackActivity
// middleware) at most once per 60s per user to keep this write-cheap.
//
// Total active time per user = sum of (lastBeatAt - startedAt) across
// their session rows. DAU/WAU/MAU = distinct userIds with any row whose
// lastBeatAt falls inside the window.
const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastBeatAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound: instantly find the user's most recent session (the candidate
// to extend or to compare against the gap threshold). Descending on
// lastBeatAt so .findOne({ userId }).sort({ lastBeatAt: -1 }) is index-only.
userSessionSchema.index({ userId: 1, lastBeatAt: -1 });
// Supports the DAU rollup: "distinct userIds where lastBeatAt >= startOfDay".
userSessionSchema.index({ lastBeatAt: -1 });

module.exports = mongoose.model('UserSession', userSessionSchema);
