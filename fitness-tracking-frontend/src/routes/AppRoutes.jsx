import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/ui/Loading';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';

const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const About = lazy(() => import('../pages/About'));
const Privacy = lazy(() => import('../pages/Privacy'));
const Terms = lazy(() => import('../pages/Terms'));
const Contact = lazy(() => import('../pages/Contact'));
const Onboarding = lazy(() => import('../pages/Onboarding'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Workouts = lazy(() => import('../pages/Workouts'));
const Calendar = lazy(() => import('../pages/Calendar'));
const ExerciseLibrary = lazy(() => import('../pages/ExerciseLibrary'));
const Goals = lazy(() => import('../pages/Goals'));
const Routines = lazy(() => import('../pages/Routines'));
const Community = lazy(() => import('../pages/Community'));
const CommunityDetail = lazy(() => import('../pages/CommunityDetail'));
const Profile = lazy(() => import('../pages/Profile'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const AdminCommunityDetail = lazy(() => import('../pages/AdminCommunityDetail'));

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/onboarding"
            element={
              <PrivateRoute>
                <Onboarding />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            <Route path="workouts" element={<Workouts />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="exercises" element={<ExerciseLibrary />} />
            <Route path="goals" element={<Goals />} />
            <Route path="routines" element={<Routines />} />
            <Route path="community" element={<Community />} />
            <Route path="community/:id" element={<CommunityDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/communities/:id"
            element={
              <AdminRoute>
                <AdminCommunityDetail />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
