const logger = (req, res, next) => {
  console.log(`[${req.id || '-'}] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
};

module.exports = logger;