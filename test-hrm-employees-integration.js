// Test HRM Employees Integration
const http = require('http');

const testBackendConnection = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/hrm/employees',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token' // You'll need a real token
    }
  };

  const req = http.request(options, (res) => {
    console.log(`✅ HRM Employees API Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ HRM Employees API Response:', response);
      } catch (e) {
        console.log('✅ Raw Response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ HRM Employees API Error: ${e.message}`);
  });

  req.end();
};

console.log('🚀 Testing HRM Employees Integration...');
console.log('📍 Backend Route: /api/hrm/employees');
console.log('📍 Frontend Screen: HrmEmployeesScreen');
console.log('📍 Navigation: Admin Shell -> HRM Portal -> Employees');
console.log('');

// Test backend connection (requires backend to be running)
testBackendConnection();