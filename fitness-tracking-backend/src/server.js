const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Start the HTTP listener first so the API is always reachable.
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Connect to Mongo in the background. If it fails (e.g. Atlas IP whitelist),
  // the server keeps running so frontend calls return a clear error instead of
  // ECONNREFUSED.
  try {
    await connectDB();
  } catch (error) {
    console.error(`[WARN] MongoDB connection failed: ${error.message}`);
    console.error('API will respond, but DB-backed endpoints will return errors until the DB is reachable.');
  }
};

startServer();
