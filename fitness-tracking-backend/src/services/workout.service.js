// Workout service - business logic for workout operations
const Workout = require('../models/Workout');
const WorkoutDetail = require('../models/WorkoutDetail');
const Exercise = require('../models/Exercise');

const createWorkoutWithSets = async (userId, workoutData, setsData) => {
  // Create workout
  const workout = await Workout.create({
    userId,
    ...workoutData
  });

  // Create workout details/sets if provided
  if (setsData && setsData.length > 0) {
    const workoutDetails = setsData.map(set => ({
      workoutId: workout._id,
      exerciseId: set.exerciseId,
      setNumber: set.setNumber,
      reps: set.reps,
      weight: set.weight || null,
      duration: set.duration || null,
      restPeriod: set.restPeriod || 60
    }));

    await WorkoutDetail.insertMany(workoutDetails);
  }

  // Populate references for response
  return Workout.findById(workout._id)
    .populate('userId', 'name email')
    .populate({
      path: 'details',
      populate: {
        path: 'exerciseId',
        select: 'name category muscleGroups equipmentNeeded'
      }
    });
};

const getUserWorkouts = async (userId, filters = {}) => {
  const query = { userId };

  // Add filters if provided
  if (filters.type) query.type = filters.type;
  if (filters.startDate) query.date = { ...query.date || {}, $gte: new Date(filters.startDate) };
  if (filters.endDate) query.date = { ...query.date || {}, $lte: new Date(filters.endDate) };

  return Workout.find(query)
    .sort({ date: -1 })
    .populate('userId', 'name email');
};

const getWorkoutById = async (workoutId, userId) => {
  const workout = await Workout.findById(workoutId)
    .populate('userId', 'name email')
    .populate({
      path: 'details',
      populate: {
        path: 'exerciseId',
        select: 'name category muscleGroups equipmentNeeded instructions'
      }
    });

  // Check authorization
  if (workout && workout.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  return workout;
};

const updateWorkoutWithSets = async (workoutId, userId, workoutData, setsData) => {
  // Find workout
  const workout = await Workout.findById(workoutId);
  if (!workout) {
    throw new Error('Workout not found');
  }

  // Check authorization
  if (workout.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  // Update workout
  const updatedWorkout = await Workout.findByIdAndUpdate(
    workoutId,
    workoutData,
    { new: true, runValidators: true }
  );

  // Handle sets if provided
  if (setsData !== undefined) {
    // Delete existing sets
    await WorkoutDetail.deleteMany({ workoutId });

    // Create new sets if provided
    if (setsData && setsData.length > 0) {
      const workoutDetails = setsData.map(set => ({
        workoutId,
        exerciseId: set.exerciseId,
        setNumber: set.setNumber,
        reps: set.reps,
        weight: set.weight || null,
        duration: set.duration || null,
        restPeriod: set.restPeriod || 60
      }));

      await WorkoutDetail.insertMany(workoutDetails);
    }
  }

  // Populate references for response
  return Workout.findById(workoutId)
    .populate('userId', 'name email')
    .populate({
      path: 'details',
      populate: {
        path: 'exerciseId',
        select: 'name category muscleGroups equipmentNeeded'
      }
    });
};

const deleteWorkoutAndSets = async (workoutId, userId) => {
  // Find workout
  const workout = await Workout.findById(workoutId);
  if (!workout) {
    throw new Error('Workout not found');
  }

  // Check authorization
  if (workout.userId.toString() !== userId.toString()) {
    throw new Error('Not authorized');
  }

  // Delete workout details first
  await WorkoutDetail.deleteMany({ workoutId });

  // Delete workout
  await Workout.findByIdAndDelete(workoutId);
};

module.exports = {
  createWorkoutWithSets,
  getUserWorkouts,
  getWorkoutById,
  updateWorkoutWithSets,
  deleteWorkoutAndSets
};