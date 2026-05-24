// Tracks user "active time" by bookkeeping session rows. Designed for the
// single-process MVP — for horizontal scaling we'd back the in-memory cache
// with Redis. Public functions:
//
//   trackActivity     middleware: runs AFTER protect; non-fatal, never blocks
//   SESSION_GAP_MS    constant exported for reuse in queries
//
// Throttling: we only persist a `lastBeatAt` update when more than 60s have
// elapsed since the last persistence for that user. Without this every
// authed request would issue an UPDATE; the cache absorbs ~99% of writes.
//
// New-session rule: if the cached lastBeat is older than SESSION_GAP_MS
// (15 min) OR there is no cached lastBeat AND no recent session in DB, we
// open a new session row. Otherwise we update the current session's
// lastBeatAt.
const UserSession = require('../models/UserSession');

const SESSION_GAP_MS = 15 * 60 * 1000;       // 15 minutes of silence = session ended
const PERSIST_THROTTLE_MS = 60 * 1000;       // bump DB at most once per minute per user

// Map<userIdString, { lastBeat: Date, lastPersisted: Date, sessionId: ObjectId }>
// Cleared on process restart — that's fine; next request just opens a fresh
// session if needed.
const cache = new Map();

const trackActivity = async (req, _res, next) => {
  // Defensive: if some upstream slipped this onto an unauthenticated route,
  // do nothing instead of blowing up.
  if (!req.user || !req.user._id) return next();

  const now = new Date();
  const userKey = req.user._id.toString();
  const entry = cache.get(userKey);

  try {
    // Fast path: cache hit, within session window, throttle not yet elapsed.
    if (
      entry &&
      now - entry.lastBeat <= SESSION_GAP_MS &&
      now - entry.lastPersisted < PERSIST_THROTTLE_MS
    ) {
      entry.lastBeat = now; // in-memory only
      return next();
    }

    // Cache hit, within session window, throttle elapsed → persist.
    if (entry && now - entry.lastBeat <= SESSION_GAP_MS) {
      await UserSession.updateOne(
        { _id: entry.sessionId },
        { $set: { lastBeatAt: now } }
      );
      entry.lastBeat = now;
      entry.lastPersisted = now;
      return next();
    }

    // Either cache miss OR gap exceeded → potentially a new session.
    // Check DB for any recent session before opening a fresh row (covers
    // the case where this Node process just restarted but the user is
    // still mid-session).
    const recent = await UserSession.findOne({
      userId: req.user._id,
      lastBeatAt: { $gte: new Date(now.getTime() - SESSION_GAP_MS) },
    })
      .sort({ lastBeatAt: -1 })
      .select('_id lastBeatAt')
      .lean();

    if (recent) {
      await UserSession.updateOne({ _id: recent._id }, { $set: { lastBeatAt: now } });
      cache.set(userKey, {
        lastBeat: now,
        lastPersisted: now,
        sessionId: recent._id,
      });
      return next();
    }

    // Genuinely new session.
    const created = await UserSession.create({
      userId: req.user._id,
      startedAt: now,
      lastBeatAt: now,
    });
    cache.set(userKey, {
      lastBeat: now,
      lastPersisted: now,
      sessionId: created._id,
    });
    return next();
  } catch (err) {
    // Activity tracking is best-effort instrumentation; a transient DB blip
    // here MUST NOT fail the user's actual request. Log and move on.
    // eslint-disable-next-line no-console
    console.error(`[trackActivity] non-fatal: ${err.message}`);
    return next();
  }
};

// Re-exported as a chained pair so route files can swap a single `protect`
// reference for `protectAndTrack` with no other changes. Express treats this
// array exactly like `protect, trackActivity, handler` in the chain.
const { protect } = require('./auth.middleware');
const protectAndTrack = [protect, trackActivity];

module.exports = { trackActivity, protectAndTrack, SESSION_GAP_MS };
