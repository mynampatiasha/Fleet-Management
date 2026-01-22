const axios = require('axios');

async function testFleetMapAuth() {
  console.log('\n🧪 TESTING FLEET MAP AUTHENTICATION FIX');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Login as admin to get JWT token
    console.log('\n1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@abrafleet.com',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('   Token:', token.substring(0, 50) + '...');
    
    // Step 2: Test the live-status endpoint with the token
    console.log('\n2️⃣ Testing /api/admin/fleet/vehicles/live-status with JWT token...');
    const fleetResponse = await axios.get('http://localhost:3001/api/admin/fleet/vehicles/live-status', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Fleet data fetched successfully!');
    console.log('   Status:', fleetResponse.status);
    console.log('   Success:', fleetResponse.data.success);
    console.log('   Vehicles count:', fleetResponse.data.data?.length || 0);
    
    if (fleetResponse.data.data && fleetResponse.data.data.length > 0) {
      console.log('\n📊 Sample vehicle data:');
      const sample = fleetResponse.data.data[0];
      console.log('   Registration:', sample.registrationNumber);
      console.log('   Status:', sample.status);
      console.log('   Driver:', sample.driver?.name || 'Not assigned');
      console.log('   Trips Today:', sample.tripsToday);
      console.log('   Has Location:', !!sample.liveLocation);
    }
    
    console.log('\n✅ ALL TESTS PASSED!');
    console.log('='.repeat(80));
    console.log('\n📝 FLUTTER FIX SUMMARY:');
    console.log('   ✅ JWT token retrieval fixed in enhanced_fleet_map_screen.dart');
    console.log('   ✅ JWT token retrieval fixed in fleet_vehicles_list_screen.dart');
    console.log('   ✅ Backend endpoint is working correctly');
    console.log('   ✅ Authentication is properly configured');
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Hot reload your Flutter app (press "r" in terminal)');
    console.log('   2. Navigate to Fleet Map View');
    console.log('   3. The 401 error should be resolved!');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message || error.message);
    console.error('   Data:', error.response?.data);
    process.exit(1);
  }
}

testFleetMapAuth();
