// Test script to verify assignment API endpoint
const https = require('https');
const http = require('http');

// Test the assignment endpoint
async function testAssignmentAPI() {
  console.log('🧪 Testing Assignment API Endpoint...\n');
  
  // Test 1: Check if endpoint exists (should return 401 without auth)
  console.log('📋 Test 1: Check endpoint existence');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/assignment/assign-group',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  const testData = JSON.stringify({
    rosterIds: ['test1', 'test2'],
    vehicleId: 'test-vehicle'
  });
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   Headers:`, res.headers);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Response: ${data}\n`);
        
        if (res.statusCode === 401) {
          console.log('✅ Endpoint exists and requires authentication (expected)');
        } else if (res.statusCode === 404) {
          console.log('❌ Endpoint not found (404 error)');
        } else {
          console.log(`⚠️  Unexpected status: ${res.statusCode}`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });
    
    req.write(testData);
    req.end();
  });
}

// Run the test
testAssignmentAPI().catch(console.error);