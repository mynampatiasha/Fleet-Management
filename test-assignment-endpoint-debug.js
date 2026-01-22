// Test script to debug the assignment endpoint 404 error
const http = require('http');

const baseUrl = 'http://localhost:3001';

async function testEndpoint(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    console.log(`\n🧪 Testing ${method} ${path}`);
    console.log(`   Full URL: ${baseUrl}${path}`);
    if (body) {
      console.log(`   Body: ${JSON.stringify(body)}`);
    }

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   ✅ Response: ${res.statusCode} ${res.statusMessage}`);
        console.log(`   📄 Body: ${data}`);
        resolve({
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          body: data,
          headers: res.headers
        });
      });
    });

    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🔍 ASSIGNMENT ENDPOINT DEBUG TEST');
  console.log('=' .repeat(80));
  
  try {
    // Test 1: Check if server is running
    console.log('\n📡 Test 1: Server Health Check');
    await testEndpoint('GET', '/health');
    
    // Test 2: Check if assignment routes are loaded
    console.log('\n📡 Test 2: Assignment Routes Check');
    await testEndpoint('GET', '/api/assignment/pending-rosters');
    
    // Test 3: Test the problematic assign-group endpoint
    console.log('\n📡 Test 3: Assign Group Endpoint (HEAD)');
    await testEndpoint('HEAD', '/api/assignment/assign-group');
    
    // Test 4: Test with actual POST (should fail with validation error, not 404)
    console.log('\n📡 Test 4: Assign Group Endpoint (POST - Invalid Data)');
    await testEndpoint('POST', '/api/assignment/assign-group', {
      rosterIds: ['test'],
      vehicleId: 'test'
    });
    
    // Test 5: Test with valid ObjectId format
    console.log('\n📡 Test 5: Assign Group Endpoint (POST - Valid Format)');
    await testEndpoint('POST', '/api/assignment/assign-group', {
      rosterIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      vehicleId: '507f1f77bcf86cd799439013'
    });
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 Tests completed');
}

// Run the tests
runTests();