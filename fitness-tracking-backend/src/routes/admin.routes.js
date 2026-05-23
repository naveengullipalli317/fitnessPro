const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');
const Joi = require('joi');
const { validate } = require('../middleware/validation.middleware');

// Run BOTH guards on every endpoint — protect resolves req.user, adminOnly
// checks role. Order matters: adminOnly assumes req.user is populated.
router.use(protect, adminOnly);

const userUpdateSchema = Joi.object({
  role: Joi.string().valid('user', 'admin'),
  isDeactivated: Joi.boolean(),
}).min(1); // at least one field

router.get('/stats', ctrl.stats);
router.get('/users', ctrl.listUsers);
router.get('/users/:id', ctrl.getUser);
router.patch('/users/:id', validate(userUpdateSchema), ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/communities', ctrl.listCommunities);
router.get('/communities/:id', ctrl.getCommunity);
router.delete('/communities/:id/members/:userId', ctrl.kickMember);

module.exports = router;
