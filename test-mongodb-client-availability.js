const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/test-mongodb-client',
  method: 'GET'
};

console.log('🧪 Testing MongoDB client availability in middleware...');

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response:', JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('✅ MongoDB client is working correctly!');
        console.log('✅ req.mongoClient is available in middleware');
        console.log('✅ Can start sessions for transactions');
        console.log('\nThe trip creation issue should be resolved now.');
      } else {
        console.log('❌ MongoDB client issue found:');
        console.log('   Error:', jsonData.error);
        console.log('   Message:', jsonData.message);
        console.log('   Details:', jsonData.details);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.end();