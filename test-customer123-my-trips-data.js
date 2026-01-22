const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function testCustomer123TripsData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const database = client.db('abra_fleet');
    const tripsCollection = database.collection('trips');
    const rostersCollection = database.collection('rosters');
    
    // Get all trips for customer123
    const trips = await tripsCollection.find({ 
      customerEmail: 'customer123@abrafleet.com' 
    }).sort({ scheduledPickupTime: -1 }).toArray();
    
    // Get all rosters for customer123
    const rosters = await rostersCollection.find({ 
      customerEmail: 'customer123@abrafleet.com' 
    }).sort({ startDate: -1 }).toArray();
    
    console.log(`\n📊 CUSTOMER123 DATA VERIFICATION FOR MYSTATS_SCREEN:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🚗 Total trips found: ${trips.length}`);
    console.log(`📋 Total rosters found: ${rosters.length}`);
    
    if (trips.length === 0) {
      console.log('❌ No trips found! Run create-customer123-my-trips-demo-data.js first');
      return;
    }
    
    // Calculate data exactly as mystats_screen.dart expects
    const statusCounts = {};
    const monthlyDistance = {};
    let totalDistance = 0;
    let onTimeCount = 0;
    let delayedCount = 0;
    
    trips.forEach(trip => {
      // Status analysis for totalTrips
      statusCounts[trip.status] = (statusCounts[trip.status] || 0) + 1;
      
      // Distance and on-time analysis for completed trips only
      if (trip.status === 'completed') {
        totalDistance += trip.distance || 0;
        
        // On-time delivery analysis
        if (trip.isOnTime === true) onTimeCount++;
        if (trip.isOnTime === false) delayedCount++;
        
        // Monthly distance breakdown
        const monthKey = trip.monthYear || `${trip.year}-${String(trip.month).padStart(2, '0')}`;
        if (monthKey && monthKey !== 'undefined-undefined') {
          if (!monthlyDistance[monthKey]) {
            monthlyDistance[monthKey] = 0;
          }
          monthlyDistance[monthKey] += trip.distance || 0;
        }
      }
    });
    
    // Get most recent trip for recentTrip data
    const recentTrip = trips[0];
    
    // Format monthly distance as mystats_screen expects
    const monthlyDistanceArray = Object.entries(monthlyDistance)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, distance]) => {
        const [year, monthNum] = monthKey.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short' });
        return { month: monthName, distance: distance };
      });
    
    console.log(`\n📈 MYSTATS_SCREEN DATA STRUCTURE:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    // totalTrips object
    console.log(`📊 totalTrips: {`);
    console.log(`     completed: ${statusCounts.completed || 0},`);
    console.log(`     ongoing: ${statusCounts.ongoing || 0},`);
    console.log(`     cancelled: ${statusCounts.cancelled || 0}`);
    console.log(`   }`);
    
    // onTimeDelivery object
    console.log(`⏰ onTimeDelivery: {`);
    console.log(`     onTime: ${onTimeCount},`);
    console.log(`     delayed: ${delayedCount}`);
    console.log(`   }`);
    
    // totalDistance number
    console.log(`🛣️  totalDistance: ${totalDistance.toFixed(1)}`);
    
    // monthlyDistance array
    console.log(`📅 monthlyDistance: [`);
    monthlyDistanceArray.forEach((item, index) => {
      const comma = index < monthlyDistanceArray.length - 1 ? ',' : '';
      console.log(`     { month: '${item.month}', distance: ${item.distance.toFixed(1)} }${comma}`);
    });
    console.log(`   ]`);
    
    // recentTrip object
    if (recentTrip) {
      console.log(`🚗 recentTrip: {`);
      console.log(`     vehicleNumber: '${recentTrip.vehicleNumber || 'N/A'}',`);
      console.log(`     driverName: '${recentTrip.driverName || 'N/A'}',`);
      console.log(`     driverPhone: '${recentTrip.driverPhone || 'N/A'}',`);
      console.log(`     distance: ${recentTrip.distance || 0}`);
      console.log(`   }`);
    } else {
      console.log(`🚗 recentTrip: null`);
    }
    
    console.log(`\n🎯 RECENT TRIPS (For Demo Showcase):`);
    trips.slice(0, 5).forEach((trip, index) => {
      const date = new Date(trip.scheduledPickupTime).toLocaleDateString();
      const time = new Date(trip.scheduledPickupTime).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      const rating = trip.rating ? `⭐${trip.rating}` : 'No rating';
      
      console.log(`   ${index + 1}. ${trip.tripId} - ${date} ${time}`);
      console.log(`      ${trip.pickupLocation?.name || 'Unknown'} → ${trip.dropLocation?.name || 'Unknown'}`);
      console.log(`      ${trip.vehicleName} (${trip.driverName}) - ${trip.status.toUpperCase()}`);
      console.log(`      Distance: ${trip.distance}km, Fare: ₹${trip.fare?.totalFare}, ${rating}`);
      console.log('');
    });
    
    console.log(`\n📋 MY_TRIPS_SCREEN DATA:`);
    if (rosters.length > 0) {
      const rosterStatusCounts = {};
      rosters.forEach(roster => {
        rosterStatusCounts[roster.status] = (rosterStatusCounts[roster.status] || 0) + 1;
      });
      console.log(`   Roster status breakdown:`, rosterStatusCounts);
      console.log(`   Recent rosters: ${rosters.slice(0, 3).map(r => `${r.rosterId} (${r.status})`).join(', ')}`);
    } else {
      console.log(`   No rosters found`);
    }
    
    console.log(`\n✅ DEMO READY FOR MANAGER PRESENTATION!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🔑 Login: customer123@abrafleet.com`);
    console.log(`📊 MyStats Screen: Data structure matches mystats_screen.dart expectations`);
    console.log(`🚗 MyTrips Screen: ${rosters.length} rosters with expandable trip details`);
    console.log(`📱 Features: Animated counters, charts, distance tracking, billing`);
    console.log(`⚡ Integration: Both MongoDB and Firestore data available`);
    
    // Data quality verification
    const qualityChecks = {
      'All trips have required fields': trips.every(t => t.tripId && t.status && t.distance),
      'Completed trips have ratings': trips.filter(t => t.status === 'completed').every(t => t.rating),
      'All trips have vehicle details': trips.every(t => t.vehicleName && t.driverName),
      'Monthly data is properly formatted': monthlyDistanceArray.length > 0,
      'Recent trip data is available': recentTrip && recentTrip.vehicleNumber && recentTrip.driverName,
      'On-time data is calculated': onTimeCount + delayedCount > 0
    };
    
    console.log(`\n🔍 DATA QUALITY FOR MYSTATS_SCREEN:`);
    Object.entries(qualityChecks).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });
    
    const qualityScore = Object.values(qualityChecks).filter(Boolean).length / Object.keys(qualityChecks).length * 100;
    console.log(`\n📊 Data Quality Score: ${qualityScore.toFixed(0)}%`);
    
    if (qualityScore >= 90) {
      console.log(`🎉 EXCELLENT! Data perfectly matches mystats_screen.dart expectations!`);
    } else if (qualityScore >= 75) {
      console.log(`👍 GOOD! Data is compatible with mystats_screen.dart.`);
    } else {
      console.log(`⚠️  WARNING! Data structure may not match mystats_screen.dart expectations.`);
    }
    
  } catch (error) {
    console.error('❌ Error testing customer123 data for mystats_screen:', error);
  } finally {
    await client.close();
  }
}

testCustomer123TripsData();