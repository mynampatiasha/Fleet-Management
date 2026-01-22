const http = require('http');

function testDistanceAPI() {
  console.log('🧪 Testing Distance API...\n');

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/roster/admin/assigned-trips',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Note: In a real scenario, you'd need a valid JWT token
      'Authorization': 'Bearer test-token'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        console.log('✅ API Response Status:', res.statusCode);
        
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('📊 Total trips returned:', response.data?.length || 0);

          if (response.data && response.data.length > 0) {
            console.log('\n📋 Sample trip data:');
            const sampleTrip = response.data[0];
            
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
            response.data.forEach(trip => {
              if (trip.totalDistanceKm > 0 || trip.distance > 0 || trip.distanceData?.totalDistanceKm > 0) {
                tripsWithDistance++;
              }
            });

            console.log(`\n📈 Trips with distance data: ${tripsWithDistance}/${response.data.length}`);
            
            if (tripsWithDistance === 0) {
              console.log('\n❌ NO TRIPS HAVE DISTANCE DATA!');
              console.log('The API is not returning distance information.');
            } else {
              console.log('\n✅ Distance data is available in the API response');
              console.log('The frontend should now display distance information');
            }
          } else {
            console.log('\n⚠️  No trips found in the response');
          }
        } else {
          console.log('❌ API Error:', res.statusCode);
          console.log('Response:', data);
        }
      } catch (error) {
        console.error('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.end();
}

testDistanceAPI();