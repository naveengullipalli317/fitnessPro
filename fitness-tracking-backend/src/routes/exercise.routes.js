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
const { validate } = require('../middleware/validation.middleware');
const { exerciseCreateSchema, exerciseUpdateSchema } = require('../utils/validation.utils');

router.get('/', getExercises);
router.get('/:id', getExerciseById);

router.post('/', protect, validate(exerciseCreateSchema), createExercise);
router.put('/:id', protect, validate(exerciseUpdateSchema), updateExercise);
router.delete('/:id', protect, deleteExercise);

module.exports = router;
