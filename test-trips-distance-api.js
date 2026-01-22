const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testTripsDistanceAPI() {
  try {
    console.log('🧪 Testing Trips Distance API...\n');

    // Test the assigned trips endpoint
    const response = await axios.get(`${API_BASE_URL}/api/roster/admin/assigned-trips`, {
      headers: {
        'Authorization': 'Bearer test-token', // You'll need a valid token
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('📊 Total trips returned:', response.data.data?.length || 0);

    if (response.data.data && response.data.data.length > 0) {
      console.log('\n📋 Sample trip data:');
      const sampleTrip = response.data.data[0];
      
      console.log('Customer:', sampleTrip.customerName);
      console.log('Status:', sampleTrip.status);
      console.log('Distance (totalDistanceKm):', sampleTrip.totalDistanceKm || 'Not available');
      console.log('Distance (distance):', sampleTrip.distance || 'Not available');
      console.log('Duration (totalDurationMin):', sampleTrip.totalDurationMin || 'Not available');
      console.log('Duration (estimatedDuration):', sampleTrip.estimatedDuration || 'Not available');
      
      if (sampleTrip.distanceData) {
        console.log('\n🗂️ Distance Data Object:');
        console.log('  Total Distance:', sampleTrip.distanceData.totalDistanceKm || 'Not available');
        console.log('  Total Duration:', sampleTrip.distanceData.totalDurationMin || 'Not available');
        console.log('  Login Distance:', sampleTrip.distanceData.login?.distanceKm || 'Not available');
        console.log('  Logout Distance:', sampleTrip.distanceData.logout?.distanceKm || 'Not available');
      } else {
        console.log('\n⚠️  No distanceData object found');
      }

      // Check how many trips have distance data
      let tripsWithDistance = 0;
      response.data.data.forEach(trip => {
        if (trip.totalDistanceKm > 0 || trip.distance > 0 || trip.distanceData?.totalDistanceKm > 0) {
          tripsWithDistance++;
        }
      });

      console.log(`\n📈 Trips with distance data: ${tripsWithDistance}/${response.data.data.length}`);
      
      if (tripsWithDistance === 0) {
        console.log('\n❌ NO TRIPS HAVE DISTANCE DATA!');
        console.log('This explains why distance is not showing in the frontend.');
        console.log('\nPossible solutions:');
        console.log('1. Run the calculate-roster-distances.js script');
        console.log('2. Ensure distance calculation is working during roster assignment');
        console.log('3. Check if distanceData field exists in the database');
      } else {
        console.log('\n✅ Distance data is available in the API response');
        console.log('The frontend should now display distance information');
      }
    } else {
      console.log('\n⚠️  No trips found in the response');
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testTripsDistanceAPI();