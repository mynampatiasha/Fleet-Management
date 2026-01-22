// Test customer123 tracking with authentication
const axios = require('axios');

async function testWithAuth() {
  const customerId = 'b5aoloVR7xYI6SICibCIWecBaf82'; // customer123@abrafleet.com
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('🔐 Testing customer123 login and active trip...\n');
    
    // First, login as customer123
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'customer123@abrafleet.com',
      password: 'customer123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login successful!');
      const token = loginResponse.data.token;
      
      // Now test the active trip endpoint with auth
      const tripResponse = await axios.get(`${baseURL}/api/rosters/active-trip/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Active trip API response:');
      console.log(`   Status: ${tripResponse.status}`);
      
      if (tripResponse.data.success && tripResponse.data.trip) {
        const trip = tripResponse.data.trip;
        console.log('\n🚗 Active Trip Found:');
        console.log(`   Trip ID: ${trip.readableId}`);
        console.log(`   Status: ${trip.status}`);
        console.log(`   Vehicle: ${trip.vehicleNumber} (${trip.vehicleMake} ${trip.vehicleModel})`);
        console.log(`   Driver: ${trip.driverName} (${trip.driverPhone})`);
        console.log(`   Route: ${trip.pickupLocation} → ${trip.dropLocation}`);
        console.log(`   Distance: ${trip.distance} km`);
        console.log(`   Start Time: ${trip.tripStartTime}`);
        
        console.log('\n🎯 Perfect! Customer123 now has an active trip for testing.');
        console.log('   The customer can now use the tracking feature in the app.');
      } else {
        console.log('❌ No active trip found in API response');
        console.log('   Response:', JSON.stringify(tripResponse.data, null, 2));
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Test Failed:');
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

testWithAuth();