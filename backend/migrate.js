const mysql = require('mysql2/promise');

// 🔑 PASTE YOUR MYSQL_URL BELOW
const MYSQL_URL = "mysql://root:hNxUMVeYhMocORCAvNpxoYaDIACRNuUH@trolley.proxy.rlwy.net:34367/railway";
async function setupDatabase() {
    console.log("🚀 Starting Database Migration on Railway...");
    
    try {
        const connection = await mysql.createConnection(MYSQL_URL);
        console.log("✅ Connected to Railway MySQL!");

        const tables = [
            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100),
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('student', 'admin') DEFAULT 'student',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS schemes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                eligibility TEXT,
                deadline DATE,
                website VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS internships (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                eligibility TEXT,
                deadline DATE,
                website VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                event_date DATE,
                website VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                scheme_name VARCHAR(255),
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                document_url VARCHAR(512) DEFAULT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`
        ];

        for (const sql of tables) {
            await connection.execute(sql);
        }

        console.log("🎉 SUCCESS! All tables created on Railway.");
        process.exit(0);

    } catch (err) {
        console.error("❌ MIGRATION FAILED:", err.message);
        process.exit(1);
    }
}

setupDatabase();
