const axios = require('axios');

async function testDriverRatingsFix() {
  try {
    console.log('🌟 Testing driver ratings fix...');
    console.log('='.repeat(60));
    
    // Test 1: Verify endpoint exists
    console.log('\n1️⃣ Testing endpoint availability...');
    try {
      await axios.get('http://localhost:3001/api/admin/drivers/ratings');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint exists and requires authentication (expected)');
      } else if (error.response?.status === 404) {
        console.log('❌ Endpoint not found - this is the issue!');
        return;
      } else {
        console.log('⚠️ Unexpected response:', error.response?.status);
      }
    }
    
    // Test 2: Check backend health
    console.log('\n2️⃣ Testing backend health...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/health');
      console.log('✅ Backend is healthy:', healthResponse.data.status);
    } catch (error) {
      console.log('⚠️ Backend health check failed');
    }
    
    // Test 3: Check other admin endpoints
    console.log('\n3️⃣ Testing other admin endpoints...');
    try {
      await axios.get('http://localhost:3001/api/admin/drivers');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Admin drivers endpoint exists and requires auth');
      } else {
        console.log('❌ Admin drivers endpoint issue:', error.response?.status);
      }
    }
    
    // Test 4: Test with mock authentication
    console.log('\n4️⃣ Testing with mock authentication...');
    try {
      const response = await axios.get('http://localhost:3001/api/admin/drivers/ratings', {
        headers: {
          'Authorization': 'Bearer mock-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Got response with mock token:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Mock token rejected (expected)');
      } else if (error.response?.status === 404) {
        console.log('❌ Still getting 404 - routing issue');
      } else {
        console.log('⚠️ Unexpected response with mock token:', error.response?.status);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS:');
    console.log('   - If all tests show 401: Authentication issue (fixable)');
    console.log('   - If any test shows 404: Route registration issue (backend problem)');
    console.log('   - Frontend fix: Added better auth checking and error handling');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDriverRatingsFix();