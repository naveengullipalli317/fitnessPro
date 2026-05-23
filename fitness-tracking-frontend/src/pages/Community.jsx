import { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import SectionHeader from '../components/ui/SectionHeader';
import { useCommunities } from '../hooks/useCommunities';
import { useAuth } from '../hooks/useAuth';
import { images } from '../utils/images';

const Community = () => {
  const { user } = useAuth();
  // We fetch BOTH scopes so the tab switch is instant — these are cheap reads.
  // Each tab's hook keeps its own loading state.
  const mine = useCommunities('mine');
  const explore = useCommunities('explore');

  const [tab, setTab] = useState('mine');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', type: 'public', bannerUrl: '' });

  const visible = tab === 'mine' ? mine.communities : explore.communities;
  const activeError = tab === 'mine' ? mine.error : explore.error;
  const activeLoading = tab === 'mine' ? mine.isLoading : explore.isLoading;

  const resetForm = () =>
    setForm({ name: '', description: '', type: 'public', bannerUrl: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      // Strip empty optional fields so backend Joi defaults apply cleanly.
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
      };
      if (form.bannerUrl.trim()) payload.bannerUrl = form.bannerUrl.trim();
      await mine.createCommunity(payload);
      explore.refetch();
      setShowForm(false);
      resetForm();
      setTab('mine');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create community.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (community) => {
    try {
      await explore.joinCommunity(community._id);
      mine.refetch();
    } catch (err) {
      // surface via per-tab error
    }
  };

  const handleLeave = async (community) => {
    if (!window.confirm(`Leave "${community.name}"?`)) return;
    try {
      await mine.leaveCommunity(community._id);
      explore.refetch();
    } catch (_) {
      /* shown via hook */
    }
  };

  const handleDelete = async (community) => {
    if (!window.confirm(`Delete "${community.name}"? This removes all memberships.`)) return;
    try {
      await mine.deleteCommunity(community._id);
      explore.refetch();
    } catch (_) {
      /* shown via hook */
    }
  };

  const renderCard = (c) => {
    const isOwner = (c.createdBy?._id || c.createdBy) === user?._id;
    return (
      <Card
        key={c._id}
        data-testid="community-card"
        data-community-name={c.name}
        className="p-6 hover:shadow-glow transition-shadow flex flex-col"
      >
        {c.bannerUrl ? (
          <div className="mb-4 -mx-6 -mt-6 h-32 overflow-hidden rounded-t-lg">
            <img
              src={c.bannerUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        ) : null}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <span className="eyebrow">{c.memberCount} {c.memberCount === 1 ? 'member' : 'members'}</span>
            <h4 className="headline text-2xl mt-1 break-words">{c.name}</h4>
            {c.description && (
              <p className="text-sm text-ink-300 mt-2 line-clamp-3">{c.description}</p>
            )}
            {!isOwner && c.createdBy?.name && (
              <p className="text-xs text-ink-500 mt-2">by {c.createdBy.name}</p>
            )}
          </div>
          <span className={'chip ' + (c.type === 'public' ? 'chip-volt' : '')}>
            {c.type === 'public' ? 'Public' : 'Private'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          {tab === 'mine' ? (
            isOwner ? (
              <button
                type="button"
                onClick={() => handleDelete(c)}
                className="text-xs text-ink-500 hover:text-rose-400"
              >
                ✕ Delete
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleLeave(c)}
                className="text-xs text-ink-500 hover:text-rose-400"
              >
                Leave
              </button>
            )
          ) : (
            <Button size="sm" onClick={() => handleJoin(c)}>
              {c.type === 'public' ? 'Join' : 'Request to join'}
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-ink-700">
        <img src={images.dashboard} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative p-8 sm:p-10 flex flex-wrap justify-between items-end gap-4">
          <div>
            <span className="eyebrow">Stronger together</span>
            <h2 className="headline text-4xl sm:text-5xl mt-2">Communities</h2>
            <p className="text-ink-300 mt-2 max-w-xl">
              Train alongside athletes who share your goals. Join a public crew, or build your own.
            </p>
          </div>
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '＋ Create Community'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-ink-800">
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={
            'relative px-4 py-3 text-sm font-semibold uppercase tracking-widest2 transition-colors ' +
            (tab === 'mine' ? 'text-volt-500' : 'text-ink-400 hover:text-ink-200')
          }
        >
          My Communities ({mine.communities.length})
          {tab === 'mine' && (
            <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-grad-volt rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab('explore')}
          className={
            'relative px-4 py-3 text-sm font-semibold uppercase tracking-widest2 transition-colors ' +
            (tab === 'explore' ? 'text-volt-500' : 'text-ink-400 hover:text-ink-200')
          }
        >
          Explore ({explore.communities.length})
          {tab === 'explore' && (
            <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-grad-volt rounded-full" />
          )}
        </button>
      </div>

      {activeError && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
          {activeError}
        </div>
      )}

      {showForm && (
        <Card className="p-6">
          <SectionHeader eyebrow="New community" title="Create a community" />
          <form onSubmit={handleCreate} className="space-y-4 mt-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Community Name
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Iron Athletes"
                minLength={2}
                maxLength={60}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="ink-input min-h-[88px] resize-y"
                rows={3}
                maxLength={1000}
                placeholder="What's this community about?"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Banner Image URL <span className="text-ink-500 normal-case tracking-normal">(optional)</span>
              </label>
              <Input
                type="url"
                value={form.bannerUrl}
                onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                Community Type
              </label>
              <div className="flex gap-3">
                {['public', 'private'].map((t) => (
                  <label
                    key={t}
                    className={
                      'flex-1 cursor-pointer rounded-lg border px-4 py-3 text-sm flex items-center gap-3 transition-colors ' +
                      (form.type === t
                        ? 'border-volt-500 bg-volt-500/10 text-ink-100'
                        : 'border-ink-700 text-ink-300 hover:border-ink-600')
                    }
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={form.type === t}
                      onChange={() => setForm({ ...form, type: t })}
                      className="accent-volt-500"
                    />
                    <div>
                      <div className="font-semibold capitalize">{t}</div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        {t === 'public'
                          ? 'Anyone can find and join.'
                          : 'Approval required to join.'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {formError && <p className="text-rose-400 text-sm">{formError}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={submitting || !form.name.trim()}>
              {submitting ? 'Creating…' : 'Create Community'}
            </Button>
          </form>
        </Card>
      )}

      {activeLoading && visible.length === 0 ? (
        <div className="text-center py-12 text-ink-400">Loading communities…</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-16 text-ink-400 border border-dashed border-ink-700 rounded-xl">
          {tab === 'mine'
            ? "You haven't joined any communities yet. Try exploring public ones."
            : 'No public communities to explore yet — be the first to create one.'}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">{visible.map(renderCard)}</div>
      )}
    </div>
  );
};

export default Community;
