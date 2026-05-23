const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/community.controller');
const messageRoutes = require('./message.routes');
const { protect } = require('../middleware/auth.middleware');
const { protectAndTrack } = require('../middleware/activity.middleware');
const { validate } = require('../middleware/validation.middleware');
const { communityCreateSchema, communityUpdateSchema } = require('../utils/validation.utils');

router.get('/', protectAndTrack, ctrl.list);
router.post('/', protectAndTrack, validate(communityCreateSchema), ctrl.create);
router.get('/:id', protectAndTrack, ctrl.getById);
router.put('/:id', protectAndTrack, validate(communityUpdateSchema), ctrl.update);
router.delete('/:id', protectAndTrack, ctrl.remove);
router.post('/:id/join', protectAndTrack, ctrl.join);
router.post('/:id/leave', protectAndTrack, ctrl.leave);
router.get('/:id/members', protectAndTrack, ctrl.members);

// Sub-router: /communities/:id/messages/* — handles chat list, post, delete,
// and SSE stream. The stream endpoint has its own auth path because
// EventSource can't send Authorization headers (see message.controller.js).
router.use('/:id/messages', messageRoutes);

module.exports = router;
