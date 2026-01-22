const { MongoClient } = require('mongodb');

// Debug script to check real-time fleet data
console.log('\n🔍 ========== DEBUGGING REAL-TIME FLEET DATA ==========');
console.log('📅 Timestamp:', new Date().toISOString());

async function debugFleetData() {
  let client;
  
  try {
    // Connect to MongoDB
    const uri = 'mongodb://localhost:27017'; // Adjust if different
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('abra_fleet');

    // Check if drivertest exists
    console.log('\n👤 ========== CHECKING DRIVER ==========');
    const driver = await db.collection('drivers').findOne({
      $or: [
        { firebaseUid: 'drivertest' },
        { uid: 'drivertest' },
        { driverId: 'drivertest' }
      ]
    });

    if (driver) {
      console.log('✅ Driver found:');
      console.log('   Driver ID:', driver.driverId);
      console.log('   Firebase UID:', driver.firebaseUid || driver.uid);
      console.log('   Name:', `${driver.personalInfo?.firstName} ${driver.personalInfo?.lastName}`);
      console.log('   Email:', driver.personalInfo?.email);
    } else {
      console.log('❌ Driver not found');
      console.log('   Searching for any drivers...');
      
      const anyDrivers = await db.collection('drivers').find({}).limit(3).toArray();
      console.log(`   Found ${anyDrivers.length} drivers in database:`);
      anyDrivers.forEach((d, i) => {
        console.log(`     ${i+1}. ${d.driverId} (${d.firebaseUid || d.uid})`);
      });
    }

    // Check rosters for today
    console.log('\n📋 ========== CHECKING ROSTERS FOR TODAY ==========');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Date range:', today.toISOString(), 'to', tomorrow.toISOString());

    const todayRosters = await db.collection('rosters').find({
      $and: [
        {
          $or: [
            { driverId: 'drivertest' },
            { assignedDriverId: 'drivertest' },
            { 'assignedDriver.driverId': 'drivertest' }
          ]
        },
        {
          $or: [
            { 
              startDate: { 
                $gte: today,
                $lt: tomorrow 
              } 
            },
            { 
              fromDate: { 
                $gte: today,
                $lt: tomorrow 
              } 
            }
          ]
        }
      ]
    }).toArray();

    console.log(`📊 Found ${todayRosters.length} rosters for today`);

    if (todayRosters.length > 0) {
      console.log('✅ Today\'s rosters:');
      todayRosters.forEach((roster, i) => {
        console.log(`   ${i+1}. Customer: ${roster.customerName || 'Unknown'}`);
        console.log(`      Roster ID: ${roster._id}`);
        console.log(`      Customer ID: ${roster.customerId || roster.userId}`);
        console.log(`      Status: ${roster.status}`);
        console.log(`      Start Date: ${roster.startDate || roster.fromDate}`);
        console.log(`      Trip Type: ${roster.tripType || roster.rosterType}`);
        console.log(`      Driver ID: ${roster.driverId || roster.assignedDriverId}`);
      });
    } else {
      console.log('⚠️  No rosters found for today');
      
      // Check if driver has any rosters (any date)
      const anyRosters = await db.collection('rosters').find({
        $or: [
          { driverId: 'drivertest' },
          { assignedDriverId: 'drivertest' },
          { 'assignedDriver.driverId': 'drivertest' }
        ]
      }).limit(5).toArray();

      console.log(`   Driver has ${anyRosters.length} rosters total (any date):`);
      anyRosters.forEach((r, i) => {
        console.log(`     ${i+1}. ${r.customerName} - ${r.startDate || r.fromDate} (${r.status})`);
      });

      // Check recent rosters (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const recentRosters = await db.collection('rosters').find({
        $and: [
          {
            $or: [
              { driverId: 'drivertest' },
              { assignedDriverId: 'drivertest' }
            ]
          },
          {
            $or: [
              { startDate: { $gte: weekAgo } },
              { fromDate: { $gte: weekAgo } }
            ]
          }
        ]
      }).toArray();

      console.log(`   Recent rosters (last 7 days): ${recentRosters.length}`);
    }

    // Check all rosters with various statuses
    console.log('\n📈 ========== ROSTER STATUS ANALYSIS ==========');
    const statusCounts = await db.collection('rosters').aggregate([
      {
        $match: {
          $or: [
            { driverId: 'drivertest' },
            { assignedDriverId: 'drivertest' }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    console.log('Roster status breakdown:');
    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count}`);
    });

    // Suggest solutions
    console.log('\n💡 ========== SUGGESTIONS ==========');
    if (!driver) {
      console.log('❌ Driver not found - Create driver profile or fix Firebase UID mapping');
    } else if (todayRosters.length === 0) {
      console.log('⚠️  No rosters for today - Options:');
      console.log('   1. Create test rosters for today');
      console.log('   2. Check if rosters have correct date');
      console.log('   3. Verify roster status is valid');
      console.log('   4. Run: node create-drivertest-demo-data.js');
    } else {
      console.log('✅ Data looks good - Check API and frontend logs');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ MongoDB connection closed');
    }
  }
}

// Run the debug
debugFleetData()
  .then(() => {
    console.log('\n========== DEBUG COMPLETE ==========\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Debug failed:', error);
    process.exit(1);
  });