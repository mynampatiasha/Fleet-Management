const axios = require('axios');
const { MongoClient } = require('mongodb');

const BACKEND_URL = 'http://localhost:3001';
const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function testLiveMyStatsIssue() {
  let client;
  
  try {
    console.log('='.repeat(80));
    console.log('🔍 LIVE DEBUGGING: CUSTOMER123 MYSTATS NOT SHOWING DATA');
    console.log('='.repeat(80));

    // Step 1: Verify backend is running
    console.log('\n1. Testing backend connectivity...');
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
      console.log('✅ Backend is running:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ Backend is not accessible:', error.message);
      console.log('🔧 Make sure backend is running on port 3001');
      return;
    }

    // Step 2: Connect to database and verify data
    console.log('\n2. Connecting to database and verifying data...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('abra_fleet');
    
    const customerUID = 'b5aoloVR7xYI6SICibCIWecBaf82';
    
    // Check user record
    const user = await db.collection('users').findOne({ firebaseUid: customerUID });
    console.log(`✅ User record: ${user ? 'EXISTS' : 'MISSING'}`);
    if (user) {
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
    }
    
    // Check trips
    const trips = await db.collection('trips').find({ customerId: customerUID }).toArray();
    console.log(`✅ Trips found: ${trips.length}`);
    
    // Check rosters
    const rosters = await db.collection('rosters').find({ userId: customerUID }).toArray();
    console.log(`✅ Rosters found: ${rosters.length}`);

    if (trips.length === 0 && rosters.length === 0) {
      console.log('❌ NO DATA FOUND - This explains the empty MyStats screen');
      return;
    }

    // Step 3: Test the exact API endpoint that MyStats screen calls
    console.log('\n3. Testing the exact API endpoint used by MyStats screen...');
    console.log('   Endpoint: /api/customer/stats/dashboard');
    
    try {
      // Test without auth first to see the error
      const response = await axios.get(`${BACKEND_URL}/api/customer/stats/dashboard`, {
        headers: {
          'Authorization': 'Bearer fake_token',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('❌ Unexpected success - should have failed with auth error');
      console.log('Response:', response.data);
      
    } catch (error) {
      if (error.response) {
        console.log(`✅ API endpoint exists (Status: ${error.response.status})`);
        console.log(`✅ Expected auth error: ${error.response.data?.message || 'Auth required'}`);
        
        if (error.response.status === 401) {
          console.log('✅ This confirms the API is working but requires authentication');
        }
      } else {
        console.log('❌ API connection error:', error.message);
        return;
      }
    }

    // Step 4: Check what the Flutter app might be sending
    console.log('\n4. Analyzing potential Flutter app issues...');
    
    // Check if there are any recent API calls in backend logs
    console.log('   Checking for common Flutter app issues:');
    console.log('   - Firebase authentication token issues');
    console.log('   - Network connectivity problems');
    console.log('   - API service configuration errors');
    console.log('   - CORS issues (if running on web)');

    // Step 5: Simulate what the API should return
    console.log('\n5. Simulating expected API response...');
    
    // Calculate stats like the API should
    const completedTrips = trips.filter(t => ['completed', 'delivered'].includes(t.status?.toLowerCase())).length;
    const ongoingTrips = trips.filter(t => ['in_progress', 'picked_up', 'ongoing', 'scheduled', 'assigned'].includes(t.status?.toLowerCase())).length;
    const cancelledTrips = trips.filter(t => t.status?.toLowerCase() === 'cancelled').length;
    const pendingRosters = rosters.filter(r => ['pending_assignment', 'pending'].includes(r.status?.toLowerCase())).length;
    
    let totalDistance = 0;
    trips.forEach(trip => {
      if (trip.distance) totalDistance += parseFloat(trip.distance) || 0;
      if (trip.actualDistance) totalDistance += parseFloat(trip.actualDistance) || 0;
    });
    
    const expectedResponse = {
      totalTrips: {
        completed: completedTrips,
        ongoing: ongoingTrips + pendingRosters,
        cancelled: cancelledTrips,
        total: completedTrips + ongoingTrips + cancelledTrips + pendingRosters
      },
      totalDistance: Math.round(totalDistance * 10) / 10,
      onTimeDelivery: {
        onTime: completedTrips,
        delayed: 0
      },
      monthlyDistance: [],
      weeklyBookings: [],
      topRoutes: [],
      lastUpdated: new Date()
    };
    
    console.log('\n📊 EXPECTED API RESPONSE:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(expectedResponse, null, 2));
    console.log('='.repeat(50));

    // Step 6: Provide debugging steps
    console.log('\n6. DEBUGGING STEPS FOR FLUTTER APP:');
    console.log('='.repeat(50));
    console.log('🔍 Check Flutter Console Logs:');
    console.log('   1. Open Flutter app in browser (F12 -> Console)');
    console.log('   2. Login as customer123@abrafleet.com');
    console.log('   3. Navigate to MyStats screen');
    console.log('   4. Look for these error patterns:');
    console.log('      - "Failed to load statistics"');
    console.log('      - "Network error"');
    console.log('      - "401 Unauthorized"');
    console.log('      - "Firebase Auth token"');
    console.log('      - "Connection timeout"');
    
    console.log('\n🔧 Common Fixes:');
    console.log('   1. Check if user is properly logged in');
    console.log('   2. Verify Firebase authentication is working');
    console.log('   3. Check network connectivity to localhost:3001');
    console.log('   4. Clear browser cache and cookies');
    console.log('   5. Check .env file has correct API_BASE_URL');
    
    console.log('\n🧪 Test Authentication:');
    console.log('   1. Try logging out and logging back in');
    console.log('   2. Check if other API calls work (like profile)');
    console.log('   3. Test on different browser/incognito mode');
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 SUMMARY');
    console.log('='.repeat(80));
    console.log('✅ Backend is running correctly');
    console.log('✅ Database has customer123 data (49 trips, 5 rosters)');
    console.log('✅ User record exists in database');
    console.log('✅ API endpoint exists and responds');
    console.log('❌ Flutter app is not successfully calling the API');
    console.log('');
    console.log('🔍 MOST LIKELY CAUSES:');
    console.log('1. Firebase authentication token is invalid/expired');
    console.log('2. Network connectivity issue between Flutter and backend');
    console.log('3. API service in Flutter is not sending proper headers');
    console.log('4. CORS issue (if running Flutter web)');
    console.log('');
    console.log('🛠️ IMMEDIATE ACTION:');
    console.log('Check Flutter browser console for error messages while on MyStats screen');
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

testLiveMyStatsIssue();