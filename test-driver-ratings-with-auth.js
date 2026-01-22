// Test script for driver ratings endpoint with authentication
const axios = require('axios');

async function testDriverRatingsWithAuth() {
  try {
    console.log('🌟 Testing driver ratings endpoint with authentication...');
    
    // First, let's try to login as admin to get a token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Admin login successful');
      
      // Now test the ratings endpoint with the token
      const response = await axios.get('http://localhost:3001/api/admin/drivers/ratings', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Response Status:', response.status);
      console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        const summary = response.data.data.summary;
        console.log('\n📈 Summary:');
        console.log(`   Total Drivers: ${summary.totalDrivers}`);
        console.log(`   Active Drivers: ${summary.activeDrivers}`);
        console.log(`   Drivers with Ratings: ${summary.driversWithRatings}`);
        console.log(`   Average Rating: ${summary.averageRating}`);
        console.log(`   Total Ratings Given: ${summary.totalRatingsGiven}`);
        
        const drivers = response.data.data.drivers;
        const ratedDrivers = drivers.filter(d => d.totalRatings > 0);
        
        if (ratedDrivers.length > 0) {
          console.log('\n⭐ Top Rated Drivers:');
          ratedDrivers
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 5)
            .forEach((driver, index) => {
              console.log(`   ${index + 1}. ${driver.driverName}: ${driver.averageRating.toFixed(1)} (${driver.totalRatings} ratings)`);
            });
        } else {
          console.log('\n⚠️ No drivers have ratings yet');
          console.log('💡 To test with sample data, you can create some trips with ratings');
        }
      }
    } else {
      console.error('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('❌ Error testing ratings endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testDriverRatingsWithAuth();