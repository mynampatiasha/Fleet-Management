// Test script to verify Fleet Map backend connection
const http = require('http');

const testFleetMapAPI = async () => {
  console.log('🧪 Testing Fleet Map Backend Connection...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/admin/fleet/vehicles/live-status',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📡 Response Status: ${res.statusCode}`);
        console.log(`📦 Response Headers:`, res.headers);
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ Response Data:`, JSON.stringify(jsonData, null, 2));
          resolve(jsonData);
        } catch (e) {
          console.log(`📄 Raw Response:`, data);
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request Error:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.error('⏰ Request Timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

// Run the test
testFleetMapAPI()
  .then(() => {
    console.log('✅ Fleet Map API test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fleet Map API test failed:', error.message);
    process.exit(1);
  });