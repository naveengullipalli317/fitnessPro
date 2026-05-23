const Workout = require('../models/Workout');
const WorkoutDetail = require('../models/WorkoutDetail');

// @desc    Get user's workouts
// @route   GET /api/workouts or /api/users/:id/workouts
// @access  Private
const getUserWorkouts = async (req, res) => {
  try {
    // If user ID is in params, use that (for admin/trainer access)
    // Otherwise use the logged-in user's ID
    const userId = req.params.id || req.user._id;

    // Verify authorization - users can only access their own workouts
    // unless they are admin/trainer (simplified for now)
    if (req.params.id && req.params.id !== req.user._id.toString()) {
      // In a real app, you'd check for admin/trainer role here
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const workouts = await Workout.find({ userId })
      .sort({ date: -1 })
      .populate('userId', 'name email');

    res.json({ success: true, data: workouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get workout by ID
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('userId', 'name email')
      .populate({
        path: 'details',
        populate: {
          path: 'exerciseId',
          select: 'name category muscleGroups equipmentNeeded'
        }
      });

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Check authorization
    if (workout.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res) => {
  try {
    const { type, duration, distance, caloriesBurned, date, notes, sets } = req.body;

    // Create workout
    const workout = await Workout.create({
      userId: req.user._id,
      type,
      duration,
      distance: distance || null,
      caloriesBurned: caloriesBurned || 0,
      date: date || Date.now(),
      notes: notes || ''
    });

    // Create workout details/sets if provided
    if (sets && sets.length > 0) {
      const workoutDetails = sets.map(set => ({
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
    const populatedWorkout = await Workout.findById(workout._id)
      .populate('userId', 'name email')
      .populate({
        path: 'details',
        populate: {
          path: 'exerciseId',
          select: 'name category muscleGroups equipmentNeeded'
        }
      });

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: populatedWorkout
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update workout
// @route   PUT /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res) => {
  try {
    const { type, duration, distance, caloriesBurned, date, notes } = req.body;

    // Find workout
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Check authorization
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update workout
    const updatedWorkout = await Workout.findByIdAndUpdate(
      req.params.id,
      {
        type,
        duration,
        distance: distance || null,
        caloriesBurned: caloriesBurned || 0,
        date: date || Date.now(),
        notes: notes || ''
      },
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email')
    .populate({
      path: 'details',
      populate: {
        path: 'exerciseId',
        select: 'name category muscleGroups equipmentNeeded'
      }
    });

    res.json({
      success: true,
      message: 'Workout updated successfully',
      data: updatedWorkout
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res) => {
  try {
    // Find workout
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Check authorization
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete workout details first
    await WorkoutDetail.deleteMany({ workoutId: req.params.id });

    // Delete workout
    await Workout.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get workout sets
// @route   GET /api/workouts/:id/sets
// @access  Private
const getWorkoutSets = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Check authorization
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const sets = await WorkoutDetail.find({ workoutId: req.params.id })
      .populate('exerciseId', 'name category muscleGroups')
      .sort({ setNumber: 1 });

    res.json({ success: true, data: sets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add set to workout
// @route   POST /api/workouts/:id/sets
// @access  Private
const addSetToWorkout = async (req, res) => {
  try {
    const { exerciseId, setNumber, reps, weight, duration, restPeriod } = req.body;

    // Find workout
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Check authorization
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Create workout detail/set
    const workoutDetail = await WorkoutDetail.create({
      workoutId: req.params.id,
      exerciseId,
      setNumber,
      reps,
      weight: weight || null,
      duration: duration || null,
      restPeriod: restPeriod || 60
    });

    // Populate exercise for response
    const populatedSet = await WorkoutDetail.findById(workoutDetail._id)
      .populate('exerciseId', 'name category muscleGroups');

    res.status(201).json({
      success: true,
      message: 'Set added successfully',
      data: populatedSet
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update set
// @route   PUT /api/workouts/:id/sets/:setId
// @access  Private
const updateSet = async (req, res) => {
  try {
    const { setNumber, reps, weight, duration, restPeriod } = req.body;

    // Find workout detail
    const workoutDetail = await WorkoutDetail.findById(req.params.setId);
    if (!workoutDetail) {
      return res.status(404).json({ success: false, message: 'Set not found' });
    }

    // Find workout to check authorization
    const workout = await Workout.findById(workoutDetail.workoutId);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Check authorization
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Update workout detail
    const updatedSet = await WorkoutDetail.findByIdAndUpdate(
      req.params.setId,
      {
        setNumber,
        reps,
        weight: weight || null,
        duration: duration || null,
        restPeriod: restPeriod || 60
      },
      { new: true, runValidators: true }
    )
    .populate('exerciseId', 'name category muscleGroups');

    res.json({
      success: true,
      message: 'Set updated successfully',
      data: updatedSet
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete set
// @route   DELETE /api/workouts/:id/sets/:setId
// @access  Private
const deleteSet = async (req, res) => {
  try {
    // Find workout detail
    const workoutDetail = await WorkoutDetail.findById(req.params.setId);
    if (!workoutDetail) {
      return res.status(404).json({ success: false, message: 'Set not found' });
    }

    // Find workout to check authorization
    const workout = await Workout.findById(workoutDetail.workoutId);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    // Check authorization
    if (workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete workout detail
    await WorkoutDetail.findByIdAndDelete(req.params.setId);

    res.json({ success: true, message: 'Set deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUserWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutSets,
  addSetToWorkout,
  updateSet,
  deleteSet
};