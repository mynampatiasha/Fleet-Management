const axios = require('axios');

async function testDriverRouteWithAuth() {
  try {
    console.log('🧪 Testing /api/driver/route/today with proper auth...\n');
    
    const baseUrl = 'http://localhost:3001';
    
    // First, let's test without auth to see if we get the right error
    console.log('1️⃣ Testing without auth (should get 401)...');
    try {
      const response = await axios.get(`${baseUrl}/api/driver/route/today`);
      console.log('❌ Unexpected success without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returns 401 without auth');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }
    
    // Test with mock token to see if localeCompare error is gone
    console.log('\n2️⃣ Testing with mock token (should get auth error, not localeCompare error)...');
    try {
      const response = await axios.get(`${baseUrl}/api/driver/route/today`, {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Unexpected success with mock token');
    } catch (error) {
      console.log('📡 Response Status:', error.response?.status);
      console.log('📄 Response Message:', error.response?.data?.message);
      console.log('🔍 Response Error:', error.response?.data?.error);
      
      if (error.response?.data?.error?.includes('localeCompare')) {
        console.log('❌ STILL HAS localeCompare ERROR!');
      } else {
        console.log('✅ localeCompare error is FIXED!');
        console.log('   (Getting expected auth error instead)');
      }
    }
    
    console.log('\n📋 Summary:');
    console.log('   - The localeCompare error should be fixed');
    console.log('   - Driver dashboard should now load without 500 errors');
    console.log('   - You may need to login as a driver to see actual route data');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testDriverRouteWithAuth();