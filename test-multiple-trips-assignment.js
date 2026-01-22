// Test script to check if multiple trips assignment is working correctly
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testMultipleTripsAssignment() {
  console.log('🧪 TESTING MULTIPLE TRIPS ASSIGNMENT SYSTEM');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Check if we have pending rosters
    console.log('\n📋 Step 1: Checking pending rosters...');
    const rostersResponse = await axios.get(`${BASE_URL}/roster/admin/pending`, {
      headers: {
        'x-test-firebase-uid': 'test-admin-uid'
      }
    });
    
    const pendingRosters = rostersResponse.data.data || [];
    console.log(`✅ Found ${pendingRosters.length} pending rosters`);
    
    if (pendingRosters.length < 4) {
      console.log('❌ Need at least 4 pending rosters to test grouping');
      return;
    }
    
    // Step 2: Test Smart Grouping
    console.log('\n🔍 Step 2: Testing Smart Grouping...');
    const groupingResponse = await axios.post(`${BASE_URL}/roster/admin/group-similar`, {}, {
      headers: {
        'x-test-firebase-uid': 'test-admin-uid'
      }
    });
    
    const groups = groupingResponse.data.groups || [];
    console.log(`✅ Found ${groups.length} groups`);
    
    if (groups.length === 0) {
      console.log('❌ No groups found - cannot test multiple trips assignment');
      return;
    }
    
    // Step 3: Take first group and test route optimization
    const firstGroup = groups[0];
    const rosterIds = firstGroup.rosterIds || [];
    console.log(`\n🎯 Step 3: Testing route optimization for group with ${rosterIds.length} customers...`);
    
    // Step 4: Test compatible vehicles
    console.log('\n🚗 Step 4: Getting compatible vehicles...');
    const vehiclesResponse = await axios.post(`${BASE_URL}/route-optimization/compatible-vehicles`, {
      rosterIds: rosterIds
    }, {
      headers: {
        'x-test-firebase-uid': 'test-admin-uid',
        'Content-Type': 'application/json'
      }
    });
    
    const compatibleVehicles = vehiclesResponse.data.data?.compatible || [];
    console.log(`✅ Found ${compatibleVehicles.length} compatible vehicles`);
    
    if (compatibleVehicles.length === 0) {
      console.log('❌ No compatible vehicles found');
      console.log('Incompatible vehicles:', vehiclesResponse.data.data?.incompatible?.length || 0);
      return;
    }
    
    // Step 5: Test actual assignment
    console.log('\n📝 Step 5: Testing actual assignment...');
    const bestVehicle = compatibleVehicles[0];
    
    // Create mock route data
    const mockRoute = rosterIds.map((rosterId, index) => ({
      rosterId: rosterId,
      customerId: `customer_${index}`,
      customerName: `Customer ${index + 1}`,
      customerEmail: `customer${index + 1}@test.com`,
      customerPhone: `+91900000000${index}`,
      sequence: index + 1,
      pickupTime: `0${7 + index}:00`,
      eta: new Date(Date.now() + (index * 30 * 60 * 1000)).toISOString(),
      location: `Location ${index + 1}`,
      distanceFromPrevious: index === 0 ? 0 : 5,
      estimatedTime: 30
    }));
    
    const assignmentResponse = await axios.post(`${BASE_URL}/route-optimization/assign-optimized-route`, {
      vehicleId: bestVehicle._id,
      route: mockRoute,
      totalDistance: 25,
      totalTime: 120,
      startTime: '07:00'
    }, {
      headers: {
        'x-test-firebase-uid': 'test-admin-uid',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ ASSIGNMENT RESULT:');
    console.log(`Success: ${assignmentResponse.data.success}`);
    console.log(`Message: ${assignmentResponse.data.message}`);
    console.log(`Successful assignments: ${assignmentResponse.data.successCount}`);
    console.log(`Failed assignments: ${assignmentResponse.data.errorCount}`);
    console.log(`Trips created: ${assignmentResponse.data.data?.tripIds?.length || 0}`);
    
    if (assignmentResponse.data.data?.failed?.length > 0) {
      console.log('\n❌ FAILED ASSIGNMENTS:');
      assignmentResponse.data.data.failed.forEach(failure => {
        console.log(`   - ${failure.customerName}: ${failure.friendlyMessage}`);
      });
    }
    
    console.log('\n🎉 TEST COMPLETED');
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMultipleTripsAssignment();