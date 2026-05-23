import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useWorkouts } from '../hooks/useWorkouts';
import { useGoals } from '../hooks/useGoals';
import { useAuth } from '../hooks/useAuth';
import { useMissedWorkouts } from '../hooks/useMissedWorkouts';
import WorkoutStats from '../components/features/WorkoutStats';
import ProgressCharts from '../components/features/ProgressCharts';
import RecentWorkouts from '../components/features/RecentWorkouts';
import UpcomingGoals from '../components/features/UpcomingGoals';
import { images } from '../utils/images';

const DashboardHome = () => {
  const { user } = useAuth();
  const { workouts, isLoading: workoutsLoading } = useWorkouts();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { missed, count: missedCount, dismissAll } = useMissedWorkouts();

  if (workoutsLoading || goalsLoading) {
    return <div className="text-center py-12 text-ink-400">Loading your training data…</div>;
  }

  return (
    <div className="space-y-10">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-700">
        <img src={images.dashboard} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative p-8 sm:p-10">
          <span className="eyebrow">Welcome back</span>
          <h2 className="headline text-4xl sm:text-5xl mt-2">
            Hey {user?.name?.split(' ')[0] || 'Athlete'}, <span className="gradient-text">let's move.</span>
          </h2>
          <p className="text-ink-300 mt-2 max-w-xl">
            Your training snapshot. Stay consistent — the data tells the truth.
          </p>
        </div>
      </div>

      {/* Missed-workouts banner */}
      {missedCount > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 flex flex-wrap items-center gap-4">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-300 text-xl">
            ⚠
          </span>
          <div className="flex-1 min-w-[200px]">
            <p className="text-ink-100 font-semibold">
              You missed {missedCount} session{missedCount === 1 ? '' : 's'} this week.
            </p>
            <p className="text-sm text-ink-400 mt-0.5">
              Most recent: <span className="capitalize text-ink-200">{missed[0]?.type}</span> on{' '}
              {missed[0]?.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              {' '}— from <span className="text-ink-200">{missed[0]?.routineName}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/calendar"
              className="text-sm font-semibold uppercase tracking-wider text-volt-500 hover:text-volt-400"
            >
              View calendar →
            </Link>
            <button
              type="button"
              onClick={dismissAll}
              className="text-sm text-ink-400 hover:text-ink-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <WorkoutStats workouts={workouts || []} />

      {/* Detailed cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ProgressCharts workouts={workouts || []} />
        <RecentWorkouts workouts={(workouts || []).slice(0, 5)} />
        <UpcomingGoals goals={goals || []} />
      </div>
    </div>
  );
};

const Dashboard = () => {
  const location = useLocation();
  const isIndex = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  return (
    <div className="min-h-screen flex flex-col bg-ink-950">
      <Header />
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {isIndex ? <DashboardHome /> : <Outlet />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
