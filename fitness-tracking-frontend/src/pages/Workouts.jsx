import { useState } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import SectionHeader from '../components/ui/SectionHeader';
import { workoutImage, images } from '../utils/images';

const WORKOUT_TYPES = ['strength', 'cardio', 'yoga', 'hiit', 'pilates', 'crossfit', 'other'];

const initialForm = () => ({
  type: 'strength',
  duration: 30,
  caloriesBurned: 0,
  distance: '',
  date: new Date().toISOString().split('T')[0],
  notes: '',
});

const Workouts = () => {
  const { workouts, isLoading, error, createWorkout, deleteWorkout } = useWorkouts();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [workoutData, setWorkoutData] = useState(initialForm());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      const payload = {
        type: workoutData.type,
        duration: parseInt(workoutData.duration, 10) || 0,
        caloriesBurned: parseInt(workoutData.caloriesBurned, 10) || 0,
        date: workoutData.date,
        notes: workoutData.notes,
      };
      if (workoutData.distance !== '' && workoutData.distance !== null) {
        payload.distance = parseFloat(workoutData.distance);
      }
      await createWorkout(payload);
      setShowForm(false);
      setWorkoutData(initialForm());
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to log workout');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout?')) return;
    try {
      await deleteWorkout(id);
    } catch (_) {
      /* error shown via hook */
    }
  };

  if (isLoading && workouts.length === 0) {
    return <div className="text-center py-12 text-ink-400">Loading workouts…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Page banner */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-700">
        <img src={images.heroBarbell} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative p-8 sm:p-10 flex flex-wrap justify-between items-end gap-4">
          <div>
            <span className="eyebrow">Your training log</span>
            <h2 className="headline text-4xl sm:text-5xl mt-2">My Workouts</h2>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '＋ Log Workout'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {showForm && (
        <Card className="p-6">
          <SectionHeader eyebrow="New entry" title="Log a workout" />
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Type
                </label>
                <select
                  value={workoutData.type}
                  onChange={(e) => setWorkoutData({ ...workoutData, type: e.target.value })}
                  className="ink-input"
                >
                  {WORKOUT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={workoutData.duration}
                  onChange={(e) => setWorkoutData({ ...workoutData, duration: e.target.value })}
                  className="ink-input"
                  min={1}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Calories
                </label>
                <input
                  type="number"
                  value={workoutData.caloriesBurned}
                  onChange={(e) => setWorkoutData({ ...workoutData, caloriesBurned: e.target.value })}
                  className="ink-input"
                  min={0}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Distance (km)
                </label>
                <input
                  type="number"
                  value={workoutData.distance}
                  onChange={(e) => setWorkoutData({ ...workoutData, distance: e.target.value })}
                  className="ink-input"
                  min={0}
                  step={0.1}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Date
              </label>
              <input
                type="date"
                value={workoutData.date}
                onChange={(e) => setWorkoutData({ ...workoutData, date: e.target.value })}
                className="ink-input"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Notes
              </label>
              <textarea
                value={workoutData.notes}
                onChange={(e) => setWorkoutData({ ...workoutData, notes: e.target.value })}
                className="ink-input min-h-[88px] resize-y"
                rows={3}
              />
            </div>
            {formError && (
              <p className="text-rose-400 text-sm">{formError}</p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Workout'}
            </Button>
          </form>
        </Card>
      )}

      {workouts.length === 0 && !showForm ? (
        <div className="text-center py-16 text-ink-400 border border-dashed border-ink-700 rounded-xl">
          No workouts logged yet. Start by logging your first session!
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <div
              key={workout._id}
              className="group relative overflow-hidden rounded-xl border border-ink-700 h-64"
            >
              <img
                src={workoutImage(workout.type)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-grad-overlay" />
              <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="chip chip-volt backdrop-blur capitalize">{workout.type}</span>
                  <button
                    type="button"
                    onClick={() => handleDelete(workout._id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-rose-300 hover:text-rose-200"
                  >
                    ✕ Delete
                  </button>
                </div>
                <div>
                  <p className="text-xs text-ink-300 uppercase tracking-widest2">
                    {new Date(workout.date).toLocaleDateString()}
                  </p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-display text-4xl text-ink-100">{workout.duration}</span>
                    <span className="text-sm text-ink-300 uppercase tracking-widest2">min</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {workout.caloriesBurned > 0 && (
                      <span className="chip">{workout.caloriesBurned} kcal</span>
                    )}
                    {workout.distance > 0 && <span className="chip">{workout.distance} km</span>}
                  </div>
                  {workout.notes && (
                    <p className="text-xs text-ink-300 mt-3 line-clamp-2">{workout.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workouts;
