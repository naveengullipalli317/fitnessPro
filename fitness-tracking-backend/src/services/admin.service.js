// Admin service — operations restricted to admin role. Callers must already
// have passed the protect + adminOnly middleware chain. We do NOT re-check
// permissions here; the routing layer is the single source of authority.
const User = require('../models/User');
const Workout = require('../models/Workout');
const Goal = require('../models/Goal');
const Routine = require('../models/Routine');
const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const getStats = async () => {
  const since = new Date(Date.now() - THIRTY_DAYS_MS);
  const [totalUsers, activeUsers, deactivatedUsers, adminUsers, totalCommunities, totalWorkouts] =
    await Promise.all([
      User.countDocuments({}),
      // "Active" = had a workout logged or community membership row updated
      // in the last 30 days. Cheap proxy without a dedicated last-seen field.
      Workout.distinct('userId', { createdAt: { $gte: since } }).then((ids) => ids.length),
      User.countDocuments({ isDeactivated: true }),
      User.countDocuments({ role: 'admin' }),
      Community.countDocuments({}),
      Workout.countDocuments({}),
    ]);

  return {
    totalUsers,
    activeUsers,
    deactivatedUsers,
    adminUsers,
    totalCommunities,
    totalWorkouts,
  };
};

/**
 * Paginated user list with optional search by name/email.
 * Returns `{ users, total, page, pageSize }`.
 */
const listUsers = async ({ search, page = 1, pageSize = 25 } = {}) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
  const filter = {};
  if (search) {
    const rx = { $regex: search, $options: 'i' };
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((p - 1) * ps)
      .limit(ps)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { users, total, page: p, pageSize: ps };
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password').lean();
  if (!user) throw new ServiceError('User not found.', 404);

  // Counts of linked data, useful for admins deciding whether to deactivate
  // vs hard-delete a user.
  const [workouts, goals, routines, communitiesOwned, communitiesJoined] = await Promise.all([
    Workout.countDocuments({ userId }),
    Goal.countDocuments({ userId }),
    Routine.countDocuments({ createdBy: userId }),
    Community.countDocuments({ createdBy: userId }),
    CommunityMember.countDocuments({ userId, status: 'active' }),
  ]);

  return {
    ...user,
    stats: { workouts, goals, routines, communitiesOwned, communitiesJoined },
  };
};

/**
 * Patch role and/or isDeactivated on a user. Guards against the system
 * locking itself out (refuse to demote/deactivate the LAST admin).
 */
const updateUser = async (targetId, callerId, updates) => {
  const user = await User.findById(targetId);
  if (!user) throw new ServiceError('User not found.', 404);

  const willChangeRole = updates.role !== undefined && updates.role !== user.role;
  const willDeactivate = updates.isDeactivated === true && !user.isDeactivated;

  if ((willChangeRole && user.role === 'admin' && updates.role !== 'admin') || willDeactivate) {
    // If removing admin powers (demotion or deactivation), make sure another
    // admin remains. Closes the "I'm the only admin and I just demoted
    // myself" footgun.
    if (user.role === 'admin') {
      const otherAdmins = await User.countDocuments({
        _id: { $ne: targetId },
        role: 'admin',
        isDeactivated: false,
      });
      if (otherAdmins === 0) {
        throw new ServiceError(
          'Cannot demote or deactivate the last active admin. Promote another admin first.',
          400
        );
      }
    }
  }

  if (updates.role !== undefined) user.role = updates.role;
  if (updates.isDeactivated !== undefined) user.isDeactivated = updates.isDeactivated;
  await user.save();

  const { password, ...safe } = user.toObject();
  return safe;
};

/**
 * Hard-delete a user. Cascades all owned data so we don't leave dangling
 * references — workouts, goals, routines, communities (and their members).
 * Refuse to hard-delete the caller (admin removing themselves leaves no
 * way to roll the change back).
 */
const deleteUser = async (targetId, callerId) => {
  if (targetId.toString() === callerId.toString()) {
    throw new ServiceError('You cannot hard-delete your own account from here.', 400);
  }
  const user = await User.findById(targetId);
  if (!user) throw new ServiceError('User not found.', 404);

  if (user.role === 'admin') {
    const otherAdmins = await User.countDocuments({
      _id: { $ne: targetId },
      role: 'admin',
      isDeactivated: false,
    });
    if (otherAdmins === 0) {
      throw new ServiceError('Cannot delete the last active admin.', 400);
    }
  }

  const ownedCommunities = await Community.find({ createdBy: targetId }, { _id: 1 }).lean();
  const ownedCommunityIds = ownedCommunities.map((c) => c._id);

  await Promise.all([
    Workout.deleteMany({ userId: targetId }),
    Goal.deleteMany({ userId: targetId }),
    Routine.deleteMany({ createdBy: targetId }),
    CommunityMember.deleteMany({
      $or: [{ userId: targetId }, { communityId: { $in: ownedCommunityIds } }],
    }),
    Community.deleteMany({ _id: { $in: ownedCommunityIds } }),
  ]);
  await User.findByIdAndDelete(targetId);

  return { deleted: true };
};

/**
 * Admin view over all communities — bypasses the public/private visibility
 * rules that apply to normal users.
 */
const listCommunities = async ({ search, page = 1, pageSize = 25 } = {}) => {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
  const filter = {};
  if (search) {
    const rx = { $regex: search, $options: 'i' };
    filter.$or = [{ name: rx }, { description: rx }];
  }
  const [communities, total] = await Promise.all([
    Community.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((p - 1) * ps)
      .limit(ps)
      .lean(),
    Community.countDocuments(filter),
  ]);
  return { communities, total, page: p, pageSize: ps };
};

module.exports = {
  ServiceError,
  getStats,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  listCommunities,
};
