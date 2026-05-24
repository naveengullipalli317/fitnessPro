const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notification.controller');
const { protectAndTrack } = require('../middleware/activity.middleware');

router.get('/', protectAndTrack, ctrl.list);
router.patch('/read-all', protectAndTrack, ctrl.markAllRead);
router.patch('/:id/read', protectAndTrack, ctrl.markRead);
router.delete('/:id', protectAndTrack, ctrl.dismiss);
router.delete('/', protectAndTrack, ctrl.dismissAll);

module.exports = router;
