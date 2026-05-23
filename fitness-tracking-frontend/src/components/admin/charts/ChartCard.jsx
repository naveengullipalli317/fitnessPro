// Visual wrapper for an analytics card. Keeps every chart consistent —
// same border, padding, header structure, empty-state messaging.
// Children render inside a fixed-height ResponsiveContainer area below
// the header so chart libraries can do their layout math.

const ChartCard = ({ title, subtitle, kicker, height = 260, isEmpty, emptyText, action, children }) => {
  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 backdrop-blur p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          {kicker && <span className="eyebrow">{kicker}</span>}
          <h3 className="headline text-xl mt-1 text-ink-100">{title}</h3>
          {subtitle && <p className="text-xs text-ink-500 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div style={{ height }} className="-mx-2">
        {isEmpty ? (
          <div className="h-full flex items-center justify-center text-ink-500 text-sm">
            {emptyText || 'No data yet.'}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// Shared palette pulled from tailwind.config.js so charts match the app.
export const palette = {
  volt: '#f97316',
  voltSoft: 'rgba(249,115,22,0.22)',
  rose: '#fb7185',
  emerald: '#34d399',
  amber: '#fbbf24',
  ink600: '#404040',
  ink500: '#737373',
  ink400: '#a3a3a3',
  ink800: '#171717',
  grid: 'rgba(64,64,64,0.4)',
};

// Tooltip styling shared by all charts — matches the dark surfaces.
export const tooltipStyle = {
  contentStyle: {
    background: '#171717',
    border: '1px solid #404040',
    borderRadius: 8,
    fontSize: 12,
    color: '#fafafa',
  },
  labelStyle: { color: '#a3a3a3', fontSize: 11, marginBottom: 4 },
  itemStyle: { color: '#fafafa' },
  cursor: { stroke: 'rgba(249,115,22,0.5)', strokeWidth: 1 },
};

export default ChartCard;
