import StatCard from '../ui/StatCard';

const WorkoutStats = ({ workouts = [] }) => {
  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:col-span-2 lg:col-span-4">
      <StatCard label="Sessions" value={totalWorkouts} icon="🔥" />
      <StatCard label="Minutes" value={totalDuration} unit="min" accent="lime" icon="⏱" />
      <StatCard label="Calories" value={totalCalories} unit="kcal" icon="⚡" />
      <StatCard label="Avg Session" value={avgDuration} unit="min" accent="lime" icon="📈" />
    </div>
  );
};

export default WorkoutStats;
