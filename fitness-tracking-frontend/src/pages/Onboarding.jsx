import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../utils/api';
import { images } from '../utils/images';

const TOTAL_STEPS = 3;

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitnessLevel: 'beginner',
  });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const buildPayload = () => {
    const payload = { fitnessLevel: form.fitnessLevel };
    if (form.age !== '') payload.age = parseInt(form.age, 10);
    if (form.gender) payload.gender = form.gender;
    if (form.height !== '') payload.height = parseFloat(form.height);
    if (form.weight !== '') payload.weight = parseFloat(form.weight);
    return payload;
  };

  const finish = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await api.put('/auth/profile', buildPayload());
      const updated = res.data?.data;
      if (updated) updateUser(updated);
      navigate('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(data?.errors?.[0] || data?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = (e) => {
    e?.preventDefault();
    setError('');

    if (step === 1) {
      // age required at step 1
      if (form.age !== '') {
        const a = parseInt(form.age, 10);
        if (Number.isNaN(a) || a < 13 || a > 120) {
          setError('Please enter an age between 13 and 120.');
          return;
        }
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (form.height !== '') {
        const h = parseFloat(form.height);
        if (Number.isNaN(h) || h < 50 || h > 300) {
          setError('Height must be between 50 and 300 cm.');
          return;
        }
      }
      if (form.weight !== '') {
        const w = parseFloat(form.weight);
        if (Number.isNaN(w) || w < 20 || w > 500) {
          setError('Weight must be between 20 and 500 kg.');
          return;
        }
      }
      setStep(3);
      return;
    }
    finish();
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const firstName = user?.name?.split(' ')[0] || 'Athlete';

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-950">
      {/* Photo / motivation panel */}
      <div className="relative hidden lg:block">
        <img src={images.heroAthlete} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-side" />
        <div className="relative h-full flex flex-col justify-between p-10 text-ink-100">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 px-2 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">
              NG
            </span>
            <span className="headline text-xl tracking-wider">NeverGiveUp</span>
          </Link>
          <div className="max-w-md">
            <span className="eyebrow">Step {step} of {TOTAL_STEPS}</span>
            <h2 className="headline text-5xl mt-2 leading-tight">
              Tell us about <span className="gradient-text">you.</span>
            </h2>
            <p className="text-ink-300 mt-4">
              A few quick details so we can tailor your training, calorie estimates, and progress charts.
              You can change any of this later in your profile.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <span className="inline-flex h-9 px-2 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">NG</span>
              <span className="headline text-xl tracking-wider">NeverGiveUp</span>
            </Link>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const n = i + 1;
              const active = step >= n;
              return (
                <div key={n} className="flex-1 flex items-center gap-2">
                  <div
                    className={
                      'h-1.5 flex-1 rounded-full transition-colors ' +
                      (active ? 'bg-grad-volt' : 'bg-ink-800')
                    }
                  />
                </div>
              );
            })}
          </div>

          <span className="eyebrow">Step {step} / {TOTAL_STEPS}</span>
          <h1 className="headline text-3xl sm:text-4xl mt-1 mb-2">
            {step === 1 && <>Welcome aboard, {firstName}.</>}
            {step === 2 && <>Body metrics.</>}
            {step === 3 && <>Pick your level.</>}
          </h1>
          <p className="text-ink-400 text-sm mb-8">
            {step === 1 && 'A bit about you. All fields optional, but the more we know the smarter your stats.'}
            {step === 2 && 'Used to estimate calories and personalise workouts.'}
            {step === 3 && 'Sets the difficulty baseline for routine recommendations.'}
          </p>

          <form onSubmit={handleNext} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                    Age
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 28"
                    value={form.age}
                    onChange={(e) => set({ age: e.target.value })}
                    min={13}
                    max={120}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'male', label: 'Male' },
                      { v: 'female', label: 'Female' },
                      { v: 'other', label: 'Other' },
                      { v: 'prefer_not_to_say', label: 'Prefer not to say' },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        type="button"
                        onClick={() => set({ gender: opt.v })}
                        className={
                          'rounded-md border px-3 py-2.5 text-sm font-medium transition-colors text-left ' +
                          (form.gender === opt.v
                            ? 'border-volt-500 bg-volt-500/10 text-ink-100'
                            : 'border-ink-700 bg-ink-900 text-ink-300 hover:border-ink-600')
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                    Height (cm)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 175"
                    value={form.height}
                    onChange={(e) => set({ height: e.target.value })}
                    min={50}
                    max={300}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                    Weight (kg)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 72.5"
                    value={form.weight}
                    onChange={(e) => set({ weight: e.target.value })}
                    min={20}
                    max={500}
                    step="0.1"
                  />
                </div>
              </>
            )}

            {step === 3 && (
              <div>
                <label className="mb-3 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Fitness level
                </label>
                <div className="space-y-2">
                  {[
                    { v: 'beginner', title: 'Beginner', sub: 'Just getting started or returning after a break' },
                    { v: 'intermediate', title: 'Intermediate', sub: 'Consistent training for several months' },
                    { v: 'advanced', title: 'Advanced', sub: 'Years of structured training' },
                  ].map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => set({ fitnessLevel: opt.v })}
                      className={
                        'w-full rounded-md border px-4 py-3 text-left transition-colors ' +
                        (form.fitnessLevel === opt.v
                          ? 'border-volt-500 bg-volt-500/10'
                          : 'border-ink-700 bg-ink-900 hover:border-ink-600')
                      }
                    >
                      <div className="font-semibold text-ink-100">{opt.title}</div>
                      <div className="text-xs text-ink-400 mt-0.5">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-ink-400 hover:text-ink-100"
                  >
                    ← Back
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-sm text-ink-400 hover:text-ink-100"
                >
                  Skip for now
                </button>
                <Button type="submit" size="lg" disabled={saving}>
                  {saving
                    ? 'Saving…'
                    : step < TOTAL_STEPS
                    ? 'Continue →'
                    : 'Save & Start Training →'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
