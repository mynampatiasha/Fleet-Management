// Test the ratings endpoint directly to see if it exists
const axios = require('axios');

async function testRatingsEndpoint() {
  try {
    console.log('🌟 Testing ratings endpoint directly...');
    
    // Test 1: Check if endpoint exists (should get 401 or 403, not 404)
    console.log('\n1. Testing endpoint existence...');
    try {
      const response = await axios.get('http://localhost:3001/api/admin/drivers/ratings');
      console.log('✅ Unexpected success:', response.status);
    } catch (error) {
      if (error.response) {
        console.log(`📊 Response Status: ${error.response.status}`);
        console.log(`📊 Response Message: ${error.response.data?.message || 'No message'}`);
        
        if (error.response.status === 404) {
          console.log('❌ Endpoint not found - route may not be registered');
        } else if (error.response.status === 401) {
          console.log('✅ Endpoint exists but requires authentication');
        } else if (error.response.status === 403) {
          console.log('✅ Endpoint exists but requires permissions');
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
    // Test 2: Check if the drivers endpoint works (should be similar auth)
    console.log('\n2. Testing drivers endpoint for comparison...');
    try {
      const response = await axios.get('http://localhost:3001/api/admin/drivers');
      console.log('✅ Drivers endpoint success:', response.status);
    } catch (error) {
      if (error.response) {
        console.log(`📊 Drivers endpoint status: ${error.response.status}`);
        console.log(`📊 Drivers endpoint message: ${error.response.data?.message || 'No message'}`);
      }
    }
    
    // Test 3: Check backend health
    console.log('\n3. Testing backend health...');
    try {
      const response = await axios.get('http://localhost:3001/api/health');
      console.log('✅ Backend health:', response.status, response.data?.message);
    } catch (error) {
      console.log('⚠️ Health endpoint not available');
    }
    
    console.log('\n🔍 Analysis:');
    console.log('- If ratings endpoint returns 404: Route not registered properly');
    console.log('- If ratings endpoint returns 401/403: Authentication issue (expected)');
    console.log('- If drivers endpoint has same status: Consistent auth behavior');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRatingsEndpoint();