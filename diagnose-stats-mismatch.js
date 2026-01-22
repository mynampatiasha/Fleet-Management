// Script to diagnose the stats mismatch issue
const { MongoClient } = require('mongodb');

async function diagnoseStatsMismatch() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('abra_fleet_management');
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DIAGNOSING STATS MISMATCH ISSUE');
    console.log('='.repeat(80));
    
    // Get the customer's email (replace with actual email)
    const customerEmail = 'customer123@abrafleet.com'; // REPLACE WITH ACTUAL EMAIL
    
    console.log(`\n📧 Customer Email: ${customerEmail}`);
    
    // 1. Check My Trips data (rosters)
    console.log('\n1️⃣ CHECKING MY TRIPS DATA (Rosters Collection)');
    console.log('-'.repeat(80));
    
    const rosters = await db.collection('rosters').find({
      $or: [
        { customerEmail: customerEmail },
        { 'employeeDetails.email': customerEmail },
        { 'employeeData.email': customerEmail }
      ]
    }).toArray();
    
    console.log(`✅ Found ${rosters.length} rosters for ${customerEmail}`);
    
    // Count by status
    const completedRosters = rosters.filter(r => r.status === 'completed').length;
    const ongoingRosters = rosters.filter(r => ['assigned', 'in_progress', 'pending_assignment'].includes(r.status)).length;
    
    console.log(`   - Completed: ${completedRosters}`);
    console.log(`   - Ongoing: ${ongoingRosters}`);
    console.log(`   - Total: ${rosters.length}`);
    
    // Get most recent roster
    const sortedRosters = rosters.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    });
    
    if (sortedRosters.length > 0) {
      const recentRoster = sortedRosters[0];
      console.log(`\n   📋 Most Recent Roster:`);
      console.log(`      Driver: ${recentRoster.driverName || 'Not assigned'}`);
      console.log(`      Vehicle: ${recentRoster.vehicleNumber || 'Not assigned'}`);
      console.log(`      Status: ${recentRoster.status}`);
      console.log(`      Distance: ${recentRoster.actualDistance || recentRoster.distance || 0} km`);
    }
    
    // 2. Check Stats data (trips collection)
    console.log('\n2️⃣ CHECKING STATS DATA (Trips Collection)');
    console.log('-'.repeat(80));
    
    const trips = await db.collection('trips').find({
      $or: [
        { customerEmail: customerEmail },
        { 'employeeDetails.email': customerEmail },
        { 'employeeData.email': customerEmail }
      ]
    }).toArray();
    
    console.log(`✅ Found ${trips.length} trips for ${customerEmail}`);
    
    if (trips.length > 0) {
      const sortedTrips = trips.sort((a, b) => {
        const dateA = new Date(a.completedAt || a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.completedAt || b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
      
      const recentTrip = sortedTrips[0];
      console.log(`\n   🚗 Most Recent Trip:`);
      console.log(`      Driver: ${recentTrip.driverName || 'Unknown'}`);
      console.log(`      Vehicle: ${recentTrip.vehicleNumber || 'Unknown'}`);
      console.log(`      Status: ${recentTrip.status}`);
      console.log(`      Distance: ${recentTrip.actualDistance || recentTrip.distance || 0} km`);
    }
    
    // 3. Calculate total distance from rosters
    console.log('\n3️⃣ CALCULATING TOTAL DISTANCE');
    console.log('-'.repeat(80));
    
    let totalDistanceFromRosters = 0;
    rosters.forEach(roster => {
      const distance = roster.actualDistance || roster.distance || 0;
      if (distance > 0) {
        totalDistanceFromRosters += distance;
      }
    });
    
    console.log(`   Total distance from rosters: ${totalDistanceFromRosters.toFixed(1)} km`);
    
    let totalDistanceFromTrips = 0;
    trips.forEach(trip => {
      const distance = trip.actualDistance || trip.distance || 0;
      if (distance > 0) {
        totalDistanceFromTrips += distance;
      }
    });
    
    console.log(`   Total distance from trips: ${totalDistanceFromTrips.toFixed(1)} km`);
    
    // 4. Identify the mismatch
    console.log('\n4️⃣ MISMATCH ANALYSIS');
    console.log('-'.repeat(80));
    
    if (rosters.length !== trips.length) {
      console.log(`❌ MISMATCH: Rosters count (${rosters.length}) != Trips count (${trips.length})`);
    }
    
    if (Math.abs(totalDistanceFromRosters - totalDistanceFromTrips) > 0.1) {
      console.log(`❌ MISMATCH: Distance from rosters (${totalDistanceFromRosters.toFixed(1)} km) != Distance from trips (${totalDistanceFromTrips.toFixed(1)} km)`);
    }
    
    // 5. Check if stats are pulling from wrong collection
    console.log('\n5️⃣ CHECKING STATS QUERY');
    console.log('-'.repeat(80));
    
    // Simulate the stats query
    const statsTrips = await db.collection('trips').find({
      $or: [
        { customerEmail: customerEmail },
        { customerId: customerEmail }
      ]
    }).toArray();
    
    const statsRosters = await db.collection('rosters').find({
      $or: [
        { customerEmail: customerEmail },
        { 'employeeDetails.email': customerEmail },
        { 'employeeData.email': customerEmail }
      ]
    }).toArray();
    
    console.log(`   Stats query found:`);
    console.log(`      - ${statsTrips.length} trips`);
    console.log(`      - ${statsRosters.length} rosters`);
    
    // 6. Show the issue
    console.log('\n6️⃣ THE ISSUE');
    console.log('-'.repeat(80));
    
    if (trips.length > 0 && rosters.length > 0) {
      const tripDriver = trips[0].driverName;
      const rosterDriver = rosters[0].driverName;
      
      if (tripDriver !== rosterDriver) {
        console.log(`❌ FOUND THE ISSUE!`);
        console.log(`   My Trips shows: Driver "${rosterDriver}"`);
        console.log(`   MyStats shows: Driver "${tripDriver}"`);
        console.log(`   `);
        console.log(`   The stats are pulling from the TRIPS collection,`);
        console.log(`   but My Trips shows data from the ROSTERS collection.`);
        console.log(`   These are TWO DIFFERENT data sources!`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ DIAGNOSIS COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

diagnoseStatsMismatch();
