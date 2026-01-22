// Test script to verify the stats mismatch fix
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testStatsFix() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING STATS FIX');
    console.log('='.repeat(80));
    
    // You'll need to replace this with a real customer token
    const customerEmail = 'customer123@abrafleet.com'; // REPLACE
    const testToken = 'YOUR_CUSTOMER_TOKEN_HERE'; // REPLACE
    
    console.log(`\n📧 Testing for customer: ${customerEmail}`);
    console.log(`🔑 Using test token: ${testToken.substring(0, 20)}...`);
    
    // 1. Test My Trips endpoint
    console.log('\n1️⃣ TESTING MY TRIPS ENDPOINT');
    console.log('-'.repeat(80));
    
    const myTripsResponse = await axios.get(
      `${BACKEND_URL}/api/roster/customer/my-rosters`,
      {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'x-test-firebase-uid': 'customer123-firebase-uid' // For testing
        }
      }
    );
    
    console.log(`✅ My Trips Response:`);
    console.log(`   Total rosters: ${myTripsResponse.data.count}`);
    
    if (myTripsResponse.data.data && myTripsResponse.data.data.length > 0) {
      const firstRoster = myTripsResponse.data.data[0];
      console.log(`   First roster:`);
      console.log(`      Driver: ${firstRoster.driverName}`);
      console.log(`      Vehicle: ${firstRoster.vehicleNumber}`);
      console.log(`      Status: ${firstRoster.status}`);
    }
    
    // 2. Test Stats endpoint
    console.log('\n2️⃣ TESTING STATS ENDPOINT');
    console.log('-'.repeat(80));
    
    const statsResponse = await axios.get(
      `${BACKEND_URL}/api/customer/stats/dashboard`,
      {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'x-test-firebase-uid': 'customer123-firebase-uid' // For testing
        }
      }
    );
    
    console.log(`✅ Stats Response:`);
    console.log(`   Total trips: ${statsResponse.data.data.totalTrips.total}`);
    console.log(`   Completed: ${statsResponse.data.data.totalTrips.completed}`);
    console.log(`   Ongoing: ${statsResponse.data.data.totalTrips.ongoing}`);
    console.log(`   Total distance: ${statsResponse.data.data.totalDistance} km`);
    
    if (statsResponse.data.data.recentTrip) {
      console.log(`   Recent trip:`);
      console.log(`      Driver: ${statsResponse.data.data.recentTrip.driverName}`);
      console.log(`      Vehicle: ${statsResponse.data.data.recentTrip.vehicleNumber}`);
      console.log(`      Distance: ${statsResponse.data.data.recentTrip.distance} km`);
    }
    
    // 3. Compare the data
    console.log('\n3️⃣ COMPARING DATA');
    console.log('-'.repeat(80));
    
    const myTripsDriver = myTripsResponse.data.data[0]?.driverName;
    const statsDriver = statsResponse.data.data.recentTrip?.driverName;
    
    if (myTripsDriver === statsDriver) {
      console.log(`✅ SUCCESS! Drivers match:`);
      console.log(`   My Trips: ${myTripsDriver}`);
      console.log(`   MyStats: ${statsDriver}`);
    } else {
      console.log(`❌ MISMATCH! Drivers don't match:`);
      console.log(`   My Trips: ${myTripsDriver}`);
      console.log(`   MyStats: ${statsDriver}`);
    }
    
    const myTripsVehicle = myTripsResponse.data.data[0]?.vehicleNumber;
    const statsVehicle = statsResponse.data.data.recentTrip?.vehicleNumber;
    
    if (myTripsVehicle === statsVehicle) {
      console.log(`✅ SUCCESS! Vehicles match:`);
      console.log(`   My Trips: ${myTripsVehicle}`);
      console.log(`   MyStats: ${statsVehicle}`);
    } else {
      console.log(`❌ MISMATCH! Vehicles don't match:`);
      console.log(`   My Trips: ${myTripsVehicle}`);
      console.log(`   MyStats: ${statsVehicle}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

console.log('📝 NOTE: Update the customerEmail and testToken variables before running');
console.log('');
testStatsFix();
