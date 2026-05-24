import { useState } from 'react';
import { useRoutines } from '../../hooks/useRoutines';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { formatDate } from '../../utils/helpers';
import { DAYS_OF_WEEK } from '../../utils/constants';

const RoutinePlanner = () => {
  const { routines, isLoading, error, createRoutine } = useRoutines();
  const [showForm, setShowForm] = useState(false);
  const [routineData, setRoutineData] = useState({
    name: '',
    description: '',
    isPublic: false,
    workoutSchedule: [
      { dayOfWeek: 0, workoutId: '' }
    ]
  });

  const handleAddWorkoutDay = () => {
    setRoutineData(prev => ({
      ...prev,
      workoutSchedule: [...prev.workoutSchedule, { dayOfWeek: 0, workoutId: '' }]
    }));
  };

  const handleRemoveWorkoutDay = (index) => {
    if (routineData.workoutSchedule.length > 1) {
      setRoutineData(prev => ({
        ...prev,
        workoutSchedule: prev.workoutSchedule.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRoutine(routineData);
      setShowForm(false);
      // Reset form
      setRoutineData({
        name: '',
        description: '',
        isPublic: false,
        workoutSchedule: [{ dayOfWeek: 0, workoutId: '' }]
      });
    } catch (err) {
      console.error('Error creating routine:', err);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary-600">Workout Routines</h2>
        <Button
          variant="secondary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Create Routine'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Routine</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Routine Name
              </label>
              <Input
                value={routineData.name}
                onChange={(e) => setRoutineData({...routineData, name: e.target.value})}
                placeholder="Enter routine name"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Description (optional)
              </label>
              <Input
                value={routineData.description}
                onChange={(e) => setRoutineData({...routineData, description: e.target.value})}
                placeholder="Describe your routine"
                as="textarea"
                rows={3}
              />
            </div>
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={routineData.isPublic}
                  onChange={(e) => setRoutineData({...routineData, isPublic: e.target.checked})}
                  className="h-4 w-4 text-primary-600"
                />
              </div>
              <div className="ml-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Make this routine public
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Workout Schedule
              </label>
              <div className="space-y-2">
                {routineData.workoutSchedule.map((scheduleItem, index) => (
                  <div key={index} className="flex items-center space-x-3 border-b pb-2">
                    <select
                      value={scheduleItem.dayOfWeek}
                      onChange={(e) => {
                        const newSchedule = [...routineData.workoutSchedule];
                        newSchedule[index] = {...newSchedule[index], dayOfWeek: parseInt(e.target.value)};
                        setRoutineData({...routineData, workoutSchedule: newSchedule});
                      }}
                      className="px-3 py-2 border rounded-md"
                    >
                      {DAYS_OF_WEEK.map((day, idx) => (
                        <option key={idx} value={idx}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Workout ID (or leave blank for now)"
                      className="flex-1 px-3 py-2 border rounded-md"
                      value={scheduleItem.workoutId || ''}
                      onChange={(e) => {
                        const newSchedule = [...routineData.workoutSchedule];
                        newSchedule[index] = {...newSchedule[index], workoutId: e.target.value};
                        setRoutineData({...routineData, workoutSchedule: newSchedule});
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSchedule = [...routineData.workoutSchedule];
                        newSchedule.splice(index, 1);
                        setRoutineData({...routineData, workoutSchedule: newSchedule});
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={handleAddWorkoutDay}
                >
                  Add Workout Day
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create Routine
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {routines.map((routine) => (
          <Card key={routine._id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-primary-600">
                  {routine.name}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {routine.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {routine.workoutSchedule.map((scheduleItem, index) => (
                    <span key={index} className="px-2 py-1 bg-muted text-xs rounded">
                      {DAYS_OF_WEEK[scheduleItem.dayOfWeek]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                {routine.isPublic ? (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    Public
                  </span>
                ) : (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                    Private
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!routines.length && !showForm && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No routines available yet. Create your first routine!</p>
        </div>
      )}
    </div>
  );
};

export default RoutinePlanner;