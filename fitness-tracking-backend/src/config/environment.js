// Environment configuration
// Loads .env.{NODE_ENV} first, then .env as defaults. Because dotenv does not
// override variables already present in process.env, the env-specific file
// wins; .env only fills in keys the env-specific file omitted.
const path = require('path');
const dotenv = require('dotenv');

const NODE_ENV = process.env.NODE_ENV || 'development';
const backendRoot = path.resolve(__dirname, '..', '..');

dotenv.config({ path: path.join(backendRoot, `.env.${NODE_ENV}`) });
dotenv.config({ path: path.join(backendRoot, '.env') });

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: NODE_ENV,
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_here',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS || 12,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fitness_tracking',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
};

module.exports = config;
