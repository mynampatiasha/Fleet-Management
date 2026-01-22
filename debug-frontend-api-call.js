// Debug the exact API call the frontend is making
const axios = require('axios');

async function debugFrontendApiCall() {
  try {
    console.log('🔍 Debugging frontend API call...');
    
    // Test the exact URL the frontend should be calling
    const baseUrl = 'http://localhost:3001';
    const fullUrl = `${baseUrl}/api/admin/drivers/ratings`;
    
    console.log(`\n📍 Testing URL: ${fullUrl}`);
    
    // Test with different scenarios
    const tests = [
      {
        name: 'No auth headers',
        headers: {}
      },
      {
        name: 'With Content-Type only',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      {
        name: 'With fake auth token',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake-token'
        }
      }
    ];
    
    for (const test of tests) {
      console.log(`\n🧪 Test: ${test.name}`);
      try {
        const response = await axios.get(fullUrl, { headers: test.headers });
        console.log(`✅ Success: ${response.status}`);
        console.log(`📊 Data:`, response.data);
      } catch (error) {
        if (error.response) {
          console.log(`📊 Status: ${error.response.status}`);
          console.log(`📊 Message: ${error.response.data?.message || 'No message'}`);
          console.log(`📊 Error Code: ${error.response.data?.code || 'No code'}`);
          
          // Check if it's really a 404 or something else
          if (error.response.status === 404) {
            console.log('❌ TRUE 404 - Endpoint not found');
          } else if (error.response.status === 401) {
            console.log('✅ 401 - Authentication required (expected)');
          } else {
            console.log(`⚠️ Unexpected status: ${error.response.status}`);
          }
        } else {
          console.log(`❌ Network error: ${error.message}`);
        }
      }
    }
    
    // Test if the route is actually registered
    console.log('\n🔍 Testing route registration...');
    try {
      const response = await axios.get(`${baseUrl}/api/admin/drivers`);
      console.log('✅ Main drivers route works');
    } catch (error) {
      if (error.response) {
        console.log(`📊 Main drivers route status: ${error.response.status}`);
        if (error.response.status === 401) {
          console.log('✅ Main drivers route exists (401 auth required)');
        } else if (error.response.status === 404) {
          console.log('❌ Main drivers route not found - routing issue');
        }
      }
    }
    
    console.log('\n💡 Diagnosis:');
    console.log('- If ratings returns 404 but drivers returns 401: ratings route not defined');
    console.log('- If both return 401: authentication issue (normal)');
    console.log('- If both return 404: routing/server issue');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugFrontendApiCall();