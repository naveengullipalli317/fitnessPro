import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import ChartCard, { palette, tooltipStyle } from './ChartCard';

// Donut chart for role distribution. A pie of two slices feels off; a
// donut with the total in the centre lets people see both the proportion
// AND the absolute number. innerRadius leaves the hole; label in centre
// is rendered as overlaid HTML rather than fighting recharts' label API.
const RolesDonut = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  const ordered = ['admin', 'user'].map((role) => {
    const found = data.find((d) => d.role === role);
    return { role, count: found ? found.count : 0 };
  });
  const colorFor = (role) => (role === 'admin' ? palette.rose : palette.volt);

  return (
    <ChartCard
      kicker="Composition"
      title="User roles"
      subtitle={`${total} total user${total === 1 ? '' : 's'}`}
      isEmpty={total === 0}
      height={240}
    >
      <div className="relative h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={ordered}
              dataKey="count"
              nameKey="role"
              innerRadius={56}
              outerRadius={86}
              paddingAngle={2}
              stroke="none"
            >
              {ordered.map((entry) => (
                <Cell key={entry.role} fill={colorFor(entry.role)} />
              ))}
            </Pie>
            <Tooltip
              {...tooltipStyle}
              formatter={(v, role) => [`${v} (${total ? Math.round((v / total) * 100) : 0}%)`, role]}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: palette.ink400 }}
              formatter={(value) => (
                <span style={{ color: palette.ink400, textTransform: 'capitalize' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Centre label — overlaid because recharts' built-in label API is
            fiddly for "total in the middle of a donut" rendering. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -mt-6">
          <div className="font-display text-3xl text-ink-100 leading-none">{total}</div>
          <div className="text-[10px] uppercase tracking-widest2 text-ink-500 mt-1">Users</div>
        </div>
      </div>
    </ChartCard>
  );
};

export default RolesDonut;
