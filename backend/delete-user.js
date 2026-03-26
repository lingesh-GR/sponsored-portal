const mysql = require('mysql2/promise');

const MYSQL_URL = "mysql://root:hNxUMVeYhMocORCAvNpxoYaDIACRNuUH@trolley.proxy.rlwy.net:34367/railway";

async function deleteUser() {
    try {
        const connection = await mysql.createConnection(MYSQL_URL);
        console.log("Connected to database...");
        
        const emailToTarget = 'lingeshgr06@gmail.com';
        
        const [result] = await connection.execute(
            "DELETE FROM users WHERE email = ?",
            [emailToTarget]
        );
        
        if (result.affectedRows > 0) {
            console.log(`Success: Deleted ${result.affectedRows} user(s) with email ${emailToTarget}`);
        } else {
            console.log(`No user found with email ${emailToTarget}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

deleteUser();
