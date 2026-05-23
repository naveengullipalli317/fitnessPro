const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUserWorkouts } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Protected routes
router.get('/:id', protect, getUserProfile); // Get user profile
router.put('/:id', protect, updateUserProfile); // Update user profile
router.get('/:id/workouts', protect, getUserWorkouts); // Get user's workouts

module.exports = router;