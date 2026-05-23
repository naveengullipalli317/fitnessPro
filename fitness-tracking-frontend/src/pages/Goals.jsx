import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import { useGoals } from '../hooks/useGoals';
import { images } from '../utils/images';

const Goals = () => {
  const { goals, isLoading, error, createGoal, deleteGoal } = useGoals();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [goalData, setGoalData] = useState({
    goalType: 'weightLoss',
    targetValue: '',
    deadline: '',
  });

  const resetForm = () => {
    setGoalData({ goalType: 'weightLoss', targetValue: '', deadline: '' });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await createGoal({
        goalType: goalData.goalType,
        targetValue: parseFloat(goalData.targetValue) || 0,
        deadline: goalData.deadline,
      });
      setShowForm(false);
      resetForm();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
    } catch (_) {
      // no-op; useGoals already exposes error
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-ink-400">Loading goals…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-700">
        <img src={images.goal} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative p-8 sm:p-10 flex flex-wrap justify-between items-end gap-4">
          <div>
            <span className="eyebrow">Set the standard</span>
            <h2 className="headline text-4xl sm:text-5xl mt-2">My Goals</h2>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '＋ Add Goal'}
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
          <SectionHeader eyebrow="New target" title="Set a new goal" />
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Goal Type
              </label>
              <select
                value={goalData.goalType}
                onChange={(e) => setGoalData({ ...goalData, goalType: e.target.value })}
                className="ink-input"
              >
                <option value="weightLoss">Weight Loss (kg)</option>
                <option value="muscleGain">Muscle Gain (kg)</option>
                <option value="distance">Running Distance (km)</option>
                <option value="duration">Workout Duration (minutes)</option>
                <option value="frequency">Workout Frequency (sessions/week)</option>
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Target Value
                </label>
                <input
                  type="number"
                  value={goalData.targetValue}
                  onChange={(e) => setGoalData({ ...goalData, targetValue: e.target.value })}
                  className="ink-input"
                  min={0}
                  step={0.1}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Target Date
                </label>
                <input
                  type="date"
                  value={goalData.deadline}
                  onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })}
                  className="ink-input"
                  required
                />
              </div>
            </div>
            {formError && <p className="text-rose-400 text-sm">{formError}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Goal'}
            </Button>
          </form>
        </Card>
      )}

      {goals.length === 0 && !showForm ? (
        <div className="text-center py-16 text-ink-400 border border-dashed border-ink-700 rounded-xl">
          No goals set yet. Create your first one and start chasing it.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {goals.map((goal) => {
            const pct = goal.targetValue > 0 ? Math.min((goal.currentValue / goal.targetValue) * 100, 100) : 0;
            return (
              <Card key={goal._id} className="p-6 group hover:shadow-glow transition-shadow">
                <div className="flex justify-between items-start mb-4 gap-3">
                  <div className="flex-1">
                    <span className="eyebrow">{new Date(goal.deadline).toLocaleDateString()}</span>
                    <h4 className="headline text-2xl mt-1 capitalize">
                      {goal.goalType.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {goal.achieved ? (
                      <span className="chip chip-lime">✓ Achieved</span>
                    ) : (
                      <span className="chip chip-volt">In Progress</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(goal._id)}
                      className="text-xs text-ink-500 hover:text-rose-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-ink-900 border border-ink-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={
                        'h-3 rounded-full transition-all ' +
                        (goal.achieved ? 'bg-lime-500' : 'bg-grad-volt')
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mt-3">
                    <span className="text-ink-300">
                      <span className="font-display text-2xl text-ink-100">{goal.currentValue}</span>
                      <span className="text-ink-500 mx-1">/</span>
                      <span className="text-ink-300">{goal.targetValue}</span>
                    </span>
                    <span className="font-display text-2xl gradient-text">{Math.round(pct)}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;
