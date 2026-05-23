const Exercise = require('../models/Exercise');
const WorkoutDetail = require('../models/WorkoutDetail');

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Public
const getExercises = async (req, res) => {
  try {
    const { category, difficultyLevel, search } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (difficultyLevel) filter.difficultyLevel = difficultyLevel;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const exercises = await Exercise.find(filter).sort({ name: 1 });
    res.json({ success: true, data: exercises });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get exercise by ID
// @route   GET /api/exercises/:id
// @access  Public
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new exercise
// @route   POST /api/exercises
// @access  Private (admin/trainer only)
const createExercise = async (req, res) => {
  try {
    const { name, category, equipmentNeeded, muscleGroups, difficultyLevel, instructions, videoUrl } = req.body;

    // Check if exercise already exists
    const exerciseExists = await Exercise.findOne({ name: { $regex: new RegExp(name, 'i') } });
    if (exerciseExists) {
      return res.status(400).json({ success: false, message: 'Exercise with this name already exists' });
    }

    const exercise = await Exercise.create({
      name,
      category,
      equipmentNeeded: equipmentNeeded || [],
      muscleGroups: muscleGroups || [],
      difficultyLevel: difficultyLevel || 'beginner',
      instructions,
      videoUrl: videoUrl || null
    });

    res.status(201).json({
      success: true,
      message: 'Exercise created successfully',
      data: exercise
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private (admin/trainer only)
const updateExercise = async (req, res) => {
  try {
    const { name, category, equipmentNeeded, muscleGroups, difficultyLevel, instructions, videoUrl } = req.body;

    // Find exercise
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    // Check if updated name conflicts with another exercise
    if (name && name !== exercise.name) {
      const exerciseExists = await Exercise.findOne({
        name: { $regex: new RegExp(name, 'i') },
        _id: { $ne: req.params.id }
      });
      if (exerciseExists) {
        return res.status(400).json({ success: false, message: 'Exercise with this name already exists' });
      }
    }

    // Update exercise
    const updatedExercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      {
        name: name || exercise.name,
        category: category || exercise.category,
        equipmentNeeded: equipmentNeeded || exercise.equipmentNeeded,
        muscleGroups: muscleGroups || exercise.muscleGroups,
        difficultyLevel: difficultyLevel || exercise.difficultyLevel,
        instructions: instructions || exercise.instructions,
        videoUrl: videoUrl !== undefined ? videoUrl : exercise.videoUrl
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Exercise updated successfully',
      data: updatedExercise
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private (admin/trainer only)
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }

    // Check if exercise is used in any workout details
    const workoutDetailCount = await WorkoutDetail.countDocuments({ exerciseId: req.params.id });
    if (workoutDetailCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete exercise because it is used in existing workouts'
      });
    }

    await Exercise.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise
};