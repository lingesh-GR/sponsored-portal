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

async function syncAll() {
    try {
        const localDB = await mysql.createConnection(LOCAL_CONFIG);
        console.log("✅ Connected to LOCAL database");

        const railwayDB = await mysql.createConnection(RAILWAY_URL);
        console.log("✅ Connected to RAILWAY database\n");

        // ========== 1. SYNC SCHEMES ==========
        console.log("═══════════════════════════════════");
        console.log("📘 Syncing SCHEMES...");
        console.log("═══════════════════════════════════");
        const [schemes] = await localDB.execute("SELECT * FROM schemes");
        console.log(`   Found ${schemes.length} schemes locally`);
        let sInserted = 0, sSkipped = 0;
        for (const s of schemes) {
            try {
                await railwayDB.execute(
                    "INSERT INTO schemes (id, title, description, eligibility, deadline, website, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [s.id, s.title, s.description, s.eligibility, s.deadline, s.website, s.created_at]
                );
                sInserted++;
                console.log(`   ✅ Inserted: ${s.title}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    sSkipped++;
                    console.log(`   ⏭️  Skipped: ${s.title}`);
                } else {
                    console.error(`   ❌ Failed: ${s.title} - ${err.message}`);
                }
            }
        }
        console.log(`   📊 Schemes: ${sInserted} inserted, ${sSkipped} skipped\n`);

        // ========== 2. SYNC INTERNSHIPS ==========
        console.log("═══════════════════════════════════");
        console.log("💼 Syncing INTERNSHIPS...");
        console.log("═══════════════════════════════════");
        const [internships] = await localDB.execute("SELECT * FROM internships");
        console.log(`   Found ${internships.length} internships locally`);
        let iInserted = 0, iSkipped = 0;
        for (const i of internships) {
            try {
                await railwayDB.execute(
                    "INSERT INTO internships (id, title, description, eligibility, deadline, website, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [i.id, i.title, i.description, i.eligibility, i.deadline, i.website, i.created_at]
                );
                iInserted++;
                console.log(`   ✅ Inserted: ${i.title}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    iSkipped++;
                    console.log(`   ⏭️  Skipped: ${i.title}`);
                } else {
                    console.error(`   ❌ Failed: ${i.title} - ${err.message}`);
                }
            }
        }
        console.log(`   📊 Internships: ${iInserted} inserted, ${iSkipped} skipped\n`);

        // ========== 3. SYNC EVENTS ==========
        console.log("═══════════════════════════════════");
        console.log("📅 Syncing EVENTS...");
        console.log("═══════════════════════════════════");
        const [events] = await localDB.execute("SELECT * FROM events");
        console.log(`   Found ${events.length} events locally`);
        let eInserted = 0, eSkipped = 0;
        for (const e of events) {
            try {
                await railwayDB.execute(
                    "INSERT INTO events (id, title, description, event_date, website, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                    [e.id, e.title, e.description, e.event_date, e.website, e.created_at]
                );
                eInserted++;
                console.log(`   ✅ Inserted: ${e.title}`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    eSkipped++;
                    console.log(`   ⏭️  Skipped: ${e.title}`);
                } else {
                    console.error(`   ❌ Failed: ${e.title} - ${err.message}`);
                }
            }
        }
        console.log(`   📊 Events: ${eInserted} inserted, ${eSkipped} skipped\n`);

        // ========== 4. SYNC APPLICATIONS ==========
        console.log("═══════════════════════════════════");
        console.log("📄 Syncing APPLICATIONS...");
        console.log("═══════════════════════════════════");
        const [applications] = await localDB.execute("SELECT * FROM applications");
        console.log(`   Found ${applications.length} applications locally`);
        let aInserted = 0, aSkipped = 0;
        for (const a of applications) {
            try {
                await railwayDB.execute(
                    "INSERT INTO applications (id, student_id, scheme_name, status, applied_at, document_url) VALUES (?, ?, ?, ?, ?, ?)",
                    [a.id, a.student_id ?? null, a.scheme_name ?? null, a.status ?? 'pending', a.applied_at ?? null, a.document_url ?? null]
                );
                aInserted++;
                console.log(`   ✅ Inserted: Application #${a.id} (${a.scheme_name})`);
            } catch (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    aSkipped++;
                    console.log(`   ⏭️  Skipped: Application #${a.id}`);
                } else {
                    console.error(`   ❌ Failed: Application #${a.id} - ${err.message}`);
                }
            }
        }
        console.log(`   📊 Applications: ${aInserted} inserted, ${aSkipped} skipped\n`);

        // ========== SUMMARY ==========
        console.log("═══════════════════════════════════");
        console.log("🎉 FULL SYNC COMPLETE!");
        console.log("═══════════════════════════════════");
        console.log(`   Schemes:      ${sInserted} inserted, ${sSkipped} skipped`);
        console.log(`   Internships:  ${iInserted} inserted, ${iSkipped} skipped`);
        console.log(`   Events:       ${eInserted} inserted, ${eSkipped} skipped`);
        console.log(`   Applications: ${aInserted} inserted, ${aSkipped} skipped`);

        await localDB.end();
        await railwayDB.end();
        process.exit(0);

    } catch (err) {
        console.error("❌ Error:", err.message);
        process.exit(1);
    }
}

syncAll();
