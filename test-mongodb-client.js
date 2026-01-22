const http = require('http');

// Test endpoint that doesn't require auth to check MongoDB client
const testData = {
  test: "mongodb-client"
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/test-db', // Use the test-db endpoint which doesn't require auth
  method: 'GET'
};

console.log('🔍 Testing MongoDB client availability...');

const req = http.request(options, (res) => {
  console.log('Status Code:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response:', jsonData);
      
      if (jsonData.status === 'success') {
        console.log('✅ MongoDB connection is working!');
        console.log('Now testing trip creation with a mock request...');
        
        // Test the trip creation route structure
        testTripCreationStructure();
      } else {
        console.log('❌ MongoDB test failed:', jsonData.message);
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

function testTripCreationStructure() {
  console.log('\n🧪 Testing trip creation route structure...');
  
  // Test data matching what the frontend sends
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
    notes: "Test trip from debug script"
  };

  const postData = JSON.stringify(tripData);

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/trips/create',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      // No Authorization header - this will fail auth but we can see the MongoDB client error
    }
  };

  const req = http.request(options, (res) => {
    console.log('Trip Creation Status Code:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('Trip Creation Response:', JSON.stringify(jsonData, null, 2));
        
        if (res.statusCode === 401) {
          console.log('✅ Expected 401 (auth required) - this means the route is accessible');
          console.log('✅ MongoDB client middleware should be working');
        } else if (res.statusCode === 500 && jsonData.message === 'Database connection error') {
          console.log('❌ MongoDB client is still not available in the route');
        }
      } catch (e) {
        console.log('Raw trip creation response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Trip creation request error:', e.message);
  });

  req.write(postData);
  req.end();
}