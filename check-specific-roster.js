// Check the specific roster that's failing in the frontend logs
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abrafleet';

async function checkSpecificRoster() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('\n🔍 CHECKING SPECIFIC ROSTER: Rakesh Verma');
    console.log('='.repeat(60));
    
    // Search for Rakesh Verma roster
    const rakeshRoster = await db.collection('rosters').findOne({
      customerName: { $regex: /rakesh/i }
    });
    
    if (!rakeshRoster) {
      console.log('❌ Rakesh Verma roster not found');
      
      // Check for similar names
      const similarRosters = await db.collection('rosters').find({
        customerName: { $regex: /verma|rakesh/i }
      }).toArray();
      
      console.log(`\n🔍 Similar names found (${similarRosters.length}):`);
      similarRosters.forEach((roster, index) => {
        console.log(`   ${index + 1}. ${roster.customerName} (${roster._id})`);
        console.log(`      Status: ${roster.status}`);
        console.log(`      VehicleId: ${roster.vehicleId || 'null'}`);
        console.log(`      DriverId: ${roster.driverId || 'null'}`);
      });
      
      return;
    }
    
    console.log('✅ Found Rakesh Verma roster:');
    console.log(`   ID: ${rakeshRoster._id}`);
    console.log(`   Name: ${rakeshRoster.customerName}`);
    console.log(`   Email: ${rakeshRoster.customerEmail || 'N/A'}`);
    console.log(`   Status: ${rakeshRoster.status}`);
    console.log(`   VehicleId: ${rakeshRoster.vehicleId || 'null'}`);
    console.log(`   DriverId: ${rakeshRoster.driverId || 'null'}`);
    console.log(`   Organization: ${rakeshRoster.organizationName || 'N/A'}`);
    console.log(`   Created: ${rakeshRoster.createdAt ? new Date(rakeshRoster.createdAt).toLocaleString() : 'N/A'}`);
    
    // Test if this roster can be assigned
    console.log('\n🧪 Testing assignment eligibility:');
    
    const assignmentQuery = {
      _id: new ObjectId(rakeshRoster._id),
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
    
    const canAssign = await db.collection('rosters').findOne(assignmentQuery);
    
    if (canAssign) {
      console.log('   ✅ Roster CAN be assigned');
    } else {
      console.log('   ❌ Roster CANNOT be assigned');
      
      // Check each condition individually
      const statusCheck = await db.collection('rosters').findOne({
        _id: new ObjectId(rakeshRoster._id),
        status: { $in: ['pending_assignment', 'pending'] }
      });
      console.log(`   Status check: ${statusCheck ? '✅ PASS' : '❌ FAIL'}`);
      
      const vehicleCheck = await db.collection('rosters').findOne({
        _id: new ObjectId(rakeshRoster._id),
        $or: [
          { vehicleId: { $exists: false } },
          { vehicleId: null }
        ]
      });
      console.log(`   Vehicle check: ${vehicleCheck ? '✅ PASS' : '❌ FAIL'}`);
      
      const driverCheck = await db.collection('rosters').findOne({
        _id: new ObjectId(rakeshRoster._id),
        $and: [
          {
            $or: [
              { driverId: { $exists: false } },
              { driverId: null }
            ]
          }
        ]
      });
      console.log(`   Driver check: ${driverCheck ? '✅ PASS' : '❌ FAIL'}`);
    }
    
    // Check if there are any trips associated
    const associatedTrips = await db.collection('trips').find({
      rosterId: rakeshRoster._id.toString()
    }).toArray();
    
    if (associatedTrips.length > 0) {
      console.log(`\n🎫 Associated trips (${associatedTrips.length}):`);
      associatedTrips.forEach((trip, index) => {
        console.log(`   ${index + 1}. ${trip.tripNumber || trip._id}`);
        console.log(`      Status: ${trip.status}`);
        console.log(`      Vehicle: ${trip.vehicleId}`);
        console.log(`      Driver: ${trip.driverId}`);
      });
    } else {
      console.log('\n🎫 No associated trips found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

checkSpecificRoster();