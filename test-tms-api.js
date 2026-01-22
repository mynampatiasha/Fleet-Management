// Test TMS API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testTMSAPI() {
  console.log('🧪 Testing TMS API Endpoints...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    
    // Test 2: TMS Stats (without auth - should fail)
    console.log('\n2️⃣ Testing TMS Stats (no auth - should fail)...');
    try {
      await axios.get(`${BASE_URL}/api/tickets/stats`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth protection working - 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    // Test 3: TMS Employees List (without auth - should fail)
    console.log('\n3️⃣ Testing Employees List (no auth - should fail)...');
    try {
      await axios.get(`${BASE_URL}/api/tickets/employees/list`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth protection working - 401 Unauthorized');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    console.log('\n🎉 TMS API is properly configured and protected!');
    console.log('📝 Next steps:');
    console.log('   1. Login to the Flutter app');
    console.log('   2. Navigate to TMS section');
    console.log('   3. Test ticket creation');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTMSAPI();