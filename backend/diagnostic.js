console.log('--- START DIAGNOSTIC ---');
console.log('Node Version:', process.version);
console.log('CWD:', process.cwd());
try {
  const fs = require('fs');
  const path = require('path');
  const serverPath = path.join(__dirname, 'server.js');
  console.log('Server file exists:', fs.existsSync(serverPath));
  if (fs.existsSync(serverPath)) {
    const stats = fs.statSync(serverPath);
    console.log('Server file size:', stats.size);
    const content = fs.readFileSync(serverPath, 'utf8');
    console.log('Server file read successfully. Length:', content.length);
  }
} catch (err) {
  console.error('DIAGNOSTIC ERROR:', err);
}
console.log('--- END DIAGNOSTIC ---');
process.exit(0);
