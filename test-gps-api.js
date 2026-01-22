// Simple test to check if GPS API is accessible
const http = require('http');

async function testGPSAPI() {
  try {
    console.log('🧪 Testing GPS API endpoint...');
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/gps/devices',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      console.log('📡 GPS API Response Status:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 401) {
          console.log('✅ GPS API is accessible (authentication required as expected)');
          console.log('🔐 Response:', data);
        } else if (res.statusCode === 200) {
          console.log('✅ GPS API working correctly!');
          const parsed = JSON.parse(data);
          console.log('📊 Statistics:', parsed.statistics);
        } else {
          console.log('❌ Unexpected status:', res.statusCode);
          console.log('📄 Response:', data);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Connection failed:', error.message);
      console.log('💡 Make sure the backend is running on port 3001');
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGPSAPI();