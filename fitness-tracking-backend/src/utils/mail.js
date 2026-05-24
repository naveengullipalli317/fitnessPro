/* eslint-disable no-console */
//
// Email delivery. Provider-agnostic — anything that speaks SMTP works.
// Configure via env: MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS,
// MAIL_FROM (optional, defaults to MAIL_USER), MAIL_SECURE (optional).
//
// If MAIL_HOST is absent we fall back to console logging — same path the
// app has used since day one. Lets dev work without setting up SMTP, and
// keeps Playwright deterministic (it reads the dev-token returned by the
// API, never an actual inbox).
//
// SMTP failures are LOGGED but NEVER thrown to the caller. The whole point
// of /auth/forgot-password's anti-enumeration design is that the same
// response goes out regardless of what happens — if SMTP being down made
// requests fail, the failure itself would tell attackers something.
//
const nodemailer = require('nodemailer');

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');

// Cache the transport per-process. Cheap to create but pointless to recreate
// on every send when env vars haven't changed.
let cachedTransport = null;
let cachedTransportKey = null;

const buildTransport = () => {
  const host = process.env.MAIL_HOST;
  if (!host) return null; // signal: fallback to console

  // Build a key that captures all the things that would change behaviour.
  // If env vars change between sends (rare but happens in tests), rebuild.
  const key = [host, process.env.MAIL_PORT, process.env.MAIL_USER, process.env.MAIL_SECURE].join('|');
  if (cachedTransport && cachedTransportKey === key) return cachedTransport;

  const port = parseInt(process.env.MAIL_PORT, 10) || 587;
  // Port 465 = implicit TLS; everything else (587, 2525) typically uses STARTTLS.
  // Override with MAIL_SECURE=true|false if your provider differs.
  const secure =
    process.env.MAIL_SECURE !== undefined
      ? process.env.MAIL_SECURE === 'true'
      : port === 465;

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: process.env.MAIL_USER
      ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS || '' }
      : undefined,
  });
  cachedTransportKey = key;
  return cachedTransport;
};

const fromAddress = () =>
  process.env.MAIL_FROM ||
  process.env.MAIL_USER ||
  'NeverGiveUp <no-reply@nevergiveup.local>';

// One-shot diagnostic. Called by `npm run mail:test` and during boot if
// MAIL_VERIFY=true. Returns a small report; doesn't throw.
const verifyMailer = async () => {
  const t = buildTransport();
  if (!t) return { configured: false, transport: 'console' };
  try {
    await t.verify();
    return { configured: true, transport: 'smtp', ok: true, host: process.env.MAIL_HOST };
  } catch (err) {
    return { configured: true, transport: 'smtp', ok: false, error: err.message };
  }
};

const dispatch = async ({ to, subject, text, html }) => {
  const transport = buildTransport();
  if (!transport) {
    // Fallback: log to stdout. Same shape as the original dev mode.
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[mail] PROD email NOT delivered (MAIL_HOST not configured): to=${to} subject="${subject}"`);
      console.warn(`[mail] body:\n${text}`);
      return { delivered: false, transport: 'none' };
    }
    console.log(`\n[mail:dev] -> ${to}\n  subject: ${subject}\n  ${text.split('\n').join('\n  ')}\n`);
    return { delivered: true, transport: 'console' };
  }
  try {
    const info = await transport.sendMail({
      from: fromAddress(),
      to,
      subject,
      text,
      html,
    });
    return { delivered: true, transport: 'smtp', messageId: info.messageId };
  } catch (err) {
    // Log loudly server-side; never propagate to the controller.
    console.error(`[mail] SMTP send FAILED to=${to} subject="${subject}" reason="${err.message}"`);
    return { delivered: false, transport: 'smtp', error: err.message };
  }
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
  // Minimal HTML version. Most clients render this; the text/plain part
  // above is the fallback for paranoid mail clients (and for spam-score
  // checkers, which dock HTML-only mails).
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif; color: #1a1a1a; line-height: 1.5; max-width: 560px;">
      <p>Hi ${escapeHtml(name || 'athlete')},</p>
      <p>
        Someone (hopefully you) asked to reset the password for your
        <strong>NeverGiveUp</strong> account.
      </p>
      <p>
        <a href="${escapeHtml(url)}"
           style="display:inline-block;background:#f97316;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
          Set a new password
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px;">
        This link expires in 30 minutes. If you didn't request this,
        you can ignore the email — your current password stays in place.
      </p>
      <p style="color:#6b7280;font-size:12px;">
        If the button doesn't work, paste this URL into your browser:<br>
        <span style="word-break:break-all;">${escapeHtml(url)}</span>
      </p>
    </div>
  `;
  return dispatch({ to: toEmail, subject, text, html });
};

// Tiny HTML escape — prevents user.name from injecting markup.
const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

module.exports = { sendResetEmail, verifyMailer };
