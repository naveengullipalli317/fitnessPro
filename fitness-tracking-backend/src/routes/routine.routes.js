const express = require('express');
const router = express.Router();
const {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
} = require('../controllers/routine.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { routineCreateSchema, routineUpdateSchema } = require('../utils/validation.utils');

router.get('/', protect, getRoutines);
router.get('/:id', protect, getRoutineById);
router.post('/', protect, validate(routineCreateSchema), createRoutine);
router.put('/:id', protect, validate(routineUpdateSchema), updateRoutine);
router.delete('/:id', protect, deleteRoutine);

module.exports = router;
