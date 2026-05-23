const mongoose = require('mongoose');

// Chat messages scoped to a community. Reads gated by active membership
// (enforced in message.service); the schema itself just describes the data.
const messageSchema = new mongoose.Schema(
  {
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    // Soft delete: keeps the row so threading/quoting can resolve later.
    // Hard delete is also available via admin action and prunes the row entirely.
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index supporting the "newest 50 messages in this community"
// query AND the "older than this cursor" pagination query. createdAt
// descending means a regular .sort({ createdAt: -1 }).limit(50) reads from
// the index in order, no in-memory sort.
messageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
