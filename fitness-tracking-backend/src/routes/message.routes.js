const express = require('express');
// mergeParams: true so :id (the communityId) from the parent router is
// available on req.params here.
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

// Stream uses its own auth resolver (EventSource can't send headers).
// Mounted BEFORE the protect-gated routes so the global middleware doesn't
// reject the EventSource request for missing Authorization header.
router.get('/stream', ctrl.stream);

router.get('/', protect, ctrl.list);
router.post('/', protect, ctrl.post);
router.delete('/:messageId', protect, ctrl.remove);

module.exports = router;
