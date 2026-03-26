const mysql = require("mysql2");
require("dotenv").config();

// Use a CONNECTION POOL instead of a single connection
// This gives: auto-reconnect, parallel queries, and lower latency
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 30000
});

// Test the connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error("MySQL Pool error:", err.message);
  } else {
    console.log("MySQL Pool Connected");
    connection.release();

    // Schema migration check for applications
    pool.query("SHOW COLUMNS FROM applications LIKE 'document_url'", (err, rows) => {
      if (err) {
        console.error("Schema check failed (applications):", err.message);
      } else if (rows.length === 0) {
        console.log("Adding missing column 'document_url' to applications table...");
        pool.query("ALTER TABLE applications ADD COLUMN document_url VARCHAR(512) DEFAULT NULL", (alterErr) => {
          if (alterErr) console.error("Failed to add column document_url:", alterErr.message);
        });
      }
    });

    // Schema migration check for users (Forgot Password)
    pool.query("SHOW COLUMNS FROM users LIKE 'reset_token'", (err, rows) => {
      if (err) {
        console.error("Schema check failed (users):", err.message);
      } else if (rows.length === 0) {
        console.log("Adding missing forgot password columns to users table...");
        pool.query("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL, ADD COLUMN reset_expires DATETIME DEFAULT NULL", (alterErr) => {
          if (alterErr) console.error("Failed to add forgot password columns:", alterErr.message);
          else console.log("Database columns for password reset added successfully.");
        });
      }
    });
  }
});

module.exports = pool;
