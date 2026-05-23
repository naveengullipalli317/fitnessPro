/** Workout, goal, routine factories for tests. */

export const todayIso = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const futureDateIso = (daysAhead = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const sampleWorkout = (overrides = {}) => ({
  type: 'strength',
  duration: 45,
  caloriesBurned: 250,
  date: todayIso(),
  notes: 'Created by Playwright',
  ...overrides,
});

export const sampleGoal = (overrides = {}) => ({
  goalType: 'weightLoss',
  targetValue: 5,
  deadline: futureDateIso(60),
  ...overrides,
});
