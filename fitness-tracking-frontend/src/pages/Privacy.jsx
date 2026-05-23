import { Link } from 'react-router-dom';
import LegalPage from '../components/layout/LegalPage';

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    body: (
      <>
        <p>
          NeverGiveUp ("NG", "we", "us") provides a fitness-tracking platform that helps athletes log
          workouts, set goals, and follow training routines. This Privacy Policy explains what
          information we collect when you use NG, how we use it, and the choices you have.
        </p>
        <p>
          By creating an account or using the service, you agree to the practices described below.
          We keep this policy in plain language because legal jargon helps no one train.
        </p>
      </>
    ),
  },
  {
    id: 'data-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <p>
          <strong className="text-ink-100">Account data</strong> — your name, email address, and an
          encrypted password hash. You can optionally add age, gender, height, weight, and fitness
          level during onboarding or from your profile.
        </p>
        <p>
          <strong className="text-ink-100">Training data</strong> — workouts you log (type,
          duration, calories, distance, notes), goals you set, routines you create, and the
          exercises you reference.
        </p>
        <p>
          <strong className="text-ink-100">Device & usage data</strong> — anonymous information
          about how you use NG, such as page views, request timestamps, and error logs. Used only to
          keep the service fast and stable.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use your data',
    body: (
      <>
        <ul className="list-disc list-outside pl-5 space-y-2">
          <li>To run the core service: render your dashboard, charts, and history.</li>
          <li>To personalise calorie estimates and progress metrics from your profile inputs.</li>
          <li>To keep your account secure (rate-limiting, fraud detection, login monitoring).</li>
          <li>To send transactional emails (password resets, account notices). We don't send marketing emails unless you opt in.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Sharing and third parties',
    body: (
      <>
        <p>
          We do not sell your personal data. We share information only with vendors who help us
          operate the service: a managed MongoDB provider for storage, a transactional email
          provider, and an error-monitoring service. Each is bound by a data-processing agreement.
        </p>
        <p>
          If you mark a routine as <em>Public</em>, your name and that routine become visible to
          other NG users. Workouts, goals, and personal details are always private to your account.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and storage',
    body: (
      <>
        <p>
          We use a small number of essential cookies and browser storage entries to keep you signed
          in (a JWT in <code className="text-volt-400">localStorage</code>) and remember UI
          preferences. We do not use third-party advertising or tracking cookies.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    body: (
      <>
        <p>
          Passwords are stored as salted bcrypt hashes. API traffic is rate-limited and protected
          with Helmet security headers. We monitor for unusual activity and respond to incidents
          promptly. No system is perfectly secure — please use a strong, unique password and report
          anything suspicious to <a className="text-volt-500 hover:text-volt-400" href="mailto:security@nevergiveup.app">security@nevergiveup.app</a>.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>
          You can view and update your account data at any time from your profile. To export or
          delete your account, email <a className="text-volt-500 hover:text-volt-400" href="mailto:privacy@nevergiveup.app">privacy@nevergiveup.app</a> and
          we will action your request within 30 days. Where applicable, you also have rights to
          access, correct, and restrict processing under GDPR and similar regulations.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <>
        <p>
          If we make material changes, we will update the "Last updated" date above and notify
          active users by email. Continued use of NG after a change means you accept the updated
          policy.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <>
        <p>
          Questions about this policy? <Link to="/contact" className="text-volt-500 hover:text-volt-400">Reach out via our contact page</Link> or
          email <a className="text-volt-500 hover:text-volt-400" href="mailto:privacy@nevergiveup.app">privacy@nevergiveup.app</a>.
        </p>
      </>
    ),
  },
];

const Privacy = () => (
  <LegalPage
    eyebrow="Legal"
    title={<>Privacy <span className="gradient-text">Policy.</span></>}
    intro="What we collect, why we collect it, and the controls you have. No tracking pixels, no data brokers, no surprises."
    lastUpdated="22 May 2026"
    sections={sections}
  />
);

export default Privacy;
