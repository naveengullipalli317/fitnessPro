const express = require('express');
const router = express.Router();
const {
  getUserGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goal.controller');
const { protect } = require('../middleware/auth.middleware');
const { protectAndTrack } = require('../middleware/activity.middleware');
const { validate } = require('../middleware/validation.middleware');
const { goalCreateSchema, goalUpdateSchema } = require('../utils/validation.utils');

router.get('/', protectAndTrack, getUserGoals);
router.get('/:id', protectAndTrack, getGoalById);
router.post('/', protectAndTrack, validate(goalCreateSchema), createGoal);
router.put('/:id', protectAndTrack, validate(goalUpdateSchema), updateGoal);
router.delete('/:id', protectAndTrack, deleteGoal);

module.exports = router;
