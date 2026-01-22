// Test the tracking endpoint
const http = require('http');

const tripId = 'TRIP-1766485955610';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/tracking/trip/${tripId}/location`,
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test-token',
    'Content-Type': 'application/json'
  }
};

console.log(`🔍 Testing trip tracking endpoint for: ${tripId}\n`);

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Response:', data);
    
    try {
      const parsed = JSON.parse(data);
      if (parsed.success && parsed.data) {
        console.log('\n✅ SUCCESS! Trip tracking data found:');
        console.log(`   Trip ID: ${parsed.data.tripId}`);
        console.log(`   Status: ${parsed.data.status}`);
        if (parsed.data.driver) {
          console.log(`   Driver: ${parsed.data.driver.name}`);
          console.log(`   Driver Phone: ${parsed.data.driver.phone}`);
          if (parsed.data.driver.locationData) {
            console.log(`   Driver Location: ${parsed.data.driver.locationData.latitude}, ${parsed.data.driver.locationData.longitude}`);
            console.log(`   Driver Speed: ${parsed.data.driver.locationData.speed} km/h`);
            console.log(`   Driver Online: ${parsed.data.driver.locationData.isOnline}`);
          }
        }
      } else {
        console.log('\n❌ No trip tracking data found');
      }
    } catch (e) {
      console.log('❌ Error parsing response:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Request error:', e.message);
});

req.end();