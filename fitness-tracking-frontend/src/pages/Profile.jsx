import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import SectionHeader from '../components/ui/SectionHeader';
import api from '../utils/api';
import { images } from '../utils/images';

const Profile = () => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [profile, setProfile] = useState(user);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || '',
    height: user?.height || '',
    weight: user?.weight || '',
    fitnessLevel: user?.fitnessLevel || 'beginner',
  });

  if (!user) {
    return <div className="text-center py-12 text-ink-400">Please log in to view your profile.</div>;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        fitnessLevel: formData.fitnessLevel,
      };
      if (formData.age !== '') payload.age = parseInt(formData.age, 10);
      if (formData.gender) payload.gender = formData.gender;
      if (formData.height !== '') payload.height = parseFloat(formData.height);
      if (formData.weight !== '') payload.weight = parseFloat(formData.weight);

      const res = await api.put('/auth/profile', payload);
      setProfile(res.data?.data || profile);
      setStatus({ kind: 'success', message: 'Profile updated' });
      setEditing(false);
    } catch (err) {
      setStatus({ kind: 'error', message: err.response?.data?.message || 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const display = profile || user;
  const initial = (display.name || '?').charAt(0).toUpperCase();

  return (
    <div className="space-y-8">
      {/* Cover + identity */}
      <div className="relative">
        <div className="relative h-56 overflow-hidden rounded-2xl border border-ink-700">
          <img src={images.profileCover} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-grad-overlay" />
        </div>
        <div className="px-6 flex flex-wrap items-end gap-5 -mt-12 relative">
          <div className="h-24 w-24 rounded-2xl bg-grad-volt border-4 border-ink-950 flex items-center justify-center font-display text-5xl text-ink-950 shrink-0 shadow-glow">
            {initial}
          </div>
          <div className="flex-1 min-w-0 pb-2">
            <span className="eyebrow">Athlete profile</span>
            <h2 className="headline text-3xl sm:text-4xl mt-1 truncate">{display.name}</h2>
            <p className="text-ink-400 text-sm truncate">{display.email}</p>
          </div>
          <div className="flex gap-2 pb-2">
            <Button variant="secondary" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
            <Button variant="destructive" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {status && (
        <div
          className={
            'rounded-md p-3 text-sm border ' +
            (status.kind === 'success'
              ? 'bg-lime-500/10 border-lime-500/30 text-lime-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300')
          }
        >
          {status.message}
        </div>
      )}

      {editing ? (
        <Card className="p-6">
          <SectionHeader eyebrow="Update" title="Edit profile" />
          <form className="space-y-4 mt-6" onSubmit={handleSave}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">Age</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  min={13}
                  max={120}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="ink-input"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">Height (cm)</label>
                <Input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  min={50}
                  max={300}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">Weight (kg)</label>
                <Input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  min={20}
                  max={500}
                  step="0.1"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">Fitness Level</label>
              <select
                value={formData.fitnessLevel}
                onChange={(e) => setFormData({ ...formData, fitnessLevel: e.target.value })}
                className="ink-input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <SectionHeader eyebrow="Account" title="Identity" />
            <dl className="mt-6 divide-y divide-ink-800 text-sm">
              {[
                ['Name', display.name],
                ['Email', display.email],
                // Show '—' when createdAt is missing rather than calling
                // Date.now() during render (an impure call that the strict
                // react-hooks/purity rule flags as a re-render hazard).
                ['Member Since', display.createdAt ? new Date(display.createdAt).toLocaleDateString() : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3">
                  <dt className="text-ink-400">{k}</dt>
                  <dd className="text-ink-100 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-6">
            <SectionHeader eyebrow="Stats" title="Fitness" />
            <dl className="mt-6 divide-y divide-ink-800 text-sm">
              {[
                ['Age', display.age || 'Not set'],
                [
                  'Gender',
                  display.gender === 'prefer_not_to_say' ? 'Prefer not to say' : display.gender || 'Not set',
                ],
                ['Height', display.height ? `${display.height} cm` : 'Not set'],
                ['Weight', display.weight ? `${display.weight} kg` : 'Not set'],
                ['Fitness Level', display.fitnessLevel || 'beginner'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-3">
                  <dt className="text-ink-400">{k}</dt>
                  <dd className="text-ink-100 font-medium capitalize">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;
