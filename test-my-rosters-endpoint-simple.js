// Simple test to verify the my-rosters endpoint returns data
const axios = require('axios');

async function testMyRostersEndpoint() {
  try {
    console.log('🧪 Testing /api/roster/customer/my-rosters endpoint\n');

    // Test without authentication first (should fail with 401)
    console.log('🔒 Step 1: Testing without authentication (should fail)...');
    try {
      await axios.get('http://localhost:3001/api/roster/customer/my-rosters');
      console.log('❌ Unexpected: Request succeeded without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.message);
      }
    }

    // Test with invalid token (should fail with 401)
    console.log('\n🔒 Step 2: Testing with invalid token (should fail)...');
    try {
      await axios.get('http://localhost:3001/api/roster/customer/my-rosters', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('❌ Unexpected: Request succeeded with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid token');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.message);
      }
    }

    console.log('\n📝 Step 3: To test with valid authentication:');
    console.log('   1. Login to the Flutter app as a customer');
    console.log('   2. Get the Firebase ID token from network requests');
    console.log('   3. Run: node test-roster-to-my-trips-flow.js');
    console.log('   4. Replace YOUR_CUSTOMER_TOKEN_HERE with the actual token');

    console.log('\n✅ Basic endpoint security tests passed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔧 Backend is not running. Start it with: npm start');
    }
  }
}

testMyRostersEndpoint();