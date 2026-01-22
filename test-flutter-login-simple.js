const axios = require('axios');

async function testLogin() {
  console.log('\n🔐 TESTING FLUTTER LOGIN FLOW');
  console.log('================================================================================\n');
  
  try {
    // Test 1: Direct login to /api/auth/login
    console.log('📡 Test 1: POST /api/auth/login');
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });
    
    console.log('✅ Response received');
    console.log('   Status:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Has token:', !!response.data.data?.token);
    console.log('   Token length:', response.data.data?.token?.length || 0);
    console.log('\n   Full response structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
  
  console.log('\n================================================================================\n');
}

testLogin();
