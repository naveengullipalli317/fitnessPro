import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import PasswordStrength, { evaluatePassword } from '../components/ui/PasswordStrength';
import { images } from '../utils/images';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = evaluatePassword(password);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;
  const canSubmit = name.trim() && email.trim() && strength.valid && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!strength.valid) {
      setError('Your password does not meet the minimum requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({ name, email, password });
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-950">
      <div className="flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 px-2 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">NG</span>
              <span className="headline text-xl tracking-wider">NeverGiveUp</span>
            </Link>
          </div>
          <span className="eyebrow">Get started</span>
          <h1 className="headline text-4xl mt-1 mb-8">Claim your strongest year.</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Full name
              </label>
              <Input
                type="text"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  aria-describedby="password-strength"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Confirm
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  aria-invalid={!passwordsMatch}
                />
                {!passwordsMatch && (
                  <p className="mt-1 text-xs text-rose-400">Passwords don't match.</p>
                )}
              </div>
            </div>
            <div id="password-strength">
              <PasswordStrength password={password} />
            </div>
            {error && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading || !canSubmit}>
              {loading ? 'Creating account...' : 'Create my account →'}
            </Button>
          </form>

          <p className="mt-8 text-sm text-ink-400 text-center">
            Already on the platform?{' '}
            <Link to="/login" className="text-volt-500 font-semibold hover:text-volt-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Photo side */}
      <div className="relative hidden lg:block order-1 lg:order-2">
        <img src={images.heroRunner} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative h-full flex flex-col justify-between p-10 text-ink-100">
          <div className="self-end">
            <Link to="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 px-2 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">NG</span>
              <span className="headline text-xl tracking-wider">NeverGiveUp</span>
            </Link>
          </div>
          <div className="max-w-md">
            <span className="eyebrow">Join free</span>
            <h2 className="headline text-5xl mt-2 leading-tight">
              Discipline <span className="gradient-text">equals freedom.</span>
            </h2>
            <p className="text-ink-300 mt-4">
              Start logging in under 60 seconds. No credit card. Just commitment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
