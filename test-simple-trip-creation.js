const http = require('http');

// Simple test without Firebase token to see the exact error
const tripData = {
  vehicleId: "694a7cddc1882931f34d491f",
  startPoint: {
    latitude: 12.99618906536335,
    longitude: 77.58292702636719,
    address: "Test Pickup Location"
  },
  endPoint: {
    latitude: 12.992843757324497,
    longitude: 77.70308999023437,
    address: "Test Drop Location"
  },
  distance: 13.00,
  scheduledPickupTime: new Date(Date.now() + 30 * 60000).toISOString(),
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  customerPhone: "+91 9876543210",
  tripType: "manual",
  notes: "Simple test without auth"
};

const postData = JSON.stringify(tripData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/trips/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
    // No Authorization header - should get 401 but we can see if MongoDB client works
  }
};

console.log('🧪 Testing trip creation endpoint (no auth)...');
console.log('Expected: 401 Unauthorized (but should not be MongoDB client error)');

const req = http.request(options, (res) => {
  console.log('\nStatus Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Body:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 401) {
        console.log('\n✅ Expected 401 - Authentication required');
        console.log('✅ Route is accessible, MongoDB client should be working');
      } else if (res.statusCode === 500 && jsonData.message === 'Database connection error') {
        console.log('\n❌ MongoDB client issue still exists!');
        console.log('The req.mongoClient is undefined in the middleware');
      } else {
        console.log('\n⚠️  Unexpected response:', res.statusCode);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
  console.error('Code:', e.code);
  
  if (e.code === 'ECONNREFUSED') {
    console.log('\n💡 Backend server is not running on port 3001');
    console.log('   Start it with: cd abra_fleet_backend && node index.js');
  }
});

req.write(postData);
req.end();