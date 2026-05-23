import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CommunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [myMembership, setMyMembership] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const { messages, send, remove, isLoading: msgsLoading, error: msgsError } = useMessages(
    myMembership?.status === 'active' ? id : null
  );

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get(`/communities/${id}`);
        if (!alive) return;
        setCommunity(res.data?.data?.community || null);
        setMyMembership(res.data?.data?.myMembership || null);
      } catch (err) {
        if (alive) setLoadError(err.response?.data?.message || 'Failed to load community.');
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // Auto-scroll to the latest message — but only if the user was already
  // near the bottom. If they scrolled up to read history, don't yank them.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 120) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      await send(draft);
      setDraft('');
    } catch (err) {
      // surfaced via the hook's error state on next refetch
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await remove(m._id);
    } catch (err) {
      window.alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  // Mirror the backend canDeleteMessage policy so the UI hides the Delete
  // button when it would just 403. Three cases: author / community owner /
  // platform admin.
  const canDelete = (m) => {
    if (m.deletedAt) return false;
    const mine = m.userId?._id === user?._id;
    const owner = community?.createdBy?._id === user?._id || community?.createdBy === user?._id;
    const admin = user?.role === 'admin';
    return mine || owner || admin;
  };

  if (loadError) {
    return (
      <div>
        <Link to="/dashboard/community" className="text-xs uppercase tracking-widest2 text-ink-400 hover:text-volt-500">
          ← All communities
        </Link>
        <div className="mt-4 rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
          {loadError}
        </div>
      </div>
    );
  }
  if (!community) {
    return <div className="text-ink-400">Loading community…</div>;
  }

  const isActiveMember = myMembership?.status === 'active';
  const isPending = myMembership?.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Header */}
          <div>
            <Link
              to="/dashboard/community"
              className="text-xs uppercase tracking-widest2 text-ink-400 hover:text-volt-500"
            >
              ← All communities
            </Link>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Community</span>
                <h1 className="headline text-4xl mt-1">{community.name}</h1>
                {community.description && (
                  <p className="text-ink-300 mt-2 max-w-2xl">{community.description}</p>
                )}
                <p className="text-xs text-ink-500 mt-2">
                  {community.memberCount} member{community.memberCount === 1 ? '' : 's'}
                  {' · '}
                  <span className={community.type === 'public' ? 'text-volt-500' : 'text-ink-400'}>
                    {community.type}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Chat panel */}
          {!isActiveMember ? (
            <Card className="p-8 text-center">
              <p className="text-ink-300">
                {isPending
                  ? 'Your join request is pending approval. Chat will open once an admin accepts you.'
                  : 'Join this community to read and post in chat.'}
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate('/dashboard/community')}
              >
                Back to communities
              </Button>
            </Card>
          ) : (
            <Card className="overflow-hidden flex flex-col" style={{ height: '70vh' }}>
              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-ink-950/60"
              >
                {msgsError && (
                  <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
                    {msgsError}
                  </div>
                )}
                {msgsLoading && messages.length === 0 ? (
                  <div className="text-center text-ink-500 py-8">Loading messages…</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-ink-500 py-8">
                    No messages yet. Be the first to post.
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.userId?._id === user?._id;
                    const isDeleted = !!m.deletedAt;
                    return (
                      <div key={m._id} className="group flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="h-7 w-7 rounded-full bg-ink-700 text-ink-300 flex items-center justify-center text-xs font-semibold">
                            {(m.userId?.name || '?').slice(0, 1).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 text-sm">
                            <span className={'font-medium ' + (mine ? 'text-volt-500' : 'text-ink-100')}>
                              {m.userId?.name || 'Unknown'}
                            </span>
                            {m.userId?.role === 'admin' && (
                              <span className="text-[10px] uppercase tracking-widest2 text-rose-300">admin</span>
                            )}
                            <span className="text-xs text-ink-500">{formatTime(m.createdAt)}</span>
                          </div>
                          {isDeleted ? (
                            <p className="text-sm italic text-ink-500">message deleted</p>
                          ) : (
                            <p className="text-sm text-ink-200 break-words whitespace-pre-wrap">
                              {m.content}
                            </p>
                          )}
                        </div>
                        {canDelete(m) && (
                          <button
                            type="button"
                            onClick={() => handleDelete(m)}
                            className="opacity-0 group-hover:opacity-100 text-xs text-ink-500 hover:text-rose-400 self-start mt-1 transition-opacity"
                            title="Delete this message"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSend} className="border-t border-ink-800 p-3 flex gap-2 bg-ink-900/60">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  maxLength={2000}
                  className="ink-input flex-1"
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !draft.trim()}>
                  {sending ? '…' : 'Send'}
                </Button>
              </form>
            </Card>
          )}
    </div>
  );
};

export default CommunityDetail;
