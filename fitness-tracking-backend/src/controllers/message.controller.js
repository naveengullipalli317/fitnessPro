const jwt = require('jsonwebtoken');
const User = require('../models/User');
const service = require('../services/message.service');

const sendError = (res, err) => {
  if (err instanceof service.ServiceError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: err.message });
};

// @route GET /api/communities/:id/messages?before=&limit=
const list = async (req, res) => {
  try {
    const data = await service.listMessages(req.params.id, req.user._id, req.query);
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
};

// @route POST /api/communities/:id/messages
const post = async (req, res) => {
  try {
    const msg = await service.postMessage(req.params.id, req.user._id, req.body?.content);
    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    sendError(res, err);
  }
};

// @route DELETE /api/communities/:id/messages/:messageId
const remove = async (req, res) => {
  try {
    await service.deleteMessage(req.params.messageId, req.user);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    sendError(res, err);
  }
};

/**
 * @route GET /api/communities/:id/messages/stream
 *
 * Server-Sent Events: one long-lived response that pushes new messages.
 *
 * Auth quirk: EventSource (the browser API) does NOT support custom
 * headers, so we accept the JWT from either Authorization OR ?token=
 * query param. Logging is configured to strip ?token= before recording,
 * but the token is still visible in middleware that runs before logging.
 * In production you'd swap this for a short-lived stream-only ticket
 * minted by an authenticated endpoint — not in scope for phase 1.
 */
const stream = async (req, res) => {
  // 1. Resolve user from header OR ?token=
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  if (!token && req.query.token) token = req.query.token;
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

  let user;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    if (user.isDeactivated) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated.' });
    }
  } catch (_) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }

  // 2. Verify the user is an active member of this community.
  try {
    await service.assertActiveMember(req.params.id, user._id);
  } catch (err) {
    return sendError(res, err);
  }

  // 3. SSE headers. X-Accel-Buffering tells nginx not to buffer; harmless
  //    on direct connections but essential when a reverse proxy is in front.
  res.status(200).set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  // Flush headers so the client knows the stream is open.
  res.write(':\n\n');

  // 4. Subscribe to the bus. Each emitted event becomes one SSE record.
  const unsubscribe = service.subscribe(req.params.id, (event) => {
    // `event` is { type: 'message:new' | 'message:delete', data: ... }
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify(event.data)}\n\n`);
  });

  // 5. Heartbeat. Many proxies (nginx default, CDNs, LBs) close connections
  //    with no traffic after 30-60s. A comment line every 25s keeps us under.
  const heartbeat = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 25_000);

  // 6. Cleanup when the client disconnects.
  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
};

module.exports = { list, post, remove, stream };
