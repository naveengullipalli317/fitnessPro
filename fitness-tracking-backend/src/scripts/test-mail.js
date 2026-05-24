#!/usr/bin/env node
/* eslint-disable no-console */
//
// Verify the configured mail transport without going through the API.
// Usage:
//   NODE_ENV=development node src/scripts/test-mail.js <recipient@example.com>
//   (or `npm run mail:test -- recipient@example.com`)
//
// What it does:
//   1. Loads env (.env.{NODE_ENV} -> .env).
//   2. Calls verifyMailer() to check SMTP creds open a session cleanly.
//   3. Sends one reset-style test email to the given address.
//
require('../config/environment');
const { verifyMailer, sendResetEmail } = require('../utils/mail');

const recipient = process.argv[2];
if (!recipient) {
  console.error('Usage: test-mail.js <recipient@example.com>');
  process.exit(1);
}

(async () => {
  console.log('[mail:test] verifying transport...');
  const v = await verifyMailer();
  console.log('  result:', JSON.stringify(v));
  if (v.configured && !v.ok) {
    console.error('[mail:test] verify failed. Check MAIL_HOST/PORT/USER/PASS/SECURE.');
    process.exit(2);
  }

  console.log(`[mail:test] sending test reset email to ${recipient}...`);
  const res = await sendResetEmail(recipient, 'Test Recipient', 'a'.repeat(64));
  console.log('  result:', JSON.stringify(res));
  if (!res.delivered) {
    console.error('[mail:test] send failed.');
    process.exit(3);
  }
  console.log('[mail:test] done — check the inbox (or stdout above for dev mode).');
})().catch((err) => {
  console.error('[mail:test] crashed:', err.message);
  process.exit(1);
});
