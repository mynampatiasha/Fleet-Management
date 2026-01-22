// Test complete route assignment end-to-end
const axios = require('axios');

async function testCompleteRouteAssignment() {
  console.log('🧪 TESTING COMPLETE ROUTE ASSIGNMENT');
  console.log('='.repeat(50));
  
  const baseURL = 'http://localhost:3001';
  
  // Test data - using a simple route with one customer
  const testRoute = [
    {
      rosterId: '694a8a867dad313c6ad8b996', // Rakesh Verma from our debug
      customerId: 'customer123',
      customerName: 'Rakesh Verma',
      customerEmail: 'rakesh@example.com',
      customerPhone: '+91-9876543210',
      sequence: 1,
      pickupTime: '09:00',
      eta: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
      location: 'Test Location, Bangalore',
      distanceFromPrevious: 5.2,
      estimatedTime: 25
    }
  ];
  
  const requestData = {
    vehicleId: '694a7cddc1882931f34d491f', // Test vehicle from debug
    route: testRoute,
    totalDistance: 5.2,
    totalTime: 25,
    startTime: '09:00'
  };
  
  try {
    console.log('📤 Sending route assignment request...');
    console.log(`   Vehicle ID: ${requestData.vehicleId}`);
    console.log(`   Customer: ${testRoute[0].customerName}`);
    console.log(`   Roster ID: ${testRoute[0].rosterId}`);
    
    const response = await axios.post(
      `${baseURL}/api/route-optimization/assign-optimized-route`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token' // You might need a real token
        },
        timeout: 30000
      }
    );
    
    console.log('\n📥 Response received:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Message: ${response.data.message}`);
    
    if (response.data.success) {
      console.log('\n✅ ROUTE ASSIGNMENT SUCCESS!');
      console.log(`   Customers assigned: ${response.data.successCount}`);
      console.log(`   Errors: ${response.data.errorCount}`);
      
      if (response.data.data && response.data.data.successful) {
        response.data.data.successful.forEach((result, index) => {
          console.log(`\n   ${index + 1}. ${result.customerName}`);
          console.log(`      Trip ID: ${result.tripId}`);
          console.log(`      Trip Number: ${result.tripNumber}`);
          console.log(`      Status: ${result.status}`);
        });
      }
    } else {
      console.log('\n❌ ROUTE ASSIGNMENT FAILED');
      console.log(`   Advice: ${response.data.advice}`);
      
      if (response.data.data && response.data.data.failed) {
        response.data.data.failed.forEach((error, index) => {
          console.log(`\n   Error ${index + 1}: ${error.customerName}`);
          console.log(`      Issue: ${error.friendlyMessage}`);
          console.log(`      Action: ${error.actionRequired}`);
        });
      }
    }
    
  } catch (error) {
    console.log('\n❌ REQUEST FAILED');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      console.log(`   Advice: ${error.response.data?.advice || 'No advice provided'}`);
    } else if (error.request) {
      console.log('   No response received - server might be down');
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

testCompleteRouteAssignment().catch(console.error);