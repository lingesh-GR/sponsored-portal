const mysql = require('mysql2/promise');

const MYSQL_URL = "mysql://root:hNxUMVeYhMocORCAvNpxoYaDIACRNuUH@trolley.proxy.rlwy.net:34367/railway";

async function fixColumn() {
    try {
        const connection = await mysql.createConnection(MYSQL_URL);
        console.log("Connected to Railway...");

        // Check if student_id column exists  
        const [cols] = await connection.execute("SHOW COLUMNS FROM applications LIKE 'student_id'");
        
        if (cols.length > 0) {
            // Drop the foreign key first (need to find its name)
            const [keys] = await connection.execute(`
                SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'applications' AND COLUMN_NAME = 'student_id'
                AND REFERENCED_TABLE_NAME IS NOT NULL
            `);

            for (const key of keys) {
                console.log(`Dropping foreign key: ${key.CONSTRAINT_NAME}`);
                await connection.execute(`ALTER TABLE applications DROP FOREIGN KEY ${key.CONSTRAINT_NAME}`);
            }

            // Rename column
            await connection.execute("ALTER TABLE applications CHANGE student_id user_id INT");
            console.log("✅ Renamed student_id -> user_id");

            // Re-add foreign key
            await connection.execute("ALTER TABLE applications ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE");
            console.log("✅ Foreign key re-added");
        } else {
            console.log("Column already named user_id, no change needed.");
        }

        await connection.end();
        process.exit(0);
    } catch (err) {
        console.error("Error:", err.message);
        process.exit(1);
    }
}

fixColumn();
