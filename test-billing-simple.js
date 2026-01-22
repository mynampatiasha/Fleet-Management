const http = require('http');

async function testBillingAPI() {
  console.log('🚀 Testing Billing API...');
  console.log('='.repeat(60));
  
  // Test 1: Health Check (should work without auth if we modify the route)
  console.log('🏥 Testing health endpoint...');
  try {
    await makeRequest('/api/billing/health', 'GET');
  } catch (error) {
    console.log('   ⚠️ Health endpoint requires auth, testing with dummy token...');
    await makeRequest('/api/billing/health', 'GET', 'dummy-token');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ BILLING API TEST COMPLETE!');
  console.log('='.repeat(60));
}

function makeRequest(path, method = 'GET', token = null, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };
    
    console.log(`   📡 ${method} ${path}${token ? ' (with auth)' : ' (no auth)'}`);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`   ✅ Status: ${res.statusCode} - ${parsed.message || 'Success'}`);
            if (parsed.data) {
              console.log(`      Data keys: ${Object.keys(parsed.data).join(', ')}`);
            }
          } else {
            console.log(`   ❌ Status: ${res.statusCode} - ${parsed.message || parsed.error}`);
          }
          resolve(parsed);
        } catch (error) {
          console.log(`   ❌ Parse Error: ${error.message}`);
          console.log(`      Raw response: ${responseData.substring(0, 200)}...`);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Network Error: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ⏰ Request timeout after 5 seconds`);
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Run the test
if (require.main === module) {
  testBillingAPI()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testBillingAPI };