// Balgyn: centralized error handler

function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  if (res.headersSent) return;
  res.status(status).json({ message });
}

module.exports = { errorHandler };
