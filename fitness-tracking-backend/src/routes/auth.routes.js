const express = require('express');
const router = express.Router();
const { register, login, logout, getProfile, updateProfile } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { registerSchema, loginSchema, userUpdateSchema } = require('../utils/validation.utils');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);

router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate(userUpdateSchema), updateProfile);

module.exports = router;
