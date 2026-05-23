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
const { validate } = require('../middleware/validation.middleware');
const { goalCreateSchema, goalUpdateSchema } = require('../utils/validation.utils');

router.get('/', protect, getUserGoals);
router.get('/:id', protect, getGoalById);
router.post('/', protect, validate(goalCreateSchema), createGoal);
router.put('/:id', protect, validate(goalUpdateSchema), updateGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;
