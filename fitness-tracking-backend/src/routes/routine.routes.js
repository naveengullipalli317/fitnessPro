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
const { protectAndTrack } = require('../middleware/activity.middleware');
const { validate } = require('../middleware/validation.middleware');
const { routineCreateSchema, routineUpdateSchema } = require('../utils/validation.utils');

router.get('/', protectAndTrack, getRoutines);
router.get('/:id', protectAndTrack, getRoutineById);
router.post('/', protectAndTrack, validate(routineCreateSchema), createRoutine);
router.put('/:id', protectAndTrack, validate(routineUpdateSchema), updateRoutine);
router.delete('/:id', protectAndTrack, deleteRoutine);

module.exports = router;
