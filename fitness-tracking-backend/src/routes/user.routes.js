const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUserWorkouts } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { protectAndTrack } = require('../middleware/activity.middleware');

// Protected routes
router.get('/:id', protectAndTrack, getUserProfile); // Get user profile
router.put('/:id', protectAndTrack, updateUserProfile); // Update user profile
router.get('/:id/workouts', protectAndTrack, getUserWorkouts); // Get user's workouts

module.exports = router;