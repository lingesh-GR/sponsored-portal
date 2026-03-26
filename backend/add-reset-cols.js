const mysql = require('mysql2/promise');

const MYSQL_URL = "mysql://root:hNxUMVeYhMocORCAvNpxoYaDIACRNuUH@trolley.proxy.rlwy.net:34367/railway";

async function fixUsersTable() {
    try {
        const connection = await mysql.createConnection(MYSQL_URL);
        console.log("Connected to Railway Database...");

        // Check if reset_token column exists  
        const [cols] = await connection.execute("SHOW COLUMNS FROM users LIKE 'reset_token'");
        
        if (cols.length === 0) {
            console.log("Adding reset_token and reset_expires columns...");
            await connection.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) DEFAULT NULL, ADD COLUMN reset_expires DATETIME DEFAULT NULL");
            console.log("✅ Columns added successfully.");
        } else {
            console.log("✅ Columns already exist.");
        }

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

fixUsersTable();
