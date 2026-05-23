import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';

const StatTile = ({ label, value, accent = false }) => (
  <Card className="p-5">
    <div className="text-xs uppercase tracking-widest2 text-ink-400">{label}</div>
    <div className={'font-display text-4xl mt-2 ' + (accent ? 'gradient-text' : 'text-ink-100')}>
      {value ?? '—'}
    </div>
  </Card>
);

const RoleBadge = ({ role }) => (
  <span
    className={
      'chip ' + (role === 'admin' ? 'border-rose-500/40 bg-rose-500/10 text-rose-300' : '')
    }
  >
    {role || 'user'}
  </span>
);

const StatusBadge = ({ deactivated }) =>
  deactivated ? (
    <span className="chip border-ink-700 bg-ink-800 text-ink-500">Deactivated</span>
  ) : (
    <span className="chip border-emerald-500/30 bg-emerald-500/10 text-emerald-400">Active</span>
  );

const AdminDashboard = () => {
  const { user: me } = useAuth();
  const { stats, users, communities, error, updateUser, deleteUser, fetchUsers, fetchCommunities } =
    useAdmin();

  const [userQuery, setUserQuery] = useState('');
  const [communityQuery, setCommunityQuery] = useState('');

  const handleUserSearch = (e) => {
    e.preventDefault();
    fetchUsers({ search: userQuery });
  };

  const handleCommunitySearch = (e) => {
    e.preventDefault();
    fetchCommunities({ search: communityQuery });
  };

  const handleToggleDeactivated = async (u) => {
    const next = !u.isDeactivated;
    const verb = next ? 'Deactivate' : 'Reactivate';
    if (!window.confirm(`${verb} ${u.email}?`)) return;
    try {
      await updateUser(u._id, { isDeactivated: next });
    } catch (err) {
      window.alert(err.response?.data?.message || 'Update failed.');
    }
  };

  const handleToggleAdmin = async (u) => {
    const next = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Set ${u.email}'s role to ${next}?`)) return;
    try {
      await updateUser(u._id, { role: next });
    } catch (err) {
      window.alert(err.response?.data?.message || 'Role change failed.');
    }
  };

  const handleHardDelete = async (u) => {
    if (
      !window.confirm(
        `Hard-delete ${u.email}? This wipes all owned workouts, goals, routines, and communities. Cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await deleteUser(u._id);
    } catch (err) {
      window.alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const tiles = useMemo(
    () => [
      { label: 'Total users', value: stats?.totalUsers, accent: true },
      { label: 'Active (30d)', value: stats?.activeUsers },
      { label: 'Deactivated', value: stats?.deactivatedUsers },
      { label: 'Admins', value: stats?.adminUsers },
      { label: 'Communities', value: stats?.totalCommunities },
      { label: 'Workouts logged', value: stats?.totalWorkouts },
    ],
    [stats]
  );

  return (
    <AdminLayout>
      <div className="space-y-10">
        <div>
          <span className="eyebrow text-rose-300">Operations</span>
          <h1 className="headline text-4xl mt-1">Admin Dashboard</h1>
          <p className="text-ink-400 mt-2 max-w-2xl">
            Live view of all users and communities. Changes here apply immediately —
            deactivated users are signed out on their next request.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
            {error}
          </div>
        )}

        {/* KPI tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tiles.map((t) => (
            <StatTile key={t.label} {...t} />
          ))}
        </div>

        {/* Users table */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <div>
              <span className="eyebrow">People</span>
              <h2 className="headline text-2xl mt-1">Users ({users.total})</h2>
            </div>
            <form onSubmit={handleUserSearch} className="flex gap-2">
              <Input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Search by name or email"
                className="min-w-[260px]"
              />
              <Button type="submit" variant="outline" size="sm">
                Search
              </Button>
            </form>
          </div>
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
                {users.items.map((u) => {
                  const isMe = u._id === me?._id;
                  return (
                    <tr key={u._id} className="border-b border-ink-800/60 last:border-0">
                      <td className="px-4 py-3 text-ink-100 font-medium">
                        {u.name}
                        {isMe && (
                          <span className="ml-2 text-[10px] uppercase tracking-widest2 text-volt-500">
                            you
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-300">{u.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3"><StatusBadge deactivated={u.isDeactivated} /></td>
                      <td className="px-4 py-3 text-ink-500 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleToggleAdmin(u)}
                            disabled={isMe}
                            className="text-xs text-ink-400 hover:text-volt-500 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleDeactivated(u)}
                            disabled={isMe}
                            className="text-xs text-ink-400 hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {u.isDeactivated ? 'Reactivate' : 'Deactivate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHardDelete(u)}
                            disabled={isMe}
                            className="text-xs text-ink-400 hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-ink-500">
                      No users match this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </section>

        {/* Communities table */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <div>
              <span className="eyebrow">Groups</span>
              <h2 className="headline text-2xl mt-1">Communities ({communities.total})</h2>
            </div>
            <form onSubmit={handleCommunitySearch} className="flex gap-2">
              <Input
                value={communityQuery}
                onChange={(e) => setCommunityQuery(e.target.value)}
                placeholder="Search communities"
                className="min-w-[260px]"
              />
              <Button type="submit" variant="outline" size="sm">
                Search
              </Button>
            </form>
          </div>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-widest2 text-ink-400 border-b border-ink-800">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Owner</th>
                  <th className="text-left px-4 py-3">Members</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {communities.items.map((c) => (
                  <tr key={c._id} className="border-b border-ink-800/60 last:border-0 hover:bg-ink-800/40">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/communities/${c._id}`}
                        className="text-ink-100 font-medium hover:text-volt-500 underline-offset-4 hover:underline"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={'chip ' + (c.type === 'public' ? 'chip-volt' : '')}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-300">
                      {c.createdBy?.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-ink-300">{c.memberCount}</td>
                    <td className="px-4 py-3 text-ink-500 text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/admin/communities/${c._id}`}
                        className="text-xs text-ink-400 hover:text-volt-500"
                      >
                        View members →
                      </Link>
                    </td>
                  </tr>
                ))}
                {communities.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-ink-500">
                      No communities.
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

export default AdminDashboard;
