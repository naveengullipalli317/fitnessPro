const mongoose = require('mongoose');

// Per-user notification record. One row per (recipient, event) — fan-out
// writes N rows when a public event happens.
//
// `type` is a namespaced string so the frontend can route to the right
// renderer / icon by prefix. Today the only producer is community.created;
// add more (`routine.public_created`, `community.invite`, etc.) without
// schema changes.
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      // not enum-restricted — keeping it open lets new types ship without
      // a schema migration. Frontend treats unknown types as a generic.
      maxlength: 64,
    },
    title: { type: String, required: true, maxlength: 120 },
    message: { type: String, required: true, maxlength: 500 },
    link: { type: String, maxlength: 500, default: '' },
    refType: { type: String, maxlength: 32, default: '' },
    refId: { type: mongoose.Schema.Types.ObjectId, default: null },
    readAt: { type: Date, default: null, index: true },
    dismissedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-prune at 90 days. Notifications older than that are noise; the
// TTL index keeps the collection from growing unbounded as the app ages.
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 }
);

// Drives the bell's "list my notifications, unread first, newest first"
// query. dismissedAt filtering is by inequality so it doesn't help here,
// but the (userId, createdAt) prefix is exact-match + range, which IS
// index-friendly.
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
