// Test the vehicle selection API directly
const axios = require('axios');

async function testVehicleAPI() {
  console.log('\n' + '🧪' * 80);
  console.log('🧪 TESTING VEHICLE SELECTION API DIRECTLY');
  console.log('🧪' * 80);
  
  try {
    const baseURL = 'http://localhost:3001';
    
    // First, get pending rosters
    console.log('\n📋 Step 1: Getting pending rosters...');
    
    const rostersResponse = await axios.get(`${baseURL}/api/assignment/pending-rosters`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Status:', rostersResponse.status);
    console.log('   Success:', rostersResponse.data.success);
    
    const individuals = rostersResponse.data.data?.individuals || [];
    console.log('   Individuals found:', individuals.length);
    
    if (individuals.length === 0) {
      console.log('❌ No pending rosters to test with');
      return;
    }
    
    // Get first roster for testing
    const testRoster = individuals[0];
    console.log(`\n📋 Test Roster: ${testRoster.customerName}`);
    console.log(`   ID: ${testRoster._id}`);
    console.log(`   Email: ${testRoster.customerEmail}`);
    
    // Test vehicle matching
    console.log('\n🔍 Step 2: Finding matching vehicles...');
    
    const vehiclesResponse = await axios.post(`${baseURL}/api/assignment/find-matches`, {
      rosterIds: [testRoster._id]
    }, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   Status:', vehiclesResponse.status);
    console.log('   Success:', vehiclesResponse.data.success);
    
    const responseData = vehiclesResponse.data;
    console.log('\n📊 API RESPONSE STRUCTURE:');
    console.log('   Response Keys:', Object.keys(responseData));
    
    if (responseData.data) {
      const data = responseData.data;
      console.log('   Data Keys:', Object.keys(data));
      console.log('   Best Match:', data.bestMatch ? 'Found' : 'None');
      console.log('   Alternatives:', data.alternatives?.length || 0);
      console.log('   All Options:', data.allOptions?.length || 0);
      console.log('   Stats:', data.stats);
      
      if (data.allOptions && data.allOptions.length > 0) {
        console.log('\n🚗 VEHICLE OPTIONS FOUND:');
        data.allOptions.forEach((vehicle, index) => {
          console.log(`   ${index + 1}. ${vehicle.vehicleReg} - Score: ${vehicle.totalScore}/100`);
          console.log(`      Driver: ${vehicle.details?.driverName || 'Unknown'}`);
          console.log(`      Distance: ${vehicle.details?.distanceKm?.toFixed(2) || 'N/A'} km`);
          console.log(`      Available Seats: ${vehicle.details?.availableSeats || 'N/A'}`);
        });
        
        console.log('\n✅ SUCCESS: Vehicle selection should work now!');
        console.log(`   Frontend will access: result["data"]["allOptions"]`);
        console.log(`   ${data.allOptions.length} vehicles available for assignment`);
        
        // Test the exact structure the frontend expects
        console.log('\n🎯 FRONTEND DATA STRUCTURE TEST:');
        console.log('   result["data"]["bestMatch"]:', data.bestMatch ? 'Found' : 'None');
        console.log('   result["data"]["alternatives"]:', Array.isArray(data.alternatives));
        console.log('   result["data"]["allOptions"]:', Array.isArray(data.allOptions));
        console.log('   result["data"]["stats"]:', typeof data.stats);
        
      } else {
        console.log('\n❌ NO VEHICLES FOUND');
        console.log('   This explains why dialog shows "No compatible vehicles found"');
        
        if (data.rejected && data.rejected.length > 0) {
          console.log('\n📋 REJECTED VEHICLES:');
          data.rejected.forEach((rejected, index) => {
            console.log(`   ${index + 1}. ${rejected.vehicle?.registrationNumber || 'Unknown'}: ${rejected.reason}`);
          });
        }
      }
    } else {
      console.log('❌ No data field in response');
    }
    
  } catch (error) {
    console.error('\n❌ API TEST FAILED:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
  
  console.log('\n' + '🧪' * 80 + '\n');
}

testVehicleAPI();