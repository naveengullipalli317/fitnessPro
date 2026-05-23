const HeroSection = ({
  image,
  eyebrow,
  title,
  subtitle,
  children,
  height = 'h-[78vh]',
  overlay = 'bg-grad-overlay',
  align = 'center',
}) => {
  const alignClasses =
    align === 'left' ? 'items-end text-left' : 'items-center text-center';
  return (
    <section className={`relative w-full ${height} overflow-hidden`}>
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover scale-105"
        loading="eager"
      />
      <div className={`absolute inset-0 ${overlay}`} />
      <div
        className={`relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 ${alignClasses}`}
      >
        <div className={align === 'left' ? '' : 'mx-auto max-w-3xl'}>
          {eyebrow && <span className="eyebrow mb-3">{eyebrow}</span>}
          {title && (
            <h1 className="headline text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-4">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-ink-300 text-lg sm:text-xl max-w-2xl mb-6">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
