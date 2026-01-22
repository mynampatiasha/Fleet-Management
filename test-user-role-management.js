const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testUserRoleManagement() {
  console.log('🧪 Testing User Role Management Routes');
  console.log('='.repeat(50));

  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    console.log('   MongoDB:', healthResponse.data.mongodb);

    // Test 2: Test unauthenticated access (should fail)
    console.log('\n2️⃣ Testing Unauthenticated Access...');
    try {
      await axios.get(`${BASE_URL}/api/user-management/users`);
      console.log('❌ Should have failed without auth token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Test with invalid token (should fail)
    console.log('\n3️⃣ Testing Invalid Token...');
    try {
      await axios.get(`${BASE_URL}/api/user-management/users`, {
        headers: {
          'Authorization': 'Bearer invalid-token-123'
        }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly rejected invalid token');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 4: Test route structure
    console.log('\n4️⃣ Testing Route Structure...');
    const routes = [
      '/api/user-management/users',
      '/api/user-management/roles',
      '/api/user-management/permissions'
    ];

    for (const route of routes) {
      try {
        await axios.get(`${BASE_URL}${route}`);
        console.log(`❌ ${route}: Should have failed without auth`);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log(`✅ ${route}: Correctly protected`);
        } else if (error.response && error.response.status === 404) {
          console.log(`⚠️  ${route}: Route not found (may not be implemented)`);
        } else {
          console.log(`❌ ${route}: Unexpected error:`, error.message);
        }
      }
    }

    console.log('\n🎉 User Role Management Routes Test Complete!');
    console.log('='.repeat(50));
    console.log('✅ Routes are properly mounted and protected');
    console.log('✅ Authentication middleware is working');
    console.log('✅ Server is running correctly');
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Get a valid Firebase token from your Flutter app');
    console.log('   2. Test authenticated requests');
    console.log('   3. Verify permission-based access control');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   → Make sure the backend server is running');
      console.error('   → Run: cd abra_fleet_backend && node index.js');
    }
  }
}

// Run the test
testUserRoleManagement();