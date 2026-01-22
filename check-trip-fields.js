const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet_db';

async function checkTripFields() {
  console.log('🔍 Checking trip field structure...\n');
  
  let client;
  
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Get total trip count
    const totalTrips = await db.collection('trips').countDocuments();
    console.log(`📊 Total trips in database: ${totalTrips}\n`);
    
    if (totalTrips === 0) {
      console.log('❌ No trips found in database');
      return;
    }
    
    // Get a sample trip to see its structure
    const sampleTrip = await db.collection('trips').findOne({});
    
    console.log('📋 Sample Trip Structure:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(sampleTrip, null, 2));
    console.log('='.repeat(60));
    
    // Check what customer-related fields exist
    console.log('\n🔍 Customer-related fields in trips:');
    const customerFields = [
      'customerId',
      'customerEmail',
      'customerFirebaseUid',
      'userId',
      'userEmail',
      'firebaseUid',
      'employeeId',
      'employeeEmail'
    ];
    
    for (const field of customerFields) {
      const count = await db.collection('trips').countDocuments({ [field]: { $exists: true } });
      if (count > 0) {
        console.log(`✅ ${field}: ${count} trips have this field`);
        
        // Show sample value
        const sample = await db.collection('trips').findOne({ [field]: { $exists: true } });
        console.log(`   Sample value: ${sample[field]}`);
        console.log(`   Sample value type: ${typeof sample[field]}`);
      } else {
        console.log(`❌ ${field}: No trips have this field`);
      }
    }
    
    // Check if trips have status field
    console.log('\n📊 Trip Status Breakdown:');
    const statuses = await db.collection('trips').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    statuses.forEach(status => {
      console.log(`   ${status._id || 'null'}: ${status.count} trips`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkTripFields();
