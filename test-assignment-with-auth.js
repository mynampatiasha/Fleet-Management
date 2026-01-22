// Test assignment endpoint with proper authentication
const http = require('http');

// Test with a mock Firebase token (this will still fail auth but should not give 404)
const mockFirebaseToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2NzAyNzM4NjYifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzM2MTQ5NzQ4LCJ1c2VyX2lkIjoidGVzdC11aWQiLCJzdWIiOiJ0ZXN0LXVpZCIsImlhdCI6MTczNjE0OTc0OCwiZXhwIjoxNzM2MTUzMzQ4LCJlbWFpbCI6InRlc3RAYWJyYWZsZWV0LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInRlc3RAYWJyYWZsZWV0LmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19';

async function testWithAuth(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${mockFirebaseToken}`
      }
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    console.log(`\n🧪 Testing ${method} ${path} (with auth)`);
    console.log(`   Full URL: http://localhost:3001${path}`);
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

async function testDifferentUrls() {
  console.log('🔍 TESTING DIFFERENT URL PATTERNS');
  console.log('=' .repeat(80));
  
  const testBody = {
    rosterIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    vehicleId: '507f1f77bcf86cd799439013'
  };
  
  try {
    // Test the exact endpoint
    await testWithAuth('POST', '/api/assignment/assign-group', testBody);
    
    // Test without /api prefix (in case there's a routing issue)
    await testWithAuth('POST', '/assignment/assign-group', testBody);
    
    // Test with different case
    await testWithAuth('POST', '/api/assignment/assign_group', testBody);
    
    // Test the working endpoint for comparison
    await testWithAuth('GET', '/api/assignment/pending-rosters');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('🏁 URL tests completed');
}

// Also test what URLs the Flutter app might be hitting
async function testFlutterUrls() {
  console.log('\n🔍 TESTING FLUTTER APP URLS');
  console.log('=' .repeat(80));
  
  // Test different base URLs that Flutter might be using
  const baseUrls = [
    'http://localhost:3001',
    'http://10.0.2.2:3001',  // Android emulator
    'http://127.0.0.1:3001',
    'http://10.38.15.123:3001'  // From .env comment
  ];
  
  for (const baseUrl of baseUrls) {
    console.log(`\n🌐 Testing base URL: ${baseUrl}`);
    
    try {
      // Parse URL
      const url = new URL(baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 3001,
        path: '/api/assignment/assign-group',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${mockFirebaseToken}`
        }
      };
      
      const testBody = {
        rosterIds: ['507f1f77bcf86cd799439011'],
        vehicleId: '507f1f77bcf86cd799439013'
      };
      
      const bodyStr = JSON.stringify(testBody);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
      
      const result = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve({
            statusCode: res.statusCode,
            body: data
          }));
        });
        
        req.on('error', reject);
        req.write(bodyStr);
        req.end();
        
        // Timeout after 3 seconds
        setTimeout(() => reject(new Error('Timeout')), 3000);
      });
      
      console.log(`   ✅ ${baseUrl}: ${result.statusCode}`);
      if (result.statusCode === 404) {
        console.log(`   ❌ 404 NOT FOUND - This URL doesn't work`);
      } else if (result.statusCode === 401) {
        console.log(`   ✅ 401 UNAUTHORIZED - Endpoint exists, auth issue`);
      }
      
    } catch (error) {
      console.log(`   ❌ ${baseUrl}: ${error.message}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  await testDifferentUrls();
  await testFlutterUrls();
}

runAllTests();