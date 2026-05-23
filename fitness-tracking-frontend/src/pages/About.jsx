import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import HeroSection from '../components/ui/HeroSection';
import SectionHeader from '../components/ui/SectionHeader';
import { images } from '../utils/images';

const values = [
  {
    title: 'Discipline',
    body: 'We build tools for the days you don\'t feel like training. The grind matters most when nobody\'s watching.',
  },
  {
    title: 'Honesty',
    body: 'Real numbers, not vanity stats. We surface the data that actually moves the needle on your performance.',
  },
  {
    title: 'Inclusivity',
    body: 'Beginner to elite, bodyweight to barbell. Every athlete starts somewhere — we meet you where you are.',
  },
  {
    title: 'Community',
    body: 'Routines and progress are better shared. Train alongside athletes pushing in the same direction.',
  },
];

const milestones = [
  { year: '2023', label: 'Founded', detail: 'Built by athletes who were tired of clunky training apps.' },
  { year: '2024', label: '50K users', detail: 'Crossed fifty thousand active athletes in our first year.' },
  { year: '2025', label: 'Coach mode', detail: 'Launched shared routines and the public training library.' },
  { year: '2026', label: 'Global', detail: 'Now training athletes in 60+ countries — and growing.' },
];

const About = () => (
  <PublicLayout>
    <HeroSection
      image={images.heroAthlete}
      eyebrow="About NeverGiveUp"
      title={
        <>
          Built by athletes.
          <br />
          <span className="gradient-text">For athletes.</span>
        </>
      }
      subtitle="We started NeverGiveUp because the tools meant to track our training kept getting in the way of it. Less friction, more reps."
    />

    {/* Mission statement */}
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <span className="eyebrow">Our mission</span>
      <h2 className="headline text-4xl sm:text-5xl mt-3 leading-tight">
        Make consistency <span className="gradient-text">inevitable.</span>
      </h2>
      <p className="text-ink-300 text-lg mt-6 leading-relaxed">
        Most people don't fail because they lack a program. They fail because the program lives
        somewhere — a spreadsheet, a notebook, an app that buries the one number that matters under
        twelve they don't. We build the opposite. A training tool you actually open before the set,
        not as homework after.
      </p>
      <p className="text-ink-400 mt-4 leading-relaxed">
        Whether you're chasing your first pull-up or your tenth personal best, NeverGiveUp keeps
        your training honest, your progress visible, and your next session one tap away.
      </p>
    </section>

    {/* Stats strip over photo */}
    <section className="relative overflow-hidden">
      <img src={images.heroBarbell} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-grad-overlay" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '120K+', label: 'Active Athletes' },
            { value: '2.4M', label: 'Workouts Logged' },
            { value: '60+', label: 'Countries' },
            { value: '4.9★', label: 'User Rating' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display text-5xl sm:text-6xl gradient-text leading-none">{s.value}</div>
              <div className="mt-2 text-xs uppercase tracking-widest2 text-ink-300">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <SectionHeader eyebrow="What we stand for" title="The principles behind the product." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-10">
        {values.map((v) => (
          <div
            key={v.title}
            className="ink-card p-6 hover:border-volt-500/40 transition-colors"
          >
            <h3 className="headline text-2xl">{v.title}</h3>
            <p className="text-ink-300 text-sm mt-3 leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Timeline */}
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <SectionHeader eyebrow="The journey" title="How we got here." />
      <ol className="mt-10 space-y-6 border-l border-ink-700 pl-6">
        {milestones.map((m) => (
          <li key={m.year} className="relative">
            <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-volt-500 ring-4 ring-ink-950" />
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl gradient-text">{m.year}</span>
              <span className="text-ink-100 font-semibold uppercase tracking-wider">{m.label}</span>
            </div>
            <p className="text-ink-400 mt-1">{m.detail}</p>
          </li>
        ))}
      </ol>
    </section>

    {/* CTA */}
    <section className="relative overflow-hidden">
      <img src={images.heroRunner} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-grad-overlay" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <span className="eyebrow">Join the movement</span>
        <h2 className="headline text-4xl sm:text-6xl mt-3 mb-4">
          Train alongside <span className="gradient-text">120,000 athletes.</span>
        </h2>
        <p className="text-ink-300 max-w-xl mx-auto mb-8">
          Free forever. No credit card. Bring your discipline — we'll bring the tools.
        </p>
        <Link to="/register" className="btn-volt text-base">
          Start training free →
        </Link>
      </div>
    </section>
  </PublicLayout>
);

export default About;
