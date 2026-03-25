const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("MySQL error:", err);
  } else {
    console.log("MySQL Connected");
    
    // Modern Migration Logic: Compatible with all MySQL versions
    db.query("SHOW COLUMNS FROM applications LIKE 'document_url'", (err, rows) => {
        if (err) {
            console.error("Schema check failed:", err.message);
            return;
        }

        if (rows.length === 0) {
            console.log("Adding missing column 'document_url' to applications table...");
            db.query("ALTER TABLE applications ADD COLUMN document_url VARCHAR(512) DEFAULT NULL", (alterErr) => {
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

module.exports = db;
