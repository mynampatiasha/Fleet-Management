// Debug script to identify the root cause of route assignment failure
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function debugRouteAssignmentFailure() {
  console.log('🔍 DEBUGGING ROUTE ASSIGNMENT FAILURE');
  console.log('='.repeat(60));
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('✅ Connected to MongoDB');
    
    // 1. Check pending rosters
    console.log('\n📋 CHECKING PENDING ROSTERS...');
    const pendingRosters = await db.collection('rosters').find({
      status: { $in: ['pending_assignment', 'pending'] }
    }).limit(5).toArray();
    
    console.log(`Found ${pendingRosters.length} pending rosters:`);
    pendingRosters.forEach((roster, index) => {
      console.log(`\n${index + 1}. Roster ID: ${roster._id}`);
      console.log(`   Customer: ${roster.customerName || roster.name || 'Unknown'}`);
      console.log(`   Status: ${roster.status}`);
      console.log(`   Vehicle ID: ${roster.vehicleId || 'Not assigned'}`);
      console.log(`   Driver ID: ${roster.driverId || 'Not assigned'}`);
      console.log(`   Organization: ${roster.organizationName || roster.organization || 'N/A'}`);
      console.log(`   Created: ${roster.createdAt}`);
    });
    
    if (pendingRosters.length === 0) {
      console.log('❌ NO PENDING ROSTERS FOUND!');
      console.log('   This could be why assignment is failing.');
      console.log('   All rosters might already be assigned or have wrong status.');
      
      // Check all rosters to see their statuses
      console.log('\n📊 CHECKING ALL ROSTER STATUSES...');
      const allStatuses = await db.collection('rosters').aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]).toArray();
      
      console.log('Roster status distribution:');
      allStatuses.forEach(status => {
        console.log(`   ${status._id}: ${status.count} rosters`);
      });
    }
    
    // 2. Check vehicles with drivers
    console.log('\n🚗 CHECKING VEHICLES WITH DRIVERS...');
    const vehiclesWithDrivers = await db.collection('vehicles').find({
      assignedDriver: { $exists: true, $ne: null }
    }).limit(3).toArray();
    
    console.log(`Found ${vehiclesWithDrivers.length} vehicles with assigned drivers:`);
    vehiclesWithDrivers.forEach((vehicle, index) => {
      console.log(`\n${index + 1}. Vehicle: ${vehicle.registrationNumber || vehicle.name || vehicle._id}`);
      console.log(`   Driver: ${vehicle.assignedDriver}`);
      console.log(`   Capacity: ${vehicle.capacity?.passengers || vehicle.seatCapacity || 'Unknown'}`);
      console.log(`   Organization: ${vehicle.organizationName || vehicle.organization || 'N/A'}`);
    });
    
    // 3. Test the exact query used in route assignment
    if (pendingRosters.length > 0 && vehiclesWithDrivers.length > 0) {
      console.log('\n🧪 TESTING ROUTE ASSIGNMENT QUERY...');
      
      const testRoster = pendingRosters[0];
      const testVehicle = vehiclesWithDrivers[0];
      
      console.log(`Testing with:`);
      console.log(`   Roster ID: ${testRoster._id}`);
      console.log(`   Vehicle ID: ${testVehicle._id}`);
      console.log(`   Current roster status: ${testRoster.status}`);
      
      // This is the exact query from the route optimization router
      const updateQuery = {
        _id: new ObjectId(testRoster._id),
        status: { $in: ['pending_assignment', 'pending'] },  // Only allow unassigned rosters
        vehicleId: { $exists: false },  // Ensure not already assigned to a vehicle
        driverId: { $exists: false }    // Ensure not already assigned to a driver
      };
      
      console.log('\n🔍 Testing update query conditions:');
      console.log('   Query:', JSON.stringify(updateQuery, null, 2));
      
      const matchingRoster = await db.collection('rosters').findOne(updateQuery);
      
      if (matchingRoster) {
        console.log('✅ QUERY MATCHES - This roster can be updated');
        console.log(`   Matched roster: ${matchingRoster.customerName || 'Unknown'}`);
      } else {
        console.log('❌ QUERY DOES NOT MATCH - This is the problem!');
        
        // Check each condition individually
        console.log('\n🔍 CHECKING EACH CONDITION:');
        
        // Check if roster exists
        const rosterExists = await db.collection('rosters').findOne({
          _id: new ObjectId(testRoster._id)
        });
        console.log(`   1. Roster exists: ${rosterExists ? '✅ YES' : '❌ NO'}`);
        
        if (rosterExists) {
          console.log(`      Current status: ${rosterExists.status}`);
          console.log(`      Has vehicleId: ${rosterExists.vehicleId ? '❌ YES (blocking)' : '✅ NO'}`);
          console.log(`      Has driverId: ${rosterExists.driverId ? '❌ YES (blocking)' : '✅ NO'}`);
          
          // Check status condition
          const statusMatch = ['pending_assignment', 'pending'].includes(rosterExists.status);
          console.log(`   2. Status is pending: ${statusMatch ? '✅ YES' : '❌ NO'}`);
          
          // Check vehicleId condition
          const noVehicleId = !rosterExists.vehicleId;
          console.log(`   3. No vehicleId: ${noVehicleId ? '✅ YES' : '❌ NO'}`);
          
          // Check driverId condition
          const noDriverId = !rosterExists.driverId;
          console.log(`   4. No driverId: ${noDriverId ? '✅ YES' : '❌ NO'}`);
          
          if (!statusMatch) {
            console.log(`\n💡 SOLUTION: Change roster status from '${rosterExists.status}' to 'pending_assignment'`);
          }
          
          if (!noVehicleId) {
            console.log(`\n💡 SOLUTION: Remove vehicleId (${rosterExists.vehicleId}) from roster`);
          }
          
          if (!noDriverId) {
            console.log(`\n💡 SOLUTION: Remove driverId (${rosterExists.driverId}) from roster`);
          }
        }
      }
    }
    
    // 4. Check for already assigned rosters
    console.log('\n📊 CHECKING ASSIGNED ROSTERS...');
    const assignedRosters = await db.collection('rosters').find({
      status: 'assigned',
      vehicleId: { $exists: true }
    }).limit(5).toArray();
    
    console.log(`Found ${assignedRosters.length} already assigned rosters:`);
    assignedRosters.forEach((roster, index) => {
      console.log(`\n${index + 1}. Customer: ${roster.customerName || 'Unknown'}`);
      console.log(`   Vehicle: ${roster.vehicleNumber || roster.vehicleId}`);
      console.log(`   Driver: ${roster.driverName || roster.driverId}`);
      console.log(`   Assigned: ${roster.assignedAt}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS COMPLETE');
    console.log('='.repeat(60));
    
    if (pendingRosters.length === 0) {
      console.log('❌ ROOT CAUSE: No pending rosters available for assignment');
      console.log('💡 SOLUTION: Create new rosters or reset existing ones to pending status');
    } else if (vehiclesWithDrivers.length === 0) {
      console.log('❌ ROOT CAUSE: No vehicles have assigned drivers');
      console.log('💡 SOLUTION: Assign drivers to vehicles in Vehicle Management');
    } else {
      console.log('✅ Both pending rosters and vehicles with drivers exist');
      console.log('🔍 Check the individual condition results above for the exact issue');
    }
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await client.close();
  }
}

// Run the debug
debugRouteAssignmentFailure().catch(console.error);