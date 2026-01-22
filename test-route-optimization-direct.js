// Test route optimization directly with specific rosters
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testRouteOptimizationDirect() {
  console.log('🧪 TESTING ROUTE OPTIMIZATION DIRECTLY');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Get pending rosters
    console.log('\n📋 Step 1: Getting pending rosters...');
    const rostersResponse = await axios.get(`${BASE_URL}/roster/admin/pending`, {
      headers: {
        'x-test-firebase-uid': 'test-admin-uid'
      }
    });
    
    const pendingRosters = rostersResponse.data.data || [];
    console.log(`✅ Found ${pendingRosters.length} pending rosters`);
    
    // Find TCS rosters (by domain)
    const tcsRosters = pendingRosters.filter(roster => {
      const email = roster.customerEmail || roster.employeeDetails?.email;
      return email && email.includes('@tcs.com');
    });
    
    console.log(`✅ Found ${tcsRosters.length} tcs.com rosters`);
    
    if (tcsRosters.length < 3) {
      console.log('❌ Need at least 3 tcs.com rosters for testing');
      return;
    }
    
    // Take first 3 rosters
    const selectedRosters = tcsRosters.slice(0, 3);
    const rosterIds = selectedRosters.map(r => r._id);
    
    console.log('\n🎯 Selected rosters for testing (tcs.com domain):');
    selectedRosters.forEach((roster, index) => {
      const email = roster.customerEmail || roster.employeeDetails?.email;
      console.log(`   ${index + 1}. ${roster.customerName || roster.employeeDetails?.name} - ${email}`);
    });
    
    // Step 2: Test compatible vehicles
    console.log('\n🚗 Step 2: Getting compatible vehicles...');
    const vehiclesResponse = await axios.post(`${BASE_URL}/roster/compatible-vehicles`, {
      rosterIds: rosterIds
    }, {
      headers: {
        'x-test-firebase-uid': 'test-admin-uid',
        'Content-Type': 'application/json'
      }
    });
    
    const compatibleVehicles = vehiclesResponse.data.data?.compatible || [];
    const incompatibleVehicles = vehiclesResponse.data.data?.incompatible || [];
    
    console.log(`✅ Found ${compatibleVehicles.length} compatible vehicles`);
    console.log(`⚠️  Found ${incompatibleVehicles.length} incompatible vehicles`);
    
    if (incompatibleVehicles.length > 0) {
      console.log('\n❌ Incompatible vehicles:');
      incompatibleVehicles.forEach(vehicle => {
        console.log(`   - ${vehicle.registrationNumber || vehicle.name}: ${vehicle.reason}`);
      });
    }
    
    if (compatibleVehicles.length === 0) {
      console.log('❌ No compatible vehicles found - cannot proceed');
      return;
    }
    
    // Step 3: Test actual assignment
    console.log('\n📝 Step 3: Testing route assignment...');
    const bestVehicle = compatibleVehicles[0];
    console.log(`Selected vehicle: ${bestVehicle.registrationNumber || bestVehicle.name}`);
    console.log(`Driver: ${bestVehicle.assignedDriver?.name || 'Unknown'}`);
    console.log(`Capacity: ${bestVehicle.seatCapacity} seats`);
    
    // Create route data from selected rosters
    const route = selectedRosters.map((roster, index) => ({
      rosterId: roster._id,
      customerId: roster.customerId || `CUST-${roster._id}`,
      customerName: roster.customerName || roster.employeeDetails?.name,
      customerEmail: roster.customerEmail || roster.employeeDetails?.email,
      customerPhone: roster.customerPhone || roster.employeeDetails?.phone,
      sequence: index + 1,
      pickupTime: `0${7 + index}:${index * 15}`.slice(-5),
      eta: new Date(Date.now() + (index * 30 * 60 * 1000)).toISOString(),
      location: {
        latitude: roster.pickupLocation?.latitude || (12.9716 + (index * 0.01)),
        longitude: roster.pickupLocation?.longitude || (77.5946 + (index * 0.01)),
        address: roster.pickupLocation?.address || `Pickup Location ${index + 1}, Bangalore`
      },
      distanceFromPrevious: index === 0 ? 0 : 5,
      estimatedTime: 30
    }));
    
    console.log('\n📍 Route details:');
    route.forEach(stop => {
      console.log(`   ${stop.sequence}. ${stop.customerName} at ${stop.pickupTime} (${stop.location.address})`);
    });
    
    const assignmentResponse = await axios.post(`${BASE_URL}/roster/assign-optimized-route`, {
      vehicleId: bestVehicle._id,
      route: route,
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
    
    if (assignmentResponse.data.success) {
      const data = assignmentResponse.data.data;
      console.log(`Vehicle: ${data.vehicleName}`);
      console.log(`Driver: ${data.driverName}`);
      console.log(`Successful assignments: ${data.successCount}`);
      console.log(`Failed assignments: ${data.errorCount}`);
      console.log(`Customer notifications: ${data.notifications?.customers || 0}`);
      console.log(`Driver notifications: ${data.notifications?.driver || 0}`);
      console.log(`Failed notifications: ${data.notifications?.failed || 0}`);
      
      if (data.failed && data.failed.length > 0) {
        console.log('\n❌ FAILED ASSIGNMENTS:');
        data.failed.forEach(failure => {
          console.log(`   - ${failure.customerName}: ${failure.friendlyMessage}`);
        });
      }
    } else {
      console.log(`Error: ${assignmentResponse.data.error}`);
      if (assignmentResponse.data.details) {
        console.log(`Details:`, assignmentResponse.data.details);
      }
      if (assignmentResponse.data.data?.failed) {
        console.log('\n❌ FAILED ASSIGNMENTS:');
        assignmentResponse.data.data.failed.forEach(failure => {
          console.log(`   - ${failure.customerName}: ${failure.friendlyMessage || failure.error}`);
        });
      }
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
testRouteOptimizationDirect();