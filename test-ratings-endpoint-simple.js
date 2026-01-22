const axios = require('axios');

async function testRatingsEndpoint() {
  try {
    console.log('🌟 Testing ratings endpoint without auth...');
    
    const response = await axios.get('http://localhost:3001/api/admin/drivers/ratings');
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', response.data);
    
  } catch (error) {
    console.log('📊 Response status:', error.response?.status);
    console.log('📊 Response data:', error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('✅ Endpoint exists but requires authentication (expected)');
    } else if (error.response?.status === 404) {
      console.log('❌ Endpoint not found - routing issue');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

testRatingsEndpoint();