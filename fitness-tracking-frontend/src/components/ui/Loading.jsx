const Loading = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 bg-ink-950">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-ink-800" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-volt-500 animate-spin" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-widest2 text-ink-400">Loading…</p>
    </div>
  );
};

export default Loading;
