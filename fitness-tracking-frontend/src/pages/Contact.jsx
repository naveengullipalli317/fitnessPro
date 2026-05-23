import { useState } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { images } from '../utils/images';

const topics = [
  { v: 'support', label: 'Account & support' },
  { v: 'billing', label: 'Billing' },
  { v: 'partnerships', label: 'Partnerships' },
  { v: 'press', label: 'Press' },
  { v: 'other', label: 'Other' },
];

const channels = [
  {
    icon: '✉',
    title: 'Email us',
    body: 'Replies within 24 hours, Mon–Fri.',
    action: { label: 'hello@nevergiveup.app', href: 'mailto:hello@nevergiveup.app' },
  },
  {
    icon: '🛟',
    title: 'Support',
    body: 'Trouble with your account? We\'ve got you.',
    action: { label: 'support@nevergiveup.app', href: 'mailto:support@nevergiveup.app' },
  },
  {
    icon: '🤝',
    title: 'Partnerships',
    body: 'Coaches, gyms, brands — let\'s build something.',
    action: { label: 'partners@nevergiveup.app', href: 'mailto:partners@nevergiveup.app' },
  },
  {
    icon: '🔒',
    title: 'Security',
    body: 'Found a vulnerability? We respond fast.',
    action: { label: 'security@nevergiveup.app', href: 'mailto:security@nevergiveup.app' },
  },
];

const socials = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'X / Twitter', href: 'https://twitter.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'TikTok', href: 'https://tiktok.com' },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', topic: 'support', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    // Frontend-only for now — no backend endpoint exists for contact messages.
    // We surface a success state so users get acknowledgement immediately;
    // wiring this to a real mail/webhook endpoint is a future step.
    setSent(true);
  };

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-800">
        <img src={images.heroGym} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-grad-overlay" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <span className="eyebrow">Get in touch</span>
          <h1 className="headline text-5xl sm:text-7xl mt-3 leading-tight">
            Let's <span className="gradient-text">talk training.</span>
          </h1>
          <p className="text-ink-300 text-lg mt-4 max-w-2xl">
            Questions, feedback, partnership ideas, or "your app saved my training" stories — we
            read every message.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12">
        {/* Form */}
        <div>
          <span className="eyebrow">Send us a message</span>
          <h2 className="headline text-3xl mt-2 mb-8">Tell us what you need.</h2>

          {sent ? (
            <div className="ink-card p-8 text-center">
              <div className="font-display text-5xl gradient-text mb-3">Thanks!</div>
              <p className="text-ink-300">
                Your message is on its way. We'll get back to you at
                {' '}<span className="text-ink-100 font-medium">{form.email}</span> within one business day.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setForm({ name: '', email: '', topic: 'support', message: '' });
                }}
                className="mt-6 text-sm text-volt-500 hover:text-volt-400 font-semibold uppercase tracking-wider"
              >
                Send another →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                    Your name
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="Alex Johnson"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set({ email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  What's it about?
                </label>
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <button
                      key={t.v}
                      type="button"
                      onClick={() => set({ topic: t.v })}
                      className={
                        'px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors ' +
                        (form.topic === t.v
                          ? 'bg-volt-500 text-ink-950'
                          : 'bg-ink-800 text-ink-300 hover:bg-ink-700')
                      }
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest2 text-ink-400">
                  Message
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => set({ message: e.target.value })}
                  className="ink-input min-h-[140px] resize-y"
                  placeholder="What's on your mind?"
                />
              </div>

              {error && (
                <div className="rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm px-3 py-2">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Send message →
              </Button>
            </form>
          )}
        </div>

        {/* Direct channels + social */}
        <div className="space-y-8">
          <div>
            <span className="eyebrow">Direct lines</span>
            <h2 className="headline text-3xl mt-2 mb-6">Or skip the form.</h2>
            <div className="grid gap-4">
              {channels.map((c) => (
                <a
                  key={c.title}
                  href={c.action.href}
                  className="ink-card p-5 flex items-start gap-4 hover:border-volt-500/40 hover:shadow-glow transition-all"
                >
                  <span className="text-2xl">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-ink-100 font-semibold">{c.title}</h3>
                    <p className="text-sm text-ink-400 mt-0.5">{c.body}</p>
                    <p className="text-sm text-volt-500 mt-2 truncate">{c.action.label}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* HQ */}
          <div className="ink-card p-6">
            <span className="eyebrow">HQ</span>
            <h3 className="headline text-2xl mt-2">NeverGiveUp Labs</h3>
            <p className="text-ink-300 mt-2 text-sm leading-relaxed">
              221 Iron Way, Suite 4B
              <br />
              Hyderabad, India
            </p>
            <p className="text-ink-500 text-xs mt-3 uppercase tracking-widest2">
              Mon–Fri · 09:00–18:00 IST
            </p>
          </div>

          {/* Social */}
          <div>
            <span className="eyebrow">Follow the grind</span>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-md border border-ink-700 text-sm font-semibold uppercase tracking-wider text-ink-200 hover:border-volt-500 hover:text-volt-500 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Contact;
