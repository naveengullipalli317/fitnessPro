#!/usr/bin/env node
/* eslint-disable no-console */
//
// Remove Playwright-generated documents from whichever database the current
// NODE_ENV points at. Matches users by the test fixtures' email/name pattern
// (app-test/tests/helpers/user.js) — real accounts are untouched.
//
// Usage:
//   NODE_ENV=development node src/scripts/cleanup-test-data.js          # dry run
//   NODE_ENV=development node src/scripts/cleanup-test-data.js --apply  # delete
//
require('../config/environment');
const mongoose = require('mongoose');
const User = require('../models/User');
const Workout = require('../models/Workout');
const WorkoutDetail = require('../models/WorkoutDetail');
const Goal = require('../models/Goal');
const Routine = require('../models/Routine');

const APPLY = process.argv.includes('--apply');

// Patterns produced by app-test/tests/helpers/*.js
const USER_FILTER = {
  $or: [
    { email: /^pw-.*@pwtest\.example\.com$/i },
    { name: /^Playwright(\s|$)/ },
  ],
};

(async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set — aborting.');
    process.exit(1);
  }

  // Mask credentials when echoing the URI back.
  const safeUri = uri.replace(/\/\/([^@]+)@/, '//***:***@');
  console.log(`[cleanup] NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  console.log(`[cleanup] connecting to ${safeUri}`);
  console.log(`[cleanup] mode: ${APPLY ? 'APPLY (will delete)' : 'DRY RUN (no deletes)'}`);

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`[cleanup] connected. db=${mongoose.connection.name}`);

  const users = await User.find(USER_FILTER, { _id: 1, email: 1 }).lean();
  const userIds = users.map((u) => u._id);
  console.log(`[cleanup] matched ${users.length} test users`);

  if (users.length === 0) {
    await mongoose.disconnect();
    console.log('[cleanup] nothing to do.');
    return;
  }

  const workouts = await Workout.find({ userId: { $in: userIds } }, { _id: 1 }).lean();
  const workoutIds = workouts.map((w) => w._id);
  const detailCount = await WorkoutDetail.countDocuments({ workoutId: { $in: workoutIds } });
  const goalCount = await Goal.countDocuments({ userId: { $in: userIds } });
  const routineCount = await Routine.countDocuments({ createdBy: { $in: userIds } });

  console.log('[cleanup] would remove:');
  console.log(`           users:          ${users.length}`);
  console.log(`           workouts:       ${workouts.length}`);
  console.log(`           workoutDetails: ${detailCount}`);
  console.log(`           goals:          ${goalCount}`);
  console.log(`           routines:       ${routineCount}`);

  if (!APPLY) {
    console.log('[cleanup] dry run — re-run with --apply to delete.');
    await mongoose.disconnect();
    return;
  }

  const del = {
    details: await WorkoutDetail.deleteMany({ workoutId: { $in: workoutIds } }),
    workouts: await Workout.deleteMany({ _id: { $in: workoutIds } }),
    goals: await Goal.deleteMany({ userId: { $in: userIds } }),
    routines: await Routine.deleteMany({ createdBy: { $in: userIds } }),
    users: await User.deleteMany({ _id: { $in: userIds } }),
  };

  console.log('[cleanup] deleted:');
  console.log(`           workoutDetails: ${del.details.deletedCount}`);
  console.log(`           workouts:       ${del.workouts.deletedCount}`);
  console.log(`           goals:          ${del.goals.deletedCount}`);
  console.log(`           routines:       ${del.routines.deletedCount}`);
  console.log(`           users:          ${del.users.deletedCount}`);

  await mongoose.disconnect();
  console.log('[cleanup] done.');
})().catch(async (err) => {
  console.error('[cleanup] failed:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
