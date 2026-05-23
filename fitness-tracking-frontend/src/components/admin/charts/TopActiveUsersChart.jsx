import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import ChartCard, { palette, tooltipStyle } from './ChartCard';

// Horizontal bar of the most-active users by accumulated session time.
// Vertical bars would force a tiny label area; horizontal lets long names
// breathe. We sort the data we render so the longest bar is on top.
const TopActiveUsersChart = ({ data = [] }) => {
  const sorted = [...data]
    .sort((a, b) => (b.totalMinutes || 0) - (a.totalMinutes || 0))
    .map((u) => ({
      ...u,
      // Recharts uses `name` as the category label; this also lets us
      // truncate gracefully without losing the full name in tooltips.
      name: u.name && u.name.length > 22 ? `${u.name.slice(0, 21)}…` : u.name,
      fullName: u.name,
    }));

  return (
    <ChartCard
      kicker="Top 10"
      title="Most active users (lifetime)"
      subtitle="Total minutes across all sessions"
      isEmpty={sorted.length === 0}
      emptyText="No session data yet. Have a user sign in and use the app."
      height={Math.max(220, sorted.length * 32 + 40)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
        >
          <XAxis
            type="number"
            stroke={palette.ink500}
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}m`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            stroke={palette.ink400}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            {...tooltipStyle}
            formatter={(v, _k, ctx) => [
              `${v} minutes · ${ctx?.payload?.sessions || 0} sessions`,
              ctx?.payload?.fullName || ctx?.payload?.name,
            ]}
            labelFormatter={() => ''}
          />
          <Bar dataKey="totalMinutes" radius={[0, 6, 6, 0]}>
            {sorted.map((u) => (
              <Cell
                key={u.userId}
                fill={u.role === 'admin' ? palette.rose : palette.volt}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default TopActiveUsersChart;
