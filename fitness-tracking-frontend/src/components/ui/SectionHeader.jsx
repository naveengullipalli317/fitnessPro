const SectionHeader = ({ eyebrow, title, action, align = 'left' }) => {
  return (
    <div
      className={`flex flex-wrap items-end gap-4 ${align === 'center' ? 'justify-center text-center' : 'justify-between'}`}
    >
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {title && (
          <h2 className="headline text-3xl sm:text-4xl mt-1 leading-tight">{title}</h2>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export default SectionHeader;
