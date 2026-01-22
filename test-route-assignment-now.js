// Test the actual route assignment with real data
const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function testRouteAssignmentNow() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TESTING ROUTE ASSIGNMENT WITH REAL DATA');
    console.log('='.repeat(80));
    
    // STEP 1: Get a vehicle with assigned driver
    console.log('\n🚗 STEP 1: Getting a vehicle with assigned driver...');
    const vehicleWithDriver = await db.collection('vehicles').findOne({
      assignedDriver: { $ne: null, $exists: true },
      status: { $regex: /^active$/i }
    });
    
    if (!vehicleWithDriver) {
      console.log('❌ No vehicles with assigned drivers found');
      return;
    }
    
    console.log(`✅ Found vehicle: ${vehicleWithDriver.registrationNumber}`);
    console.log(`   Driver: ${vehicleWithDriver.assignedDriver.name}`);
    console.log(`   Driver ID: ${vehicleWithDriver.assignedDriver.driverId}`);
    
    // STEP 2: Get some pending rosters
    console.log('\n📋 STEP 2: Getting pending rosters...');
    const pendingRosters = await db.collection('rosters').find({
      status: { $in: ['pending_assignment', 'pending'] },
      $or: [
        { vehicleId: { $exists: false } },
        { vehicleId: null }
      ]
    }).limit(2).toArray();
    
    if (pendingRosters.length === 0) {
      console.log('❌ No pending rosters found');
      return;
    }
    
    console.log(`✅ Found ${pendingRosters.length} pending rosters:`);
    pendingRosters.forEach((roster, index) => {
      console.log(`   ${index + 1}. ${roster.customerName || 'Unknown'} (${roster._id})`);
    });
    
    // STEP 3: Test the exact assignment logic from the backend
    console.log('\n🔧 STEP 3: Testing assignment logic...');
    
    const vehicleId = vehicleWithDriver._id.toString();
    const vehicle = vehicleWithDriver;
    
    // Check driver details (same logic as backend)
    let driver = null;
    let driverIdToSearch = null;

    console.log('🔍 Checking vehicle.assignedDriver format...');
    console.log('   Type:', typeof vehicle.assignedDriver);
    console.log('   Value:', JSON.stringify(vehicle.assignedDriver, null, 2));

    if (vehicle.assignedDriver) {
      if (typeof vehicle.assignedDriver === 'object' && vehicle.assignedDriver.name) {
        console.log('   ✅ Format 1: Complete object with driver details');
        driver = {
          _id: vehicle.assignedDriver._id || vehicle.assignedDriver.driverId,
          name: vehicle.assignedDriver.name,
          email: vehicle.assignedDriver.email || '',
          phone: vehicle.assignedDriver.phone || vehicle.assignedDriver.phoneNumber || ''
        };
      } 
      else if (typeof vehicle.assignedDriver === 'string') {
        console.log('   ✅ Format 2: String driver ID');
        driverIdToSearch = vehicle.assignedDriver;
      }
      else if (typeof vehicle.assignedDriver === 'object' && vehicle.assignedDriver.driverId) {
        console.log('   ✅ Format 3: Object with driverId field only');
        driverIdToSearch = vehicle.assignedDriver.driverId;
      }
      else if (typeof vehicle.assignedDriver === 'object' && vehicle.assignedDriver._id) {
        console.log('   ✅ Format 4: Object with _id field only');
        driverIdToSearch = vehicle.assignedDriver._id;
      }
    }

    if (!driver && driverIdToSearch) {
      console.log('   🔍 Searching for driver with ID:', driverIdToSearch);
      
      // Try drivers collection first
      try {
        const foundDriver = await db.collection('drivers').findOne(
          { driverId: driverIdToSearch }
        );
        
        if (foundDriver) {
          console.log('   ✅ Found in drivers collection (by driverId)');
          const firstName = foundDriver.personalInfo?.firstName || foundDriver.firstName || '';
          const lastName = foundDriver.personalInfo?.lastName || foundDriver.lastName || '';
          const fullName = `${firstName} ${lastName}`.trim() || foundDriver.name || 'Unknown Driver';
          
          driver = {
            _id: foundDriver._id,
            name: fullName,
            email: foundDriver.personalInfo?.email || foundDriver.email || '',
            phone: foundDriver.personalInfo?.phone || foundDriver.phone || foundDriver.phoneNumber || ''
          };
        }
      } catch (e) {
        console.log('   ⚠️  Not found in drivers collection (by driverId)');
      }
      
      // Try by ObjectId if not found
      if (!driver && ObjectId.isValid(driverIdToSearch)) {
        try {
          const foundDriver = await db.collection('drivers').findOne(
            { _id: new ObjectId(driverIdToSearch) }
          );
          
          if (foundDriver) {
            console.log('   ✅ Found in drivers collection (by _id)');
            const firstName = foundDriver.personalInfo?.firstName || foundDriver.firstName || '';
            const lastName = foundDriver.personalInfo?.lastName || foundDriver.lastName || '';
            const fullName = `${firstName} ${lastName}`.trim() || foundDriver.name || 'Unknown Driver';
            
            driver = {
              _id: foundDriver._id,
              name: fullName,
              email: foundDriver.personalInfo?.email || foundDriver.email || '',
              phone: foundDriver.personalInfo?.phone || foundDriver.phone || foundDriver.phoneNumber || ''
            };
          }
        } catch (e) {
          console.log('   ⚠️  Not found in drivers collection (by _id)');
        }
      }
      
      // Try users collection as fallback
      if (!driver) {
        try {
          const foundDriver = await db.collection('users').findOne({
            role: 'driver',
            $or: [
              { _id: ObjectId.isValid(driverIdToSearch) ? new ObjectId(driverIdToSearch) : null },
              { driverId: driverIdToSearch },
              { driverCode: driverIdToSearch }
            ]
          });
          
          if (foundDriver) {
            console.log('   ✅ Found in users collection');
            driver = {
              _id: foundDriver._id,
              name: foundDriver.name || foundDriver.displayName || 'Unknown Driver',
              email: foundDriver.email || '',
              phone: foundDriver.phone || foundDriver.phoneNumber || ''
            };
          }
        } catch (e) {
          console.log('   ⚠️  Not found in users collection');
        }
      }
    }

    if (!driver) {
      console.log('❌ DRIVER NOT FOUND - This is why assignment fails!');
      console.log('   Vehicle assignedDriver:', JSON.stringify(vehicle.assignedDriver, null, 2));
      return;
    }

    console.log(`✅ Driver found: ${driver.name}`);
    console.log(`   Email: ${driver.email || 'N/A'}`);
    console.log(`   Phone: ${driver.phone || 'N/A'}`);
    
    // STEP 4: Test capacity check
    console.log('\n💺 STEP 4: Testing capacity check...');
    const existingAssignments = await db.collection('rosters').find({
      vehicleId: vehicleId,
      status: 'assigned',
      assignedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    }).toArray();
    
    const totalSeats = vehicle.capacity?.passengers || 
                       vehicle.seatCapacity || 
                       vehicle.seatingCapacity || 
                       4;
    const currentAssignedCount = existingAssignments.length;
    const newCustomersCount = pendingRosters.length;
    const availableSeats = totalSeats - 1 - currentAssignedCount;
    
    console.log(`   🚗 Vehicle: ${vehicle.registrationNumber || vehicle.name || 'Vehicle'}`);
    console.log(`   💺 Total Seats: ${totalSeats}`);
    console.log(`   👥 Currently Assigned: ${currentAssignedCount}`);
    console.log(`   ✅ Available Seats: ${availableSeats}`);
    console.log(`   📋 New Customers: ${newCustomersCount}`);
    
    if (availableSeats <= 0 || newCustomersCount > availableSeats) {
      console.log(`❌ CAPACITY CHECK FAILED - This is why assignment fails!`);
      return;
    }
    
    console.log(`✅ Capacity check passed`);
    
    // STEP 5: Test the actual roster update query
    console.log('\n📝 STEP 5: Testing roster update query...');
    
    const testRoster = pendingRosters[0];
    console.log(`Testing with roster: ${testRoster.customerName} (${testRoster._id})`);
    
    // This is the exact query from the backend
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
    
    console.log('   Query conditions:');
    console.log('   - Status in [pending_assignment, pending]');
    console.log('   - vehicleId is null or doesn\'t exist');
    console.log('   - driverId is null or doesn\'t exist');
    
    const matchingRoster = await db.collection('rosters').findOne(updateQuery);
    
    if (matchingRoster) {
      console.log('   ✅ Query matches - roster can be updated');
      console.log('   ✅ ASSIGNMENT SHOULD WORK!');
      
      // Show what the update would do
      console.log('\n📋 Update would set:');
      console.log(`   vehicleId: ${vehicleId}`);
      console.log(`   vehicleNumber: ${vehicle.registrationNumber || vehicle.name}`);
      console.log(`   driverId: ${driver._id.toString()}`);
      console.log(`   driverName: ${driver.name}`);
      console.log(`   status: assigned`);
      
    } else {
      console.log('   ❌ Query does not match - roster cannot be updated');
      console.log('   ❌ THIS IS WHY ASSIGNMENT FAILS!');
      
      // Debug why it doesn't match
      console.log('\n🔍 Debugging query mismatch:');
      
      const basicMatch = await db.collection('rosters').findOne({
        _id: new ObjectId(testRoster._id)
      });
      console.log(`   Basic ID match: ${basicMatch ? 'YES' : 'NO'}`);
      
      const statusMatch = await db.collection('rosters').findOne({
        _id: new ObjectId(testRoster._id),
        status: { $in: ['pending_assignment', 'pending'] }
      });
      console.log(`   Status match: ${statusMatch ? 'YES' : 'NO'}`);
      console.log(`   Actual status: ${testRoster.status}`);
      
      const vehicleMatch = await db.collection('rosters').findOne({
        _id: new ObjectId(testRoster._id),
        $or: [
          { vehicleId: { $exists: false } },
          { vehicleId: null }
        ]
      });
      console.log(`   Vehicle condition match: ${vehicleMatch ? 'YES' : 'NO'}`);
      console.log(`   Actual vehicleId: ${testRoster.vehicleId} (type: ${typeof testRoster.vehicleId})`);
      
      const driverMatch = await db.collection('rosters').findOne({
        _id: new ObjectId(testRoster._id),
        $or: [
          { driverId: { $exists: false } },
          { driverId: null }
        ]
      });
      console.log(`   Driver condition match: ${driverMatch ? 'YES' : 'NO'}`);
      console.log(`   Actual driverId: ${testRoster.driverId} (type: ${typeof testRoster.driverId})`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 CONCLUSION');
    console.log('='.repeat(80));
    
    if (driver && availableSeats > 0 && matchingRoster) {
      console.log('✅ ASSIGNMENT SHOULD WORK!');
      console.log('   - Vehicle has assigned driver ✅');
      console.log('   - Vehicle has available capacity ✅');
      console.log('   - Roster query matches ✅');
      console.log('\n💡 If assignment is still failing, the issue is likely:');
      console.log('   1. Frontend not sending correct data');
      console.log('   2. Backend authentication/authorization');
      console.log('   3. Database transaction issues');
    } else {
      console.log('❌ ASSIGNMENT WILL FAIL');
      if (!driver) console.log('   - No driver found ❌');
      if (availableSeats <= 0) console.log('   - No available seats ❌');
      if (!matchingRoster) console.log('   - Roster query doesn\'t match ❌');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testRouteAssignmentNow().catch(console.error);