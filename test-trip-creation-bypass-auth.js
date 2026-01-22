// Test trip creation bypassing authentication for debugging
const http = require('http');

async function testTripCreationBypassAuth() {
  console.log('🧪 Testing trip creation with auth bypass...');
  
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
    notes: "Test trip with auth bypass"
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
      'x-test-firebase-uid': 'qnwp8d0clDSSNuSm3ugmXYLSI3K2', // Test mode header
      'Authorization': 'Bearer test-token' // Still need some auth header
    }
  };

  return new Promise((resolve, reject) => {
    console.log('📡 Sending request to:', `http://localhost:3001/api/trips/create`);
    
    const req = http.request(options, (res) => {
      console.log('Status Code:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log('\n📄 Response Body:');
        try {
          const jsonData = JSON.parse(data);
          console.log(JSON.stringify(jsonData, null, 2));
          
          if (res.statusCode === 200 && jsonData.success) {
            console.log('\n🎉 SUCCESS! Trip created successfully!');
            console.log('🎫 Trip Number:', jsonData.data.tripNumber);
            console.log('👨‍✈️ Driver:', jsonData.data.driver.name);
            console.log('🚗 Vehicle:', jsonData.data.vehicle.number);
            console.log('📏 Distance:', jsonData.data.trip.distance, 'km');
          } else {
            console.log('\n❌ Trip creation failed');
            console.log('Status:', res.statusCode);
            console.log('Error:', jsonData.error || jsonData.message);
          }
          
          resolve(jsonData);
        } catch (e) {
          console.log('Raw response:', data);
          resolve({ error: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Set NODE_ENV to development to enable test mode
process.env.NODE_ENV = 'development';

testTripCreationBypassAuth().catch(console.error);