// Simple test for active trip endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/rosters/active-trip/b5aoloVR7xYI6SICibCIWecBaf82',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test-token',
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Testing active trip endpoint...\n');

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
      if (parsed.success && parsed.hasActiveTrip) {
        console.log('\n✅ SUCCESS! Active trip found:');
        console.log(`   Trip ID: ${parsed.trip.tripId}`);
        console.log(`   Status: ${parsed.trip.status}`);
        console.log(`   Vehicle: ${parsed.trip.vehicleNumber}`);
        console.log(`   Driver: ${parsed.trip.driverName}`);
      } else {
        console.log('\n❌ No active trip found');
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