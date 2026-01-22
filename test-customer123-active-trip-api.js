// Test active trip API for customer123@abrafleet.com
const axios = require('axios');

async function testActiveTrip() {
  const customerId = 'b5aoloVR7xYI6SICibCIWecBaf82'; // customer123@abrafleet.com
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('🔍 Testing active trip API endpoint...\n');
    
    // Test the active trip endpoint
    const response = await axios.get(`${baseURL}/api/rosters/active-trip/${customerId}`, {
      timeout: 5000
    });
    
    console.log('✅ API Response received!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Data:`, JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.trip) {
      const trip = response.data.trip;
      console.log('\n🎯 Active Trip Details:');
      console.log(`   Trip ID: ${trip.readableId}`);
      console.log(`   Status: ${trip.status}`);
      console.log(`   Vehicle: ${trip.vehicleNumber}`);
      console.log(`   Driver: ${trip.driverName}`);
      console.log(`   Route: ${trip.pickupLocation} → ${trip.dropLocation}`);
    }
    
  } catch (error) {
    console.log('❌ API Test Failed:');
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ECONNREFUSED') {
      console.log('   Backend server is not running on port 3001');
      console.log('   Please start the backend server first: npm start');
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

testActiveTrip();