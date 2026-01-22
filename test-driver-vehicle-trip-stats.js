// Test script to check driver and vehicle trip statistics
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';

async function testTripStats() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Test 1: Get trip statistics by status
    console.log('\n📊 === TRIP STATISTICS BY STATUS ===');
    const tripsByStatus = await db.collection('trips').aggregate([
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
    
    console.log('Trip counts by status:');
    tripsByStatus.forEach(stat => {
      console.log(`  ${stat._id || 'null'}: ${stat.count}`);
    });
    
    // Test 2: Get driver with most trips
    console.log('\n👨‍✈️ === TOP DRIVERS BY TRIP COUNT ===');
    const topDrivers = await db.collection('trips').aggregate([
      {
        $group: {
          _id: '$driverId',
          totalTrips: { $sum: 1 },
          ongoing: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          scheduled: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalTrips: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray();
    
    console.log('Top 5 drivers:');
    for (const driver of topDrivers) {
      const driverInfo = await db.collection('drivers').findOne({ driverId: driver._id });
      console.log(`\n  Driver: ${driver._id} (${driverInfo?.name || 'Unknown'})`);
      console.log(`    Total: ${driver.totalTrips}`);
      console.log(`    🟢 Ongoing: ${driver.ongoing}`);
      console.log(`    🔵 Scheduled: ${driver.scheduled}`);
      console.log(`    ⚪ Completed: ${driver.completed}`);
    }
    
    // Test 3: Get vehicle with most trips
    console.log('\n🚗 === TOP VEHICLES BY TRIP COUNT ===');
    const topVehicles = await db.collection('trips').aggregate([
      {
        $group: {
          _id: '$vehicleId',
          totalTrips: { $sum: 1 },
          ongoing: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          scheduled: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { totalTrips: -1 }
      },
      {
        $limit: 5
      }
    ]).toArray();
    
    console.log('Top 5 vehicles:');
    for (const vehicle of topVehicles) {
      const vehicleInfo = await db.collection('vehicles').findOne({ vehicleId: vehicle._id });
      console.log(`\n  Vehicle: ${vehicle._id} (${vehicleInfo?.registrationNumber || 'Unknown'})`);
      console.log(`    Total: ${vehicle.totalTrips}`);
      console.log(`    🟢 Ongoing: ${vehicle.ongoing}`);
      console.log(`    🔵 Scheduled: ${vehicle.scheduled}`);
      console.log(`    ⚪ Completed: ${vehicle.completed}`);
    }
    
    // Test 4: Get current ongoing trips
    console.log('\n🔄 === CURRENT ONGOING TRIPS ===');
    const ongoingTrips = await db.collection('trips').find({
      status: 'in_progress'
    }).limit(5).toArray();
    
    console.log(`Found ${ongoingTrips.length} ongoing trips:`);
    for (const trip of ongoingTrips) {
      console.log(`\n  Trip: ${trip.tripId}`);
      console.log(`    Driver: ${trip.driverId}`);
      console.log(`    Vehicle: ${trip.vehicleId}`);
      console.log(`    Customer: ${trip.customer?.name || 'Unknown'}`);
      console.log(`    Start Time: ${trip.startTime}`);
    }
    
    // Test 5: Sample driver trip stats query
    console.log('\n🧪 === SAMPLE DRIVER TRIP STATS QUERY ===');
    const sampleDriver = await db.collection('drivers').findOne({});
    if (sampleDriver) {
      console.log(`Testing with driver: ${sampleDriver.driverId} (${sampleDriver.name})`);
      
      const stats = await db.collection('trips').aggregate([
        {
          $match: { driverId: sampleDriver.driverId }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      
      const tripStats = {
        ongoing: stats.find(s => s._id === 'in_progress')?.count || 0,
        scheduled: stats.find(s => s._id === 'scheduled')?.count || 0,
        completed: stats.find(s => s._id === 'completed')?.count || 0,
        cancelled: stats.find(s => s._id === 'cancelled')?.count || 0
      };
      
      console.log('Trip statistics:', tripStats);
      
      // Get current trip if any
      const currentTrip = await db.collection('trips').findOne({
        driverId: sampleDriver.driverId,
        status: 'in_progress'
      });
      
      if (currentTrip) {
        console.log('\nCurrent trip:', {
          tripId: currentTrip.tripId,
          status: currentTrip.status,
          startTime: currentTrip.startTime,
          customer: currentTrip.customer?.name
        });
      } else {
        console.log('\nNo current trip');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

testTripStats();
