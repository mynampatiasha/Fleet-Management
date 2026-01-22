const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCustomerStats() {
  console.log('🧪 Testing Customer Stats API\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Login as customer
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
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // Step 2: Test dashboard stats endpoint
    console.log('\n📊 Step 2: Fetching dashboard stats...');
    const statsResponse = await axios.get(`${BASE_URL}/api/customer/stats/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!statsResponse.data.success) {
      throw new Error('Stats fetch failed');
    }

    const stats = statsResponse.data.data;
    console.log('✅ Stats fetched successfully\n');
    
    // Display stats
    console.log('📈 TRIP STATISTICS:');
    console.log(`   Total Trips: ${stats.totalTrips?.total || 0}`);
    console.log(`   Completed: ${stats.totalTrips?.completed || 0}`);
    console.log(`   Ongoing: ${stats.totalTrips?.ongoing || 0}`);
    console.log(`   Cancelled: ${stats.totalTrips?.cancelled || 0}`);
    
    console.log('\n📏 DISTANCE STATISTICS:');
    console.log(`   Total Distance: ${stats.totalDistance || 0} km`);
    
    if (stats.recentTrip) {
      console.log('\n🚗 RECENT TRIP DETAILS:');
      console.log(`   Vehicle: ${stats.recentTrip.vehicleNumber || 'N/A'}`);
      console.log(`   Driver: ${stats.recentTrip.driverName || 'N/A'}`);
      console.log(`   Phone: ${stats.recentTrip.driverPhone || 'N/A'}`);
      console.log(`   Distance: ${stats.recentTrip.distance || 0} km`);
    } else {
      console.log('\n⚠️  No recent trip data available');
    }
    
    if (stats.monthlyDistance && stats.monthlyDistance.length > 0) {
      console.log('\n📅 MONTHLY DISTANCE:');
      stats.monthlyDistance.forEach(month => {
        console.log(`   ${month.month}: ${month.distance} km`);
      });
    }
    
    console.log('\n⏰ DELIVERY PERFORMANCE:');
    console.log(`   On Time: ${stats.onTimeDelivery?.onTime || 0}`);
    console.log(`   Delayed: ${stats.onTimeDelivery?.delayed || 0}`);
    
    if (stats.topRoutes && stats.topRoutes.length > 0) {
      console.log('\n🗺️  TOP ROUTES:');
      stats.topRoutes.forEach((route, index) => {
        console.log(`   ${index + 1}. ${route.route} (${route.count} trips)`);
      });
    }

    // Step 3: Test profile endpoint
    console.log('\n👤 Step 3: Fetching customer profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/customer/stats/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!profileResponse.data.success) {
      throw new Error('Profile fetch failed');
    }

    const profile = profileResponse.data.data;
    console.log('✅ Profile fetched successfully\n');
    console.log('📋 PROFILE INFORMATION:');
    console.log(`   Name: ${profile.name || 'N/A'}`);
    console.log(`   Email: ${profile.email || 'N/A'}`);
    console.log(`   Phone: ${profile.phoneNumber || 'N/A'}`);
    console.log(`   Company: ${profile.companyName || 'N/A'}`);
    console.log(`   Department: ${profile.department || 'N/A'}`);
    console.log(`   Status: ${profile.status || 'N/A'}`);

    // Step 4: Test monthly distance endpoint
    console.log('\n💰 Step 4: Fetching monthly distance for billing...');
    const monthlyResponse = await axios.get(`${BASE_URL}/api/customer/stats/monthly-distance`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!monthlyResponse.data.success) {
      throw new Error('Monthly distance fetch failed');
    }

    const monthlyData = monthlyResponse.data.data;
    console.log('✅ Monthly distance fetched successfully\n');
    console.log('📊 BILLING SUMMARY:');
    console.log(`   Total Distance (All Time): ${monthlyData.totalDistance || 0} km`);
    console.log(`   Today's Distance: ${monthlyData.todayDistance || 0} km`);
    console.log(`   Today's Trips: ${monthlyData.todayTrips || 0}`);
    
    if (monthlyData.availableMonths && monthlyData.availableMonths.length > 0) {
      console.log('\n📅 AVAILABLE MONTHS:');
      monthlyData.availableMonths.forEach(month => {
        console.log(`   - ${month.name} (${month.key})`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n📱 The customer stats feature is working correctly!');
    console.log('   - Authentication: ✅');
    console.log('   - Dashboard Stats: ✅');
    console.log('   - Profile Data: ✅');
    console.log('   - Monthly Distance: ✅');
    console.log('\n💡 You can now test in the Flutter app:');
    console.log('   1. Login as customer123@example.com');
    console.log('   2. Navigate to "Activity Report" tab');
    console.log('   3. Verify all data displays correctly');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    console.error('=' .repeat(60));
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message || error.response.data.msg || 'Unknown error'}`);
      console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received from server');
      console.error('Is the backend running on http://localhost:3001?');
    } else {
      console.error('Error:', error.message);
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure backend is running: npm run dev');
    console.error('   2. Check MongoDB connection');
    console.error('   3. Verify customer123 account exists');
    console.error('   4. Check backend logs for errors');
    
    process.exit(1);
  }
}

// Run the test
testCustomerStats();
