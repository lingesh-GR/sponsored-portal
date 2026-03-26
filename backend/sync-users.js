const mysql = require('mysql2/promise');

// Local DB (MySQL Workbench)
const LOCAL_CONFIG = {
    host: 'localhost',
    user: 'portaluser',
    password: 'portal123',
    database: 'sponsored_portal',
    port: 3306
};

// Railway DB (Online)
const RAILWAY_URL = "mysql://root:hNxUMVeYhMocORCAvNpxoYaDIACRNuUH@trolley.proxy.rlwy.net:34367/railway";

async function syncUsers() {
    try {
        // 1. Connect to LOCAL database
        const localDB = await mysql.createConnection(LOCAL_CONFIG);
        console.log("✅ Connected to LOCAL database");

        // 2. Connect to RAILWAY database
        const railwayDB = await mysql.createConnection(RAILWAY_URL);
        console.log("✅ Connected to RAILWAY database");

        // 3. Read all users from local
        const [localUsers] = await localDB.execute("SELECT email, username, password, role, created_at FROM users");
        console.log(`\n📋 Found ${localUsers.length} users in local database:\n`);

        localUsers.forEach((u, i) => {
            console.log(`   ${i + 1}. ${u.email} (${u.role})`);
        });

        // 4. Insert into Railway (skip if email already exists)
        let inserted = 0;
        let skipped = 0;

        for (const user of localUsers) {
            try {
                await railwayDB.execute(
                    "INSERT INTO users (email, username, password, role, created_at) VALUES (?, ?, ?, ?, ?)",
                    [user.email, user.username, user.password, user.role, user.created_at]
                );
                inserted++;
                console.log(`   ✅ Inserted: ${user.email}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    skipped++;
                    console.log(`   ⏭️  Skipped (already exists): ${user.email}`);
                } else {
                    console.error(`   ❌ Failed: ${user.email} - ${err.message}`);
                }
            }
        }

        console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`);

        await localDB.end();
        await railwayDB.end();
        process.exit(0);

    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

syncUsers();
