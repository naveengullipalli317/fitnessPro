import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { images } from '../utils/images';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  // Dev-only: backend returns _devToken when NODE_ENV !== 'production' so
  // we can show a clickable link inline. Stripped automatically in prod.
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setDevToken(res.data?._devToken || null);
    } catch (_) {
      // Server-side anti-enumeration means even errors are swallowed into
      // the generic success path, but defensive catch keeps the UI sane.
    } finally {
      setLoading(false);
      setSubmitted(true);
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
            <span className="eyebrow">Locked out?</span>
            <h2 className="headline text-5xl mt-2 leading-tight">
              We'll get you <span className="gradient-text">back to it.</span>
            </h2>
            <p className="text-ink-300 mt-4">
              Enter your email and we'll send a reset link. It expires in 30 minutes — use it once and you're back.
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
          <h1 className="headline text-4xl mt-1 mb-8">Forgot your password?</h1>

          {!submitted ? (
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
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={loading || !email.trim()}>
                {loading ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-ink-700 bg-ink-800/60 text-ink-200 text-sm px-4 py-3">
                If an account exists for <span className="font-medium text-ink-100">{email}</span>, a reset link has been sent. Check your inbox (and spam folder) and use it within 30 minutes.
              </div>
              {devToken && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs px-4 py-3 space-y-2">
                  <div className="font-semibold uppercase tracking-widest2">Dev mode — email not configured</div>
                  <div>
                    Reset link:{' '}
                    <Link
                      to={`/reset-password?token=${devToken}`}
                      className="underline text-amber-100 break-all"
                    >
                      /reset-password?token={devToken.slice(0, 20)}…
                    </Link>
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Link to="/login" className="text-sm text-volt-500 hover:text-volt-400 font-semibold">
                  ← Back to sign in
                </Link>
              </div>
            </div>
          )}

          <p className="mt-8 text-sm text-ink-400 text-center">
            Remembered it?{' '}
            <Link to="/login" className="text-volt-500 font-semibold hover:text-volt-400">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
