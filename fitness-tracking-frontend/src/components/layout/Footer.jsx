import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="relative mt-16 border-t border-ink-800 bg-ink-950">
      <div className="absolute inset-x-0 top-0 h-px bg-grad-volt opacity-60" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex h-8 px-1.5 items-center justify-center rounded-md bg-grad-volt text-ink-950 font-display text-lg tracking-tight">
                NG
              </span>
              <span className="headline text-xl tracking-wider">NeverGiveUp</span>
            </div>
            <p className="text-sm text-ink-400 max-w-md">
              Train hard. Track everything. Become the strongest version of yourself.
            </p>
          </div>
          <div className="flex gap-6 text-xs uppercase tracking-widest2 text-ink-400">
            <Link to="/about" className="hover:text-volt-500">About</Link>
            <Link to="/privacy" className="hover:text-volt-500">Privacy</Link>
            <Link to="/terms" className="hover:text-volt-500">Terms</Link>
            <Link to="/contact" className="hover:text-volt-500">Contact</Link>
          </div>
        </div>
        <p className="mt-8 text-xs text-ink-500">
          &copy; {new Date().getFullYear()} NeverGiveUp. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
