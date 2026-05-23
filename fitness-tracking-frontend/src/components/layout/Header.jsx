import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/workouts', label: 'Workouts' },
  { to: '/dashboard/calendar', label: 'Calendar' },
  { to: '/dashboard/exercises', label: 'Exercises' },
  { to: '/dashboard/goals', label: 'Goals' },
  { to: '/dashboard/routines', label: 'Routines' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-ink-950/80 backdrop-blur border-b border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="inline-flex h-8 px-1.5 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">
              NG
            </span>
            <span className="headline text-xl tracking-wider">NeverGiveUp</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  'relative px-3 py-2 text-sm font-medium uppercase tracking-wider transition-colors ' +
                  (isActive
                    ? 'text-volt-500'
                    : 'text-ink-300 hover:text-ink-100')
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {isActive && (
                      <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-grad-volt rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <>
                <NotificationBell />
                <span className="hidden sm:inline text-sm text-ink-400">
                  Hi, <span className="text-ink-100 font-medium">{user.name}</span>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-sm font-medium text-ink-300 hover:text-rose-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold uppercase tracking-wider text-ink-300 hover:text-volt-500"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-volt text-sm py-2"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
