const service = require('../services/admin.service');

const sendError = (res, err) => {
  if (err instanceof service.ServiceError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: err.message });
};

// @route GET /api/admin/stats
const stats = async (req, res) => {
  try {
    res.json({ success: true, data: await service.getStats() });
  } catch (err) {
    sendError(res, err);
  }
};

// @route GET /api/admin/users?search=&page=&pageSize=
const listUsers = async (req, res) => {
  try {
    res.json({ success: true, data: await service.listUsers(req.query) });
  } catch (err) {
    sendError(res, err);
  }
};

// @route GET /api/admin/users/:id
const getUser = async (req, res) => {
  try {
    res.json({ success: true, data: await service.getUserById(req.params.id) });
  } catch (err) {
    sendError(res, err);
  }
};

// @route PATCH /api/admin/users/:id   body: { role?, isDeactivated? }
const updateUser = async (req, res) => {
  try {
    const updated = await service.updateUser(req.params.id, req.user._id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    sendError(res, err);
  }
};

// @route DELETE /api/admin/users/:id  (hard delete + cascade)
const deleteUser = async (req, res) => {
  try {
    await service.deleteUser(req.params.id, req.user._id);
    res.json({ success: true, message: 'User and owned data deleted.' });
  } catch (err) {
    sendError(res, err);
  }
};

// @route GET /api/admin/communities?search=&page=&pageSize=
const listCommunities = async (req, res) => {
  try {
    res.json({ success: true, data: await service.listCommunities(req.query) });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = { stats, listUsers, getUser, updateUser, deleteUser, listCommunities };
