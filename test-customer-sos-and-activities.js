// Test script to check customer SOS alerts and recent activities

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Test customer credentials (use a real customer from your database)
const TEST_CUSTOMER_EMAIL = 'customer123@example.com';
const TEST_CUSTOMER_PASSWORD = 'password123';

let authToken = '';
let customerId = '';

// Step 1: Login as customer
async function loginAsCustomer() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: TEST_CUSTOMER_EMAIL,
      password: TEST_CUSTOMER_PASSWORD
    });

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

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.token) {
            authToken = response.token;
            customerId = response.user.id || response.user._id;
            console.log('✅ Login successful');
            console.log('   Customer ID:', customerId);
            console.log('   Token:', authToken.substring(0, 20) + '...');
            resolve();
          } else {
            reject(new Error('No token in response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Step 2: Test SOS history endpoint
async function testSOSHistory() {
  return new Promise((resolve, reject) => {
    console.log('\n📡 Testing SOS History Endpoint...');
    console.log(`   GET /api/sos/history/${customerId}`);

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: `/api/sos/history/${customerId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log('   Response:', JSON.stringify(response, null, 2));
          
          if (res.statusCode === 200) {
            console.log('✅ SOS History endpoint works!');
            if (response.sosAlerts && Array.isArray(response.sosAlerts)) {
              console.log(`   Found ${response.sosAlerts.length} SOS alerts`);
            }
          } else {
            console.log('❌ SOS History endpoint returned error');
          }
          resolve();
        } catch (e) {
          console.log('   Raw response:', data);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Step 3: Test customer stats dashboard endpoint (for recent activities)
async function testCustomerStatsDashboard() {
  return new Promise((resolve, reject) => {
    console.log('\n📡 Testing Customer Stats Dashboard Endpoint...');
    console.log('   GET /api/customer/stats/dashboard');

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/customer/stats/dashboard',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          console.log('   Response:', JSON.stringify(response, null, 2));
          
          if (res.statusCode === 200) {
            console.log('✅ Customer Stats Dashboard endpoint works!');
            if (response.data) {
              console.log('   Total Trips:', response.data.totalTrips);
              console.log('   Total Distance:', response.data.totalDistance);
            }
          } else {
            console.log('❌ Customer Stats Dashboard endpoint returned error');
          }
          resolve();
        } catch (e) {
          console.log('   Raw response:', data);
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    console.log('🧪 Testing Customer SOS and Activities Endpoints\n');
    console.log('='.repeat(60));
    
    await loginAsCustomer();
    await testSOSHistory();
    await testCustomerStatsDashboard();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
  }
}

runTests();
