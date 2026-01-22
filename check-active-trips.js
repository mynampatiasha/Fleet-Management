// Check if there are any active trips in the database
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

async function checkActiveTrips() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('🔍 Checking for active trips...\n');
    
    // Check for ongoing rosters
    const activeRosters = await db.collection('rosters').find({
      status: { $in: ['ongoing', 'in_progress', 'started'] }
    }).toArray();
    
    console.log(`📊 Found ${activeRosters.length} active rosters:`);
    
    activeRosters.forEach((roster, index) => {
      console.log(`\n${index + 1}. Roster ID: ${roster._id}`);
      console.log(`   Customer ID: ${roster.customerId}`);
      console.log(`   Status: ${roster.status}`);
      console.log(`   Driver: ${roster.driverName || 'N/A'}`);
      console.log(`   Vehicle: ${roster.vehicleNumber || 'N/A'}`);
    });
    
    // Check specifically for customer123@abrafleet.com
    const customer123Trips = await db.collection('rosters').find({
      customerId: 'b5aoloVR7xYI6SICibCIWecBaf82',
      status: { $in: ['ongoing', 'in_progress', 'started'] }
    }).toArray();
    
    console.log(`\n🎯 Active trips for customer123@abrafleet.com: ${customer123Trips.length}`);
    
    if (customer123Trips.length > 0) {
      console.log('✅ Customer has active trips - SOS should work');
      customer123Trips.forEach(trip => {
        console.log(`   Trip: ${trip._id} (${trip.status})`);
      });
    } else {
      console.log('❌ Customer has no active trips - SOS will be blocked');
      console.log('💡 Need to create an active trip for testing');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkActiveTrips();