const service = require('../services/streak.service');

// @route GET /api/streaks/me
const getMyStreak = async (req, res) => {
  try {
    const data = await service.computeStreakForUser(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMyStreak };
