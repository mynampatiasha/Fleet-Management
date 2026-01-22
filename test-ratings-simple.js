// Simple test for ratings endpoint
const axios = require('axios');

async function testRatingsSimple() {
  try {
    console.log('🌟 Testing ratings endpoint (no auth)...');
    
    const response = await axios.get('http://localhost:3001/api/admin/drivers/ratings');
    
    console.log('✅ Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testRatingsSimple();