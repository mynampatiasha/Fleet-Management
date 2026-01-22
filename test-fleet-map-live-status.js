// Test script to check Fleet Map live-status API response
const axios = require('axios');

async function testFleetMapAPI() {
  console.log('\n🧪 TESTING FLEET MAP LIVE STATUS API');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Login to get JWT token
    console.log('\n1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });
    
    console.log('✅ Login successful');
    console.log('   Response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    if (!token) {
      throw new Error('No token received from login');
    }
    console.log('   Token:', token.substring(0, 20) + '...');
    
    // Step 2: Test the live-status endpoint
    console.log('\n2️⃣ Fetching vehicles live status...');
    const response = await axios.get('http://localhost:3001/api/admin/fleet/vehicles/live-status', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n📊 RESPONSE DATA:');
    console.log('   Status:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Vehicle Count:', response.data.count);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📋 SAMPLE VEHICLE DATA:');
      const sampleVehicle = response.data.data[0];
      console.log('   Vehicle:', JSON.stringify(sampleVehicle, null, 2));
      
      // Check for null values
      console.log('\n🔍 NULL VALUE CHECK:');
      console.log('   _id:', sampleVehicle._id !== null ? '✅' : '❌ NULL');
      console.log('   registrationNumber:', sampleVehicle.registrationNumber !== null ? '✅' : '❌ NULL');
      console.log('   driver:', sampleVehicle.driver !== null ? '✅' : '❌ NULL');
      console.log('   status:', sampleVehicle.status !== null ? '✅' : '❌ NULL');
      console.log('   liveLocation:', sampleVehicle.liveLocation !== null ? '✅' : '❌ NULL');
      console.log('   currentTrip:', sampleVehicle.currentTrip !== null ? '✅' : '❌ NULL');
      console.log('   tripsToday:', sampleVehicle.tripsToday !== null ? '✅' : '❌ NULL');
      
      // Check driver structure if present
      if (sampleVehicle.driver) {
        console.log('\n👤 DRIVER DATA STRUCTURE:');
        console.log('   Type:', typeof sampleVehicle.driver);
        console.log('   Keys:', Object.keys(sampleVehicle.driver));
        console.log('   name:', sampleVehicle.driver.name);
        console.log('   phone:', sampleVehicle.driver.phone || sampleVehicle.driver.phoneNumber);
      }
      
      // Check location structure if present
      if (sampleVehicle.liveLocation) {
        console.log('\n📍 LOCATION DATA STRUCTURE:');
        console.log('   Type:', typeof sampleVehicle.liveLocation);
        console.log('   Keys:', Object.keys(sampleVehicle.liveLocation));
        console.log('   coordinates:', sampleVehicle.liveLocation.coordinates);
        console.log('   latitude:', sampleVehicle.liveLocation.latitude);
        console.log('   longitude:', sampleVehicle.liveLocation.longitude);
      }
    }
    
    console.log('\n✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('   Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   No response received from server');
      console.error('   Request:', error.request.path);
    } else {
      console.error('   Full error:', error);
    }
    console.log('='.repeat(80));
    process.exit(1);
  }
}

testFleetMapAPI();
