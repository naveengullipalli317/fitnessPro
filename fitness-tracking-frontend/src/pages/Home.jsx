import { Link } from 'react-router-dom';
import HeroSection from '../components/ui/HeroSection';
import ImageCard from '../components/ui/ImageCard';
import SectionHeader from '../components/ui/SectionHeader';
import { images } from '../utils/images';

const features = [
  { title: 'Workout Tracking', subtitle: 'Log every rep, set, and session', image: images.strength, badge: 'Logging' },
  { title: 'Goal Setting', subtitle: 'Crush targets, not excuses', image: images.goal, badge: 'Goals' },
  { title: 'Exercise Library', subtitle: 'Hundreds of moves, explained', image: images.back, badge: 'Library' },
  { title: 'Smart Routines', subtitle: 'Structured plans that scale', image: images.routine, badge: 'Routines' },
  { title: 'Progress Analytics', subtitle: 'See the work compound', image: images.cardio, badge: 'Analytics' },
  { title: 'Built To Compete', subtitle: 'Join a community that grinds', image: images.hiit, badge: 'Community' },
];

const stats = [
  { value: '120K+', label: 'Active Athletes' },
  { value: '2.4M', label: 'Workouts Logged' },
  { value: '98%', label: 'Stay Consistent' },
  { value: '4.9★', label: 'User Rating' },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection
        image={images.heroAthlete}
        eyebrow="No shortcuts. Only reps."
        title={
          <>
            Train hard.
            <br />
            <span className="gradient-text">Track everything.</span>
          </>
        }
        subtitle="The fitness platform built for athletes who refuse to plateau. Log workouts, hit goals, and turn data into discipline."
      >
        <div className="flex flex-col sm:flex-row gap-3 mt-2 justify-center">
          <Link to="/register" className="btn-volt text-base">
            Start Training Free →
          </Link>
          <Link to="/login" className="btn-ghost text-base">
            I have an account
          </Link>
        </div>
      </HeroSection>

      {/* Stat strip */}
      <section className="relative -mt-12 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ink-card p-6 shadow-2xl">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-4xl sm:text-5xl gradient-text leading-none">
                  {s.value}
                </div>
                <div className="mt-2 text-xs uppercase tracking-widest2 text-ink-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <SectionHeader
          eyebrow="Built for the work"
          title="Everything you need. Nothing you don't."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          {features.map((f) => (
            <ImageCard
              key={f.title}
              image={f.image}
              title={f.title}
              subtitle={f.subtitle}
              badge={f.badge}
              height="h-64"
            />
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden">
        <img
          src={images.heroBarbell}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <span className="eyebrow">Your move</span>
          <h2 className="headline text-4xl sm:text-6xl mt-2 mb-4">
            The body you want <span className="gradient-text">starts today.</span>
          </h2>
          <p className="text-ink-300 max-w-xl mx-auto mb-8">
            Free forever. No credit card. Just commit.
          </p>
          <Link to="/register" className="btn-volt text-base">
            Create your free account →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
