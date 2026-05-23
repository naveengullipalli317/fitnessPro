import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import ChartCard, { palette, tooltipStyle } from './ChartCard';

// DAU line chart. We use a line not an area here because DAU is naturally
// noisy and a fill would visually inflate a few quiet days into a "trough".
// Dotted reference average line gives a sense of the centre.
const ActiveUsersChart = ({ data = [] }) => {
  const avg =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.value, 0) / data.length)
      : 0;
  const peak = data.reduce((m, d) => Math.max(m, d.value), 0);
  return (
    <ChartCard
      kicker="Engagement"
      title="Daily Active Users (30 days)"
      subtitle={`avg ${avg} / day · peak ${peak}`}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 12, left: -12, bottom: 4 }}>
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
          <Tooltip {...tooltipStyle} formatter={(v) => [v, 'active users']} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={palette.emerald}
            strokeWidth={2.5}
            dot={{ r: 2.5, stroke: palette.emerald, strokeWidth: 1, fill: palette.ink800 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default ActiveUsersChart;
