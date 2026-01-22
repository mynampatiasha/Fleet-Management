const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './abra_fleet_backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkDistanceDataInDB() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('abra_fleet');
    const rostersCollection = db.collection('rosters');

    console.log('\n🔍 Checking distance data in rosters collection...\n');

    // Get total count of rosters
    const totalRosters = await rostersCollection.countDocuments({
      status: { $in: ['assigned', 'scheduled', 'ongoing', 'completed'] }
    });

    console.log(`📊 Total assigned/active rosters: ${totalRosters}`);

    // Check how many have distanceData field
    const rostersWithDistanceData = await rostersCollection.countDocuments({
      status: { $in: ['assigned', 'scheduled', 'ongoing', 'completed'] },
      distanceData: { $exists: true, $ne: null }
    });

    console.log(`📏 Rosters with distanceData field: ${rostersWithDistanceData}`);

    // Check how many have legacy distance field
    const rostersWithLegacyDistance = await rostersCollection.countDocuments({
      status: { $in: ['assigned', 'scheduled', 'ongoing', 'completed'] },
      distance: { $exists: true, $gt: 0 }
    });

    console.log(`📐 Rosters with legacy distance field: ${rostersWithLegacyDistance}`);

    // Get sample rosters to examine structure
    console.log('\n📋 Sample roster data:');
    const sampleRosters = await rostersCollection.find({
      status: { $in: ['assigned', 'scheduled', 'ongoing', 'completed'] }
    }).limit(3).toArray();

    sampleRosters.forEach((roster, index) => {
      console.log(`\n--- Sample ${index + 1} ---`);
      console.log(`Customer: ${roster.customerName || 'Unknown'}`);
      console.log(`Status: ${roster.status}`);
      console.log(`Has distanceData: ${roster.distanceData ? 'YES' : 'NO'}`);
      console.log(`Has legacy distance: ${roster.distance ? 'YES' : 'NO'}`);
      
      if (roster.distanceData) {
        console.log(`  Total Distance: ${roster.distanceData.totalDistanceKm || 'N/A'} km`);
        console.log(`  Total Duration: ${roster.distanceData.totalDurationMin || 'N/A'} min`);
        console.log(`  Login Distance: ${roster.distanceData.login?.distanceKm || 'N/A'} km`);
        console.log(`  Logout Distance: ${roster.distanceData.logout?.distanceKm || 'N/A'} km`);
      }
      
      if (roster.distance) {
        console.log(`  Legacy Distance: ${roster.distance} km`);
      }
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DISTANCE DATA SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total rosters: ${totalRosters}`);
    console.log(`With distanceData: ${rostersWithDistanceData} (${((rostersWithDistanceData/totalRosters)*100).toFixed(1)}%)`);
    console.log(`With legacy distance: ${rostersWithLegacyDistance} (${((rostersWithLegacyDistance/totalRosters)*100).toFixed(1)}%)`);

    if (rostersWithDistanceData === 0 && rostersWithLegacyDistance === 0) {
      console.log('\n❌ NO DISTANCE DATA FOUND!');
      console.log('This is why distance is not showing in the trips screen.');
      console.log('\nRecommended actions:');
      console.log('1. Run: node calculate-roster-distances.js');
      console.log('2. Ensure distance calculation is enabled during roster assignment');
      console.log('3. Check if coordinates are properly stored in roster data');
    } else if (rostersWithDistanceData > 0) {
      console.log('\n✅ Distance data found in database');
      console.log('The API should now return distance information');
    } else if (rostersWithLegacyDistance > 0) {
      console.log('\n⚠️  Only legacy distance data found');
      console.log('Consider migrating to the new distanceData structure');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Connection closed');
  }
}

checkDistanceDataInDB();