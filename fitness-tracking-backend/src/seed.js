/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Exercise = require('./models/Exercise');
const Workout = require('./models/Workout');
const WorkoutDetail = require('./models/WorkoutDetail');
const User = require('./models/User');

const EXERCISES = [
  // ── chest ───────────────────────────────────────────────────────
  { name: 'Barbell Bench Press', category: 'chest', muscleGroups: ['chest', 'triceps', 'shoulders'], equipmentNeeded: ['barbell', 'bench'], difficultyLevel: 'intermediate',
    instructions: 'Lie on a flat bench, grip the bar slightly wider than shoulder-width, lower to mid-chest, then press up to lockout.' },
  { name: 'Dumbbell Bench Press', category: 'chest', muscleGroups: ['chest', 'triceps'], equipmentNeeded: ['dumbbells', 'bench'], difficultyLevel: 'beginner',
    instructions: 'Press dumbbells from chest level to full extension. Control the descent.' },
  { name: 'Push-Up', category: 'chest', muscleGroups: ['chest', 'triceps', 'abs'], equipmentNeeded: ['none'], difficultyLevel: 'beginner',
    instructions: 'Plank position, lower chest to floor, push back up. Keep core tight.' },
  { name: 'Incline Dumbbell Press', category: 'chest', muscleGroups: ['chest', 'shoulders'], equipmentNeeded: ['dumbbells', 'bench'], difficultyLevel: 'intermediate',
    instructions: 'Bench inclined 30–45°. Press dumbbells from upper chest to lockout.' },
  { name: 'Cable Chest Fly', category: 'chest', muscleGroups: ['chest'], equipmentNeeded: ['machine'], difficultyLevel: 'intermediate',
    instructions: 'Slight bend in elbows. Arc the cables together in front of chest. Squeeze.' },

  // ── back ────────────────────────────────────────────────────────
  { name: 'Pull-Up', category: 'back', muscleGroups: ['back', 'biceps'], equipmentNeeded: ['pull_up_bar'], difficultyLevel: 'advanced',
    instructions: 'Hang from bar, palms facing away. Pull chin over bar. Lower with control.' },
  { name: 'Bent-Over Barbell Row', category: 'back', muscleGroups: ['back', 'biceps'], equipmentNeeded: ['barbell'], difficultyLevel: 'intermediate',
    instructions: 'Hinge to ~45°, neutral spine. Row bar to lower chest. Lower under control.' },
  { name: 'Lat Pulldown', category: 'back', muscleGroups: ['back', 'biceps'], equipmentNeeded: ['machine'], difficultyLevel: 'beginner',
    instructions: 'Wide grip. Pull bar to upper chest while squeezing lats. Slow eccentric.' },
  { name: 'Seated Cable Row', category: 'back', muscleGroups: ['back', 'biceps'], equipmentNeeded: ['machine'], difficultyLevel: 'beginner',
    instructions: 'Chest up, pull handle to abdomen, squeeze shoulder blades, extend arms.' },
  { name: 'Deadlift', category: 'back', muscleGroups: ['back', 'glutes', 'legs'], equipmentNeeded: ['barbell'], difficultyLevel: 'advanced',
    instructions: 'Hip hinge, neutral spine, bar over mid-foot. Drive floor away. Lock out hips.' },

  // ── legs ────────────────────────────────────────────────────────
  { name: 'Back Squat', category: 'legs', muscleGroups: ['legs', 'glutes', 'abs'], equipmentNeeded: ['barbell'], difficultyLevel: 'intermediate',
    instructions: 'Bar on upper back. Break at hips and knees together. Depth to parallel or below.' },
  { name: 'Romanian Deadlift', category: 'legs', muscleGroups: ['legs', 'glutes', 'back'], equipmentNeeded: ['barbell'], difficultyLevel: 'intermediate',
    instructions: 'Soft knees. Hinge hips back. Lower bar along legs to mid-shin. Drive hips forward.' },
  { name: 'Walking Lunge', category: 'legs', muscleGroups: ['legs', 'glutes'], equipmentNeeded: ['dumbbells'], difficultyLevel: 'beginner',
    instructions: 'Step forward, lower back knee toward floor, drive through front heel to switch.' },
  { name: 'Leg Press', category: 'legs', muscleGroups: ['legs', 'glutes'], equipmentNeeded: ['machine'], difficultyLevel: 'beginner',
    instructions: 'Feet shoulder-width on platform. Lower until knees ~90°. Press without locking knees.' },
  { name: 'Bodyweight Squat', category: 'legs', muscleGroups: ['legs', 'glutes'], equipmentNeeded: ['none'], difficultyLevel: 'beginner',
    instructions: 'Feet shoulder-width. Sit back into squat, chest up, knees tracking over toes.' },

  // ── shoulders ───────────────────────────────────────────────────
  { name: 'Overhead Press', category: 'shoulders', muscleGroups: ['shoulders', 'triceps'], equipmentNeeded: ['barbell'], difficultyLevel: 'intermediate',
    instructions: 'Bar at shoulders, tight core. Press straight up, finish with biceps by ears.' },
  { name: 'Dumbbell Lateral Raise', category: 'shoulders', muscleGroups: ['shoulders'], equipmentNeeded: ['dumbbells'], difficultyLevel: 'beginner',
    instructions: 'Slight forward lean. Raise dumbbells to sides until parallel with floor. Control down.' },
  { name: 'Face Pull', category: 'shoulders', muscleGroups: ['shoulders', 'back'], equipmentNeeded: ['machine'], difficultyLevel: 'beginner',
    instructions: 'Rope at face height. Pull to forehead, externally rotating shoulders.' },
  { name: 'Arnold Press', category: 'shoulders', muscleGroups: ['shoulders', 'triceps'], equipmentNeeded: ['dumbbells'], difficultyLevel: 'intermediate',
    instructions: 'Start palms facing you. Press while rotating palms forward, finish overhead.' },

  // ── arms ────────────────────────────────────────────────────────
  { name: 'Barbell Curl', category: 'arms', muscleGroups: ['biceps'], equipmentNeeded: ['barbell'], difficultyLevel: 'beginner',
    instructions: 'Elbows pinned. Curl bar up without swinging. Squeeze biceps at top.' },
  { name: 'Dumbbell Hammer Curl', category: 'arms', muscleGroups: ['biceps'], equipmentNeeded: ['dumbbells'], difficultyLevel: 'beginner',
    instructions: 'Neutral grip. Curl up. Hits brachialis as well as biceps.' },
  { name: 'Triceps Pushdown', category: 'arms', muscleGroups: ['triceps'], equipmentNeeded: ['machine'], difficultyLevel: 'beginner',
    instructions: 'Elbows tucked. Push rope/bar down to full extension. Squeeze triceps.' },
  { name: 'Skull Crusher', category: 'arms', muscleGroups: ['triceps'], equipmentNeeded: ['barbell', 'bench'], difficultyLevel: 'intermediate',
    instructions: 'Lie on bench. Lower bar to forehead by bending elbows. Extend back up.' },
  { name: 'Close-Grip Bench Press', category: 'arms', muscleGroups: ['triceps', 'chest'], equipmentNeeded: ['barbell', 'bench'], difficultyLevel: 'intermediate',
    instructions: 'Hands shoulder-width. Bar to lower chest, elbows tucked. Press up.' },

  // ── abs ─────────────────────────────────────────────────────────
  { name: 'Plank', category: 'abs', muscleGroups: ['abs'], equipmentNeeded: ['none'], difficultyLevel: 'beginner',
    instructions: 'Forearms and toes. Hips level with shoulders. Brace core, breathe normally.' },
  { name: 'Hanging Leg Raise', category: 'abs', muscleGroups: ['abs'], equipmentNeeded: ['pull_up_bar'], difficultyLevel: 'advanced',
    instructions: 'Hang from bar. Raise legs to horizontal (or higher). Lower slowly. No swing.' },
  { name: 'Cable Crunch', category: 'abs', muscleGroups: ['abs'], equipmentNeeded: ['machine'], difficultyLevel: 'beginner',
    instructions: 'Kneel under cable. Curl elbows toward knees by flexing spine, not pulling.' },
  { name: 'Russian Twist', category: 'abs', muscleGroups: ['abs'], equipmentNeeded: ['dumbbells'], difficultyLevel: 'beginner',
    instructions: 'Seated, lean back. Rotate weight from hip to hip. Keep chest up.' },

  // ── cardio ──────────────────────────────────────────────────────
  { name: 'Running (Steady State)', category: 'cardio', muscleGroups: ['legs', 'calves'], equipmentNeeded: ['none'], difficultyLevel: 'beginner',
    instructions: 'Maintain a conversational pace. Land mid-foot. Target zone 2 heart rate.' },
  { name: 'Cycling (Stationary)', category: 'cardio', muscleGroups: ['legs', 'glutes'], equipmentNeeded: ['machine'], difficultyLevel: 'beginner',
    instructions: 'Adjust seat so knee is slightly bent at bottom. Steady cadence ~80 rpm.' },
  { name: 'Rowing Machine', category: 'cardio', muscleGroups: ['back', 'legs'], equipmentNeeded: ['machine'], difficultyLevel: 'intermediate',
    instructions: 'Legs → hips → arms on the drive. Arms → hips → legs on the recovery.' },
  { name: 'Jump Rope', category: 'cardio', muscleGroups: ['calves', 'shoulders'], equipmentNeeded: ['other'], difficultyLevel: 'beginner',
    instructions: 'Light bounce on balls of feet. Wrists turn the rope, not the arms.' },
  { name: 'High-Knees', category: 'cardio', muscleGroups: ['legs', 'abs'], equipmentNeeded: ['none'], difficultyLevel: 'beginner',
    instructions: 'Run in place driving knees to hip height. Stay light on toes.' },

  // ── full_body ───────────────────────────────────────────────────
  { name: 'Burpee', category: 'full_body', muscleGroups: ['chest', 'legs', 'abs'], equipmentNeeded: ['none'], difficultyLevel: 'intermediate',
    instructions: 'Squat → kick to plank → push-up → jump back to squat → jump up.' },
  { name: 'Kettlebell Swing', category: 'full_body', muscleGroups: ['glutes', 'back', 'legs'], equipmentNeeded: ['kettlebell'], difficultyLevel: 'intermediate',
    instructions: 'Hinge at hips. Snap hips forward to swing kettlebell to chest height.' },
  { name: 'Thruster', category: 'full_body', muscleGroups: ['legs', 'shoulders'], equipmentNeeded: ['dumbbells'], difficultyLevel: 'intermediate',
    instructions: 'Front squat into overhead press in one fluid motion.' },
  { name: 'Mountain Climber', category: 'full_body', muscleGroups: ['abs', 'shoulders', 'legs'], equipmentNeeded: ['none'], difficultyLevel: 'beginner',
    instructions: 'Plank position. Drive knees toward chest alternately at speed.' },
];

