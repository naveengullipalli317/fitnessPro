import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { images } from '../utils/images';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Branch on HTTP status, but keep the "wrong email vs wrong password"
      // distinction intentionally ambiguous to avoid account enumeration.
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;
      if (status === 401 || status === 400) {
        setError('Email or password is incorrect. Please try again.');
      } else if (status === 429) {
        setError('Too many sign-in attempts. Please wait a few minutes and try again.');
      } else if (status >= 500) {
        setError("We can't reach the server right now. Please try again shortly.");
      } else if (!err.response) {
        setError('Network error. Check your connection and try again.');
      } else {
        setError(serverMessage || 'Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-950">
      {/* Photo side */}
      <div className="relative hidden lg:block">
        <img src={images.authLifting} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-side" />
        <div className="relative h-full flex flex-col justify-between p-10 text-ink-100">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 px-2 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">
              NG
            </span>
            <span className="headline text-xl tracking-wider">NeverGiveUp</span>
          </Link>
          <div className="max-w-md">
            <span className="eyebrow">Welcome back</span>
            <h2 className="headline text-5xl mt-2 leading-tight">
              The grind <span className="gradient-text">remembers.</span>
            </h2>
            <p className="text-ink-300 mt-4">
              Every session you log today is the strength you'll have tomorrow. Pick up where you left off.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 px-2 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">NG</span>
              <span className="headline text-xl tracking-wider">NeverGiveUp</span>
            </Link>
          </div>
          <span className="eyebrow">Sign in</span>
          <h1 className="headline text-4xl mt-1 mb-8">Let's get back to work.</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
                required
                aria-invalid={!!error}
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs uppercase tracking-widest2 text-ink-500 hover:text-volt-500"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                required
                aria-invalid={!!error}
              />
            </div>
            {error && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </Button>
          </form>

          <p className="mt-8 text-sm text-ink-400 text-center">
            New here?{' '}
            <Link to="/register" className="text-volt-500 font-semibold hover:text-volt-400">
              Create a free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
