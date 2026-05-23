#!/usr/bin/env node
/* eslint-disable no-console */
//
// Promote an existing user to admin, or demote with --demote.
// Usage:
//   NODE_ENV=development node src/scripts/promote-admin.js <email>
//   NODE_ENV=development node src/scripts/promote-admin.js <email> --demote
//
// The user must already exist. Bootstrap design: an admin is minted only by
// someone with shell access, never by self-signup or env var.
//
require('../config/environment');
const mongoose = require('mongoose');
const User = require('../models/User');

const args = process.argv.slice(2);
const demote = args.includes('--demote');
const email = args.find((a) => !a.startsWith('--'));

if (!email) {
  console.error('Usage: promote-admin.js <email> [--demote]');
  process.exit(1);
}

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set — aborting.');
    process.exit(1);
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`[promote-admin] NODE_ENV=${process.env.NODE_ENV || 'development'} db=${mongoose.connection.name}`);

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    console.error(`No user with email ${email}.`);
    await mongoose.disconnect();
    process.exit(2);
  }

  const targetRole = demote ? 'user' : 'admin';
  if (user.role === targetRole) {
    console.log(`No change: ${user.email} is already ${targetRole}.`);
    await mongoose.disconnect();
    return;
  }

  // Safety: refuse to demote the last active admin.
  if (demote && user.role === 'admin') {
    const otherAdmins = await User.countDocuments({
      _id: { $ne: user._id },
      role: 'admin',
      isDeactivated: false,
    });
    if (otherAdmins === 0) {
      console.error('Refusing to demote — this is the only active admin. Promote another first.');
      await mongoose.disconnect();
      process.exit(3);
    }
  }

  const previous = user.role;
  user.role = targetRole;
  await user.save();
  console.log(`OK: ${user.email}  ${previous} -> ${user.role}`);
  await mongoose.disconnect();
})().catch(async (err) => {
  console.error('[promote-admin] failed:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
