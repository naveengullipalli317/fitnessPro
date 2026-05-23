import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import ChartCard, { palette, tooltipStyle } from './ChartCard';

// Area chart — daily new user signups for the last N days. Smooth fill so
// growth shape reads at a glance. Empty days are explicitly zero (the
// backend fills gaps in fillDailySeries).
const SignupsChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard
      kicker="Growth"
      title="Signups (30 days)"
      subtitle={`${total} new account${total === 1 ? '' : 's'} in the window`}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 12, left: -12, bottom: 4 }}>
          <defs>
            <linearGradient id="grad-signups" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.volt} stopOpacity={0.55} />
              <stop offset="95%" stopColor={palette.volt} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={palette.grid} vertical={false} />
          <XAxis
            dataKey="date"
            stroke={palette.ink500}
            fontSize={10}
            tickFormatter={(d) => d.slice(5)} /* MM-DD */
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
          <Tooltip {...tooltipStyle} formatter={(v) => [v, 'signups']} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={palette.volt}
            strokeWidth={2}
            fill="url(#grad-signups)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default SignupsChart;
