const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file in project root
dotenv.config({ path: path.join(__dirname, '../.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'github_analyzer_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },
  github: {
    token: process.env.GITHUB_TOKEN || null
  }
};
