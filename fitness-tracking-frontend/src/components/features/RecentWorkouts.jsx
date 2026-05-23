import { Card } from '../ui/Card';
import { workoutImage } from '../../utils/images';

const RecentWorkouts = ({ workouts = [] }) => {
  return (
    <Card className="p-6">
      <span className="eyebrow">Last sessions</span>
      <h3 className="headline text-2xl mt-1 mb-5">Recent Workouts</h3>
      {workouts.length === 0 ? (
        <p className="text-sm text-ink-400">No recent workouts</p>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <div
              key={workout._id}
              className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-900/50 p-3 hover:border-volt-500/40 transition-colors"
            >
              <img
                src={workoutImage(workout.type)}
                alt=""
                className="h-12 w-12 rounded-md object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-ink-100 font-medium truncate">{workout.type}</span>
                  <span className="text-xs text-ink-400">
                    {new Date(workout.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-ink-400 mt-0.5">
                  <span>{workout.duration} min</span>
                  <span>{workout.caloriesBurned || 0} kcal</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentWorkouts;
