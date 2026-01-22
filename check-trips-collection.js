const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function checkTripsCollection() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('abra_fleet');
    const tripsCollection = db.collection('trips');
    
    // Get total count
    const totalCount = await tripsCollection.countDocuments();
    console.log(`\n📊 Total trips in collection: ${totalCount}`);
    
    // Get sample trips
    console.log('\n📋 Sample trips (first 5):');
    const sampleTrips = await tripsCollection.find().limit(5).toArray();
    sampleTrips.forEach((trip, index) => {
      console.log(`\n--- Trip ${index + 1} ---`);
      console.log('Trip ID:', trip.tripId || trip._id);
      console.log('Status:', trip.status);
      console.log('Driver:', trip.driverId || trip.driver);
      console.log('Vehicle:', trip.vehicleId || trip.vehicle);
      console.log('Customer:', trip.customerId || trip.customer);
      console.log('Route:', trip.route?.length || 0, 'stops');
      console.log('Created:', trip.createdAt);
      console.log('Fields:', Object.keys(trip).join(', '));
    });
    
    // Get trips by status
    console.log('\n📈 Trips by status:');
    const statuses = await tripsCollection.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    statuses.forEach(s => {
      console.log(`  ${s._id}: ${s.count}`);
    });
    
    // Get recent trips
    console.log('\n🕐 Recent trips (last 10):');
    const recentTrips = await tripsCollection
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    recentTrips.forEach(trip => {
      console.log(`  ${trip.tripId || trip._id} - ${trip.status} - ${new Date(trip.createdAt).toLocaleString()}`);
    });
    
    // Check for active trips
    console.log('\n🚗 Active trips:');
    const activeTrips = await tripsCollection
      .find({ status: { $in: ['ongoing', 'started', 'in_progress'] } })
      .toArray();
    
    console.log(`Found ${activeTrips.length} active trips`);
    activeTrips.forEach(trip => {
      console.log(`  Trip: ${trip.tripId || trip._id}`);
      console.log(`  Driver: ${trip.driverId || trip.driver}`);
      console.log(`  Status: ${trip.status}`);
      console.log(`  Started: ${trip.startTime || trip.startedAt || 'N/A'}`);
    });
    
    // Check field consistency
    console.log('\n🔍 Field analysis:');
    const allTrips = await tripsCollection.find().limit(100).toArray();
    const fieldCounts = {};
    
    allTrips.forEach(trip => {
      Object.keys(trip).forEach(field => {
        fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      });
    });
    
    console.log('Common fields (in sample of 100):');
    Object.entries(fieldCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([field, count]) => {
        console.log(`  ${field}: ${count}/${allTrips.length}`);
      });
    
    // Check for trips with specific customers
    console.log('\n👥 Trips by customer (top 10):');
    const customerTrips = await tripsCollection.aggregate([
      { $group: { _id: '$customerId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    customerTrips.forEach(c => {
      console.log(`  Customer ${c._id}: ${c.count} trips`);
    });
    
    // Check for trips with specific drivers
    console.log('\n🚗 Trips by driver (top 10):');
    const driverTrips = await tripsCollection.aggregate([
      { $group: { _id: '$driverId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    driverTrips.forEach(d => {
      console.log(`  Driver ${d._id}: ${d.count} trips`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

checkTripsCollection();
