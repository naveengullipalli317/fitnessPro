// Admin service — operations restricted to admin role. Callers must already
// have passed the protect + adminOnly middleware chain. We do NOT re-check
// permissions here; the routing layer is the single source of authority.
const User = require('../models/User');
const Workout = require('../models/Workout');
const Goal = require('../models/Goal');
const Routine = require('../models/Routine');
const Community = require('../models/Community');
const CommunityMember = require('../models/CommunityMember');
const UserSession = require('../models/UserSession');

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

/**
 * Single community + its members (active and pending). Admin override —
 * skips the public/private visibility rule that gates regular users.
 */
const getCommunityDetail = async (communityId) => {
  const Community = require('../models/Community');
  const community = await Community.findById(communityId).populate('createdBy', 'name email').lean();
  if (!community) throw new ServiceError('Community not found.', 404);

  const members = await CommunityMember.find({ communityId })
    .populate('userId', 'name email role isDeactivated')
    .sort({ joinedAt: 1 })
    .lean();

  return { community, members };
};

/**
 * Remove a member from a community. Owner cannot be kicked — to remove the
 * owner an admin must delete the community (or transfer ownership, phase 2).
 * Mirrors community.service.leaveCommunity's invariant: no orphan communities.
 */
const kickCommunityMember = async (communityId, targetUserId) => {
  const Community = require('../models/Community');
  const community = await Community.findById(communityId);
  if (!community) throw new ServiceError('Community not found.', 404);

  const membership = await CommunityMember.findOne({ communityId, userId: targetUserId });
  if (!membership) throw new ServiceError('That user is not a member of this community.', 404);

  if (membership.role === 'owner') {
    throw new ServiceError(
      'Cannot remove the owner. Delete the community or transfer ownership first.',
      400
    );
  }

  const wasActive = membership.status === 'active';
  await CommunityMember.deleteOne({ _id: membership._id });
  if (wasActive) {
    await Community.updateOne({ _id: communityId }, { $inc: { memberCount: -1 } });
  }
  return { kicked: true };
};

// ───────────────────────────────────────────────────────────────────────
// Analytics. Time-series + aggregations for the admin dashboard charts.
// All time-series functions return [{ date: 'YYYY-MM-DD', value: N }, ...]
// — a shape the frontend can hand straight to Recharts.
// ───────────────────────────────────────────────────────────────────────

const startOfDay = (d) => {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
};
const dayKey = (d) => startOfDay(d).toISOString().slice(0, 10); // 'YYYY-MM-DD'
const daysAgo = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return startOfDay(d);
};

/**
 * Build a complete day-bucketed series including zero-days. Mongo's
 * $group only emits buckets that have rows — joining against a generated
 * date axis fills the gaps so the chart doesn't skip days with no signups.
 */
const fillDailySeries = (rawByDay, days) => {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const k = dayKey(d);
    out.push({ date: k, value: rawByDay[k] || 0 });
  }
  return out;
};

/**
 * Daily new signups for the last N days. Buckets by createdAt date.
 */
const getSignupsTimeSeries = async (days = 30) => {
  const since = daysAgo(days - 1);
  const rows = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        n: { $sum: 1 },
      },
    },
  ]);
  const map = Object.fromEntries(rows.map((r) => [r._id, r.n]));
  return fillDailySeries(map, days);
};

/**
 * Daily Active Users for the last N days. "Active on day D" =
 * distinct user with any session row whose lastBeatAt lands in D.
 */
const getActiveUsersTimeSeries = async (days = 30) => {
  const since = daysAgo(days - 1);
  const rows = await UserSession.aggregate([
    { $match: { lastBeatAt: { $gte: since } } },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$lastBeatAt' } },
          userId: '$userId',
        },
      },
    },
    {
      $group: {
        _id: '$_id.day',
        n: { $sum: 1 },
      },
    },
  ]);
  const map = Object.fromEntries(rows.map((r) => [r._id, r.n]));
  return fillDailySeries(map, days);
};

/**
 * Top N users by total accumulated active time across all of their sessions.
 * Joined with the User collection so the chart can show names.
 */
const getTopActiveUsers = async (limit = 10) => {
  const rows = await UserSession.aggregate([
    {
      $group: {
        _id: '$userId',
        totalMs: {
          $sum: {
            $subtract: ['$lastBeatAt', '$startedAt'],
          },
        },
        sessions: { $sum: 1 },
      },
    },
    { $sort: { totalMs: -1 } },
    { $limit: Math.min(50, Math.max(1, limit)) },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        role: '$user.role',
        sessions: 1,
        totalMs: 1,
        // Frontend rounds to 1 decimal place; sending minutes is more useful
        // than hours for users who've been on a few minutes.
        totalMinutes: { $round: [{ $divide: ['$totalMs', 60000] }, 1] },
      },
    },
  ]);
  return rows;
};

/**
 * Community size distribution + growth. Returns:
 *   { growth: [{date, value}], sizes: [{ name, members, type }] }
 */
const getCommunityAnalytics = async (days = 30) => {
  const since = daysAgo(days - 1);
  const growthRows = await Community.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        n: { $sum: 1 },
      },
    },
  ]);
  const growth = fillDailySeries(
    Object.fromEntries(growthRows.map((r) => [r._id, r.n])),
    days
  );

  // Top 10 largest communities — that's the interesting distribution.
  const sizes = await Community.find({})
    .sort({ memberCount: -1 })
    .limit(10)
    .select('name memberCount type')
    .lean();

  return {
    growth,
    sizes: sizes.map((c) => ({ name: c.name, members: c.memberCount, type: c.type })),
  };
};

/**
 * Workouts logged per day. Simpler than DAU because there's one row per
 * workout, no distinct-count required.
 */
const getWorkoutsTimeSeries = async (days = 30) => {
  const since = daysAgo(days - 1);
  const rows = await Workout.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        n: { $sum: 1 },
      },
    },
  ]);
  const map = Object.fromEntries(rows.map((r) => [r._id, r.n]));
  return fillDailySeries(map, days);
};

/**
 * User-role distribution for the donut. Two slices today (user/admin) but
 * the shape leaves room for more roles later without changing the chart.
 */
const getRoleBreakdown = async () => {
  const rows = await User.aggregate([
    { $group: { _id: '$role', n: { $sum: 1 } } },
  ]);
  return rows.map((r) => ({ role: r._id || 'user', count: r.n }));
};

module.exports = {
  ServiceError,
  getStats,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  listCommunities,
  getCommunityDetail,
  kickCommunityMember,
  // Analytics:
  getSignupsTimeSeries,
  getActiveUsersTimeSeries,
  getTopActiveUsers,
  getCommunityAnalytics,
  getWorkoutsTimeSeries,
  getRoleBreakdown,
};
