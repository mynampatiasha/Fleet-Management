// Test login for arjun.nair@wipro.com
const axios = require('axios');

async function testArjunNairLogin() {
  console.log('🧪 Testing login for arjun.nair@wipro.com...\n');

  try {
    const loginData = {
      email: 'arjun.nair@wipro.com',
      password: 'arjun.nair',
      role: 'Customer'
    };

    console.log('📤 Sending login request...');
    console.log(`   Email: ${loginData.email}`);
    console.log(`   Password: ${loginData.password}`);
    console.log(`   Role: ${loginData.role}`);
    console.log('');

    // Test login with backend API
    const response = await axios.post('http://localhost:3001/api/auth/login', loginData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Login successful!');
      console.log(`   User ID: ${response.data.user.uid}`);
      console.log(`   Name: ${response.data.user.name || 'Not set'}`);
      console.log(`   Email: ${response.data.user.email}`);
      console.log(`   Role: ${response.data.user.role}`);
      console.log(`   Company: ${response.data.user.companyName || 'Not set'}`);
      console.log(`   Token: ${response.data.token ? 'Generated' : 'Not generated'}`);
      console.log('');

      console.log('🎉 User can now login to the app with these credentials!');
    } else {
      console.log('❌ Login failed:');
      console.log(`   Message: ${response.data.message || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('❌ Login test failed:');
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || 'Unknown error'}`);
      console.error(`   Data:`, error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Backend server is not running on http://localhost:3001');
      console.error('   Please start the backend server first.');
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

// Run the test
testArjunNairLogin();