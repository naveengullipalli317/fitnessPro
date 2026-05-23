const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
      unique: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    type: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
      required: true,
    },
    bannerUrl: {
      type: String,
      maxlength: 500,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalised counter — kept in sync by the service layer on join/leave.
    // Cheap O(1) read for list views; the canonical truth is CommunityMember.
    memberCount: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { timestamps: true }
);

communitySchema.index({ createdBy: 1 });
communitySchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Community', communitySchema);
