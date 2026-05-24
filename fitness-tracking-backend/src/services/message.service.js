// Community chat service. Sole layer that talks to the Message + membership
// collections. Routes/controllers stay dumb HTTP plumbing.
const { EventEmitter } = require('events');
const Message = require('../models/Message');
const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// In-process pub/sub for SSE fan-out. Channel name is `community:<id>`.
// If we ever scale beyond a single Node process we swap this for a Redis
// pub/sub adapter — the interface (emit / on) stays identical.
const bus = new EventEmitter();
bus.setMaxListeners(0); // many SSE subscribers per process

const channelFor = (communityId) => `community:${communityId.toString()}`;

/**
 * Throws unless the caller is an active member of the given community.
 * Centralises the gate so we don't re-implement it in every endpoint.
 */
const assertActiveMember = async (communityId, userId) => {
  const exists = await Community.exists({ _id: communityId });
  if (!exists) throw new ServiceError('Community not found.', 404);
  const membership = await CommunityMember.findOne({
    communityId,
    userId,
    status: 'active',
  }).lean();
  if (!membership) {
    throw new ServiceError('You must be a member of this community to read or post here.', 403);
  }
  return membership; // caller often wants role too
};

/**
 * Decide whether `user` is allowed to delete `message`.
 *
 * TODO (you): implement this policy. Several reasonable options:
 *   - Author can always delete their own message.
 *   - Community owner (createdBy) can delete any message in their community.
 *   - Platform admin (user.role === 'admin') can delete any message anywhere.
 *   - Time-window grace: only allow author delete within N minutes of posting.
 *
 * Inputs:
 *   message  : a lean Message document, includes userId and communityId
 *   user     : the authenticated user (req.user) — includes _id and role
 *   community: a lean Community document for `message.communityId` — includes createdBy
 *
 * Return true / false. Throwing is fine too if you want a custom message.
 *
 * Constraint: every existing caller (PATCH /messages/:id by the author,
 * DELETE by admin) must keep working — so any policy you pick must at
 * minimum allow "author of message" and "platform admin".
 */
const canDeleteMessage = (message, user, community) => {
  const isAuthor = message.userId.toString() === user._id.toString();
  const isCommunityOwner = community.createdBy.toString() === user._id.toString();
  const isPlatformAdmin = user.role === 'admin';
  return isAuthor || isCommunityOwner || isPlatformAdmin;
};

/**
 * Recent messages, newest-first. Cursor pagination via ?before=<messageId>
 * — fetch messages strictly older than the cursor. No `before` = top of
 * the list (the most recent N).
 */
const listMessages = async (communityId, userId, { limit = 50, before } = {}) => {
  await assertActiveMember(communityId, userId);

  const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const filter = { communityId };
  if (before) {
    const cursor = await Message.findById(before).lean();
    if (cursor) filter.createdAt = { $lt: cursor.createdAt };
  }

  const messages = await Message.find(filter)
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 })
    .limit(lim)
    .lean();

  // Return oldest-first so the UI can append without reversing on every render.
  return messages.reverse();
};

/**
 * Post a new message. Emits to the SSE bus AFTER persistence — guarantees
 * subscribers never see a message that isn't in the DB.
 */
const postMessage = async (communityId, userId, rawContent) => {
  await assertActiveMember(communityId, userId);

  const content = (rawContent || '').trim();
  if (!content) throw new ServiceError('Message content cannot be empty.', 400);
  if (content.length > 2000) throw new ServiceError('Message is too long (max 2000 characters).', 400);

  const msg = await Message.create({ communityId, userId, content });
  // Populate the author info for the broadcast so subscribers don't have to
  // round-trip back to fetch it.
  const populated = await Message.findById(msg._id)
    .populate('userId', 'name email role')
    .lean();

  bus.emit(channelFor(communityId), { type: 'message:new', data: populated });
  return populated;
};

/**
 * Soft-delete a message. Permission via canDeleteMessage policy.
 */
const deleteMessage = async (messageId, user) => {
  const msg = await Message.findById(messageId);
  if (!msg) throw new ServiceError('Message not found.', 404);

  const community = await Community.findById(msg.communityId).lean();
  if (!community) throw new ServiceError('Community not found.', 404);

  if (!canDeleteMessage(msg.toObject(), user, community)) {
    throw new ServiceError('You cannot delete this message.', 403);
  }

  // Use updateOne so the schema's `minlength: 1` on content (which is correct
  // for live posts) doesn't reject the empty-string wipe that soft-delete
  // does. Bypassing validation is the intent here, not an accident.
  await Message.updateOne(
    { _id: msg._id },
    { $set: { deletedAt: new Date(), content: '' } }
  );

  bus.emit(channelFor(msg.communityId), {
    type: 'message:delete',
    data: { _id: msg._id, communityId: msg.communityId },
  });
  return { deleted: true };
};

/**
 * Subscribe an SSE response to a community channel. Returns an unsubscribe
 * function the caller wires to req.on('close').
 */
const subscribe = (communityId, listener) => {
  const channel = channelFor(communityId);
  bus.on(channel, listener);
  return () => bus.off(channel, listener);
};

module.exports = {
  ServiceError,
  bus,
  channelFor,
  assertActiveMember,
  canDeleteMessage,
  listMessages,
  postMessage,
  deleteMessage,
  subscribe,
};
