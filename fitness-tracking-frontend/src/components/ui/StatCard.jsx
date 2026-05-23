const StatCard = ({ label, value, unit, accent = 'volt', icon }) => {
  const accentRing =
    accent === 'lime'
      ? 'ring-lime-500/30 from-lime-500/20'
      : 'ring-volt-500/30 from-volt-500/20';
  return (
    <div
      className={`relative ink-card p-5 ring-1 ${accentRing} bg-gradient-to-br to-transparent overflow-hidden`}
    >
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-grad-volt opacity-10 blur-2xl" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-widest2 text-ink-400">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl text-ink-100 leading-none">{value}</span>
        {unit && <span className="text-sm text-ink-400 uppercase tracking-wider">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;
