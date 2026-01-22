const http = require('http');

// Test login to get a fresh token
const loginData = {
  email: "admin@abrafleet.com",
  password: "admin123"
};

const postData = JSON.stringify(loginData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🔐 Getting fresh authentication token...');

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      if (res.statusCode === 200 && jsonData.success) {
        console.log('✅ Login successful!');
        console.log('Token:', jsonData.data.token.substring(0, 50) + '...');
        console.log('\nUse this token in test-trip-creation-debug.js:');
        console.log(`const REAL_TOKEN = "${jsonData.data.token}";`);
      } else {
        console.log('❌ Login failed:', jsonData.message || jsonData.error);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.write(postData);
req.end();