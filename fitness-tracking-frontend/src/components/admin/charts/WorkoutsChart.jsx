import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import ChartCard, { palette, tooltipStyle } from './ChartCard';

// Daily workouts-logged bar chart. Bars (not area) because each day's value
// is independent — area would imply continuity that isn't there. Today
// gets a highlighted bar so you see "where are we so far today".
const WorkoutsChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  const todayKey = data[data.length - 1]?.date;

  return (
    <ChartCard
      kicker="Activity"
      title="Workouts logged (30 days)"
      subtitle={`${total} workout${total === 1 ? '' : 's'} logged in the window`}
      isEmpty={data.length === 0}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 12, left: -12, bottom: 4 }}>
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
          <Tooltip {...tooltipStyle} formatter={(v) => [v, 'workouts']} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.date} fill={d.date === todayKey ? palette.volt : palette.voltSoft} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default WorkoutsChart;
