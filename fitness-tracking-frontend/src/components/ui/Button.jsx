const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md text-sm font-semibold tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-950 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-volt-500 text-ink-950 hover:bg-volt-400 focus:ring-volt-500 shadow-glow',
    secondary:
      'bg-ink-800 text-ink-100 border border-ink-700 hover:bg-ink-700 hover:border-volt-500/40 focus:ring-volt-500',
    destructive:
      'bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500',
    outline:
      'border border-ink-700 text-ink-100 hover:bg-ink-800 hover:border-volt-500/40 focus:ring-volt-500',
    ghost: 'text-ink-300 hover:text-ink-100 hover:bg-ink-800',
    link: 'text-volt-500 underline-offset-4 hover:underline hover:text-volt-400',
  };

  const sizeClasses = {
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-5 py-2',
    lg: 'h-12 px-8 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
export default Button;
