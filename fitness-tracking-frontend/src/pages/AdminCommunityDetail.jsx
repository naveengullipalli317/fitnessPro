import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../utils/api';
import AdminLayout from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';

const RoleChip = ({ role }) => (
  <span
    className={
      'chip ' +
      (role === 'owner'
        ? 'border-volt-500/40 bg-volt-500/10 text-volt-300'
        : role === 'admin'
        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
        : '')
    }
  >
    {role}
  </span>
);

const StatusChip = ({ status }) => {
  const map = {
    active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    blocked: 'border-ink-700 bg-ink-800 text-ink-500',
  };
  return <span className={'chip ' + (map[status] || '')}>{status}</span>;
};

const AdminCommunityDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/communities/${id}`);
      setData(res.data?.data || null);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load community.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleKick = async (m) => {
    if (!window.confirm(`Remove ${m.userId?.name || m.userId?.email} from this community?`)) return;
    try {
      await api.delete(`/admin/communities/${id}/members/${m.userId._id}`);
      await reload();
    } catch (err) {
      window.alert(err.response?.data?.message || 'Kick failed.');
    }
  };

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-ink-400">Loading community…</div>
      </AdminLayout>
    );
  }
  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Link to="/admin" className="text-xs uppercase tracking-widest2 text-ink-400 hover:text-volt-500">
            ← Operations Console
          </Link>
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
            {error}
          </div>
        </div>
      </AdminLayout>
    );
  }
  if (!data) return null;

  const { community, members } = data;
  const activeCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <Link to="/admin" className="text-xs uppercase tracking-widest2 text-ink-400 hover:text-volt-500">
            ← Operations Console
          </Link>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow text-rose-300">Community</span>
              <h1 className="headline text-4xl mt-1">{community.name}</h1>
              {community.description && (
                <p className="text-ink-300 mt-2 max-w-2xl">{community.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={'chip ' + (community.type === 'public' ? 'chip-volt' : '')}>
                {community.type}
              </span>
            </div>
          </div>
        </div>

        {/* Meta tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-xs uppercase tracking-widest2 text-ink-400">Owner</div>
            <div className="mt-1 text-ink-100 font-medium">{community.createdBy?.name || '—'}</div>
            <div className="text-xs text-ink-500">{community.createdBy?.email || ''}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase tracking-widest2 text-ink-400">Active members</div>
            <div className="mt-1 font-display text-3xl text-ink-100">{activeCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase tracking-widest2 text-ink-400">Pending requests</div>
            <div className="mt-1 font-display text-3xl text-ink-100">{pendingCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs uppercase tracking-widest2 text-ink-400">Created</div>
            <div className="mt-1 text-ink-100">
              {community.createdAt ? new Date(community.createdAt).toLocaleDateString() : '—'}
            </div>
          </Card>
        </div>

        {/* Members table */}
        <section>
          <h2 className="headline text-2xl mb-3">Members</h2>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest2 text-ink-400 border-b border-ink-800">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const u = m.userId;
                  const isOwner = m.role === 'owner';
                  return (
                    <tr key={m._id} className="border-b border-ink-800/60 last:border-0">
                      <td className="px-4 py-3 text-ink-100 font-medium">
                        {u?.name || <span className="text-ink-500">deleted user</span>}
                        {u?.isDeactivated && (
                          <span className="ml-2 text-[10px] uppercase tracking-widest2 text-amber-400">
                            deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-300">{u?.email || '—'}</td>
                      <td className="px-4 py-3"><RoleChip role={m.role} /></td>
                      <td className="px-4 py-3"><StatusChip status={m.status} /></td>
                      <td className="px-4 py-3 text-ink-500 text-xs">
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleKick(m)}
                          disabled={isOwner}
                          title={isOwner ? 'Owners cannot be kicked — delete the community to remove them.' : 'Remove this member'}
                          className="text-xs text-ink-400 hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {isOwner ? 'Owner' : 'Kick'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-ink-500">
                      No members yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminCommunityDetail;
