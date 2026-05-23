import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Deliberately visually distinct from the user-facing Header so admins never
// forget which mode they're in. Dark slate header, red accent for the badge,
// "Back to app" link is the only way back into /dashboard.
const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-ink-950">
      <header className="sticky top-0 z-30 bg-rose-950/40 backdrop-blur border-b border-rose-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 gap-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-7 px-2 items-center justify-center rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-widest2">
                Admin
              </span>
              <span className="text-ink-200 text-sm font-medium">Operations Console</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden sm:inline text-xs uppercase tracking-widest2 text-ink-400 hover:text-volt-500"
              >
                ← Back to app
              </Link>
              <span className="hidden md:inline text-sm text-ink-400">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="text-xs uppercase tracking-widest2 text-ink-300 hover:text-rose-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
