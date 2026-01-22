// Test script to debug route assignment failures in detail
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function debugAssignmentFailure() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DEBUGGING ROUTE ASSIGNMENT FAILURE');
    console.log('='.repeat(80));
    
    // STEP 1: Get pending rosters
    console.log('\n📋 STEP 1: Checking pending rosters...');
    const pendingRosters = await db.collection('rosters').find({
      status: { $in: ['pending_assignment', 'pending'] }
    }).limit(5).toArray();
    
    console.log(`Found ${pendingRosters.length} pending rosters`);
    
    if (pendingRosters.length === 0) {
      console.log('❌ No pending rosters found. Creating test data...');
      
      // Create a test roster
      const testRoster = {
        customerName: 'Test Customer',
        customerEmail: 'test@customer123.com',
        employeeDetails: {
          name: 'Test Customer',
          email: 'test@customer123.com',
          phone: '9876543210'
        },
        status: 'pending_assignment',
        rosterType: 'login',
        startTime: '09:00',
        endTime: '18:00',
        pickupLocation: {
          address: 'Test Location, Bangalore'
        },
        officeLocation: 'Customer123 Office, Whitefield',
        organizationId: 'customer123',
        organizationName: 'Customer123',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const insertResult = await db.collection('rosters').insertOne(testRoster);
      console.log(`✅ Created test roster: ${insertResult.insertedId}`);
      
      pendingRosters.push({
        ...testRoster,
        _id: insertResult.insertedId
      });
    }
    
    // STEP 2: Check each roster's current state
    console.log('\n📊 STEP 2: Analyzing roster states...');
    for (let i = 0; i < Math.min(3, pendingRosters.length); i++) {
      const roster = pendingRosters[i];
      console.log(`\n   Roster ${i + 1}: ${roster.customerName || 'Unknown'}`);
      console.log(`   ID: ${roster._id}`);
      console.log(`   Status: ${roster.status}`);
      console.log(`   VehicleId: ${roster.vehicleId || 'null/undefined'} (type: ${typeof roster.vehicleId})`);
      console.log(`   DriverId: ${roster.driverId || 'null/undefined'} (type: ${typeof roster.driverId})`);
      console.log(`   Has vehicleId field: ${roster.hasOwnProperty('vehicleId')}`);
      console.log(`   Has driverId field: ${roster.hasOwnProperty('driverId')}`);
      
      // Test the exact query conditions
      console.log('\n   🔍 Testing query conditions:');
      
      // Original query condition
      const originalQuery = {
        _id: new ObjectId(roster._id),
        status: { $in: ['pending_assignment', 'pending'] },
        $or: [
          { vehicleId: { $exists: false } },
          { vehicleId: null }
        ],
        $and: [
          {
            $or: [
              { driverId: { $exists: false } },
              { driverId: null }
            ]
          }
        ]
      };
      
      const matchesOriginal = await db.collection('rosters').findOne(originalQuery);
      console.log(`   Original query matches: ${matchesOriginal ? 'YES' : 'NO'}`);
      
      // Simplified query condition
      const simplifiedQuery = {
        _id: new ObjectId(roster._id),
        status: { $in: ['pending_assignment', 'pending'] }
      };
      
      const matchesSimplified = await db.collection('rosters').findOne(simplifiedQuery);
      console.log(`   Simplified query matches: ${matchesSimplified ? 'YES' : 'NO'}`);
      
      // Test individual conditions
      const vehicleCondition1 = { vehicleId: { $exists: false } };
      const vehicleCondition2 = { vehicleId: null };
      const driverCondition1 = { driverId: { $exists: false } };
      const driverCondition2 = { driverId: null };
      
      const vehicleTest1 = await db.collection('rosters').findOne({ _id: new ObjectId(roster._id), ...vehicleCondition1 });
      const vehicleTest2 = await db.collection('rosters').findOne({ _id: new ObjectId(roster._id), ...vehicleCondition2 });
      const driverTest1 = await db.collection('rosters').findOne({ _id: new ObjectId(roster._id), ...driverCondition1 });
      const driverTest2 = await db.collection('rosters').findOne({ _id: new ObjectId(roster._id), ...driverCondition2 });
      
      console.log(`   vehicleId $exists: false -> ${vehicleTest1 ? 'YES' : 'NO'}`);
      console.log(`   vehicleId null -> ${vehicleTest2 ? 'YES' : 'NO'}`);
      console.log(`   driverId $exists: false -> ${driverTest1 ? 'YES' : 'NO'}`);
      console.log(`   driverId null -> ${driverTest2 ? 'YES' : 'NO'}`);
    }
    
    // STEP 3: Get available vehicles with drivers
    console.log('\n🚗 STEP 3: Checking available vehicles...');
    const vehicles = await db.collection('vehicles').find({
      status: { $regex: /^active$/i }
    }).limit(3).toArray();
    
    console.log(`Found ${vehicles.length} active vehicles`);
    
    for (let i = 0; i < Math.min(2, vehicles.length); i++) {
      const vehicle = vehicles[i];
      console.log(`\n   Vehicle ${i + 1}: ${vehicle.registrationNumber || vehicle.name || 'Unknown'}`);
      console.log(`   ID: ${vehicle._id}`);
      console.log(`   Status: ${vehicle.status}`);
      console.log(`   AssignedDriver: ${JSON.stringify(vehicle.assignedDriver, null, 2)}`);
      console.log(`   DriverId: ${vehicle.driverId || 'null/undefined'}`);
      
      // Check if this vehicle has a driver
      let hasDriver = false;
      if (vehicle.assignedDriver) {
        if (typeof vehicle.assignedDriver === 'object' && vehicle.assignedDriver.name) {
          hasDriver = true;
          console.log(`   ✅ Has driver: ${vehicle.assignedDriver.name}`);
        } else if (typeof vehicle.assignedDriver === 'string' && vehicle.assignedDriver.trim() !== '') {
          hasDriver = true;
          console.log(`   ✅ Has driver ID: ${vehicle.assignedDriver}`);
        }
      }
      
      if (!hasDriver) {
        console.log(`   ❌ No driver assigned`);
      }
      
      // Check existing assignments
      const existingAssignments = await db.collection('rosters').find({
        vehicleId: vehicle._id.toString(),
        status: 'assigned'
      }).toArray();
      
      console.log(`   Current assignments: ${existingAssignments.length}`);
      
      const capacity = vehicle.capacity?.passengers || vehicle.seatCapacity || vehicle.seatingCapacity || 4;
      const availableSeats = capacity - 1 - existingAssignments.length;
      console.log(`   Capacity: ${capacity} total, ${availableSeats} available`);
    }
    
    // STEP 4: Test the actual assignment process
    if (pendingRosters.length > 0 && vehicles.length > 0) {
      console.log('\n🧪 STEP 4: Testing assignment process...');
      
      const testRoster = pendingRosters[0];
      const testVehicle = vehicles.find(v => 
        v.assignedDriver && 
        (typeof v.assignedDriver === 'object' && v.assignedDriver.name) ||
        (typeof v.assignedDriver === 'string' && v.assignedDriver.trim() !== '')
      );
      
      if (!testVehicle) {
        console.log('❌ No vehicle with assigned driver found for testing');
        return;
      }
      
      console.log(`Testing assignment of ${testRoster.customerName} to ${testVehicle.registrationNumber || testVehicle.name}`);
      
      // Test the exact update query from the code
      const updateQuery = {
        _id: new ObjectId(testRoster._id),
        status: { $in: ['pending_assignment', 'pending'] },
        $or: [
          { vehicleId: { $exists: false } },
          { vehicleId: null }
        ],
        $and: [
          {
            $or: [
              { driverId: { $exists: false } },
              { driverId: null }
            ]
          }
        ]
      };
      
      console.log('\n   Query to test:');
      console.log(JSON.stringify(updateQuery, null, 2));
      
      const testUpdate = await db.collection('rosters').findOne(updateQuery);
      
      if (testUpdate) {
        console.log('   ✅ Query matches - assignment should work');
        
        // Try the actual update (but rollback)
        const session = client.startSession();
        try {
          await session.startTransaction();
          
          const updateResult = await db.collection('rosters').findOneAndUpdate(
            updateQuery,
            {
              $set: {
                vehicleId: new ObjectId(testVehicle._id),
                vehicleNumber: testVehicle.registrationNumber || testVehicle.name,
                driverId: 'test-driver-id',
                driverName: 'Test Driver',
                status: 'assigned',
                assignedAt: new Date(),
                assignedBy: 'test-user',
                updatedAt: new Date()
              }
            },
            { returnDocument: 'after', session }
          );
          
          if (updateResult.value) {
            console.log('   ✅ Update successful - assignment would work');
            console.log(`   Updated status: ${updateResult.value.status}`);
            console.log(`   Updated vehicleId: ${updateResult.value.vehicleId}`);
          } else {
            console.log('   ❌ Update failed - no document matched');
          }
          
          await session.abortTransaction(); // Rollback the test
          console.log('   🔄 Test transaction rolled back');
          
        } catch (updateError) {
          await session.abortTransaction();
          console.log('   ❌ Update error:', updateError.message);
        } finally {
          await session.endSession();
        }
        
      } else {
        console.log('   ❌ Query does not match - assignment will fail');
        
        // Let's check why it doesn't match
        console.log('\n   🔍 Debugging why query doesn\'t match:');
        
        // Check each part of the query
        const basicMatch = await db.collection('rosters').findOne({
          _id: new ObjectId(testRoster._id)
        });
        console.log(`   Basic ID match: ${basicMatch ? 'YES' : 'NO'}`);
        
        const statusMatch = await db.collection('rosters').findOne({
          _id: new ObjectId(testRoster._id),
          status: { $in: ['pending_assignment', 'pending'] }
        });
        console.log(`   Status match: ${statusMatch ? 'YES' : 'NO'}`);
        
        const vehicleMatch = await db.collection('rosters').findOne({
          _id: new ObjectId(testRoster._id),
          $or: [
            { vehicleId: { $exists: false } },
            { vehicleId: null }
          ]
        });
        console.log(`   Vehicle condition match: ${vehicleMatch ? 'YES' : 'NO'}`);
        
        const driverMatch = await db.collection('rosters').findOne({
          _id: new ObjectId(testRoster._id),
          $or: [
            { driverId: { $exists: false } },
            { driverId: null }
          ]
        });
        console.log(`   Driver condition match: ${driverMatch ? 'YES' : 'NO'}`);
      }
    }
    
    // STEP 5: Suggest fixes
    console.log('\n💡 STEP 5: Suggested fixes...');
    
    console.log('\n   Option 1: Simplify the query condition');
    console.log('   Replace the complex $or/$and conditions with:');
    console.log('   {');
    console.log('     _id: ObjectId(rosterId),');
    console.log('     status: { $in: ["pending_assignment", "pending"] },');
    console.log('     $and: [');
    console.log('       { $or: [{ vehicleId: { $exists: false } }, { vehicleId: null }] },');
    console.log('       { $or: [{ driverId: { $exists: false } }, { driverId: null }] }');
    console.log('     ]');
    console.log('   }');
    
    console.log('\n   Option 2: Use a more permissive query');
    console.log('   {');
    console.log('     _id: ObjectId(rosterId),');
    console.log('     status: { $in: ["pending_assignment", "pending"] }');
    console.log('   }');
    console.log('   And check assignment conflicts in application logic');
    
    console.log('\n   Option 3: Clean up existing data');
    console.log('   - Set vehicleId and driverId to null for all pending rosters');
    console.log('   - Ensure consistent data format');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await client.close();
  }
}

debugAssignmentFailure().catch(console.error);