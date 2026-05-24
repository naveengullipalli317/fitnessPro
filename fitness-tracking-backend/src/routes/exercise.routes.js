const express = require('express');
const router = express.Router();
const {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} = require('../controllers/exercise.controller');
const { protect } = require('../middleware/auth.middleware');
const { protectAndTrack } = require('../middleware/activity.middleware');
const { validate } = require('../middleware/validation.middleware');
const { exerciseCreateSchema, exerciseUpdateSchema } = require('../utils/validation.utils');

router.get('/', getExercises);
router.get('/:id', getExerciseById);

router.post('/', protectAndTrack, validate(exerciseCreateSchema), createExercise);
router.put('/:id', protectAndTrack, validate(exerciseUpdateSchema), updateExercise);
router.delete('/:id', protectAndTrack, deleteExercise);

module.exports = router;
