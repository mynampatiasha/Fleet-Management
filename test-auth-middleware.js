// Test Auth Middleware
const http = require('http');

// Test a simple endpoint to check auth middleware
const testAuthMiddleware = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/analytics/manpower-stats', // Simple endpoint
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-test-firebase-uid': 'test-admin-uid' // Use test mode
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('✅ Auth Middleware Test Response:');
      console.log('Status Code:', res.statusCode);
      console.log('Response:', data);
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error);
  });

  req.end();
};

console.log('🧪 Testing Auth Middleware with test mode...');
testAuthMiddleware();