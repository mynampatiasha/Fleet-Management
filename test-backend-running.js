// Quick test to check if backend is running
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

console.log('🔍 Checking if backend is running on http://localhost:3001...\n');

const req = http.request(options, (res) => {
  console.log(`✅ Backend is RUNNING!`);
  console.log(`   Status: ${res.statusCode}`);
  console.log(`   Message: Backend server is accessible\n`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (data) {
      console.log('   Response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.log(`❌ Backend is NOT RUNNING!`);
  console.log(`   Error: ${error.message}`);
  console.log(`\n💡 Solution: Start the backend server by running:`);
  console.log(`   > cd abra_fleet_backend`);
  console.log(`   > node index.js`);
  console.log(`   OR from root directory:`);
  console.log(`   > start-backend.bat\n`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log(`❌ Backend connection TIMEOUT!`);
  console.log(`   The server is not responding on port 3001\n`);
  req.destroy();
  process.exit(1);
});

req.end();
