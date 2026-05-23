const Badge = ({ variant = 'secondary', children, className = '', ...props }) => {
  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide';
  const variantClasses = {
    default: 'bg-volt-500 text-ink-950',
    primary: 'bg-volt-500 text-ink-950',
    secondary: 'bg-ink-700 text-ink-200 border border-ink-700',
    destructive: 'bg-rose-600 text-white',
    outline: 'border border-ink-700 text-ink-300',
    success: 'bg-lime-500/15 text-lime-400 border border-lime-500/30',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.secondary} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
export default Badge;