// Sample workouts per major category — seeded for the first existing user.
const SAMPLE_WORKOUTS = [
  { type: 'strength', duration: 55, caloriesBurned: 420, notes: 'Upper-body push day: bench, OHP, accessories.' },
  { type: 'strength', duration: 60, caloriesBurned: 440, notes: 'Pull day: deadlifts, rows, pull-ups.' },
  { type: 'strength', duration: 65, caloriesBurned: 500, notes: 'Leg day: squat focus, RDLs, lunges.' },
  { type: 'cardio', duration: 35, distance: 5.2, caloriesBurned: 360, notes: '5k easy zone 2 run.' },
  { type: 'cardio', duration: 25, caloriesBurned: 280, notes: 'Rowing intervals: 8×500m.' },
  { type: 'hiit', duration: 20, caloriesBurned: 240, notes: 'Burpees, KB swings, thrusters — EMOM.' },
  { type: 'yoga', duration: 40, caloriesBurned: 150, notes: 'Recovery flow: hips and shoulders.' },
  { type: 'pilates', duration: 45, caloriesBurned: 200, notes: 'Core stability + mobility class.' },
];

const seedExercises = async () => {
  let inserted = 0;
  let skipped = 0;
  for (const ex of EXERCISES) {
    const existing = await Exercise.findOne({ name: ex.name });
    if (existing) {
      skipped += 1;
      continue;
    }
    await Exercise.create(ex);
    inserted += 1;
  }
  console.log(`Exercises: ${inserted} inserted, ${skipped} already existed.`);
};

