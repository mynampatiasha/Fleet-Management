// Test script to verify driver pickup status functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDriverPickupFlow() {
  try {
    console.log('🧪 Testing Driver Pickup Status Flow');
    console.log('=' * 50);

    // You'll need to replace this with a valid driver token
    const driverToken = 'YOUR_DRIVER_TOKEN_HERE';
    
    const headers = {
      'Authorization': `Bearer ${driverToken}`,
      'Content-Type': 'application/json'
    };

    // Step 1: Get today's route
    console.log('📋 Step 1: Getting today\'s route...');
    const routeResponse = await axios.get(`${BASE_URL}/api/driver/route/today`, { headers });
    
    if (!routeResponse.data.data.hasRoute) {
      console.log('❌ No route found for today');
      return;
    }

    const customers = routeResponse.data.data.customers;
    const routeSummary = routeResponse.data.data.routeSummary;
    
    console.log('✅ Route found:');
    console.log(`   Total customers: ${routeSummary.totalCustomers}`);
    console.log(`   Completed customers: ${routeSummary.completedCustomers}`);
    console.log(`   Pending customers: ${routeSummary.pendingCustomers}`);
    
    // Show customer statuses
    console.log('\n👥 Customer statuses:');
    customers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.name} - Status: ${customer.status}`);
    });

    // Step 2: Find a customer to mark as picked up
    const pendingCustomer = customers.find(c => c.status === 'pending' || c.status === 'assigned');
    
    if (!pendingCustomer) {
      console.log('⚠️  No pending customers found to test pickup');
      return;
    }

    console.log(`\n📍 Step 2: Marking customer as picked up: ${pendingCustomer.name}`);
    
    // Mark customer as picked up
    const pickupResponse = await axios.post(
      `${BASE_URL}/api/driver/route/mark-customer-picked`,
      {
        rosterId: pendingCustomer.id,
        latitude: 12.9716,
        longitude: 77.5946
      },
      { headers }
    );

    console.log('✅ Pickup response:', pickupResponse.data);

    // Step 3: Get route again to verify counts
    console.log('\n🔄 Step 3: Refreshing route to check updated counts...');
    const updatedRouteResponse = await axios.get(`${BASE_URL}/api/driver/route/today`, { headers });
    
    const updatedCustomers = updatedRouteResponse.data.data.customers;
    const updatedSummary = updatedRouteResponse.data.data.routeSummary;
    
    console.log('📊 Updated counts:');
    console.log(`   Total customers: ${updatedSummary.totalCustomers}`);
    console.log(`   Completed customers: ${updatedSummary.completedCustomers}`);
    console.log(`   Pending customers: ${updatedSummary.pendingCustomers}`);
    
    // Show updated customer statuses
    console.log('\n👥 Updated customer statuses:');
    updatedCustomers.forEach((customer, index) => {
      const statusIcon = customer.status === 'picked_up' ? '✅' : 
                        customer.status === 'completed' ? '🏁' : '⏳';
      console.log(`   ${index + 1}. ${customer.name} - Status: ${customer.status} ${statusIcon}`);
    });

    // Verify the specific customer was updated
    const updatedCustomer = updatedCustomers.find(c => c.id === pendingCustomer.id);
    if (updatedCustomer && updatedCustomer.status === 'picked_up') {
      console.log(`\n✅ SUCCESS: Customer ${updatedCustomer.name} is now marked as picked_up`);
    } else {
      console.log(`\n❌ ISSUE: Customer status not updated correctly`);
      console.log(`   Expected: picked_up`);
      console.log(`   Actual: ${updatedCustomer?.status || 'not found'}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Instructions for running the test
console.log(`
🧪 DRIVER PICKUP STATUS TEST

To run this test:
1. Make sure the backend is running on localhost:3001
2. Get a valid driver Firebase token
3. Replace 'YOUR_DRIVER_TOKEN_HERE' with the actual token
4. Run: node test-driver-pickup-status.js

This will test the complete flow:
- Get today's route
- Mark a customer as picked up
- Verify the counts are updated correctly
`);

// Uncomment to run the test
// testDriverPickupFlow();