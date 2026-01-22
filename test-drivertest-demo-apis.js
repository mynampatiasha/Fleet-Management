// test-drivertest-demo-apis.js
// Quick test script to verify demo APIs are working

const http = require('http');

const BASE_URL = 'http://localhost:3001';
const DEMO_EMAIL = 'drivertest@gmail.com';

async function testAPI(endpoint, description) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint}?email=${DEMO_EMAIL}`;
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200 && jsonData.success) {
            console.log(`   ✅ SUCCESS: ${res.statusCode}`);
            console.log(`   📊 Data keys: ${Object.keys(jsonData.data || {}).join(', ')}`);
          } else {
            console.log(`   ❌ FAILED: ${res.statusCode}`);
            console.log(`   📄 Response: ${data.substring(0, 200)}...`);
          }
        } catch (e) {
          console.log(`   ❌ PARSE ERROR: ${e.message}`);
          console.log(`   📄 Raw response: ${data.substring(0, 200)}...`);
        }
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ REQUEST ERROR: ${err.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ⏰ TIMEOUT: Request took too long`);
      req.destroy();
      resolve();
    });
  });
}

async function runTests() {
  console.log('\n🚗 ========== TESTING DRIVERTEST DEMO APIS ==========\n');
  
  const tests = [
    {
      endpoint: '/api/driver/demo/active-trip',
      description: 'Active Trip Data'
    },
    {
      endpoint: '/api/driver/demo/dashboard-stats',
      description: 'Dashboard Stats'
    },
    {
      endpoint: '/api/driver/demo/vehicle-check',
      description: 'Vehicle Check Data'
    },
    {
      endpoint: '/api/driver/demo/today-route',
      description: 'Today\'s Route with Customers'
    }
  ];
  
  for (const test of tests) {
    await testAPI(test.endpoint, test.description);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  console.log('\n========== TEST COMPLETE ==========');
  console.log('\n📱 Next steps:');
  console.log('   1. Start your Flutter app');
  console.log('   2. Login with: drivertest@gmail.com / Driver123!');
  console.log('   3. Navigate to Driver Dashboard');
  console.log('   4. Verify all demo data is displayed correctly');
  console.log('\n💡 Tips for demo:');
  console.log('   • Active trip shows customer "Priya Sharma"');
  console.log('   • Dashboard shows 15 completed trips');
  console.log('   • Vehicle check shows "KA01AB1234 - Tata Ace Gold"');
  console.log('   • Today\'s route shows 4 customers with different statuses');
  console.log('   • All data is realistic and business-friendly');
  console.log('\n');
}

// Check if backend is running first
console.log('🔍 Checking if backend server is running...');
const healthCheck = http.get(`${BASE_URL}/health`, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Backend server is running');
    runTests();
  } else {
    console.log('❌ Backend server responded with status:', res.statusCode);
    console.log('Please start the backend server first with: npm start');
  }
}).on('error', (err) => {
  console.log('❌ Backend server is not running');
  console.log('Please start the backend server first:');
  console.log('   cd abra_fleet_backend');
  console.log('   node index.js');
  console.log('\nOr run: setup-drivertest-demo.bat');
});