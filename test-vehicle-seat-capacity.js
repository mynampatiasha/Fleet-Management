// test-vehicle-seat-capacity.js - Test vehicle seat capacity extraction
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testVehicleSeatCapacity() {
  try {
    console.log('🚗 ========== TESTING VEHICLE SEAT CAPACITY ==========');
    console.log('API Base URL:', API_BASE_URL);
    console.log('====================================================\n');

    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connection...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Backend is running:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Backend connection failed:', error.message);
      console.log('💡 Make sure to run: npm start in abra_fleet_backend folder');
      return;
    }

    // Test 2: Fetch vehicles and check seat capacity data
    console.log('\n2️⃣ Testing vehicle data structure...');
    try {
      const vehiclesResponse = await axios.get(`${API_BASE_URL}/api/admin/vehicles?limit=5`);
      
      if (vehiclesResponse.data.success && vehiclesResponse.data.data.length > 0) {
        console.log('✅ Vehicles found in database:');
        
        vehiclesResponse.data.data.forEach((vehicle, index) => {
          console.log(`\n🚗 Vehicle ${index + 1}: ${vehicle.registrationNumber || vehicle.vehicleNumber}`);
          console.log('   📊 Seat Capacity Fields:');
          console.log('      - seatCapacity:', vehicle.seatCapacity);
          console.log('      - seatingCapacity:', vehicle.seatingCapacity);
          console.log('      - capacity.passengers:', vehicle.capacity?.passengers);
          console.log('      - capacity object:', JSON.stringify(vehicle.capacity));
          
          // Determine which field should be used
          let finalSeatCapacity = 0;
          if (vehicle.seatCapacity != null) {
            finalSeatCapacity = vehicle.seatCapacity;
            console.log('   ✅ Using seatCapacity:', finalSeatCapacity);
          } else if (vehicle.seatingCapacity != null) {
            finalSeatCapacity = vehicle.seatingCapacity;
            console.log('   ✅ Using seatingCapacity:', finalSeatCapacity);
          } else if (vehicle.capacity?.passengers != null) {
            finalSeatCapacity = vehicle.capacity.passengers;
            console.log('   ✅ Using capacity.passengers:', finalSeatCapacity);
          } else {
            finalSeatCapacity = 4; // Default
            console.log('   ⚠️ Using default capacity:', finalSeatCapacity);
          }
          
          console.log('   🎯 Final Seat Capacity:', finalSeatCapacity);
        });
        
        console.log('\n💡 RECOMMENDATION:');
        const firstVehicle = vehiclesResponse.data.data[0];
        if (firstVehicle.seatCapacity != null) {
          console.log('   Use "seatCapacity" field - it\'s available and populated');
        } else if (firstVehicle.capacity?.passengers != null) {
          console.log('   Use "capacity.passengers" field - seatCapacity not available');
        } else {
          console.log('   Need to check backend data structure - no clear seat capacity field');
        }
        
      } else {
        console.log('⚠️ No vehicles found in database');
        console.log('   Add some vehicles first before testing');
      }
    } catch (error) {
      console.log('❌ Failed to fetch vehicles:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log('💡 Authentication required - this is normal for production');
      }
    }

    console.log('\n🚗 ========== TEST COMPLETED ==========');
    console.log('📊 SEAT CAPACITY EXTRACTION GUIDE:');
    console.log('1. Check which field contains seat capacity data');
    console.log('2. Update Vehicle.fromJson() method accordingly');
    console.log('3. Test in Flutter app to verify correct display');
    console.log('4. Ensure dropdown shows correct seat counts');
    console.log('=========================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVehicleSeatCapacity();