const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/community.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { communityCreateSchema, communityUpdateSchema } = require('../utils/validation.utils');

router.get('/', protect, ctrl.list);
router.post('/', protect, validate(communityCreateSchema), ctrl.create);
router.get('/:id', protect, ctrl.getById);
router.put('/:id', protect, validate(communityUpdateSchema), ctrl.update);
router.delete('/:id', protect, ctrl.remove);
router.post('/:id/join', protect, ctrl.join);
router.post('/:id/leave', protect, ctrl.leave);
router.get('/:id/members', protect, ctrl.members);

module.exports = router;
