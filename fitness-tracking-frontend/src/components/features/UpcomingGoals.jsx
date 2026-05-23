import { Card } from '../ui/Card';

const UpcomingGoals = ({ goals = [] }) => {
  const now = Date.now();
  const upcoming = goals
    .filter((g) => g && !g.achieved && new Date(g.deadline).getTime() > now)
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 3);

  return (
    <Card className="p-6">
      <span className="eyebrow">On the radar</span>
      <h3 className="headline text-2xl mt-1 mb-5">Upcoming Goals</h3>
      {upcoming.length === 0 ? (
        <p className="text-sm text-ink-400">No upcoming goals</p>
      ) : (
        <div className="space-y-4">
          {upcoming.map((goal) => {
            const pct =
              goal.targetValue > 0
                ? Math.min(((goal.currentValue || 0) / goal.targetValue) * 100, 100)
                : 0;
            return (
              <div key={goal._id}>
                <div className="flex justify-between text-sm">
                  <span className="capitalize text-ink-100 font-medium">
                    {goal.goalType.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-ink-400">
                    {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="bg-ink-700 rounded-full h-2 flex-1 overflow-hidden">
                    <div
                      className="bg-grad-volt h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-volt-500 w-10 text-right">
                    {Math.round(pct)}%
                  </span>
                </div>
                <div className="text-xs text-ink-500 mt-1">
                  {goal.currentValue || 0} / {goal.targetValue}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default UpcomingGoals;
