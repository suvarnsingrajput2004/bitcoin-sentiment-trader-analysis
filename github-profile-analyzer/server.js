const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const { testConnection } = require('./config/db');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middleware/errorHandler');
const apiLimiter = require('./middleware/rateLimiter');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// HTTP request logging
app.use(morgan('dev'));

// Apply rate limiting to all API requests
app.use('/api', apiLimiter);

// Bind application routes
app.use('/api', profileRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Centralized error handling middleware
app.use(errorHandler);

// Start the server
async function startServer() {
  try {
    // 1. Verify MySQL connection before binding port
    await testConnection();

    // 2. Start listening
    app.listen(config.port, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start the application server due to a database connection failure.');
    process.exit(1);
  }
}

startServer();
