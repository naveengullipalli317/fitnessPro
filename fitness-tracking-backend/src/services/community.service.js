// Community service — sole layer that talks to Community / CommunityMember.
// All membership-count bookkeeping lives here so callers don't have to remember.
const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Create a community and the creator's owner membership in one shot.
 * memberCount starts at 1 to match the single owner row we just wrote.
 */
const createCommunity = async (userId, data) => {
  // Uniqueness is enforced at the schema level too, but checking first gives
  // us a 409-ish business error instead of a raw Mongo E11000.
  const existing = await Community.findOne({ name: data.name });
  if (existing) {
    throw new ServiceError('A community with this name already exists.', 409);
  }

  const community = await Community.create({
    name: data.name,
    description: data.description || '',
    type: data.type || 'public',
    bannerUrl: data.bannerUrl || '',
    createdBy: userId,
    memberCount: 1,
  });

  await CommunityMember.create({
    communityId: community._id,
    userId,
    role: 'owner',
    status: 'active',
  });

  return community;
};

/**
 * List communities visible to the caller.
 *   scope = 'mine'    -> only communities the caller is an active member of
 *   scope = 'explore' -> public communities the caller is NOT yet a member of
 *   (default)         -> public + caller's own
 * Additional filters: search (name/description), type.
 */
const listCommunities = async (userId, { scope, search, type } = {}) => {
  const myMemberships = await CommunityMember.find({
    userId,
    status: 'active',
  }).select('communityId').lean();
  const myCommunityIds = myMemberships.map((m) => m.communityId);

  let filter;
  if (scope === 'mine') {
    filter = { _id: { $in: myCommunityIds } };
  } else if (scope === 'explore') {
    filter = { type: 'public', _id: { $nin: myCommunityIds } };
  } else {
    filter = { $or: [{ type: 'public' }, { _id: { $in: myCommunityIds } }] };
  }

  if (type) filter.type = type;
  if (search) {
    const rx = { $regex: search, $options: 'i' };
    filter.$and = [{ $or: [{ name: rx }, { description: rx }] }];
  }

  return Community.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Fetch a community along with the caller's own membership state, so the
 * frontend can decide whether to show Join / Leave / Edit / Delete.
 */
const getCommunityById = async (communityId, userId) => {
  const community = await Community.findById(communityId).populate('createdBy', 'name email');
  if (!community) {
    throw new ServiceError('Community not found.', 404);
  }

  const membership = await CommunityMember.findOne({ communityId, userId }).lean();

  // Hide private communities the caller has nothing to do with.
  if (community.type === 'private' && !membership) {
    throw new ServiceError('Community not found.', 404);
  }

  return {
    community,
    myMembership: membership
      ? { role: membership.role, status: membership.status, joinedAt: membership.joinedAt }
      : null,
  };
};

const updateCommunity = async (communityId, userId, updates) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ServiceError('Community not found.', 404);
  if (community.createdBy.toString() !== userId.toString()) {
    throw new ServiceError('Only the owner can edit this community.', 403);
  }

  if (updates.name && updates.name !== community.name) {
    const conflict = await Community.findOne({ name: updates.name, _id: { $ne: communityId } });
    if (conflict) throw new ServiceError('A community with this name already exists.', 409);
  }

  Object.assign(community, updates);
  await community.save();
  return community;
};

/**
 * Delete the community and every membership row that references it.
 * Owner-only. Cascades atomically enough for our needs — both deletes run
 * here, so the parent disappears even if the child cleanup misses a row.
 */
const deleteCommunity = async (communityId, userId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ServiceError('Community not found.', 404);
  if (community.createdBy.toString() !== userId.toString()) {
    throw new ServiceError('Only the owner can delete this community.', 403);
  }

  await CommunityMember.deleteMany({ communityId });
  await Community.findByIdAndDelete(communityId);
  return { deleted: true };
};

/**
 * Public communities: instant active join.
 * Private communities: status=pending until an admin approves (phase 2).
 * Re-joining (after a leave) reactivates the same row instead of inserting a
 * duplicate — the unique index would block a second row anyway.
 */
const joinCommunity = async (communityId, userId) => {
  const community = await Community.findById(communityId);
  if (!community) throw new ServiceError('Community not found.', 404);

  const existing = await CommunityMember.findOne({ communityId, userId });
  if (existing) {
    if (existing.status === 'blocked') {
      throw new ServiceError('You are blocked from this community.', 403);
    }
    if (existing.status === 'active') {
      throw new ServiceError('You are already a member of this community.', 409);
    }
    // pending — caller already requested access; no-op.
    return { status: existing.status, role: existing.role };
  }

  const targetStatus = community.type === 'public' ? 'active' : 'pending';
  await CommunityMember.create({
    communityId,
    userId,
    role: 'member',
    status: targetStatus,
  });

  // Only active joins bump the count. Pending requests don't yet count as members.
  if (targetStatus === 'active') {
    await Community.updateOne({ _id: communityId }, { $inc: { memberCount: 1 } });
  }

  return { status: targetStatus, role: 'member' };
};

/**
 * Leave a community. The owner can't leave while the community still exists —
 * they must delete it (or transfer ownership in phase 2). This prevents the
 * "orphan community with no owner" failure mode.
 */
const leaveCommunity = async (communityId, userId) => {
  const membership = await CommunityMember.findOne({ communityId, userId });
  if (!membership) {
    throw new ServiceError('You are not a member of this community.', 404);
  }
  if (membership.role === 'owner') {
    throw new ServiceError(
      'Owners cannot leave their own community. Delete the community or transfer ownership first.',
      400
    );
  }

  const wasActive = membership.status === 'active';
  await CommunityMember.deleteOne({ _id: membership._id });
  if (wasActive) {
    await Community.updateOne({ _id: communityId }, { $inc: { memberCount: -1 } });
  }
  return { left: true };
};

const listMembers = async (communityId, userId) => {
  // Only members can see the roster (cheap privacy default).
  const caller = await CommunityMember.findOne({ communityId, userId, status: 'active' });
  if (!caller) throw new ServiceError('You are not a member of this community.', 403);

  return CommunityMember.find({ communityId, status: 'active' })
    .populate('userId', 'name email')
    .sort({ joinedAt: 1 });
};

module.exports = {
  ServiceError,
  createCommunity,
  listCommunities,
  getCommunityById,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  listMembers,
};
