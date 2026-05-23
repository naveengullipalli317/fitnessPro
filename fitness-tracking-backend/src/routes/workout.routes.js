const express = require('express');
const router = express.Router();
const {
  getUserWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutSets,
  addSetToWorkout,
  updateSet,
  deleteSet,
} = require('../controllers/workout.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { workoutCreateSchema, workoutUpdateSchema } = require('../utils/validation.utils');

router.get('/', protect, getUserWorkouts);
router.get('/:id', protect, getWorkoutById);
router.post('/', protect, validate(workoutCreateSchema), createWorkout);
router.put('/:id', protect, validate(workoutUpdateSchema), updateWorkout);
router.delete('/:id', protect, deleteWorkout);

router.get('/:id/sets', protect, getWorkoutSets);
router.post('/:id/sets', protect, addSetToWorkout);
router.put('/:id/sets/:setId', protect, updateSet);
router.delete('/:id/sets/:setId', protect, deleteSet);

module.exports = router;
