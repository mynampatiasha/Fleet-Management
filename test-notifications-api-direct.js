// Test notifications API directly through backend
const http = require('http');

function testNotificationsAPI() {
  console.log('🔍 Testing Notifications API Direct Access...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/notifications',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log(`📡 Response Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log(`📡 Response Body:`, JSON.stringify(response, null, 2));
        
        if (res.statusCode === 401) {
          console.log('🔐 Authentication required (expected)');
          console.log('✅ Notifications API endpoint is accessible');
        } else if (res.statusCode === 200) {
          console.log('✅ API working, notifications returned');
        } else {
          console.log(`⚠️  Unexpected status code: ${res.statusCode}`);
        }
      } catch (e) {
        console.log('❌ Error parsing response:', e.message);
        console.log('Raw response:', data);
      }
      
      console.log('✅ Test completed');
    });
  });

  req.on('error', (e) => {
    console.log(`❌ Request error: ${e.message}`);
  });

  req.end();
}

// Test the API
testNotificationsAPI();