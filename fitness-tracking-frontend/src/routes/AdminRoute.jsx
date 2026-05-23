import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/ui/Loading';

// Same shape as PrivateRoute, but requires role==='admin'. Non-admins are
// bounced to the dashboard (not /login) — they're authenticated, just not
// authorised. Sending them to /login would be misleading and trigger a
// re-login loop.
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;