const seedWorkoutsForUser = async (user) => {
  if (!user) {
    console.log('No user found in DB — skipping sample workouts. Register a user first if you want workouts seeded.');
    return;
  }
  const existing = await Workout.countDocuments({ userId: user._id });
  if (existing > 0) {
    console.log(`User ${user.email} already has ${existing} workouts — skipping.`);
    return;
  }
  const today = new Date();
  let inserted = 0;
  for (let i = 0; i < SAMPLE_WORKOUTS.length; i += 1) {
    const w = SAMPLE_WORKOUTS[i];
    const date = new Date(today);
    date.setDate(today.getDate() - i * 2);
    await Workout.create({ ...w, userId: user._id, date });
    inserted += 1;
  }
  console.log(`Workouts: ${inserted} inserted for user ${user.email}.`);
};

const run = async () => {
  try {
    await connectDB();
    // wait briefly for `connected` event to fire
    await new Promise((r) => setTimeout(r, 500));

    if (mongoose.connection.readyState !== 1) {
      console.error('Mongo is not connected. Aborting.');
      process.exit(1);
    }

    await seedExercises();

    const targetEmail = process.argv[2];
    const user = targetEmail
      ? await User.findOne({ email: targetEmail })
      : await User.findOne().sort({ createdAt: 1 });

    if (targetEmail && !user) {
      console.warn(`No user with email ${targetEmail} — skipping workout seed.`);
    }
    await seedWorkoutsForUser(user);

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

run();
