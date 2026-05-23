const mongoose = require('mongoose');

// Join table for the many-to-many between User and Community.
// Carries metadata that doesn't belong on either side (role, lifecycle status,
// joinedAt). Bulk operations and pagination key off this collection — never
// embed members as an array on Community.
const communityMemberSchema = new mongoose.Schema(
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
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
      required: true,
    },
    // active   = full member, can read/post
    // pending  = requested to join a private community, awaiting approval
    // blocked  = removed by an admin; cannot rejoin
    status: {
      type: String,
      enum: ['active', 'pending', 'blocked'],
      default: 'active',
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One membership row per (community, user). Prevents duplicate joins and
// makes "is this user a member?" a primary-key lookup.
communityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });
communityMemberSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('CommunityMember', communityMemberSchema);
