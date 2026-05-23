import { Link } from 'react-router-dom';
import LegalPage from '../components/layout/LegalPage';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of terms',
    body: (
      <p>
        These Terms of Service ("Terms") govern your access to and use of NeverGiveUp ("NG"). By
        creating an account or using NG you agree to be bound by these Terms and our
        {' '}<Link to="/privacy" className="text-volt-500 hover:text-volt-400">Privacy Policy</Link>.
        If you don't agree, please don't use the service.
      </p>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    body: (
      <p>
        You must be at least 13 years old to create an account. By using NG you confirm you meet
        this requirement and have the legal capacity to enter into these Terms.
      </p>
    ),
  },
  {
    id: 'accounts',
    title: 'Your account',
    body: (
      <>
        <p>
          You are responsible for everything that happens under your account, including keeping your
          password secret. Tell us right away at
          {' '}<a className="text-volt-500 hover:text-volt-400" href="mailto:security@nevergiveup.app">security@nevergiveup.app</a>{' '}
          if you suspect unauthorised access.
        </p>
        <p>
          You agree to provide accurate information and to keep it up to date. We may suspend or
          terminate accounts that misuse the service, abuse other users, or break these Terms.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'Acceptable use',
    body: (
      <>
        <p>You agree not to:</p>
        <ul className="list-disc list-outside pl-5 space-y-2">
          <li>Reverse-engineer, scrape, or attempt to extract source code or data from NG without permission.</li>
          <li>Upload routines or notes that are unlawful, harassing, hateful, or infringe on others' rights.</li>
          <li>Use NG to send spam or impersonate other users.</li>
          <li>Interfere with the service's normal operation (rate-limit evasion, denial-of-service, etc.).</li>
        </ul>
      </>
    ),
  },
  {
    id: 'content',
    title: 'Your content',
    body: (
      <>
        <p>
          You own the workouts, goals, routines, and notes you create on NG. By marking a routine
          as <em>Public</em>, you grant other users a non-exclusive licence to view and copy that
          routine into their own training plans.
        </p>
        <p>
          We may remove content that violates these Terms, applicable law, or our community
          standards.
        </p>
      </>
    ),
  },
  {
    id: 'health',
    title: 'Health disclaimer',
    body: (
      <>
        <p>
          NG is a training-log tool, <strong className="text-ink-100">not medical advice</strong>.
          Exercises, routines, and metrics shown on the platform are educational. Consult a
          qualified healthcare professional before starting any new exercise program, especially if
          you have a pre-existing condition.
        </p>
        <p>You train at your own risk. We are not responsible for injuries sustained while using the service.</p>
      </>
    ),
  },
  {
    id: 'service-changes',
    title: 'Changes to the service',
    body: (
      <p>
        We are constantly improving NG. We may add, modify, or remove features at any time. Where a
        change materially affects you, we will give reasonable advance notice via the app or by
        email.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    body: (
      <p>
        You can close your account at any time from your profile settings. We may suspend or
        terminate your account if you breach these Terms. On termination, your training data is
        deleted within 30 days unless legal obligations require us to retain it.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <p>
        To the maximum extent permitted by law, NG is provided "as is" without warranties of any
        kind. We are not liable for indirect, incidental, or consequential damages arising from
        your use of the service. Our total liability for any claim is limited to the amount you
        paid us in the twelve months before the claim arose (which, for free accounts, is zero).
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: (
      <p>
        These Terms are governed by the laws of the jurisdiction in which NG is operated, without
        regard to its conflict-of-laws rules. Any disputes will be resolved in the courts located
        in that jurisdiction.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these Terms? <Link to="/contact" className="text-volt-500 hover:text-volt-400">Get in touch via the contact page</Link> or
        email <a className="text-volt-500 hover:text-volt-400" href="mailto:legal@nevergiveup.app">legal@nevergiveup.app</a>.
      </p>
    ),
  },
];

const Terms = () => (
  <LegalPage
    eyebrow="Legal"
    title={<>Terms of <span className="gradient-text">Service.</span></>}
    intro="The agreement between you and NeverGiveUp. Train hard, train safe, treat the community well."
    lastUpdated="22 May 2026"
    sections={sections}
  />
);

export default Terms;
