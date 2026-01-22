// Simple test for customer123 tracking
const axios = require('axios');

async function testSimpleTracking() {
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('🔍 Testing backend health and customer123 tracking...\n');
    
    // Test backend health
    const healthResponse = await axios.get(`${baseURL}/api/health`);
    console.log('✅ Backend is healthy:', healthResponse.data);
    
    // Test without auth first to see the error
    const customerId = 'b5aoloVR7xYI6SICibCIWecBaf82';
    
    try {
      const tripResponse = await axios.get(`${baseURL}/api/rosters/active-trip/${customerId}`);
      console.log('✅ Trip response:', tripResponse.data);
    } catch (authError) {
      console.log('🔐 Authentication required (expected)');
      console.log(`   Status: ${authError.response?.status}`);
      console.log(`   Message: ${authError.response?.data?.message}`);
    }
    
    // Test login endpoint
    try {
      console.log('\n🔐 Testing login...');
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
        email: 'customer123@abrafleet.com',
        password: 'customer123'
      });
      console.log('✅ Login response:', loginResponse.data);
    } catch (loginError) {
      console.log('❌ Login failed:');
      console.log(`   Status: ${loginError.response?.status}`);
      console.log(`   Response:`, loginError.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('   Backend server is not running on port 3001');
    }
  }
}

testSimpleTracking();