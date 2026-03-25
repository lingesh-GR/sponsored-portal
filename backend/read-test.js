const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const filesToCheck = [
  '.env',
  'server.js',
  'package.json',
  'config/swaggerConfig.js',
  'config/db.js',
  'routes/authRoutes.js',
  'routes/applicationRoutes.js',
  'routes/schemeRoutes.js',
  'routes/eventRoutes.js',
  'routes/internshipRoutes.js',
  'routes/passwordRoutes.js',
  'routes/userRoutes.js'
];

console.log('--- FILE ACCESS DIAGNOSTIC ---');
filesToCheck.forEach(f => {
  const p = path.join(baseDir, f);
  try {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      console.log(`✅ READ OK: ${f} (${content.length} chars)`);
    } else {
      console.log(`⚠️  MISSING: ${f}`);
    }
  } catch (err) {
    console.error(`❌ ERROR READING: ${f}`);
    console.error(err);
  }
});
console.log('--- END DIAGNOSTIC ---');
