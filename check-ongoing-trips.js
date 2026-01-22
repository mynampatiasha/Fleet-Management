// check-ongoing-trips.js
// Check for any ongoing trips in the database

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet_management';

async function checkOngoingTrips() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Check for any ongoing trips
    const ongoingTrips = await db.collection('rosters').find({
      status: { $in: ['ongoing', 'in_progress', 'started'] }
    }).toArray();
    
    console.log(`📊 Found ${ongoingTrips.length} ongoing trips:`);
    
    if (ongoingTrips.length === 0) {
      console.log('❌ No ongoing trips found in the database');
      console.log('');
      console.log('💡 This explains why "Track Now" shows "No active trip found"');
      console.log('');
      console.log('🔧 SOLUTIONS:');
      console.log('1. Assign a driver and vehicle to existing pending rosters');
      console.log('2. Change roster status from "pending_assignment" to "ongoing"');
      console.log('3. Create a test ongoing trip for testing');
    } else {
      ongoingTrips.forEach((trip, index) => {
        console.log(`\n${index + 1}. Trip ID: ${trip._id}`);
        console.log(`   Customer: ${trip.customerName || 'Unknown'}`);
        console.log(`   Status: ${trip.status}`);
        console.log(`   Vehicle: ${trip.vehicleNumber || 'Not assigned'}`);
        console.log(`   Driver: ${trip.driverName || 'Not assigned'}`);
        console.log(`   User ID: ${trip.userId || trip.customerId}`);
      });
    }
    
    // Also check pending assignments
    const pendingTrips = await db.collection('rosters').find({
      status: 'pending_assignment'
    }).limit(5).toArray();
    
    console.log(`\n📋 Found ${pendingTrips.length} pending assignment trips (showing first 5):`);
    pendingTrips.forEach((trip, index) => {
      console.log(`${index + 1}. ${trip.customerName} - ${trip.rosterType} - ${trip.officeLocation}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkOngoingTrips();