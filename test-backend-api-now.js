// Test Backend API Directly
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/notifications',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    // You would need to add Authorization header with real token
    // 'Authorization': 'Bearer YOUR_AUTH_TOKEN'
  }
};

console.log('🧪 Testing Backend API: GET /api/notifications');
console.log('📡 Connecting to: http://localhost:3001/api/notifications');

const req = http.request(options, (res) => {
  console.log(`📊 Status Code: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Response received:');
      console.log(`   Success: ${response.success}`);
      console.log(`   Notifications: ${response.data?.notifications?.length || 0}`);
      
      if (response.data?.notifications?.length > 0) {
        console.log('\n📋 Sample notifications:');
        response.data.notifications.slice(0, 3).forEach((notif, index) => {
          console.log(`   ${index + 1}. ${notif.title} (${notif.type})`);
        });
      }
    } catch (error) {
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection Error:', error.message);
  console.log('💡 Make sure backend is running on port 3001');
  console.log('   Run: npm start or node index.js in abra_fleet_backend/');
});

req.end();