// Notification service. Hides storage from callers; producers ("a public
// community was created") call high-level `fanOut*` methods, consumers
// ("the bell") call list/markRead/dismiss.
const Notification = require('../models/Notification');
const User = require('../models/User');

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const LIST_LIMIT_DEFAULT = 25;
const LIST_LIMIT_MAX = 100;

/**
 * Bell list query. Excludes dismissed rows; sorted unread-first then by
 * recency. We return the full set in one shot (capped at ~100) plus
 * separate `unreadCount` so the badge doesn't need a second round-trip.
 */
const listForUser = async (userId, { limit } = {}) => {
  const lim = Math.min(LIST_LIMIT_MAX, Math.max(1, parseInt(limit, 10) || LIST_LIMIT_DEFAULT));
  const [items, unreadCount] = await Promise.all([
    Notification.find({ userId, dismissedAt: null })
      .sort({ readAt: 1, createdAt: -1 }) // unread (readAt null) sorts first
      .limit(lim)
      .lean(),
    Notification.countDocuments({ userId, dismissedAt: null, readAt: null }),
  ]);
  return { items, unreadCount };
};

const markRead = async (userId, notificationId) => {
  const r = await Notification.updateOne(
    { _id: notificationId, userId, readAt: null },
    { $set: { readAt: new Date() } }
  );
  return { updated: r.modifiedCount > 0 };
};

const markAllRead = async (userId) => {
  const r = await Notification.updateMany(
    { userId, readAt: null, dismissedAt: null },
    { $set: { readAt: new Date() } }
  );
  return { updated: r.modifiedCount };
};

const dismiss = async (userId, notificationId) => {
  const r = await Notification.updateOne(
    { _id: notificationId, userId },
    { $set: { dismissedAt: new Date() } }
  );
  if (r.matchedCount === 0) throw new ServiceError('Notification not found.', 404);
  return { dismissed: true };
};

const dismissAll = async (userId) => {
  const r = await Notification.updateMany(
    { userId, dismissedAt: null },
    { $set: { dismissedAt: new Date() } }
  );
  return { dismissed: r.modifiedCount };
};

/**
 * Low-level bulk insert. `userIds` is the recipient set; payload supplies
 * type/title/message/link/refType/refId. One row per recipient.
 */
const createForUsers = async (userIds, payload) => {
  if (!Array.isArray(userIds) || userIds.length === 0) return { created: 0 };
  const docs = userIds.map((uid) => ({
    userId: uid,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    link: payload.link || '',
    refType: payload.refType || '',
    refId: payload.refId || null,
  }));
  // ordered:false so a single bad doc (very unlikely with our shape)
  // doesn't abort the rest of the batch.
  await Notification.insertMany(docs, { ordered: false });
  return { created: docs.length };
};

/**
 * Fan-out for a freshly created PUBLIC community. Producers call this
 * AFTER the community is persisted; we look up the recipient set ourselves.
 *
 * Recipients = every active, non-deactivated user who isn't the creator.
 * MVP scope is "all active users" — easy to swap in a recency filter
 * (last 30 days, etc.) later without changing the call site.
 */
const fanOutCommunityCreated = async (community, creatorId) => {
  if (!community || community.type !== 'public') {
    // Defence-in-depth: callers should already gate on type, but if they
    // forget, we refuse to fan-out a private community as a safety net.
    return { created: 0, skipped: 'not-public' };
  }

  const recipients = await User.find(
    { _id: { $ne: creatorId }, isDeactivated: { $ne: true } },
    { _id: 1 }
  ).lean();
  if (recipients.length === 0) return { created: 0 };

  const creator = await User.findById(creatorId).select('name').lean();
  const creatorName = creator?.name || 'A user';

  return createForUsers(recipients.map((u) => u._id), {
    type: 'community.created',
    title: 'New community',
    // Concise message with the actor + community name — the link takes
    // the user to the community detail page for the rest.
    message: `${creatorName} created "${community.name}". Open to all members.`,
    link: `/dashboard/community`,
    refType: 'community',
    refId: community._id,
  });
};

module.exports = {
  ServiceError,
  listForUser,
  markRead,
  markAllRead,
  dismiss,
  dismissAll,
  createForUsers,
  fanOutCommunityCreated,
};
