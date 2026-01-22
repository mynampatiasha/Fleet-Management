const axios = require('axios');

async function testAuth() {
  try {
    console.log('🌟 Testing authentication endpoint...');
    
    // Test login endpoint
    console.log('\n1. Testing login endpoint...');
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Login response status:', response.status);
    console.log('✅ Login response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.token) {
      const token = response.data.token;
      console.log('\n2. Testing ratings endpoint with token...');
      
      const ratingsResponse = await axios.get('http://localhost:3001/api/admin/drivers/ratings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Ratings response status:', ratingsResponse.status);
      console.log('✅ Ratings response:', JSON.stringify(ratingsResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testAuth();