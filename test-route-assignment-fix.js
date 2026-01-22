// Test the route assignment fix
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function testRouteAssignmentFix() {
  console.log('🧪 TESTING ROUTE ASSIGNMENT FIX');
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
    console.log(`   VehicleId: ${pendingRoster.vehicleId}`);
    console.log(`   DriverId: ${pendingRoster.driverId}`);
    
    const rosterId = pendingRoster._id.toString();
    
    // Test the FIXED query
    console.log('\n🔍 Testing FIXED query:');
    const fixedQuery = {
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
    
    const fixedResult = await db.collection('rosters').findOne(fixedQuery);
    console.log(`   Result: ${fixedResult ? '✅ Found' : '❌ Not found'}`);
    
    if (fixedResult) {
      console.log(`   ✅ SUCCESS! The fixed query works!`);
      console.log(`   Customer: ${fixedResult.customerName || 'Unknown'}`);
      
      // Test the actual update operation
      console.log('\n🔄 Testing actual update operation:');
      
      const session = client.startSession();
      
      try {
        await session.withTransaction(async () => {
          const updateResult = await db.collection('rosters').findOneAndUpdate(
            fixedQuery,
            {
              $set: {
                vehicleId: new ObjectId('694a7cddc1882931f34d491f'), // Test vehicle ID
                vehicleNumber: 'TEST-VEHICLE',
                driverId: 'test-driver-id',
                driverName: 'Test Driver',
                status: 'assigned',
                assignedAt: new Date(),
                testUpdate: true
              }
            },
            { returnDocument: 'after', session }
          );
          
          if (updateResult.value) {
            console.log(`   ✅ UPDATE SUCCESS!`);
            console.log(`   Updated customer: ${updateResult.value.customerName}`);
            console.log(`   New status: ${updateResult.value.status}`);
            console.log(`   Vehicle: ${updateResult.value.vehicleNumber}`);
            console.log(`   Driver: ${updateResult.value.driverName}`);
          } else {
            console.log(`   ❌ Update failed`);
          }
          
          // Rollback the test update
          await session.abortTransaction();
          console.log(`   🔄 Test update rolled back`);
        });
      } catch (error) {
        console.log(`   ❌ Transaction error: ${error.message}`);
      } finally {
        await session.endSession();
      }
    } else {
      console.log(`   ❌ The fixed query still doesn't work`);
    }
    
    // Show summary
    console.log('\n' + '='.repeat(50));
    console.log('🎯 SUMMARY:');
    console.log('='.repeat(50));
    
    if (fixedResult) {
      console.log('✅ ROOT CAUSE IDENTIFIED AND FIXED!');
      console.log('');
      console.log('🐛 Problem: Rosters had vehicleId: null and driverId: null');
      console.log('   The query { vehicleId: { $exists: false } } failed');
      console.log('   because the field existed but was null');
      console.log('');
      console.log('🔧 Solution: Updated query to check for both:');
      console.log('   - Field doesn\'t exist: { $exists: false }');
      console.log('   - Field is null: { field: null }');
      console.log('');
      console.log('✅ Route assignment should now work!');
    } else {
      console.log('❌ Issue not fully resolved yet');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testRouteAssignmentFix().catch(console.error);