// Password reset flow. Two operations: request a token, redeem a token.
// Single responsibility: never tell callers whether an email exists, always
// hash tokens at rest, single-use, bound by expiry.
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendResetEmail } = require('../utils/mail');

class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

/**
 * Mint a single-use reset token and dispatch it to the user. Always returns
 * the same shape regardless of whether `email` matches a real account —
 * this is the user-enumeration defence and MUST stay that way.
 *
 * Dev-mode convenience: returns the raw token so Playwright (and you, while
 * iterating) can complete the flow without checking real email. Stripped
 * in production by the controller.
 */
const requestPasswordReset = async (email) => {
  const normalized = (email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalized });

  // No user? Return the same generic success. Spend roughly the same wall-
  // clock time as the happy path so timing doesn't leak existence either.
  if (!user || user.isDeactivated) {
    // ~30ms padding to approximate the crypto+DB cost of the happy path.
    await new Promise((r) => setTimeout(r, 30));
    return { rawToken: null };
  }

  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await PasswordReset.create({ userId: user._id, tokenHash, expiresAt });
  await sendResetEmail(user.email, user.name, rawToken);

  return { rawToken };
};

/**
 * Take a raw token presented by the user, return the User document it's
 * good for, or throw a ServiceError. ALL of the security rules live here:
 *
 *   1. Hash the raw token (we never stored it in plaintext).
 *   2. Look up the PasswordReset row by that hash.
 *   3. Refuse if the row doesn't exist (used or never minted).
 *   4. Refuse if the row's `expiresAt` is in the past.
 *      (TTL index prunes asynchronously, so a brief window of "stale but
 *       still in DB" is possible — check explicitly.)
 *   5. Load and return the User. Refuse if the user no longer exists OR
 *      is deactivated.
 *
 * Throw `new ServiceError(message, statusCode)` for any rejection; the
 * controller layer maps statusCode -> HTTP status.
 *
 * Return shape: { user, resetRow } — the caller needs both: `user` to
 * update the password, `resetRow._id` to delete after success.
 *
 * Constraint: the message you throw on rejection should be the SAME for
 * every failure case ("Invalid or expired reset token.") so attackers
 * can't distinguish "wrong token" from "expired" from "deactivated".
 */
const validateResetTokenAndGetUser = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const resetRow = await PasswordReset.findOne({ tokenHash });
  if (!resetRow) throw new ServiceError('Invalid or expired reset token.', 400);
  if (resetRow.expiresAt < new Date()) {
    await PasswordReset.deleteOne({ _id: resetRow._id });
    throw new ServiceError('Invalid or expired reset token.', 400);
  }
  const user = await User.findById(resetRow.userId);
  if (!user || user.isDeactivated) {
    throw new ServiceError('Invalid or expired reset token.', 400);
  }
  return { user, resetRow };
};

/**
 * Redeem a reset token: validate, swap password, invalidate all old
 * sessions for that user by bumping passwordChangedAt, delete token.
 */
const resetPassword = async (rawToken, newPassword) => {
  if (!rawToken || typeof rawToken !== 'string') {
    throw new ServiceError('Invalid or expired reset token.', 400);
  }
  // Length / charset sanity — fail closed before any DB I/O.
  if (newPassword == null || newPassword.length < 8) {
    throw new ServiceError('Password must be at least 8 characters long.', 400);
  }

  const { user, resetRow } = await validateResetTokenAndGetUser(rawToken);

  user.password = newPassword; // pre-save hook hashes it
  user.passwordChangedAt = new Date();
  await user.save();

  // Single-use: delete the row even on retries/race so the same token
  // can never be used twice. Also clean up any OTHER outstanding resets
  // for this user — they shouldn't be redeemable after a successful reset.
  await PasswordReset.deleteMany({ userId: user._id });

  return { reset: true };
};

module.exports = {
  ServiceError,
  hashToken,
  TOKEN_TTL_MS,
  requestPasswordReset,
  validateResetTokenAndGetUser,
  resetPassword,
};
