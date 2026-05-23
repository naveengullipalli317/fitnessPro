const Routine = require('../models/Routine');
const Workout = require('../models/Workout');

// @desc    Get routines visible to the current user (own + public)
// @route   GET /api/routines
// @access  Private
const getRoutines = async (req, res) => {
  try {
    const { isPublic, search } = req.query;
    const userId = req.user._id;

    // Visibility rule: a user sees their own routines plus any public ones.
    // The optional ?isPublic= query narrows this further (e.g. only public,
    // or only the user's private routines).
    let visibility;
    if (isPublic === 'true') {
      visibility = { isPublic: true };
    } else if (isPublic === 'false') {
      visibility = { createdBy: userId, isPublic: false };
    } else {
      visibility = { $or: [{ createdBy: userId }, { isPublic: true }] };
    }

    const filter = { ...visibility };
    if (search) {
      filter.$and = [
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        },
      ];
    }

    const routines = await Routine.find(filter)
      .populate('createdBy', 'name email')
      .populate({
        path: 'workoutSchedule.workoutId',
        select: 'type date duration'
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: routines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get routine by ID
// @route   GET /api/routines/:id
// @access  Private (owner, or anyone if isPublic)
const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate({
        path: 'workoutSchedule.workoutId',
        select: 'type date duration caloriesBurned'
      });

    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }

    // Block access to other users' private routines.
    const ownerId = routine.createdBy?._id?.toString?.() || routine.createdBy?.toString?.();
    if (!routine.isPublic && ownerId !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }

    res.json({ success: true, data: routine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new routine
// @route   POST /api/routines
// @access  Private
const createRoutine = async (req, res) => {
  try {
    const { name, description, isPublic, workoutSchedule } = req.body;

    // Validate workoutSchedule if provided
    if (workoutSchedule && workoutSchedule.length > 0) {
      // Verify that all workout IDs exist and belong to the user
      const workoutIds = workoutSchedule.map(item => item.workoutId);
      const workouts = await Workout.find({ _id: { $in: workoutIds }, userId: req.user._id });

      if (workouts.length !== workoutIds.length) {
        return res.status(400).json({ success: false, message: 'One or more workouts not found or not authorized' });
      }
    }

    const routine = await Routine.create({
      name,
      description: description || '',
      isPublic: isPublic !== undefined ? isPublic : false,
      createdBy: req.user._id,
      workoutSchedule: workoutSchedule || []
    });

    // Populate references for response
    const populatedRoutine = await Routine.findById(routine._id)
      .populate('createdBy', 'name email')
      .populate({
        path: 'workoutSchedule.workoutId',
        select: 'type date duration caloriesBurned'
      });

    res.status(201).json({
      success: true,
      message: 'Routine created successfully',
      data: populatedRoutine
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update routine
// @route   PUT /api/routines/:id
// @access  Private
const updateRoutine = async (req, res) => {
  try {
    const { name, description, isPublic, workoutSchedule } = req.body;

    // Find routine
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }

    // Check authorization
    if (routine.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Validate workoutSchedule if provided
    if (workoutSchedule && workoutSchedule.length > 0) {
      // Verify that all workout IDs exist and belong to the user
      const workoutIds = workoutSchedule.map(item => item.workoutId);
      const workouts = await Workout.find({ _id: { $in: workoutIds }, userId: req.user._id });

      if (workouts.length !== workoutIds.length) {
        return res.status(400).json({ success: false, message: 'One or more workouts not found or not authorized' });
      }
    }

    // Update routine
    const updatedRoutine = await Routine.findByIdAndUpdate(
      req.params.id,
      {
        name: name || routine.name,
        description: description !== undefined ? description : routine.description,
        isPublic: isPublic !== undefined ? isPublic : routine.isPublic,
        workoutSchedule: workoutSchedule || routine.workoutSchedule
      },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email')
    .populate({
      path: 'workoutSchedule.workoutId',
      select: 'type date duration caloriesBurned'
    });

    res.json({
      success: true,
      message: 'Routine updated successfully',
      data: updatedRoutine
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete routine
// @route   DELETE /api/routines/:id
// @access  Private
const deleteRoutine = async (req, res) => {
  try {
    // Find routine
    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ success: false, message: 'Routine not found' });
    }

    // Check authorization
    if (routine.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Routine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Routine deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine
};