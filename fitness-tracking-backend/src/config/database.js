const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const BASE_DELAY_MS = 2000;
const MAX_DELAY_MS = 30000;
let attempt = 0;
let retryTimer = null;

const scheduleRetry = (uri) => {
  if (retryTimer) return;
  const delay = Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
  attempt += 1;
  console.log(`[mongo] retrying connection in ${Math.round(delay / 1000)}s (attempt ${attempt})`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    tryConnect(uri);
  }, delay);
};

const tryConnect = async (uri) => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    // success: handlers below will log it
  } catch (err) {
    console.error(`[mongo] connect failed: ${err.message}`);
    scheduleRetry(uri);
  }
};

mongoose.connection.on('connected', () => {
  attempt = 0;
  console.log(`MongoDB Connected: ${mongoose.connection.host}`);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[mongo] connection lost');
  const uri = process.env.MONGODB_URI;
  if (uri) scheduleRetry(uri);
});

mongoose.connection.on('error', (err) => {
  console.error(`[mongo] error: ${err.message}`);
});

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  await tryConnect(uri);
};

module.exports = connectDB;
