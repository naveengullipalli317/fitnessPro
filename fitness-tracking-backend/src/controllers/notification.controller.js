const service = require('../services/notification.service');

const sendError = (res, err) => {
  if (err instanceof service.ServiceError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: err.message });
};

// @route GET /api/notifications
const list = async (req, res) => {
  try {
    const data = await service.listForUser(req.user._id, req.query);
    res.json({ success: true, data });
  } catch (err) { sendError(res, err); }
};

// @route PATCH /api/notifications/:id/read
const markRead = async (req, res) => {
  try {
    await service.markRead(req.user._id, req.params.id);
    res.json({ success: true });
  } catch (err) { sendError(res, err); }
};

// @route PATCH /api/notifications/read-all
const markAllRead = async (req, res) => {
  try {
    const r = await service.markAllRead(req.user._id);
    res.json({ success: true, data: r });
  } catch (err) { sendError(res, err); }
};

// @route DELETE /api/notifications/:id
const dismiss = async (req, res) => {
  try {
    await service.dismiss(req.user._id, req.params.id);
    res.json({ success: true });
  } catch (err) { sendError(res, err); }
};

// @route DELETE /api/notifications
const dismissAll = async (req, res) => {
  try {
    const r = await service.dismissAll(req.user._id);
    res.json({ success: true, data: r });
  } catch (err) { sendError(res, err); }
};

module.exports = { list, markRead, markAllRead, dismiss, dismissAll };
