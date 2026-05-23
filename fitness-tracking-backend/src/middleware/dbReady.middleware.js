const mongoose = require('mongoose');

const dbReady = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Check the MongoDB connection (IP whitelist / credentials).',
    });
  }
  return next();
};

module.exports = dbReady;
