console.log('--- MINIMAL SERVER STARTING ---');
try {
  const express = require('express');
  console.log('✅ Express module found');
  const app = express();
  console.log('✅ App object created');
  app.get('/', (req, res) => res.send('Basic OK'));
  app.listen(5001, () => {
    console.log('🚀 Minimal server running on http://localhost:5001');
  });
} catch (err) {
  console.error('❌ MINIMAL SERVER ERROR:', err);
}
