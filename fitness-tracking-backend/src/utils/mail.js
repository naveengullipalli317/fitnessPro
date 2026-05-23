/* eslint-disable no-console */
// Single seam between the app and email delivery. The two public functions
// (sendResetEmail, plus future signupConfirm, weeklySummary, …) hide whether
// we're really sending mail or just logging in dev. Swap to nodemailer /
// SendGrid / Resend by replacing the body of `dispatch()` below — no caller
// needs to change.

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');

// Lowest-level dispatch. In production with no email service wired up we'd
// rather log loudly and fail than silently drop. In dev/test we just log.
const dispatch = async ({ to, subject, text }) => {
  if (process.env.NODE_ENV === 'production') {
    // TODO: integrate real provider (nodemailer / SendGrid / Resend).
    // Until then, log a warning so missed sends are visible in prod logs.
    console.warn(`[mail] PROD email NOT delivered (no provider wired): to=${to} subject="${subject}"`);
    console.warn(`[mail] body:\n${text}`);
    return { delivered: false, transport: 'none' };
  }
  // dev / test
  console.log(`\n[mail:dev] -> ${to}\n  subject: ${subject}\n  ${text.split('\n').join('\n  ')}\n`);
  return { delivered: true, transport: 'console' };
};

const sendResetEmail = async (toEmail, name, rawToken) => {
  const url = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
  const subject = 'Reset your NeverGiveUp password';
  const text =
    `Hi ${name || 'athlete'},\n\n` +
    `Someone (hopefully you) asked to reset the password for your\n` +
    `NeverGiveUp account. Open this link within 30 minutes to set a new one:\n\n` +
    `  ${url}\n\n` +
    `If you didn't request this, you can ignore this email — your\n` +
    `current password stays in place.\n`;
  return dispatch({ to: toEmail, subject, text });
};

module.exports = { sendResetEmail };
