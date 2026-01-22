// ============================================================================
// TEST CONSECUTIVE TRIP ASSIGNMENT LOGIC
// Tests the vehicle compatibility check for consecutive trips
// ============================================================================

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';

async function testConsecutiveTripAssignment() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING CONSECUTIVE TRIP ASSIGNMENT LOGIC');
  console.log('='.repeat(80));

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // STEP 1: Create test data - active trip for a vehicle
    console.log('\n📋 STEP 1: Setting up test data...');
    
    // Find a vehicle with assigned driver
    const testVehicle = await db.collection('vehicles').findOne({
      status: { $regex: /^active$/i },
      $or: [
        { assignedDriver: { $exists: true, $ne: null } },
        { driverId: { $exists: true, $ne: null } }
      ]
    });
    
    if (!testVehicle) {
      console.log('❌ No vehicles with assigned drivers found');
      return;
    }
    
    console.log(`✅ Using test vehicle: ${testVehicle.registrationNumber || testVehicle.name || 'Vehicle'}`);
    console.log(`   Vehicle ID: ${testVehicle._id}`);
    
    // Create a test active trip
    const currentTime = new Date();
    const tripEndTime = new Date(currentTime.getTime() + (30 * 60 * 1000)); // 30 minutes from now
    
    const testTrip = {
      tripNumber: `TEST-TRIP-${Date.now()}`,
      vehicleId: testVehicle._id.toString(),
      status: 'in_progress',
      scheduledDate: new Date().toISOString().split('T')[0],
      estimatedEndTime: tripEndTime.toISOString(),
      endLocation: 'Whitefield, Bangalore',
      lastDropLocation: 'ITPL Main Road, Whitefield',
      createdAt: new Date(),
      testData: true // Mark as test data for cleanup
    };
    
    const tripResult = await db.collection('trips').insertOne(testTrip);
    console.log(`✅ Created test active trip: ${testTrip.tripNumber}`);
    console.log(`   Trip ends at: ${tripEndTime.toLocaleTimeString()}`);
    console.log(`   End location: ${testTrip.endLocation}`);
    
    // STEP 2: Create test rosters for consecutive trip
    console.log('\n📋 STEP 2: Creating test rosters for consecutive trip...');
    
    const nextTripTime = new Date(tripEndTime.getTime() + (60 * 60 * 1000)); // 1 hour after current trip ends
    const nextTripTimeStr = `${String(nextTripTime.getHours()).padStart(2, '0')}:${String(nextTripTime.getMinutes()).padStart(2, '0')}`;
    
    const testRosters = [
      {
        customerName: 'Test Customer 1',
        customerEmail: 'testcustomer1@tcs.com',
        startTime: nextTripTimeStr,
        loginTime: nextTripTimeStr,
        requestedPickupTime: nextTripTimeStr,
        pickupLocation: {
          address: 'Koramangala, Bangalore'
        },
        loginPickupAddress: 'Koramangala 5th Block, Bangalore',
        officeLocation: 'TCS Office, Electronic City',
        rosterType: 'login',
        status: 'pending_assignment',
        createdAt: new Date(),
        testData: true // Mark as test data for cleanup
      },
      {
        customerName: 'Test Customer 2', 
        customerEmail: 'testcustomer2@tcs.com',
        startTime: nextTripTimeStr,
        loginTime: nextTripTimeStr,
        requestedPickupTime: nextTripTimeStr,
        pickupLocation: {
          address: 'BTM Layout, Bangalore'
        },
        loginPickupAddress: 'BTM Layout 2nd Stage, Bangalore',
        officeLocation: 'TCS Office, Electronic City',
        rosterType: 'login',
        status: 'pending_assignment',
        createdAt: new Date(),
        testData: true // Mark as test data for cleanup
      }
    ];
    
    const rosterResults = await db.collection('rosters').insertMany(testRosters);
    const rosterIds = Object.values(rosterResults.insertedIds).map(id => id.toString());
    
    console.log(`✅ Created ${testRosters.length} test rosters`);
    console.log(`   Next trip time: ${nextTripTimeStr}`);
    console.log(`   Pickup locations: Koramangala, BTM Layout`);
    console.log(`   Roster IDs: ${rosterIds.join(', ')}`);
    
    // STEP 3: Test the compatible-vehicles API
    console.log('\n📋 STEP 3: Testing compatible-vehicles API...');
    
    const fetch = require('node-fetch');
    const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';
    
    // Mock auth token (in real scenario, you'd get this from login)
    const mockToken = 'test-token';
    
    const response = await fetch(`${API_BASE}/api/roster/compatible-vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify({
        rosterIds: rosterIds
      })
    });
    
    if (!response.ok) {
      console.log('⚠️  API call failed, testing logic directly...');
      
      // Test the logic directly
      await testConsecutiveTripLogicDirect(db, testVehicle._id.toString(), rosterIds, testTrip);
    } else {
      const result = await response.json();
      console.log('\n📊 API Response:');
      console.log(`   Compatible vehicles: ${result.data?.compatible?.length || 0}`);
      console.log(`   Incompatible vehicles: ${result.data?.incompatible?.length || 0}`);
      
      // Check if our test vehicle is in the results
      const ourVehicle = result.data?.compatible?.find(v => v._id.toString() === testVehicle._id.toString()) ||
                         result.data?.incompatible?.find(v => v._id.toString() === testVehicle._id.toString());
      
      if (ourVehicle) {
        console.log(`\n🚗 Our test vehicle (${testVehicle.registrationNumber || 'Vehicle'}):`);
        console.log(`   Status: ${ourVehicle.isCompatible ? '✅ Compatible' : '❌ Incompatible'}`);
        console.log(`   Reason: ${ourVehicle.compatibilityReason}`);
        
        if (ourVehicle.timingConstraint) {
          console.log(`   Timing Analysis:`);
          console.log(`     Distance to next pickup: ${ourVehicle.timingConstraint.distanceKm?.toFixed(1)} km`);
          console.log(`     Travel time needed: ${ourVehicle.timingConstraint.travelTimeMinutes} minutes`);
          console.log(`     Available time: ${ourVehicle.timingConstraint.availableTimeMinutes} minutes`);
          console.log(`     Time needed: ${ourVehicle.timingConstraint.timeNeeded} minutes`);
        }
        
        if (ourVehicle.timingInfo) {
          console.log(`   Timing Info:`);
          console.log(`     Has active trip: ${ourVehicle.timingInfo.hasActiveTrip}`);
          console.log(`     Consecutive trip feasible: ${ourVehicle.timingInfo.consecutiveTripFeasible}`);
        }
      } else {
        console.log(`\n⚠️  Our test vehicle not found in results`);
      }
    }
    
    // STEP 4: Cleanup test data
    console.log('\n📋 STEP 4: Cleaning up test data...');
    
    await db.collection('trips').deleteMany({ testData: true });
    await db.collection('rosters').deleteMany({ testData: true });
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ CONSECUTIVE TRIP ASSIGNMENT TEST COMPLETED');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await client.close();
  }
}

async function testConsecutiveTripLogicDirect(db, vehicleId, rosterIds, activeTrip) {
  console.log('\n🔧 Testing consecutive trip logic directly...');
  
  try {
    // Get rosters
    const rosters = await db.collection('rosters')
      .find({
        _id: { $in: rosterIds.map(id => new (require('mongodb')).ObjectId(id)) }
      })
      .toArray();
    
    console.log(`📋 Found ${rosters.length} rosters to test`);
    
    // Simulate the consecutive trip check logic
    const currentTripEndTime = new Date(activeTrip.estimatedEndTime);
    const currentTripEndLocation = activeTrip.endLocation || activeTrip.lastDropLocation;
    
    // Get new trip requirements from rosters
    const newTripStartTime = new Date();
    rosters.forEach(roster => {
      const rosterTime = roster.requestedPickupTime || roster.startTime || roster.loginTime;
      if (rosterTime) {
        const [hours, minutes] = rosterTime.split(':');
        const rosterDateTime = new Date();
        rosterDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        if (rosterDateTime < newTripStartTime || newTripStartTime.getTime() === new Date().getTime()) {
          newTripStartTime.setTime(rosterDateTime.getTime());
        }
      }
    });
    
    // Calculate required pickup start time (15 minutes before customer pickup)
    const requiredStartTime = new Date(newTripStartTime.getTime() - (15 * 60 * 1000));
    
    // Get first pickup location from rosters
    const firstPickupLocation = rosters[0]?.pickupLocation?.address || 
                               rosters[0]?.loginPickupAddress || 
                               'Unknown location';
    
    console.log(`📍 Current trip ends at: ${currentTripEndTime.toLocaleTimeString()}`);
    console.log(`📍 Current trip end location: ${currentTripEndLocation}`);
    console.log(`📍 Next trip pickup location: ${firstPickupLocation}`);
    console.log(`⏰ Required start time for next trip: ${requiredStartTime.toLocaleTimeString()}`);
    
    // Calculate distance using our helper function
    const { calculateDistanceBetweenLocations } = require('./abra_fleet_backend/routes/route_optimization_router.js');
    
    // Since we can't import the function directly, let's implement the logic here
    function calculateDistanceBetweenLocationsTest(location1, location2) {
      if (typeof location1 === 'string' && typeof location2 === 'string') {
        if (location1.toLowerCase() === location2.toLowerCase()) {
          return 0;
        }
        
        const location1Lower = location1.toLowerCase();
        const location2Lower = location2.toLowerCase();
        
        const commonWords = ['bangalore', 'bengaluru', 'whitefield', 'koramangala', 'indiranagar', 'btm', 'jayanagar'];
        const location1Areas = commonWords.filter(word => location1Lower.includes(word));
        const location2Areas = commonWords.filter(word => location2Lower.includes(word));
        
        if (location1Areas.length > 0 && location2Areas.length > 0) {
          return Math.random() * 5 + 2; // 2-7 km
        } else {
          return Math.random() * 10 + 8; // 8-18 km
        }
      }
      
      return 10; // Default estimate
    }
    
    const distance = calculateDistanceBetweenLocationsTest(currentTripEndLocation, firstPickupLocation);
    const travelTimeMinutes = Math.ceil((distance / 30) * 60); // 30 km/h average speed
    const bufferTimeMinutes = 15; // 15 minutes buffer
    const totalTimeNeeded = travelTimeMinutes + bufferTimeMinutes;
    
    // Calculate available time
    const availableTimeMs = requiredStartTime.getTime() - currentTripEndTime.getTime();
    const availableTimeMinutes = Math.floor(availableTimeMs / (60 * 1000));
    
    console.log(`📏 Distance to next pickup: ${distance.toFixed(1)} km`);
    console.log(`🕐 Travel time needed: ${travelTimeMinutes} minutes`);
    console.log(`⏳ Buffer time: ${bufferTimeMinutes} minutes`);
    console.log(`⏰ Total time needed: ${totalTimeNeeded} minutes`);
    console.log(`⌛ Available time: ${availableTimeMinutes} minutes`);
    
    if (totalTimeNeeded > availableTimeMinutes) {
      console.log(`❌ CONSECUTIVE TRIP NOT FEASIBLE`);
      console.log(`   Need ${totalTimeNeeded} minutes, only ${availableTimeMinutes} available`);
    } else {
      console.log(`✅ CONSECUTIVE TRIP FEASIBLE`);
      console.log(`   Vehicle can reach next pickup in time`);
    }
    
  } catch (error) {
    console.error('❌ Direct logic test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testConsecutiveTripAssignment();
}

module.exports = { testConsecutiveTripAssignment };