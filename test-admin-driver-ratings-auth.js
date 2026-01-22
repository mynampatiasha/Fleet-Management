const axios = require('axios');

async function testDriverRatingsAuth() {
  try {
    console.log('🌟 Testing driver ratings endpoint with admin authentication...');
    
    // First, login as admin to get a valid token
    console.log('\n1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token;
      
      // Test the ratings endpoint with the token
      console.log('\n2. Testing ratings endpoint with admin token...');
      const ratingsResponse = await axios.get('http://localhost:3001/api/admin/drivers/ratings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Ratings endpoint response status:', ratingsResponse.status);
      console.log('✅ Ratings data:', JSON.stringify(ratingsResponse.data, null, 2));
      
    } else {
      console.log('❌ Admin login failed:', loginResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing ratings endpoint:', error.response?.status, error.response?.data || error.message);
  }
}

testDriverRatingsAuth();