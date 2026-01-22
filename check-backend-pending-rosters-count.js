// Quick script to check how many pending rosters are in the backend
const { MongoClient } = require('mongodb');

async function checkPendingRostersCount() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('abrafleet');
    const collection = db.collection('rosters');
    
    // Get total count
    const totalCount = await collection.countDocuments();
    console.log(`📊 Total rosters in database: ${totalCount}`);
    
    // Get count by status
    const statusCounts = await collection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();
    
    console.log('\n📋 Rosters by status:');
    statusCounts.forEach(item => {
      console.log(`   ${item._id || 'null'}: ${item.count}`);
    });
    
    // Get pending rosters specifically
    const pendingStatuses = ['pending', 'pending_assignment', 'created'];
    const pendingCount = await collection.countDocuments({
      status: { $in: pendingStatuses }
    });
    
    console.log(`\n🔍 Pending rosters (status in ${JSON.stringify(pendingStatuses)}): ${pendingCount}`);
    
    // Get sample pending rosters
    const samplePending = await collection.find({
      status: { $in: pendingStatuses }
    }).limit(5).toArray();
    
    console.log('\n📝 Sample pending rosters:');
    samplePending.forEach((roster, index) => {
      console.log(`   ${index + 1}. ${roster.customerName} (${roster.customerEmail}) - Status: ${roster.status}`);
      console.log(`      ID: ${roster._id}`);
      console.log(`      Created: ${roster.createdAt}`);
      console.log(`      Vehicle: ${roster.vehicleId || 'none'}`);
      console.log(`      Driver: ${roster.driverId || 'none'}`);
      console.log(`      AssignedVehicle: ${roster.assignedVehicleId || 'none'}`);
      console.log(`      AssignedDriver: ${roster.assignedDriverId || 'none'}`);
      console.log('');
    });
    
    // Check for rosters with assignment fields but pending status
    const conflictingRosters = await collection.find({
      status: { $in: pendingStatuses },
      $or: [
        { vehicleId: { $exists: true, $ne: null, $ne: '' } },
        { driverId: { $exists: true, $ne: null, $ne: '' } },
        { assignedVehicleId: { $exists: true, $ne: null, $ne: '' } },
        { assignedDriverId: { $exists: true, $ne: null, $ne: '' } },
        { tripId: { $exists: true, $ne: null, $ne: '' } }
      ]
    }).toArray();
    
    console.log(`\n⚠️ Conflicting rosters (pending status but has assignment fields): ${conflictingRosters.length}`);
    if (conflictingRosters.length > 0) {
      console.log('   These rosters have pending status but assignment fields:');
      conflictingRosters.forEach((roster, index) => {
        console.log(`   ${index + 1}. ${roster.customerName} - Status: ${roster.status}`);
        console.log(`      vehicleId: ${roster.vehicleId}`);
        console.log(`      driverId: ${roster.driverId}`);
        console.log(`      assignedVehicleId: ${roster.assignedVehicleId}`);
        console.log(`      assignedDriverId: ${roster.assignedDriverId}`);
        console.log(`      tripId: ${roster.tripId}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkPendingRostersCount();