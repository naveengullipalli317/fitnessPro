const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { protectAndTrack } = require('../middleware/activity.middleware');
const { validate } = require('../middleware/validation.middleware');
const {
  registerSchema,
  loginSchema,
  userUpdateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../utils/validation.utils');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
// Password recovery — both public. Rate limit is the existing authLimiter
// applied at app.js (20/15min on /auth/*), which doubles as a guardrail
// against email-flooding via the forgot endpoint.
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

router.get('/profile', protectAndTrack, getProfile);
router.put('/profile', protectAndTrack, validate(userUpdateSchema), updateProfile);

module.exports = router;
