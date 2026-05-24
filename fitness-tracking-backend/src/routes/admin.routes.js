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

// Analytics — each chart on the dashboard hits one of these. Cheap reads;
// no rate-limit beyond the existing apiLimiter on /admin/*.
router.get('/analytics/signups', ctrl.analyticsSignups);
router.get('/analytics/active-users', ctrl.analyticsActiveUsers);
router.get('/analytics/top-active', ctrl.analyticsTopActive);
router.get('/analytics/communities', ctrl.analyticsCommunities);
router.get('/analytics/workouts', ctrl.analyticsWorkouts);
router.get('/analytics/roles', ctrl.analyticsRoles);

module.exports = router;
