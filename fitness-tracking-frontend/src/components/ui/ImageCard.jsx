const ImageCard = ({
  image,
  title,
  subtitle,
  badge,
  onClick,
  children,
  height = 'h-56',
}) => {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group relative ${height} w-full overflow-hidden rounded-xl border border-ink-700 text-left
        transition-transform duration-300 hover:-translate-y-1 hover:shadow-glow`}
    >
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-grad-overlay" />
      {badge && (
        <span className="absolute top-3 right-3 chip chip-volt backdrop-blur">{badge}</span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4">
        {title && (
          <h3 className="headline text-2xl text-ink-100 leading-tight">{title}</h3>
        )}
        {subtitle && <p className="text-sm text-ink-300 mt-1">{subtitle}</p>}
        {children}
      </div>
    </Wrapper>
  );
};

export default ImageCard;
