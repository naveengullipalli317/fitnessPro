import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from './NotificationBell';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/workouts', label: 'Workouts' },
  { to: '/dashboard/calendar', label: 'Calendar' },
  { to: '/dashboard/exercises', label: 'Exercises' },
  { to: '/dashboard/goals', label: 'Goals' },
  { to: '/dashboard/routines', label: 'Routines' },
  { to: '/dashboard/community', label: 'Community' },
  { to: '/dashboard/profile', label: 'Profile' },
];

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Logged-in users should stay inside the app when clicking the logo;
  // anonymous users go to the marketing home page.
  const logoTarget = user ? '/dashboard' : '/';

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <header className="sticky top-0 z-30 bg-ink-950/80 backdrop-blur border-b border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          <Link to={logoTarget} className="flex items-center gap-2 shrink-0">
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
                {/* Vertical divider so the greeting and the action button
                    don't visually merge into one line of gray text. */}
                <span aria-hidden="true" className="hidden md:inline h-5 w-px bg-ink-700" />
                <button
                  type="button"
                  onClick={logout}
                  className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-ink-700 px-3 py-1.5 text-sm font-medium text-ink-300 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/5 transition-colors"
                  title="Sign out"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline text-sm font-semibold uppercase tracking-wider text-ink-300 hover:text-volt-500"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline btn-volt text-sm py-2"
                >
                  Join Free
                </Link>
              </>
            )}

            {/* Hamburger — visible only below md */}
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md text-ink-200 hover:text-volt-500 hover:bg-ink-800/60 transition-colors"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drop-down panel */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-ink-800 bg-ink-950/95 backdrop-blur"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col">
            {user && (
              <div className="px-2 pb-3 mb-2 border-b border-ink-800 text-sm text-ink-400">
                Hi, <span className="text-ink-100 font-medium">{user.name}</span>
              </div>
            )}

            {user &&
              navLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    'px-2 py-3 text-sm font-medium uppercase tracking-wider rounded-md transition-colors ' +
                    (isActive
                      ? 'text-volt-500 bg-ink-800/40'
                      : 'text-ink-300 hover:text-ink-100 hover:bg-ink-800/40')
                  }
                >
                  {l.label}
                </NavLink>
              ))}

            <div className="mt-2 pt-3 border-t border-ink-800 flex flex-col gap-2">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-left px-2 py-3 text-sm font-medium text-ink-300 hover:text-rose-400 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-2 py-3 text-sm font-semibold uppercase tracking-wider text-ink-300 hover:text-volt-500"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-volt text-sm py-2 text-center">
                    Join Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
