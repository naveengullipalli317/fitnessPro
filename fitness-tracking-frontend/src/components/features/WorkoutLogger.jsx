import { useState } from 'react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { formatDate, formatDuration } from '../../utils/helpers';

const WorkoutLogger = () => {
  const { workouts, isLoading, error, createWorkout } = useWorkouts();
  const [showForm, setShowForm] = useState(false);
  const [workoutData, setWorkoutData] = useState({
    type: 'strength',
    duration: 30,
    date: new Date().toISOString().split('T')[0],
    notes: '',
    sets: [
      {
        exerciseId: '',
        setNumber: 1,
        reps: 10,
        weight: null,
        duration: null,
        restPeriod: 60
      }
    ]
  });

  const handleAddSet = () => {
    setWorkoutData(prev => ({
      ...prev,
      sets: [...prev.sets, {
        exerciseId: '',
        setNumber: prev.sets.length + 1,
        reps: 10,
        weight: null,
        duration: null,
        restPeriod: 60
      }]
    }));
  };

  const handleRemoveSet = (index) => {
    if (workoutData.sets.length > 1) {
      setWorkoutData(prev => ({
        ...prev,
        sets: prev.sets.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createWorkout(workoutData);
      setShowForm(false);
      // Reset form
      setWorkoutData({
        type: 'strength',
        duration: 30,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        sets: [
          {
            exerciseId: '',
            setNumber: 1,
            reps: 10,
            weight: null,
            duration: null,
            restPeriod: 60
          }
        ]
      });
    } catch (err) {
      console.error('Error creating workout:', err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-600">Log Workout</h2>
        <Button
          variant="outline"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Close' : 'New Workout'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Workout Details</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Workout Type
                </label>
                <select
                  value={workoutData.type}
                  onChange={(e) => setWorkoutData({...workoutData, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="strength">Strength</option>
                  <option value="cardio">Cardio</option>
                  <option value="yoga">Yoga</option>
                  <option value="hiit">HIIT</option>
                  <option value="pilates">Pilates</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-muted-foreground">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={workoutData.duration}
                  onChange={(e) => setWorkoutData({...workoutData, duration: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border rounded-md"
                  min={1}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Date
              </label>
              <input
                type="date"
                value={workoutData.date}
                onChange={(e) => setWorkoutData({...workoutData, date: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Notes (optional)
              </label>
              <textarea
                value={workoutData.notes}
                onChange={(e) => setWorkoutData({...workoutData, notes: e.target.value})}
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Exercise Sets</h4>
              {workoutData.sets.map((set, index) => (
                <div key={index} className="space-y-3 border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Set {set.setNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSet(index)}
                      className="text-destructive hover:text-destructive/80"
                      disabled={workoutData.sets.length === 1}
                    >
                      Remove Set
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-muted-foreground">
                        Exercise
                      </label>
                      <input
                        type="text"
                        placeholder="Exercise name or ID"
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-muted-foreground">
                          Reps
                        </label>
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => {
                            const newSets = [...workoutData.sets];
                            newSets[index] = {...newSets[index], reps: parseInt(e.target.value) || 0};
                            setWorkoutData({...workoutData, sets: newSets});
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                          min={1}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-muted-foreground">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          value={set.weight || ''}
                          onChange={(e) => {
                            const newSets = [...workoutData.sets];
                            newSets[index] = {...newSets[index], weight: e.target.value ? parseFloat(e.target.value) : null};
                            setWorkoutData({...workoutData, sets: newSets});
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                          min={0}
                          step={0.1}
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-muted-foreground">
                          Duration (sec)
                        </label>
                        <input
                          type="number"
                          value={set.duration || ''}
                          onChange={(e) => {
                            const newSets = [...workoutData.sets];
                            newSets[index] = {...newSets[index], duration: e.target.value ? parseInt(e.target.value) : null};
                            setWorkoutData({...workoutData, sets: newSets});
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-muted-foreground">
                          Rest (sec)
                        </label>
                        <input
                          type="number"
                          value={set.restPeriod}
                          onChange={(e) => {
                            const newSets = [...workoutData.sets];
                            newSets[index] = {...newSets[index], restPeriod: parseInt(e.target.value) || 60};
                            setWorkoutData({...workoutData, sets: newSets});
                          }}
                          className="w-full px-3 py-2 border rounded-md"
                          min={0}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                onClick={handleAddSet}
                className="w-full text-sm flex items-center justify-center"
              >
                + Add Another Set
              </Button>
            </div>

            <Button type="submit" className="w-full">
              Log Workout
            </Button>
          </form>
        </Card>
      )}

      {!showForm && workouts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Recent Workouts</h3>
          <div className="space-y-4">
            {workouts.slice(0, 5).map((workout) => (
              <Card key={workout._id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-primary-600">
                      {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(workout.date)}
                    </p>
                  </div>
                  <div className="text-right text-sm space-x-2">
                    <span className="badge bg-primary-100 text-primary-600">
                      {formatDuration(workout.duration)}
                    </span>
                    {workout.caloriesBurned > 0 && (
                      <span className="badge bg-secondary-100 text-secondary-600">
                        {workout.caloriesBurned} kcal
                      </span>
                    )}
                  </div>
                </div>
                {workout.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{workout.notes}</p>
                )}
                <div className="mt-4">
                  <a
                    href={`/workouts/${workout._id}`}
                    className="text-sm font-medium text-primary-600 hover:underline"
                  >
                    View Details
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {!showForm && workouts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No workouts logged yet. Start by logging your first workout!</p>
        </div>
      )}
    </div>
  );
};

export default WorkoutLogger;