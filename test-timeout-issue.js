const http = require('http');

function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      const endTime = Date.now();
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ 
          status: res.statusCode, 
          time: endTime - startTime,
          data: data.substring(0, 100) 
        });
      });
    });

    req.on('error', (error) => reject(error));
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout after 15 seconds'));
    });
    req.end();
  });
}

async function runTests() {
  const endpoints = [
    '/health',
    '/api/roster/admin/stats',
    '/api/driver/todays-customers'
  ];

  console.log('🔍 Testing backend endpoints for timeout issues...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const result = await testEndpoint(endpoint);
      console.log(`✅ ${endpoint}: Status ${result.status}, Time: ${result.time}ms`);
      if (result.status !== 200) {
        console.log(`   Response: ${result.data}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
    console.log('');
  }
}

runTests();