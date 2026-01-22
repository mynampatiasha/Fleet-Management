// Test Assignment Endpoints
// Quick test to verify assignment endpoints are working

const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testEndpoints() {
  console.log('🧪 Testing Assignment Endpoints...\n');

  // Test 1: Health check
  console.log('📡 Test 1: Health Check');
  try {
    const response = await makeRequest('GET', '/health');
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${response.body.substring(0, 100)}...`);
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }

  // Test 2: Check if assignment endpoints exist (HEAD request)
  console.log('\n📡 Test 2: Assignment Endpoint Availability');
  const endpoints = [
    '/api/assignment/pending-rosters',
    '/api/assignment/find-matches',
    '/api/assignment/assign',
    '/api/assignment/assign-group',
    '/api/assignment/available-vehicles'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest('HEAD', endpoint);
      console.log(`   ${endpoint}: ${response.statusCode} ${response.statusCode === 404 ? '❌ NOT FOUND' : response.statusCode === 401 ? '✅ EXISTS (Auth Required)' : '✅ EXISTS'}`);
    } catch (e) {
      console.log(`   ${endpoint}: ❌ ERROR - ${e.message}`);
    }
  }

  // Test 3: Test POST to assign-group (should get 401 without auth)
  console.log('\n📡 Test 3: POST Request Test (without auth)');
  try {
    const response = await makeRequest('POST', '/api/assignment/assign-group', {
      rosterIds: ['507f1f77bcf86cd799439011'],
      vehicleId: '507f1f77bcf86cd799439013'
    });
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Response: ${response.body.substring(0, 200)}...`);
    
    if (response.statusCode === 404) {
      console.log('   ❌ ENDPOINT NOT FOUND - This is the root cause!');
    } else if (response.statusCode === 401) {
      console.log('   ✅ ENDPOINT EXISTS - Authentication required (expected)');
    }
  } catch (e) {
    console.log(`   ❌ Error: ${e.message}`);
  }

  console.log('\n🏁 Test completed!');
}

testEndpoints().catch(console.error);