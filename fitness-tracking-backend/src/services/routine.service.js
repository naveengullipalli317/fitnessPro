// Routine service - business logic for routine operations
const Routine = require('../models/Routine');
const Workout = require('../models/Workout');

const getRoutines = async (filters = {}) => {
  // Build filter object
  const filter = {};
  if (filters.isPublic !== undefined) filter.isPublic = filters.isPublic === 'true';
  if (filters.search) {
    filter.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }

  return Routine.find(filter)
    .populate('createdBy', 'name email')
    .populate({
      path: 'workoutSchedule.workoutId',
      select: 'type date duration'
    })
    .sort({ createdAt: -1 });
};

const getRoutineById = async (routineId) => {
  return Routine.findById(routineId)
    .populate('createdBy', 'name email')
    .populate({
      path: 'workoutSchedule.workoutId',
      select: 'type date duration caloriesBurned'
    });
};

const createRoutine = async (userId, routineData) => {
  const { name, description, isPublic, workoutSchedule } = routineData;

  // Validate workoutSchedule if provided
  if (workoutSchedule && workoutSchedule.length > 0) {
    // Verify that all workout IDs exist and belong to the user
    const workoutIds = workoutSchedule.map(item => item.workoutId);
    const workouts = await Workout.find({ _id: { $in: workoutIds }, userId });

    if (workouts.length !== workoutIds.length) {
      throw new Error('One or more workouts not found or not authorized');
    }
  }

  return Routine.create({
    name,
    description: description || '',
    isPublic: isPublic !== undefined ? isPublic : false,
    createdBy: userId,
    workoutSchedule: workoutSchedule || []
  });
};

const updateRoutine = async (routineId, userId, updateData) => {
  // Find routine
  const routine = await Routine.findById(routineId);
  if (!routine) {
    throw new Error('Routine not found');
  }

  // Check authorization
  if (routine.createdBy.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  // Validate workoutSchedule if provided
  if (updateData.workoutSchedule && updateData.workoutSchedule.length > 0) {
    // Verify that all workout IDs exist and belong to the user
    const workoutIds = updateData.workoutSchedule.map(item => item.workoutId);
    const workouts = await Workout.find({ _id: { $in: workoutIds }, userId });

    if (workouts.length !== workoutIds.length) {
      throw new Error('One or more workouts not found or not authorized');
    }
  }

  // Update routine
  return Routine.findByIdAndUpdate(
    routineId,
    {
      name: updateData.name || routine.name,
      description: updateData.description !== undefined ? updateData.description : routine.description,
      isPublic: updateData.isPublic !== undefined ? updateData.isPublic : routine.isPublic,
      workoutSchedule: updateData.workoutSchedule || routine.workoutSchedule
    },
    { new: true, runValidators: true }
  )
  .populate('createdBy', 'name email')
  .populate({
    path: 'workoutSchedule.workoutId',
    select: 'type date duration caloriesBurned'
  });
};

const deleteRoutine = async (routineId, userId) => {
  // Find routine
  const routine = await Routine.findById(routineId);
  if (!routine) {
    throw new Error('Routine not found');
  }

  // Check authorization
  if (routine.createdBy.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  return Routine.findByIdAndDelete(routineId);
};

module.exports = {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine
};