const service = require('../services/community.service');

// Map a ServiceError to its HTTP status, fall through to 500 for unknowns.
const sendError = (res, err) => {
  if (err instanceof service.ServiceError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: err.message });
};

// @route POST /api/communities
const create = async (req, res) => {
  try {
    const community = await service.createCommunity(req.user._id, req.body);
    res.status(201).json({ success: true, data: community });
  } catch (err) {
    sendError(res, err);
  }
};

// @route GET /api/communities?scope=mine|explore&search=&type=
const list = async (req, res) => {
  try {
    const communities = await service.listCommunities(req.user._id, req.query);
    res.json({ success: true, data: communities });
  } catch (err) {
    sendError(res, err);
  }
};

// @route GET /api/communities/:id
const getById = async (req, res) => {
  try {
    const data = await service.getCommunityById(req.params.id, req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
};

// @route PUT /api/communities/:id
const update = async (req, res) => {
  try {
    const community = await service.updateCommunity(req.params.id, req.user._id, req.body);
    res.json({ success: true, data: community });
  } catch (err) {
    sendError(res, err);
  }
};

// @route DELETE /api/communities/:id
const remove = async (req, res) => {
  try {
    await service.deleteCommunity(req.params.id, req.user._id);
    res.json({ success: true, message: 'Community deleted.' });
  } catch (err) {
    sendError(res, err);
  }
};

// @route POST /api/communities/:id/join
const join = async (req, res) => {
  try {
    const result = await service.joinCommunity(req.params.id, req.user._id);
    res.json({ success: true, data: result });
  } catch (err) {
    sendError(res, err);
  }
};

// @route POST /api/communities/:id/leave
const leave = async (req, res) => {
  try {
    await service.leaveCommunity(req.params.id, req.user._id);
    res.json({ success: true, message: 'You have left the community.' });
  } catch (err) {
    sendError(res, err);
  }
};

// @route GET /api/communities/:id/members
const members = async (req, res) => {
  try {
    const members = await service.listMembers(req.params.id, req.user._id);
    res.json({ success: true, data: members });
  } catch (err) {
    sendError(res, err);
  }
};

module.exports = { create, list, getById, update, remove, join, leave, members };
