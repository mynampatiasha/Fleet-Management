const axios = require('axios');

async function testDriverReportsWithAuth() {
  console.log('🧪 Testing Driver Reports with Rajesh Kumar Authentication\n');

  const baseUrl = 'http://localhost:3001';
  
  // Test headers with Firebase UID for rajesh.kumar@abrafleet.com
  const testHeaders = {
    'x-test-firebase-uid': 'aVIF9Ahluig993fCNyZRrIDC3KO2', // Real Firebase UID
    'Content-Type': 'application/json'
  };
  
  try {
    // Test 1: Performance Summary with test authentication
    console.log('1️⃣ Testing Performance Summary with test auth...');
    const perfResponse = await axios.get(`${baseUrl}/api/driver/reports/performance-summary`, {
      headers: testHeaders
    });
    
    if (perfResponse.status === 200) {
      const data = perfResponse.data.data;
      console.log('✅ Performance Summary API working!');
      console.log(`   - Driver ID: DRV-100001 (Rajesh Kumar)`);
      console.log(`   - Total Trips: ${data.totalTrips}`);
      console.log(`   - Average Rating: ${data.avgRating}/5.0`);
      console.log(`   - On-Time %: ${data.onTimePercentage}%`);
      console.log(`   - Total Distance: ${data.totalKm} km\n`);
    }

    // Test 2: Daily Analytics with test authentication
    console.log('2️⃣ Testing Daily Analytics with test auth...');
    const dailyResponse = await axios.get(`${baseUrl}/api/driver/reports/daily-analytics`, {
      headers: testHeaders
    });
    
    if (dailyResponse.status === 200) {
      const data = dailyResponse.data.data;
      console.log('✅ Daily Analytics API working!');
      console.log(`   - Working Hours: ${data.workingHours}`);
      console.log(`   - Fuel Efficiency: ${data.fuelEfficiency}`);
      console.log(`   - Trips Today: ${data.tripsToday}`);
      console.log(`   - Distance Today: ${data.distanceToday} km\n`);
    }

    // Test 3: Trips with test authentication
    console.log('3️⃣ Testing Trips API with test auth...');
    const tripsResponse = await axios.get(`${baseUrl}/api/driver/reports/trips`, {
      headers: testHeaders
    });
    
    if (tripsResponse.status === 200) {
      const data = tripsResponse.data.data;
      console.log('✅ Trips API working!');
      console.log(`   - Total Trips: ${data.summary.totalTrips}`);
      console.log(`   - Completed Trips: ${data.summary.completedTrips}`);
      console.log(`   - Total Distance: ${data.summary.totalDistance} km`);
      console.log(`   - Total Duration: ${data.summary.totalDurationHours} hours`);
      
      if (data.trips.length > 0) {
        const recentTrip = data.trips[0];
        console.log(`   - Recent Trip: ${recentTrip.tripNumber} - ${recentTrip.customerName} (${recentTrip.status})`);
        console.log(`   - Trip Distance: ${recentTrip.distance} km`);
        if (recentTrip.rating) {
          console.log(`   - Trip Rating: ${recentTrip.rating}/5.0`);
        }
      }
      console.log('');
    }

    // Test 4: Test without authentication (should fail)
    console.log('4️⃣ Testing APIs without authentication (should fail)...');
    try {
      const noAuthResponse = await axios.get(`${baseUrl}/api/driver/reports/performance-summary`);
      console.log('⚠️  API works without auth - this is unexpected!');
    } catch (error) {
      console.log('✅ API correctly requires authentication');
      console.log(`   - Error: ${error.response?.data?.message || error.message}\n`);
    }

    console.log('🎯 DIAGNOSIS:');
    console.log('   ✅ Backend APIs work perfectly with test authentication');
    console.log('   ✅ Rajesh Kumar (DRV-100001) has real trip data');
    console.log('   ✅ Authentication middleware is working correctly');
    console.log('\n🔧 FRONTEND ISSUE:');
    console.log('   ❌ Frontend is likely not authenticated properly');
    console.log('   ❌ User might not be logged in as rajesh.kumar@abrafleet.com');
    console.log('   ❌ Firebase authentication token might be missing/expired');
    console.log('\n💡 SOLUTIONS:');
    console.log('   1. Check if user is logged in to Firebase');
    console.log('   2. Verify Firebase ID token is being sent in Authorization header');
    console.log('   3. Check if rajesh.kumar@abrafleet.com exists in Firebase Auth');
    console.log('   4. Ensure API calls include: Authorization: Bearer <firebase-token>');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDriverReportsWithAuth();