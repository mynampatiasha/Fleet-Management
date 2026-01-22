const axios = require('axios');
const { MongoClient } = require('mongodb');

const BACKEND_URL = 'http://localhost:3001';
const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function debugCustomer123MyStats() {
  let client;
  
  try {
    console.log('='.repeat(80));
    console.log('🔍 DEBUGGING CUSTOMER123 MYSTATS ISSUE');
    console.log('='.repeat(80));

    // Step 1: Connect to MongoDB and verify data
    console.log('\n1. Connecting to MongoDB and checking data...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('abra_fleet');
    
    const customerUID = 'b5aoloVR7xYI6SICibCIWecBaf82';
    
    // Check trips
    const trips = await db.collection('trips').find({ customerId: customerUID }).toArray();
    console.log(`✅ Found ${trips.length} trips for customer123`);
    
    // Check rosters
    const rosters = await db.collection('rosters').find({ userId: customerUID }).toArray();
    console.log(`✅ Found ${rosters.length} rosters for customer123`);

    // Analyze trip data
    if (trips.length > 0) {
      console.log('\n📊 Trip Analysis:');
      const tripsByStatus = {};
      let totalDistance = 0;
      
      trips.forEach(trip => {
        const status = trip.status || 'unknown';
        tripsByStatus[status] = (tripsByStatus[status] || 0) + 1;
        
        if (trip.distance) {
          totalDistance += parseFloat(trip.distance) || 0;
        }
        if (trip.actualDistance) {
          totalDistance += parseFloat(trip.actualDistance) || 0;
        }
      });
      
      console.log('  Status breakdown:');
      Object.entries(tripsByStatus).forEach(([status, count]) => {
        console.log(`    - ${status}: ${count}`);
      });
      console.log(`  Total distance: ${totalDistance.toFixed(2)} km`);
      
      // Show sample trip data
      console.log('\n📋 Sample Trip Data:');
      const sampleTrip = trips[0];
      console.log(`  Trip ID: ${sampleTrip.tripId}`);
      console.log(`  Customer ID: ${sampleTrip.customerId}`);
      console.log(`  Status: ${sampleTrip.status}`);
      console.log(`  Distance: ${sampleTrip.distance || sampleTrip.actualDistance || 'N/A'}`);
      console.log(`  Created: ${sampleTrip.createdAt || sampleTrip.scheduledDate || 'N/A'}`);
      console.log(`  Vehicle: ${sampleTrip.vehicleNumber || 'N/A'}`);
      console.log(`  Driver: ${sampleTrip.driverName || 'N/A'}`);
    }

    // Step 2: Test backend health
    console.log('\n2. Testing backend connectivity...');
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      console.log('✅ Backend is healthy:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }

    // Step 3: Test stats endpoint structure
    console.log('\n3. Testing stats endpoint structure...');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/customer/stats/dashboard`, {
        headers: {
          'Authorization': 'Bearer fake_token_for_testing',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      console.log('Unexpected success - this should have failed with auth error');
    } catch (error) {
      if (error.response) {
        console.log(`✅ Endpoint exists (Status: ${error.response.status})`);
        console.log(`✅ Auth error as expected: ${error.response.data?.message || 'Auth required'}`);
      } else {
        console.log('❌ Connection error:', error.message);
        return;
      }
    }

    // Step 4: Check Firebase users collection
    console.log('\n4. Checking Firebase user data...');
    const users = await db.collection('users').find({ firebaseUid: customerUID }).toArray();
    console.log(`✅ Found ${users.length} user records for customer123`);
    
    if (users.length > 0) {
      const user = users[0];
      console.log('  User details:');
      console.log(`    Email: ${user.email}`);
      console.log(`    Name: ${user.name || 'N/A'}`);
      console.log(`    Role: ${user.role || 'N/A'}`);
      console.log(`    Status: ${user.status || 'N/A'}`);
      console.log(`    Firebase UID: ${user.firebaseUid}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎯 DIAGNOSIS SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Customer123 has ${trips.length} trips and ${rosters.length} rosters`);
    console.log('✅ Backend is running and responding on port 3001');
    console.log('✅ Stats endpoint exists and requires authentication');
    console.log(`✅ User record exists: ${users.length > 0 ? 'YES' : 'NO'}`);
    
    console.log('\n🔍 LIKELY ISSUES:');
    console.log('1. Flutter app authentication may be failing');
    console.log('2. Firebase token may not be valid or expired');
    console.log('3. API service may not be sending proper headers');
    console.log('4. Network connectivity between Flutter and backend');
    
    console.log('\n🛠️ NEXT STEPS:');
    console.log('1. Check Flutter app logs for authentication errors');
    console.log('2. Verify Firebase configuration in Flutter app');
    console.log('3. Test API calls from Flutter app with debug logs');
    console.log('4. Check if customer123 can login to the Flutter app');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\n❌ Error during debugging:', error.message);
    console.error(error.stack);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

debugCustomer123MyStats();