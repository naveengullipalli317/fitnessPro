import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="hidden md:block lg:w-64">
      <div className="flex h-full flex-col">
        {/* Sidebar Brand */}
        <div className="flex-shrink-0 flex items-center px-4 py-4 border-b">
          <Link to="/" className="text-xl font-semibold text-primary-600">
            NeverGiveUp
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-2 space-y-1 flex-1 overflow-y-auto">
          <Link
            to="/dashboard"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            to="/workouts"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium"
          >
            Workouts
          </Link>
          <Link
            to="/exercises"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium"
          >
            Exercises
          </Link>
          <Link
            to="/goals"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium"
          >
            Goals
          </Link>
          <Link
            to="/routines"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium"
          >
            Routines
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 flex items-center px-4 py-4 border-t">
          {/* User info would go here when authenticated */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary-200">
              {/* User avatar placeholder */}
            </div>
            <div className="text-sm font-medium">User</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;