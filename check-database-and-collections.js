const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

const uri = process.env.MONGODB_URI;

async function checkDatabaseAndCollections() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    console.log(`📍 Connection URI: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    // List all databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('\n📊 ALL DATABASES:');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Check the main database
    const db = client.db('abra_fleet');
    console.log('\n\n🔍 Checking database: abra_fleet');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Collections (${collections.length} total):`);
    
    for (const collection of collections) {
      const coll = db.collection(collection.name);
      const count = await coll.countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }
    
    // Specifically check trips collection
    console.log('\n\n🔍 DETAILED CHECK: trips collection');
    const tripsCollection = db.collection('trips');
    const tripsCount = await tripsCollection.countDocuments();
    console.log(`Total documents in trips: ${tripsCount}`);
    
    if (tripsCount > 0) {
      console.log('\n📋 Sample trips:');
      const sampleTrips = await tripsCollection.find({}).limit(5).toArray();
      sampleTrips.forEach((trip, index) => {
        console.log(`\n  Trip ${index + 1}:`);
        console.log(`    _id: ${trip._id}`);
        console.log(`    tripId: ${trip.tripId || 'N/A'}`);
        console.log(`    driverId: ${trip.driverId || 'N/A'}`);
        console.log(`    driverName: ${trip.driverName || 'N/A'}`);
        console.log(`    vehicleNumber: ${trip.vehicleNumber || 'N/A'}`);
        console.log(`    status: ${trip.status || 'N/A'}`);
      });
    }
    
    // Check if there are any other trip-related collections
    console.log('\n\n🔍 Looking for trip-related collections:');
    const tripCollections = collections.filter(c => 
      c.name.toLowerCase().includes('trip')
    );
    
    if (tripCollections.length > 0) {
      console.log('Found trip-related collections:');
      for (const coll of tripCollections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`  - ${coll.name}: ${count} documents`);
      }
    } else {
      console.log('No other trip-related collections found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

checkDatabaseAndCollections();
