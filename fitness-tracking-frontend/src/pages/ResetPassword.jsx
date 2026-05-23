import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import PasswordStrength, { evaluatePassword } from '../components/ui/PasswordStrength';
import { images } from '../utils/images';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => evaluatePassword(password), [password]);
  const passwordsMatch = confirm.length === 0 || password === confirm;
  // Token format guard: backend Joi requires 64-hex; pre-validate so users
  // who land here from a mangled URL get a useful message instead of "Validation error".
  const tokenLooksValid = /^[a-f0-9]{64}$/i.test(token);
  const canSubmit =
    tokenLooksValid && strength.valid && password === confirm && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      // Pause so the user reads the success state, then bounce to login.
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. Try requesting a new link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-950">
      <div className="relative hidden lg:block">
        <img src={images.authLifting} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-side" />
        <div className="relative h-full flex flex-col justify-between p-10 text-ink-100">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 px-2 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">NG</span>
            <span className="headline text-xl tracking-wider">NeverGiveUp</span>
          </Link>
          <div className="max-w-md">
            <span className="eyebrow">Almost back</span>
            <h2 className="headline text-5xl mt-2 leading-tight">
              Pick a new <span className="gradient-text">password.</span>
            </h2>
            <p className="text-ink-300 mt-4">
              Make it long, mix in letters and numbers. The meter on the right is honest, not flattering.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 px-2 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">NG</span>
              <span className="headline text-xl tracking-wider">NeverGiveUp</span>
            </Link>
          </div>
          <span className="eyebrow">Reset password</span>
          <h1 className="headline text-4xl mt-1 mb-8">Set a new password</h1>

          {!tokenLooksValid && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2 mb-5">
              This reset link is malformed or incomplete.{' '}
              <Link to="/forgot-password" className="underline font-semibold">
                Request a new one
              </Link>
              .
            </div>
          )}

          {success ? (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm px-4 py-3">
              Password reset. Redirecting to sign in…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  New password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoFocus
                />
              </div>
              <PasswordStrength password={password} />
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Confirm password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  aria-invalid={!passwordsMatch}
                />
                {!passwordsMatch && (
                  <p className="mt-1 text-xs text-rose-400">Passwords don't match.</p>
                )}
              </div>
              {error && (
                <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={!canSubmit}>
                {loading ? 'Resetting…' : 'Reset password'}
              </Button>
            </form>
          )}

          <p className="mt-8 text-sm text-ink-400 text-center">
            <Link to="/login" className="text-volt-500 font-semibold hover:text-volt-400">
              ← Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
