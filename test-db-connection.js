const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/test-db',
  method: 'GET'
};

console.log('🔍 Testing database connection...');

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const jsonData = JSON.parse(data);
      if (jsonData.status === 'success') {
        console.log('✅ Database connection is working!');
      } else {
        console.log('❌ Database connection failed:', jsonData.message);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.end();