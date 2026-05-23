// Live password strength meter + rule checklist used by the Register form.
// Keep the policy thresholds here so frontend gating stays aligned with the
// backend Joi schema (utils/validation.utils.js: registerSchema).

const RULES = [
  { id: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { id: 'letter', label: 'Contains a letter', test: (pw) => /[A-Za-z]/.test(pw) },
  { id: 'number', label: 'Contains a number', test: (pw) => /\d/.test(pw) },
  { id: 'special', label: 'Contains a symbol (recommended)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

/**
 * Returns a strength score and per-rule pass/fail. `valid` is the gate for
 * enabling the submit button — the "special char" rule is recommended but
 * not required, mirroring the backend.
 */
export const evaluatePassword = (pw = '') => {
  const checks = Object.fromEntries(RULES.map((r) => [r.id, r.test(pw)]));
  const baseScore =
    Number(checks.length) +
    Number(pw.length >= 12) +
    Number(/[a-z]/.test(pw)) +
    Number(/[A-Z]/.test(pw)) +
    Number(checks.number) +
    Number(checks.special);

  let label = 'Weak';
  let color = 'rose';
  if (baseScore >= 6) {
    label = 'Strong';
    color = 'emerald';
  } else if (baseScore === 5) {
    label = 'Good';
    color = 'volt';
  } else if (baseScore >= 3) {
    label = 'Fair';
    color = 'amber';
  }

  return {
    score: baseScore,            // 0..6
    label,
    color,                       // 'rose' | 'amber' | 'volt' | 'emerald'
    checks,
    valid: checks.length && checks.letter && checks.number,
  };
};

const COLOR_BG = {
  rose: 'bg-rose-500',
  amber: 'bg-amber-500',
  volt: 'bg-volt-500',
  emerald: 'bg-emerald-500',
};

const COLOR_TEXT = {
  rose: 'text-rose-400',
  amber: 'text-amber-400',
  volt: 'text-volt-400',
  emerald: 'text-emerald-400',
};

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const { score, label, color, checks } = evaluatePassword(password);
  const segments = 4;
  const filled = Math.min(segments, Math.ceil((score / 6) * segments));

  return (
    <div className="mt-2 space-y-2" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: segments }).map((_, i) => (
            <span
              key={i}
              className={
                'h-1.5 flex-1 rounded-full ' +
                (i < filled ? COLOR_BG[color] : 'bg-ink-800')
              }
            />
          ))}
        </div>
        <span className={'text-xs font-semibold uppercase tracking-widest2 ' + COLOR_TEXT[color]}>
          {label}
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-xs">
        {RULES.map((r) => (
          <li
            key={r.id}
            className={'flex items-center gap-2 ' + (checks[r.id] ? 'text-emerald-400' : 'text-ink-500')}
          >
            <span aria-hidden="true">{checks[r.id] ? '✓' : '○'}</span>
            <span>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrength;
