// Simple test to check roster data in MongoDB
const { MongoClient } = require('mongodb');

async function checkRosterData() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet_management');
    
    console.log('🔍 CHECKING ROSTER DATA FOR SEQUENCE AND DISTANCE...\n');
    
    // Find rosters with pickup sequence
    const rosters = await db.collection('rosters').find({
      status: 'assigned',
      pickupSequence: { $exists: true }
    }).limit(10).toArray();
    
    console.log(`📋 Found ${rosters.length} assigned rosters with pickup sequence:\n`);
    
    rosters.forEach((roster, index) => {
      console.log(`${index + 1}. Customer: ${roster.customerName || 'Unknown'}`);
      console.log(`   Driver ID: ${roster.driverId || 'N/A'}`);
      console.log(`   Pickup Sequence: ${roster.pickupSequence || 'MISSING'}`);
      console.log(`   Distance: ${roster.distance || 'N/A'} km`);
      
      if (roster.routeDetails) {
        console.log(`   Route Details:`);
        console.log(`     - Distance from Previous: ${roster.routeDetails.distanceFromPrevious || 'N/A'} km`);
        console.log(`     - Total Distance: ${roster.routeDetails.totalDistance || 'N/A'} km`);
        console.log(`     - Sequence: ${roster.routeDetails.sequence || 'N/A'}`);
      } else {
        console.log(`   Route Details: MISSING`);
      }
      
      console.log(`   Status: ${roster.status}`);
      console.log(`   Assigned At: ${roster.assignedAt || 'N/A'}`);
      console.log('');
    });
    
    // Check for drivertest specifically
    console.log('🚗 CHECKING DRIVERTEST ROSTERS:\n');
    
    const driverTestRosters = await db.collection('rosters').find({
      $or: [
        { driverId: 'DRV-852306' },
        { driverName: /drivertest/i }
      ]
    }).toArray();
    
    console.log(`Found ${driverTestRosters.length} rosters for drivertest:\n`);
    
    driverTestRosters.forEach((roster, index) => {
      console.log(`${index + 1}. ${roster.customerName || 'Unknown'}`);
      console.log(`   Pickup Sequence: ${roster.pickupSequence || '❌ MISSING'}`);
      console.log(`   Distance: ${roster.routeDetails?.distanceFromPrevious || roster.distance || '❌ MISSING'} km`);
      console.log(`   Status: ${roster.status}`);
      console.log('');
    });
    
    console.log('✅ Data check completed!');
    console.log('\n📱 NEXT STEPS:');
    console.log('1. If pickup sequences are missing, run route optimization first');
    console.log('2. Hot reload Flutter app');
    console.log('3. Login as drivertest and check dashboard');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkRosterData();