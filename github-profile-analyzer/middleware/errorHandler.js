/**
 * Centralized error handler middleware.
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error for internal tracking
  console.error(`[Error] ${req.method} ${req.url} - Status ${statusCode} - Message: ${message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  // Consistent API error response layout
  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      status: statusCode,
      // Only include stack trace if not in production environment
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    }
  });
}

module.exports = errorHandler;
