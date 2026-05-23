const Card = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`rounded-xl border border-ink-700 bg-ink-800/80 text-ink-100 backdrop-blur shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card };
export default Card;
