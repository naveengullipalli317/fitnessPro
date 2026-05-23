// Exercise service - business logic for exercise operations
const Exercise = require('../models/Exercise');
const WorkoutDetail = require('../models/WorkoutDetail');

const getExercises = async (filters = {}) => {
  // Build filter object
  const filter = {};
  if (filters.category) filter.category = filters.category;
  if (filters.difficultyLevel) filter.difficultyLevel = filters.difficultyLevel;
  if (filters.search) {
    filter.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { category: { $regex: filters.search, $options: 'i' } }
    ];
  }

  return Exercise.find(filter).sort({ name: 1 });
};

const getExerciseById = async (exerciseId) => {
  return Exercise.findById(exerciseId);
};

const createExercise = async (exerciseData) => {
  // Check if exercise already exists
  const exerciseExists = await Exercise.findOne({
    name: { $regex: new RegExp(exerciseData.name, 'i') }
  });
  if (exerciseExists) {
    throw new Error('Exercise with this name already exists');
  }

  return Exercise.create(exerciseData);
};

const updateExercise = async (exerciseId, updateData) => {
  // Check if updated name conflicts with another exercise
  if (updateData.name) {
    const exerciseExists = await Exercise.findOne({
      name: { $regex: new RegExp(updateData.name, 'i') },
      _id: { $ne: exerciseId }
    });
    if (exerciseExists) {
      throw new Error('Exercise with this name already exists');
    }
  }

  return Exercise.findByIdAndUpdate(
    exerciseId,
    updateData,
    { new: true, runValidators: true }
  );
};

const deleteExercise = async (exerciseId) => {
  // Check if exercise is used in any workout details
  const workoutDetailCount = await WorkoutDetail.countDocuments({ exerciseId });
  if (workoutDetailCount > 0) {
    throw new Error('Cannot delete exercise because it is used in existing workouts');
  }

  return Exercise.findByIdAndDelete(exerciseId);
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
};