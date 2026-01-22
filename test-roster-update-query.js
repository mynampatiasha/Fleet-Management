// Test the exact roster update query to find the issue
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function testRosterUpdateQuery() {
  console.log('🧪 TESTING ROSTER UPDATE QUERY');
  console.log('='.repeat(50));
  
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    // Get a pending roster
    const pendingRoster = await db.collection('rosters').findOne({
      status: { $in: ['pending_assignment', 'pending'] }
    });
    
    if (!pendingRoster) {
      console.log('❌ No pending roster found');
      return;
    }
    
    console.log('📋 Testing with roster:');
    console.log(`   ID: ${pendingRoster._id}`);
    console.log(`   Customer: ${pendingRoster.customerName || 'Unknown'}`);
    console.log(`   Status: ${pendingRoster.status}`);
    console.log(`   VehicleId exists: ${!!pendingRoster.vehicleId}`);
    console.log(`   DriverId exists: ${!!pendingRoster.driverId}`);
    
    const rosterId = pendingRoster._id.toString();
    
    // Test 1: Simple ID query
    console.log('\n🔍 Test 1: Simple ID query');
    const simpleQuery = { _id: new ObjectId(rosterId) };
    const simpleResult = await db.collection('rosters').findOne(simpleQuery);
    console.log(`   Result: ${simpleResult ? '✅ Found' : '❌ Not found'}`);
    
    // Test 2: Status query
    console.log('\n🔍 Test 2: Status query');
    const statusQuery = {
      _id: new ObjectId(rosterId),
      status: { $in: ['pending_assignment', 'pending'] }
    };
    const statusResult = await db.collection('rosters').findOne(statusQuery);
    console.log(`   Result: ${statusResult ? '✅ Found' : '❌ Not found'}`);
    
    // Test 3: VehicleId query
    console.log('\n🔍 Test 3: VehicleId exists query');
    const vehicleQuery = {
      _id: new ObjectId(rosterId),
      vehicleId: { $exists: false }
    };
    const vehicleResult = await db.collection('rosters').findOne(vehicleQuery);
    console.log(`   Result: ${vehicleResult ? '✅ Found' : '❌ Not found'}`);
    
    // Test 4: DriverId query
    console.log('\n🔍 Test 4: DriverId exists query');
    const driverQuery = {
      _id: new ObjectId(rosterId),
      driverId: { $exists: false }
    };
    const driverResult = await db.collection('rosters').findOne(driverQuery);
    console.log(`   Result: ${driverResult ? '✅ Found' : '❌ Not found'}`);
    
    // Test 5: Combined query (the one that's failing)
    console.log('\n🔍 Test 5: Combined query (the failing one)');
    const combinedQuery = {
      _id: new ObjectId(rosterId),
      status: { $in: ['pending_assignment', 'pending'] },
      vehicleId: { $exists: false },
      driverId: { $exists: false }
    };
    const combinedResult = await db.collection('rosters').findOne(combinedQuery);
    console.log(`   Result: ${combinedResult ? '✅ Found' : '❌ Not found'}`);
    
    if (!combinedResult) {
      console.log('\n🔍 DETAILED FIELD ANALYSIS:');
      
      // Check actual field values
      const fullRoster = await db.collection('rosters').findOne({ _id: new ObjectId(rosterId) });
      console.log('   Full roster data:');
      console.log(`     _id: ${fullRoster._id} (type: ${typeof fullRoster._id})`);
      console.log(`     status: "${fullRoster.status}" (type: ${typeof fullRoster.status})`);
      console.log(`     vehicleId: ${fullRoster.vehicleId} (type: ${typeof fullRoster.vehicleId})`);
      console.log(`     driverId: ${fullRoster.driverId} (type: ${typeof fullRoster.driverId})`);
      
      // Check for null vs undefined
      console.log('\n   Field existence check:');
      console.log(`     vehicleId in roster: ${'vehicleId' in fullRoster}`);
      console.log(`     driverId in roster: ${'driverId' in fullRoster}`);
      console.log(`     vehicleId === null: ${fullRoster.vehicleId === null}`);
      console.log(`     driverId === null: ${fullRoster.driverId === null}`);
      console.log(`     vehicleId === undefined: ${fullRoster.vehicleId === undefined}`);
      console.log(`     driverId === undefined: ${fullRoster.driverId === undefined}`);
      
      // Test alternative queries
      console.log('\n🔍 TESTING ALTERNATIVE QUERIES:');
      
      // Test with null check
      const nullQuery = {
        _id: new ObjectId(rosterId),
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
      const nullResult = await db.collection('rosters').findOne(nullQuery);
      console.log(`   With null check: ${nullResult ? '✅ Found' : '❌ Not found'}`);
      
      // Test without exists check
      const simpleStatusQuery = {
        _id: new ObjectId(rosterId),
        status: { $in: ['pending_assignment', 'pending'] }
      };
      const simpleStatusResult = await db.collection('rosters').findOne(simpleStatusQuery);
      console.log(`   Status only: ${simpleStatusResult ? '✅ Found' : '❌ Not found'}`);
    }
    
    // Test 6: Try the actual update operation
    console.log('\n🔍 Test 6: Actual update operation');
    
    const session = client.startSession();
    
    try {
      await session.withTransaction(async () => {
        const updateResult = await db.collection('rosters').findOneAndUpdate(
          {
            _id: new ObjectId(rosterId),
            status: { $in: ['pending_assignment', 'pending'] },
            vehicleId: { $exists: false },
            driverId: { $exists: false }
          },
          {
            $set: {
              testUpdate: new Date(),
              testField: 'test-value'
            }
          },
          { returnDocument: 'after', session }
        );
        
        console.log(`   Update result: ${updateResult.value ? '✅ Success' : '❌ Failed'}`);
        
        if (updateResult.value) {
          console.log(`   Updated roster: ${updateResult.value.customerName}`);
          
          // Rollback the test update
          await db.collection('rosters').updateOne(
            { _id: new ObjectId(rosterId) },
            { 
              $unset: { 
                testUpdate: 1,
                testField: 1
              }
            },
            { session }
          );
        } else {
          console.log('   ❌ Update failed - this is the root cause!');
        }
        
        // Abort transaction to rollback any changes
        await session.abortTransaction();
      });
    } catch (error) {
      console.log(`   ❌ Transaction error: ${error.message}`);
    } finally {
      await session.endSession();
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testRosterUpdateQuery().catch(console.error);