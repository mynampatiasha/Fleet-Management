// Debug the customer roster API issue
const axios = require('axios');

async function debugCustomerRosterIssue() {
  try {
    console.log('🔍 Debugging customer roster API issue...');
    
    const baseUrl = 'http://localhost:3001';
    
    // Test the exact endpoint that's failing
    const rosterUrl = `${baseUrl}/api/roster/customer/my-rosters`;
    
    console.log(`\n📍 Testing URL: ${rosterUrl}`);
    
    // Test without auth first
    console.log('\n🧪 Test 1: No authentication');
    try {
      const response = await axios.get(rosterUrl);
      console.log(`✅ Success: ${response.status}`);
      console.log(`📊 Data:`, response.data);
    } catch (error) {
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📊 Message: ${error.response.data?.message || 'No message'}`);
        console.log(`📊 Full Error:`, error.response.data);
      } else {
        console.log(`❌ Network error: ${error.message}`);
      }
    }
    
    // Test with fake auth token
    console.log('\n🧪 Test 2: With fake auth token');
    try {
      const response = await axios.get(rosterUrl, {
        headers: {
          'Authorization': 'Bearer fake-token',
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ Success: ${response.status}`);
    } catch (error) {
      if (error.response) {
        console.log(`📊 Status: ${error.response.status}`);
        console.log(`📊 Message: ${error.response.data?.message || 'No message'}`);
        console.log(`📊 Full Error:`, error.response.data);
      }
    }
    
    // Check if the route exists at all
    console.log('\n🔍 Checking if roster routes are registered...');
    
    const testRoutes = [
      '/api/roster',
      '/api/roster/customer',
      '/api/roster/customer/my-rosters'
    ];
    
    for (const route of testRoutes) {
      const fullUrl = `${baseUrl}${route}`;
      console.log(`\n📍 Testing: ${fullUrl}`);
      
      try {
        const response = await axios.get(fullUrl);
        console.log(`✅ ${route}: ${response.status}`);
      } catch (error) {
        if (error.response) {
          console.log(`📊 ${route}: ${error.response.status} - ${error.response.data?.message || 'No message'}`);
          
          if (error.response.status === 404) {
            console.log(`❌ Route not found: ${route}`);
          } else if (error.response.status === 401) {
            console.log(`✅ Route exists but requires auth: ${route}`);
          } else {
            console.log(`⚠️ Route exists with status: ${error.response.status}`);
          }
        } else {
          console.log(`❌ Network error for ${route}: ${error.message}`);
        }
      }
    }
    
    console.log('\n💡 Next steps:');
    console.log('1. Check if roster router is properly registered in backend');
    console.log('2. Check if customer routes are defined in roster router');
    console.log('3. Check if user exists in database');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugCustomerRosterIssue();