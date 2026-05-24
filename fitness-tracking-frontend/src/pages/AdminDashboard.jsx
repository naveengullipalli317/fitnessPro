import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import AdminLayout from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';

import SignupsChart from '../components/admin/charts/SignupsChart';
import ActiveUsersChart from '../components/admin/charts/ActiveUsersChart';
import TopActiveUsersChart from '../components/admin/charts/TopActiveUsersChart';
import CommunitiesChart from '../components/admin/charts/CommunitiesChart';
import WorkoutsChart from '../components/admin/charts/WorkoutsChart';
import RolesDonut from '../components/admin/charts/RolesDonut';

// Tiny inline sparkline for KPI tiles — embeds a 30-day series at thumbnail
// size. Recharts handles the responsive layout; we keep the chart visually
// minimal (no axes, no grid) so the KPI number remains the focal point.
const Sparkline = ({ data, accent = '#f97316' }) => {
  if (!data || data.length === 0) return null;
  return (
    <div className="h-10 -mx-1 mt-3 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={`spark-${accent.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.45} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={accent}
            strokeWidth={1.5}
            fill={`url(#spark-${accent.replace('#', '')})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatTile = ({ label, value, sub, accent = '#f97316', sparklineData }) => (
  <Card className="p-5 relative overflow-hidden">
    {/* Soft accent gradient in the top-right corner — gives each tile a subtle
        sense of identity without a heavy coloured border. */}
    <div
      className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none"
      style={{ background: accent }}
    />
    <div className="relative">
      <div className="text-xs uppercase tracking-widest2 text-ink-400">{label}</div>
      <div className="font-display text-4xl mt-2 text-ink-100">
        {value ?? '—'}
      </div>
      {sub && <div className="text-xs text-ink-500 mt-1">{sub}</div>}
      {sparklineData && <Sparkline data={sparklineData} accent={accent} />}
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

const formatRelative = (date) => {
  if (!date) return '—';
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 5) return 'just now';
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return date.toLocaleTimeString();
};

const AdminDashboard = () => {
  const { user: me } = useAuth();
  const {
    stats, users, communities, analytics, lastFetchedAt,
    error, updateUser, deleteUser, fetchUsers, fetchCommunities, fetchAnalytics,
  } = useAdmin();

  const [userQuery, setUserQuery] = useState('');
  const [communityQuery, setCommunityQuery] = useState('');

  const handleUserSearch = (e) => { e.preventDefault(); fetchUsers({ search: userQuery }); };
  const handleCommunitySearch = (e) => { e.preventDefault(); fetchCommunities({ search: communityQuery }); };

  const handleToggleDeactivated = async (u) => {
    const next = !u.isDeactivated;
    if (!window.confirm(`${next ? 'Deactivate' : 'Reactivate'} ${u.email}?`)) return;
    try { await updateUser(u._id, { isDeactivated: next }); }
    catch (err) { window.alert(err.response?.data?.message || 'Update failed.'); }
  };
  const handleToggleAdmin = async (u) => {
    const next = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Set ${u.email}'s role to ${next}?`)) return;
    try { await updateUser(u._id, { role: next }); }
    catch (err) { window.alert(err.response?.data?.message || 'Role change failed.'); }
  };
  const handleHardDelete = async (u) => {
    if (!window.confirm(`Hard-delete ${u.email}? This wipes all owned workouts, goals, routines, and communities. Cannot be undone.`)) return;
    try { await deleteUser(u._id); }
    catch (err) { window.alert(err.response?.data?.message || 'Delete failed.'); }
  };

  // KPI tiles. Each carries a sparkline of the matching 30-day series
  // when we have one; static tiles render without.
  const tiles = useMemo(() => [
    { label: 'Total users',     value: stats?.totalUsers,        accent: '#f97316', sparklineData: analytics?.signups },
    { label: 'Active (30d)',    value: stats?.activeUsers,       accent: '#34d399', sparklineData: analytics?.activeUsers },
    { label: 'Deactivated',     value: stats?.deactivatedUsers,  accent: '#737373' },
    { label: 'Admins',          value: stats?.adminUsers,        accent: '#fb7185' },
    { label: 'Communities',     value: stats?.totalCommunities,  accent: '#fbbf24', sparklineData: analytics?.communities?.growth },
    { label: 'Workouts logged', value: stats?.totalWorkouts,     accent: '#f97316', sparklineData: analytics?.workouts },
  ], [stats, analytics]);

  return (
    <AdminLayout>
      <div className="space-y-10">
        {/* Hero */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-rose-300">Operations</span>
            <h1 className="headline text-4xl mt-1">Admin Dashboard</h1>
            <p className="text-ink-400 mt-2 max-w-2xl">
              Live view of all users, communities, and activity. Changes apply
              immediately — deactivated users are signed out on their next request.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-widest2 text-ink-500">Last refreshed</div>
              <div className="text-xs text-ink-300">{formatRelative(lastFetchedAt)}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { fetchUsers(); fetchCommunities(); fetchAnalytics(); }}
            >
              ↻ Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
            {error}
          </div>
        )}

        {/* KPI tiles with sparklines */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {tiles.map((t) => <StatTile key={t.label} {...t} />)}
          </div>
        </section>

        {/* Charts — three rows of 2 columns each */}
        <section className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Insights</span>
              <h2 className="headline text-2xl mt-1">Analytics</h2>
            </div>
            <p className="text-xs text-ink-500">All series cover the last 30 days unless noted.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <SignupsChart data={analytics?.signups || []} />
            <ActiveUsersChart data={analytics?.activeUsers || []} />
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <WorkoutsChart data={analytics?.workouts || []} />
            <RolesDonut data={analytics?.roles || []} />
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <TopActiveUsersChart data={analytics?.topActive || []} />
            <CommunitiesChart data={analytics?.communities || { growth: [], sizes: [] }} />
          </div>
        </section>

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
              <Button type="submit" variant="outline" size="sm">Search</Button>
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
                        {isMe && (<span className="ml-2 text-[10px] uppercase tracking-widest2 text-volt-500">you</span>)}
                      </td>
                      <td className="px-4 py-3 text-ink-300">{u.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-4 py-3"><StatusBadge deactivated={u.isDeactivated} /></td>
                      <td className="px-4 py-3 text-ink-500 text-xs">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => handleToggleAdmin(u)} disabled={isMe}
                            className="text-xs text-ink-400 hover:text-volt-500 disabled:opacity-40 disabled:cursor-not-allowed">
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button type="button" onClick={() => handleToggleDeactivated(u)} disabled={isMe}
                            className="text-xs text-ink-400 hover:text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed">
                            {u.isDeactivated ? 'Reactivate' : 'Deactivate'}
                          </button>
                          <button type="button" onClick={() => handleHardDelete(u)} disabled={isMe}
                            className="text-xs text-ink-400 hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.items.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-500">No users match this search.</td></tr>
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
              <Button type="submit" variant="outline" size="sm">Search</Button>
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
                      <Link to={`/admin/communities/${c._id}`}
                        className="text-ink-100 font-medium hover:text-volt-500 underline-offset-4 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={'chip ' + (c.type === 'public' ? 'chip-volt' : '')}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-300">{c.createdBy?.email || '—'}</td>
                    <td className="px-4 py-3 text-ink-300">{c.memberCount}</td>
                    <td className="px-4 py-3 text-ink-500 text-xs">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/communities/${c._id}`} className="text-xs text-ink-400 hover:text-volt-500">
                        View members →
                      </Link>
                    </td>
                  </tr>
                ))}
                {communities.items.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-500">No communities.</td></tr>
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
