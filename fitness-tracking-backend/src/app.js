const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Ensure env is loaded even if app.js is required outside of server.js (e.g. tests).
require('./config/environment');

const requestId = require('./middleware/requestId.middleware');
const logging = require('./middleware/logging.middleware');
const errorHandler = require('./middleware/error.middleware');
const dbReady = require('./middleware/dbReady.middleware');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const workoutRoutes = require('./routes/workout.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const goalRoutes = require('./routes/goal.routes');
const routineRoutes = require('./routes/routine.routes');
const communityRoutes = require('./routes/community.routes');
const adminRoutes = require('./routes/admin.routes');
const streakRoutes = require('./routes/streak.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestId);
app.use(morgan('dev'));
app.use(logging);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  // Disable outside production so e2e suites + local dev don't trip a 429
  // cascade from chatty page loads (each authed page fires several requests).
  skip: () => process.env.NODE_ENV !== 'production',
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  // Disable the limiter outside production so e2e suites (which create many
  // throwaway accounts) and local dev don't trip a 429 cascade.
  skip: () => process.env.NODE_ENV !== 'production',
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

const mongoose = require('mongoose');
const DB_STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

const healthHandler = (req, res) => {
  const dbState = DB_STATES[mongoose.connection.readyState] || 'unknown';
  res.status(200).json({
    status: 'OK',
    db: dbState,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  });
};

const mountApi = (base) => {
  app.get(`${base}/health`, healthHandler);
  app.use(`${base}/auth`, authLimiter, dbReady, authRoutes);
  app.use(`${base}/users`, apiLimiter, dbReady, userRoutes);
  app.use(`${base}/workouts`, apiLimiter, dbReady, workoutRoutes);
  app.use(`${base}/exercises`, apiLimiter, dbReady, exerciseRoutes);
  app.use(`${base}/goals`, apiLimiter, dbReady, goalRoutes);
  app.use(`${base}/routines`, apiLimiter, dbReady, routineRoutes);
  app.use(`${base}/communities`, apiLimiter, dbReady, communityRoutes);
  app.use(`${base}/admin`, apiLimiter, dbReady, adminRoutes);
  app.use(`${base}/streaks`, apiLimiter, dbReady, streakRoutes);
  app.use(`${base}/notifications`, apiLimiter, dbReady, notificationRoutes);
};

mountApi('/api/v1');
mountApi('/api'); // alias for backwards compatibility

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;
