// Test Arjun Nair authentication flow
const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testArjunNairAuthFlow() {
  console.log('🔍 Testing Arjun Nair Authentication Flow\n');
  
  try {
    // Test 1: Verify email endpoint
    console.log('1️⃣ Testing verify-email endpoint...');
    const verifyResponse = await axios.get(`${API_BASE}/auth/verify-email/arjun.nair@wipro.com`);
    
    console.log('✅ Verify Email Response:');
    console.log('   Status:', verifyResponse.status);
    console.log('   Success:', verifyResponse.data.success);
    console.log('   User Role:', verifyResponse.data.user?.role);
    console.log('   User Name:', verifyResponse.data.user?.name);
    console.log('   User Email:', verifyResponse.data.user?.email);
    console.log('   Firebase UID:', verifyResponse.data.user?.firebaseUid);
    
    if (verifyResponse.data.success) {
      console.log('\n✅ User verification successful! The authentication issue should be resolved.');
      
      // Test 2: Check role mapping
      const userRole = verifyResponse.data.user?.role;
      if (userRole === 'Customer') {
        console.log('✅ Role is correctly set as "Customer"');
      } else {
        console.log(`⚠️  Role is "${userRole}" - may need frontend role mapping update`);
      }
      
    } else {
      console.log('❌ User verification failed:', verifyResponse.data.message);
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:');
      console.log('   Status:', error.response.status);
      console.log('   Message:', error.response.data?.message || error.response.data);
      
      if (error.response.status === 404) {
        console.log('\n🔧 User still not found. Possible issues:');
        console.log('   - Backend server not running');
        console.log('   - MongoDB connection issue');
        console.log('   - User not properly created in database');
      }
    } else {
      console.log('❌ Connection Error:', error.message);
      console.log('\n🔧 Possible issues:');
      console.log('   - Backend server not running on port 3001');
      console.log('   - Network connectivity issue');
    }
  }
}

// Run the test
testArjunNairAuthFlow();