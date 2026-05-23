import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import SectionHeader from '../components/ui/SectionHeader';
import { useRoutines } from '../hooks/useRoutines';
import { useWorkouts } from '../hooks/useWorkouts';
import { useAuth } from '../hooks/useAuth';
import { images } from '../utils/images';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Routines = () => {
  const { user } = useAuth();
  const { routines, isLoading, error, createRoutine, deleteRoutine } = useRoutines();
  const { workouts } = useWorkouts();

  const [tab, setTab] = useState('mine');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [routineData, setRoutineData] = useState({
    name: '',
    description: '',
    isPublic: false,
    workoutSchedule: [],
  });

  const myRoutines = useMemo(
    () => routines.filter((r) => r.createdBy?._id === user?._id || r.createdBy === user?._id),
    [routines, user]
  );
  const publicRoutines = useMemo(
    () =>
      routines.filter(
        (r) => r.isPublic && (r.createdBy?._id || r.createdBy) !== user?._id
      ),
    [routines, user]
  );
  const visible = tab === 'mine' ? myRoutines : publicRoutines;

  const addScheduleRow = () => {
    setRoutineData((d) => ({
      ...d,
      workoutSchedule: [...d.workoutSchedule, { dayOfWeek: 1, workoutId: workouts[0]?._id || '' }],
    }));
  };

  const updateRow = (i, patch) => {
    setRoutineData((d) => {
      const next = [...d.workoutSchedule];
      next[i] = { ...next[i], ...patch };
      return { ...d, workoutSchedule: next };
    });
  };

  const removeRow = (i) => {
    setRoutineData((d) => {
      const next = [...d.workoutSchedule];
      next.splice(i, 1);
      return { ...d, workoutSchedule: next };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const cleanSchedule = routineData.workoutSchedule.filter((s) => s.workoutId);
      await createRoutine({ ...routineData, workoutSchedule: cleanSchedule });
      setShowForm(false);
      setRoutineData({ name: '', description: '', isPublic: false, workoutSchedule: [] });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create routine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this routine?')) return;
    try {
      await deleteRoutine(id);
    } catch (_) {
      /* shown via hook */
    }
  };

  if (isLoading && routines.length === 0) {
    return <div className="text-center py-12 text-ink-400">Loading routines…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-700">
        <img src={images.routine} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative p-8 sm:p-10 flex flex-wrap justify-between items-end gap-4">
          <div>
            <span className="eyebrow">Plan the work</span>
            <h2 className="headline text-4xl sm:text-5xl mt-2">Workout Routines</h2>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '＋ Create Routine'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-ink-800">
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={
            'relative px-4 py-3 text-sm font-semibold uppercase tracking-widest2 transition-colors ' +
            (tab === 'mine' ? 'text-volt-500' : 'text-ink-400 hover:text-ink-200')
          }
        >
          My Routines ({myRoutines.length})
          {tab === 'mine' && (
            <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-grad-volt rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('public')}
          className={
            'relative px-4 py-3 text-sm font-semibold uppercase tracking-widest2 transition-colors ' +
            (tab === 'public' ? 'text-volt-500' : 'text-ink-400 hover:text-ink-200')
          }
        >
          Public ({publicRoutines.length})
          {tab === 'public' && (
            <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-grad-volt rounded-full" />
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {showForm && (
        <Card className="p-6">
          <SectionHeader eyebrow="New plan" title="Create routine" />
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Routine Name
              </label>
              <Input
                value={routineData.name}
                onChange={(e) => setRoutineData({ ...routineData, name: e.target.value })}
                placeholder="e.g. PPL Hypertrophy"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Description
              </label>
              <textarea
                value={routineData.description}
                onChange={(e) => setRoutineData({ ...routineData, description: e.target.value })}
                className="ink-input min-h-[88px] resize-y"
                rows={3}
                placeholder="What is this routine for?"
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-ink-200">
              <input
                type="checkbox"
                checked={routineData.isPublic}
                onChange={(e) => setRoutineData({ ...routineData, isPublic: e.target.checked })}
                className="h-4 w-4 accent-volt-500"
              />
              Make this routine public (share with the community)
            </label>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Workout Schedule
              </label>
              {workouts.length === 0 ? (
                <p className="text-sm text-ink-400">Log a workout first — you can then add it to a routine.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {routineData.workoutSchedule.map((row, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <select
                          value={row.dayOfWeek}
                          onChange={(e) => updateRow(i, { dayOfWeek: parseInt(e.target.value, 10) })}
                          className="ink-input max-w-[160px]"
                        >
                          {DAYS.map((d, idx) => (
                            <option key={d} value={idx}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <select
                          value={row.workoutId}
                          onChange={(e) => updateRow(i, { workoutId: e.target.value })}
                          className="ink-input flex-1"
                        >
                          <option value="">Select a workout…</option>
                          {workouts.map((w) => (
                            <option key={w._id} value={w._id}>
                              {w.type} — {new Date(w.date).toLocaleDateString()} ({w.duration}m)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          className="text-rose-400 hover:text-rose-300 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" type="button" onClick={addScheduleRow} className="mt-3">
                    ＋ Add Day
                  </Button>
                </>
              )}
            </div>

            {formError && <p className="text-rose-400 text-sm">{formError}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Routine'}
            </Button>
          </form>
        </Card>
      )}

      {visible.length === 0 ? (
        <div className="text-center py-16 text-ink-400 border border-dashed border-ink-700 rounded-xl">
          {tab === 'mine'
            ? "You haven't created any routines yet."
            : 'No public routines from other users yet.'}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((routine) => {
            const isMine = (routine.createdBy?._id || routine.createdBy) === user?._id;
            const days = routine.workoutSchedule?.length || 0;
            return (
              <Card key={routine._id} className="p-6 hover:shadow-glow transition-shadow">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div className="flex-1">
                    <span className="eyebrow">{days} day{days === 1 ? '' : 's'} / week</span>
                    <h4 className="headline text-2xl mt-1">{routine.name}</h4>
                    {routine.description && (
                      <p className="text-sm text-ink-300 mt-2">{routine.description}</p>
                    )}
                    {!isMine && routine.createdBy?.name && (
                      <p className="text-xs text-ink-500 mt-2">by {routine.createdBy.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {routine.isPublic ? (
                      <span className="chip chip-volt">Public</span>
                    ) : (
                      <span className="chip">Private</span>
                    )}
                  </div>
                </div>
                {routine.workoutSchedule?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {routine.workoutSchedule.map((s, i) => (
                      <span key={i} className="chip">
                        {DAYS[s.dayOfWeek]?.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                )}
                {isMine && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(routine._id)}
                      className="text-xs text-ink-500 hover:text-rose-400"
                    >
                      ✕ Delete
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Routines;
