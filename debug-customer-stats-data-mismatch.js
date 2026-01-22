const axios = require('axios');
const { MongoClient, ObjectId } = require('mongodb');

const BASE_URL = 'http://localhost:3001';
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'abra_fleet_db';

async function debugCustomerStatsMismatch() {
  console.log('🔍 Debugging Customer Stats Data Mismatch\n');
  console.log('=' .repeat(70));

  let mongoClient;

  try {
    // Step 1: Login and get token
    console.log('\n📝 Step 1: Logging in as customer...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'customer123@example.com',
      password: 'password123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login successful');
    console.log(`   User ID: ${userId}`);

    // Step 2: Connect to MongoDB directly
    console.log('\n🔌 Step 2: Connecting to MongoDB...');
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
    const db = mongoClient.db(DB_NAME);
    console.log('✅ Connected to MongoDB');

    // Step 3: Check trips collection
    console.log('\n📊 Step 3: Checking trips collection...');
    
    // Try different query variations
    const queries = [
      { customerId: userId },
      { customerId: new ObjectId(userId) },
      { userId: userId },
      { userId: new ObjectId(userId) },
      { customerFirebaseUid: userId },
      { firebaseUid: userId }
    ];

    let foundTrips = [];
    let workingQuery = null;

    for (const query of queries) {
      const trips = await db.collection('trips').find(query).toArray();
      if (trips.length > 0) {
        foundTrips = trips;
        workingQuery = query;
        console.log(`✅ Found ${trips.length} trips with query:`, JSON.stringify(query));
        break;
      } else {
        console.log(`❌ No trips found with query:`, JSON.stringify(query));
      }
    }

    if (foundTrips.length === 0) {
      console.log('\n⚠️  No trips found with any query variation!');
      console.log('   Checking if trips exist at all...');
      
      const allTrips = await db.collection('trips').find({}).limit(5).toArray();
      console.log(`   Total trips in database: ${await db.collection('trips').countDocuments()}`);
      
      if (allTrips.length > 0) {
        console.log('\n   Sample trip structure:');
        console.log(JSON.stringify(allTrips[0], null, 2));
      }
    } else {
      console.log(`\n✅ Found ${foundTrips.length} trips!`);
      console.log(`   Working query: ${JSON.stringify(workingQuery)}`);
      
      // Analyze trip statuses
      const statusCounts = {};
      foundTrips.forEach(trip => {
        const status = trip.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      console.log('\n📈 Trip Status Breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
      
      // Check distance data
      const tripsWithDistance = foundTrips.filter(t => t.distance || t.actualDistance);
      console.log(`\n📏 Trips with distance data: ${tripsWithDistance.length}`);
      
      if (tripsWithDistance.length > 0) {
        const totalDistance = tripsWithDistance.reduce((sum, trip) => {
          return sum + (trip.actualDistance || trip.distance || 0);
        }, 0);
        console.log(`   Total distance: ${totalDistance.toFixed(2)} km`);
      }
      
      // Show sample trip
      console.log('\n📋 Sample Trip:');
      const sampleTrip = foundTrips[0];
      console.log(`   Trip ID: ${sampleTrip.tripId || sampleTrip._id}`);
      console.log(`   Status: ${sampleTrip.status}`);
      console.log(`   Customer ID: ${sampleTrip.customerId}`);
      console.log(`   User ID: ${sampleTrip.userId || 'N/A'}`);
      console.log(`   Distance: ${sampleTrip.actualDistance || sampleTrip.distance || 0} km`);
      console.log(`   Created: ${sampleTrip.createdAt}`);
    }

    // Step 4: Check rosters collection
    console.log('\n📊 Step 4: Checking rosters collection...');
    
    const rosterQueries = [
      { userId: userId },
      { userId: new ObjectId(userId) },
      { customerId: userId },
      { customerId: new ObjectId(userId) }
    ];

    let foundRosters = [];
    let workingRosterQuery = null;

    for (const query of rosterQueries) {
      const rosters = await db.collection('rosters').find(query).toArray();
      if (rosters.length > 0) {
        foundRosters = rosters;
        workingRosterQuery = query;
        console.log(`✅ Found ${rosters.length} rosters with query:`, JSON.stringify(query));
        break;
      } else {
        console.log(`❌ No rosters found with query:`, JSON.stringify(query));
      }
    }

    if (foundRosters.length > 0) {
      console.log(`\n✅ Found ${foundRosters.length} rosters!`);
      console.log(`   Working query: ${JSON.stringify(workingRosterQuery)}`);
      
      // Analyze roster statuses
      const rosterStatusCounts = {};
      foundRosters.forEach(roster => {
        const status = roster.status || 'unknown';
        rosterStatusCounts[status] = (rosterStatusCounts[status] || 0) + 1;
      });
      
      console.log('\n📈 Roster Status Breakdown:');
      Object.entries(rosterStatusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count}`);
      });
    }

    // Step 5: Test the API endpoint
    console.log('\n🌐 Step 5: Testing API endpoint...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/customer/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.data.success) {
        const stats = statsResponse.data.data;
        console.log('✅ API Response received:');
        console.log(`   Total Trips: ${stats.totalTrips?.total || 0}`);
        console.log(`   Completed: ${stats.totalTrips?.completed || 0}`);
        console.log(`   Ongoing: ${stats.totalTrips?.ongoing || 0}`);
        console.log(`   Cancelled: ${stats.totalTrips?.cancelled || 0}`);
        console.log(`   Total Distance: ${stats.totalDistance || 0} km`);
      } else {
        console.log('❌ API returned unsuccessful response');
      }
    } catch (apiError) {
      console.error('❌ API Error:', apiError.response?.data || apiError.message);
    }

    // Step 6: Diagnosis and Solution
    console.log('\n' + '='.repeat(70));
    console.log('🔧 DIAGNOSIS & SOLUTION:');
    console.log('='.repeat(70));

    if (foundTrips.length > 0 && workingQuery) {
      console.log('\n✅ ISSUE IDENTIFIED:');
      console.log(`   - Database has ${foundTrips.length} trips`);
      console.log(`   - Working query: ${JSON.stringify(workingQuery)}`);
      console.log(`   - Backend might be using wrong field name`);
      
      console.log('\n💡 SOLUTION:');
      console.log('   The backend query in customer_stats_router.js needs to use:');
      console.log(`   ${JSON.stringify(workingQuery)}`);
      console.log('\n   Current backend query might be using:');
      console.log('   { customerId: userId } or { userId: userId }');
      console.log('\n   Check if userId is stored as String or ObjectId');
    } else {
      console.log('\n⚠️  NO TRIPS FOUND:');
      console.log('   - No trips match the user ID in any field');
      console.log('   - Check if trips are associated with a different user ID');
      console.log('   - Verify the user ID from login matches trip records');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('\n🔌 MongoDB connection closed');
    }
  }
}

// Run the diagnostic
debugCustomerStatsMismatch();
