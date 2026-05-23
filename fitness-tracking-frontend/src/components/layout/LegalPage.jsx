import { useEffect } from 'react';
import PublicLayout from './PublicLayout';

const LegalPage = ({ eyebrow, title, intro, lastUpdated, sections }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <PublicLayout>
      {/* Header banner */}
      <section className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 bg-grad-volt-soft" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="headline text-4xl sm:text-6xl mt-3 leading-tight">{title}</h1>
          {intro && <p className="text-ink-300 mt-4 max-w-3xl">{intro}</p>}
          {lastUpdated && (
            <p className="text-xs uppercase tracking-widest2 text-ink-500 mt-4">
              Last updated · {lastUpdated}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[220px_1fr] gap-10">
        {/* TOC */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs uppercase tracking-widest2 text-ink-500 mb-3">On this page</p>
          <nav className="space-y-1 text-sm">
            {sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-ink-400 hover:text-volt-500 transition-colors"
              >
                <span className="text-ink-600 mr-2">{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Body */}
        <article className="space-y-10 text-ink-200 leading-relaxed">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-display text-3xl gradient-text">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="headline text-2xl text-ink-100">{s.title}</h2>
              </div>
              <div className="space-y-3 text-ink-300">{s.body}</div>
            </section>
          ))}
        </article>
      </div>
    </PublicLayout>
  );
};

export default LegalPage;
