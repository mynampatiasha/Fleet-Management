// Verify active trip for customer123@abrafleet.com
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function verifyActiveTrip() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    const customerId = 'b5aoloVR7xYI6SICibCIWecBaf82'; // customer123@abrafleet.com
    
    console.log('🔍 Checking active trip for customer123@abrafleet.com...\n');
    
    // Find active trip
    const activeTrip = await db.collection('rosters').findOne({
      customerId: customerId,
      status: 'ongoing'
    });
    
    if (activeTrip) {
      console.log('✅ Active trip found!');
      console.log(`   Trip ID: ${activeTrip._id}`);
      console.log(`   Readable ID: ${activeTrip.readableId}`);
      console.log(`   Status: ${activeTrip.status}`);
      console.log(`   Customer: ${activeTrip.customerName} (${activeTrip.customerEmail})`);
      console.log(`   Vehicle: ${activeTrip.vehicleNumber} (${activeTrip.vehicleMake} ${activeTrip.vehicleModel})`);
      console.log(`   Driver: ${activeTrip.driverName} (${activeTrip.driverPhone})`);
      console.log(`   Route: ${activeTrip.pickupLocation} → ${activeTrip.dropLocation}`);
      console.log(`   Start Time: ${activeTrip.tripStartTime}`);
      console.log(`   Distance: ${activeTrip.distance} km`);
      
      console.log('\n🎯 Trip Details for Testing:');
      console.log(`   Customer ID: ${customerId}`);
      console.log(`   Trip Status: ${activeTrip.status}`);
      console.log(`   Created: ${activeTrip.createdAt}`);
    } else {
      console.log('❌ No active trip found for customer123@abrafleet.com');
      
      // Check all trips for this customer
      const allTrips = await db.collection('rosters').find({
        customerId: customerId
      }).toArray();
      
      console.log(`\n📊 Found ${allTrips.length} total trips for this customer:`);
      allTrips.forEach((trip, index) => {
        console.log(`   ${index + 1}. ${trip.readableId} - Status: ${trip.status} - Date: ${trip.startDate}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking trip:', error);
  } finally {
    await client.close();
  }
}

verifyActiveTrip();