const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      // Reject tokens that were valid at the time of issue but whose owner
      // has since been deactivated. The login endpoint blocks new tokens;
      // this catches anyone still holding an old one.
      if (req.user.isDeactivated) {
        return res.status(403).json({
          success: false,
          message: 'This account has been deactivated. Contact support.'
        });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

// Run AFTER protect. Cheap role gate for admin-only routes.
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  return next();
};

module.exports = { protect, adminOnly };