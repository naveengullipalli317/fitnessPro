const Input = ({
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseClasses =
    'flex h-11 w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-volt-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors';

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      {...props}
    />
  );
};

export { Input };
export default Input;
