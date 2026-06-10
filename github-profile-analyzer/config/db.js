const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool(config.db);

/**
 * Test the database connection pool.
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection pool established successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection
};
