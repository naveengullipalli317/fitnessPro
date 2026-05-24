const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/streak.controller');
const { protectAndTrack } = require('../middleware/activity.middleware');

router.get('/me', protectAndTrack, ctrl.getMyStreak);

module.exports = router;
