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
const { protectAndTrack } = require('../middleware/activity.middleware');
const { validate } = require('../middleware/validation.middleware');
const { workoutCreateSchema, workoutUpdateSchema } = require('../utils/validation.utils');

router.get('/', protectAndTrack, getUserWorkouts);
router.get('/:id', protectAndTrack, getWorkoutById);
router.post('/', protectAndTrack, validate(workoutCreateSchema), createWorkout);
router.put('/:id', protectAndTrack, validate(workoutUpdateSchema), updateWorkout);
router.delete('/:id', protectAndTrack, deleteWorkout);

router.get('/:id/sets', protectAndTrack, getWorkoutSets);
router.post('/:id/sets', protectAndTrack, addSetToWorkout);
router.put('/:id/sets/:setId', protectAndTrack, updateSet);
router.delete('/:id/sets/:setId', protectAndTrack, deleteSet);

module.exports = router;
