import { Card } from '../ui/Card';

const ProgressCharts = ({ workouts = [] }) => {
  const byType = workouts.reduce((acc, w) => {
    if (!w?.type) return acc;
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {});
  const entries = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const max = entries.length > 0 ? entries[0][1] : 0;

  return (
    <Card className="p-6">
      <span className="eyebrow">Breakdown</span>
      <h3 className="headline text-2xl mt-1 mb-5">Workout Mix</h3>
      {entries.length === 0 ? (
        <p className="text-sm text-ink-400">Log a workout to see your progress breakdown.</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([type, count]) => {
            const pct = max > 0 ? (count / max) * 100 : 0;
            return (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize text-ink-200">{type}</span>
                  <span className="font-semibold text-volt-500">{count}</span>
                </div>
                <div className="w-full bg-ink-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-grad-volt h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default ProgressCharts;
