// Test script to verify vehicle details API with driver information
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testVehicleDetailsAPI() {
  try {
    console.log('🔍 Testing Vehicle Details API...\n');

    // First, get all vehicles to find a vehicle ID
    console.log('1. Fetching all vehicles...');
    const vehiclesResponse = await axios.get(`${BASE_URL}/api/admin/vehicles?limit=5`);
    
    if (!vehiclesResponse.data.success || vehiclesResponse.data.data.length === 0) {
      console.log('❌ No vehicles found');
      return;
    }

    const vehicles = vehiclesResponse.data.data;
    console.log(`✅ Found ${vehicles.length} vehicles`);

    // Test each vehicle
    for (const vehicle of vehicles.slice(0, 3)) {
      console.log(`\n2. Testing vehicle: ${vehicle.vehicleNumber || vehicle.registrationNumber}`);
      console.log(`   Vehicle ID: ${vehicle._id}`);
      console.log(`   Driver: ${vehicle.assignedDriver?.name || 'None'}`);
      console.log(`   Seat Capacity: ${vehicle.capacity?.passengers || vehicle.seatingCapacity || 'Unknown'}`);

      // Test individual vehicle details
      try {
        const vehicleDetailsResponse = await axios.get(`${BASE_URL}/api/admin/vehicles/${vehicle._id}`);
        if (vehicleDetailsResponse.data.success) {
          console.log(`   ✅ Vehicle details API working`);
        }
      } catch (error) {
        console.log(`   ❌ Vehicle details API failed: ${error.message}`);
      }

      // Test assigned customers
      try {
        const customersResponse = await axios.get(`${BASE_URL}/api/admin/vehicles/${vehicle._id}/assigned-customers`);
        if (customersResponse.data.success) {
          const data = customersResponse.data.data;
          console.log(`   ✅ Assigned customers API working`);
          console.log(`   📊 Capacity: ${data.capacity?.occupied || 0}/${data.capacity?.total || 0}`);
          console.log(`   👥 Customers: ${data.customers?.length || 0}`);
          console.log(`   🚗 Driver: ${data.driver?.name || 'None'}`);
        }
      } catch (error) {
        console.log(`   ❌ Assigned customers API failed: ${error.message}`);
      }
    }

    console.log('\n✅ Vehicle Details API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testVehicleDetailsAPI();