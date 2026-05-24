import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import ChartCard, { palette, tooltipStyle } from './ChartCard';

// Composed chart: daily community creations (bars) over the period.
// A second panel below shows the top communities by member count.
const CommunitiesChart = ({ data = { growth: [], sizes: [] } }) => {
  const { growth = [], sizes = [] } = data;
  const total = growth.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5">
      <ChartCard
        kicker="Communities"
        title={`New communities (30 days)`}
        subtitle={`${total} created in the window`}
        isEmpty={growth.length === 0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={growth} margin={{ top: 4, right: 12, left: -12, bottom: 4 }}>
            <defs>
              <linearGradient id="grad-communities" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.amber} stopOpacity={0.4} />
                <stop offset="95%" stopColor={palette.amber} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={palette.grid} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={palette.ink500}
              fontSize={10}
              tickFormatter={(d) => d.slice(5)}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={palette.ink500}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip {...tooltipStyle} formatter={(v) => [v, 'new']} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={palette.amber}
              strokeWidth={1.5}
              fill="url(#grad-communities)"
            />
            <Bar dataKey="value" barSize={6} fill={palette.amber} radius={[3, 3, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        kicker="Member count"
        title="Top communities by members"
        subtitle="Largest first; public in volt, private in rose"
        isEmpty={sizes.length === 0}
        height={Math.max(180, sizes.length * 28 + 40)}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={sizes}
            layout="vertical"
            margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
          >
            <XAxis
              type="number"
              stroke={palette.ink500}
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
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
                `${v} member${v === 1 ? '' : 's'} (${ctx?.payload?.type})`,
                ctx?.payload?.name,
              ]}
              labelFormatter={() => ''}
            />
            <Bar dataKey="members" radius={[0, 6, 6, 0]}>
              {sizes.map((c, i) => (
                <Cell
                  key={i}
                  fill={c.type === 'public' ? palette.volt : palette.rose}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default CommunitiesChart;
