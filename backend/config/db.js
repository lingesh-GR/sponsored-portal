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

    // Schema migration check
    pool.query("SHOW COLUMNS FROM applications LIKE 'document_url'", (err, rows) => {
      if (err) {
        console.error("Schema check failed:", err.message);
        return;
      }
      if (rows.length === 0) {
        console.log("Adding missing column 'document_url' to applications table...");
        pool.query("ALTER TABLE applications ADD COLUMN document_url VARCHAR(512) DEFAULT NULL", (alterErr) => {
          if (alterErr) {
            console.error("Failed to add column:", alterErr.message);
          } else {
            console.log("Database column 'document_url' added successfully.");
          }
        });
      } else {
        console.log("Database schema is already up to date.");
      }
    });
  }
});

module.exports = pool;
