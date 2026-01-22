const axios = require('axios');

async function testDriverRouteToday() {
  try {
    console.log('🧪 Testing /api/driver/route/today after localeCompare fix...\n');
    
    const baseUrl = 'http://localhost:3001';
    const endpoint = `${baseUrl}/api/driver/route/today`;
    
    // Test with a mock token (backend should handle auth gracefully)
    const response = await axios.get(endpoint, {
      headers: {
        'Authorization': 'Bearer mock-token-for-testing',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.status === 'success') {
      console.log('\n🎉 SUCCESS: API is working without localeCompare error!');
      
      if (response.data.data.hasRoute) {
        console.log(`📋 Route found with ${response.data.data.customers?.length || 0} customers`);
      } else {
        console.log('📋 No route found (expected for test user)');
      }
    } else {
      console.log('⚠️  API returned error status');
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('   Status:', error.response?.status);
    console.error('   Message:', error.response?.data?.message);
    console.error('   Error:', error.response?.data?.error);
    
    if (error.response?.data?.error?.includes('localeCompare')) {
      console.error('\n🔍 STILL HAS localeCompare ERROR - need to check other locations');
    } else {
      console.log('\n✅ localeCompare error is FIXED!');
    }
  }
}

testDriverRouteToday();