const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCustomerStatsFix() {
  console.log('🧪 Testing Customer Stats Fix\n');
  console.log('='.repeat(70));
  
  try {
    // Step 1: Login as a customer (try different credentials)
    console.log('\n📝 Step 1: Attempting customer login...');
    
    const customerCredentials = [
      { email: 'customer123@abrafleet.com', password: 'password123' },
      { email: 'customer123@example.com', password: 'password123' },
      { email: 'pooja.joshi@abrafleet.com', password: 'password123' }
    ];
    
    let token = null;
    let userEmail = null;
    
    for (const creds of customerCredentials) {
      try {
        console.log(`   Trying ${creds.email}...`);
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, creds);
        
        if (loginResponse.data.success) {
          token = loginResponse.data.token;
          userEmail = creds.email;
          console.log(`✅ Login successful as ${userEmail}`);
          break;
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${error.response?.data?.message || error.message}`);
      }
    }
    
    if (!token) {
      console.log('\n❌ Could not login with any customer credentials');
      console.log('💡 Please create a customer account first or check credentials');
      return;
    }
    
    // Step 2: Test the dashboard endpoint
    console.log('\n📊 Step 2: Testing /api/customer/stats/dashboard...');
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/api/customer/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (dashboardResponse.data.success) {
        const stats = dashboardResponse.data.data;
        console.log('✅ Dashboard endpoint working!');
        console.log('\n📈 Statistics Summary:');
        console.log('   Total Trips:');
        console.log(`      - Total: ${stats.totalTrips?.total || 0}`);
        console.log(`      - Completed: ${stats.totalTrips?.completed || 0}`);
        console.log(`      - Ongoing: ${stats.totalTrips?.ongoing || 0}`);
        console.log(`      - Cancelled: ${stats.totalTrips?.cancelled || 0}`);
        console.log(`   Total Distance: ${stats.totalDistance || 0} km`);
        console.log(`   On-Time Delivery: ${stats.onTimeDelivery?.onTime || 0} / ${(stats.onTimeDelivery?.onTime || 0) + (stats.onTimeDelivery?.delayed || 0)}`);
        
        if (stats.recentTrip) {
          console.log('\n🚗 Recent Trip Details:');
          console.log(`   Vehicle: ${stats.recentTrip.vehicleNumber}`);
          console.log(`   Driver: ${stats.recentTrip.driverName}`);
          console.log(`   Phone: ${stats.recentTrip.driverPhone}`);
          console.log(`   Distance: ${stats.recentTrip.distance} km`);
        }
        
        // Check if we have data
        if (stats.totalTrips?.total === 0) {
          console.log('\n⚠️  No trips found for this customer');
          console.log('   This could mean:');
          console.log('   1. Customer has no trips yet');
          console.log('   2. Trips are stored with a different email/ID');
          console.log('   3. Need to check database directly');
        } else {
          console.log('\n✅ SUCCESS! Customer stats are now showing data!');
        }
      } else {
        console.log('❌ Dashboard returned unsuccessful response');
        console.log('   Response:', dashboardResponse.data);
      }
    } catch (error) {
      console.error('❌ Dashboard endpoint error:', error.response?.data || error.message);
    }
    
    // Step 3: Test the trips endpoint
    console.log('\n📊 Step 3: Testing /api/customer/stats/trips...');
    try {
      const tripsResponse = await axios.get(`${BASE_URL}/api/customer/stats/trips`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (tripsResponse.data.success) {
        const tripStats = tripsResponse.data.data;
        console.log('✅ Trips endpoint working!');
        console.log(`   Total: ${tripStats.total || 0}`);
        console.log(`   Completed: ${tripStats.completed || 0}`);
        console.log(`   Ongoing: ${tripStats.ongoing || 0}`);
        console.log(`   Cancelled: ${tripStats.cancelled || 0}`);
      }
    } catch (error) {
      console.error('❌ Trips endpoint error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🏁 Test Complete!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Open the Flutter app');
    console.log('   2. Login as the customer');
    console.log('   3. Navigate to Activity Report (My Stats)');
    console.log('   4. Verify that trip data is now showing');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testCustomerStatsFix();
