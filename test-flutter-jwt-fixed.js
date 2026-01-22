// test-flutter-jwt-fixed.js - Test the fixed Flutter JWT connection
const axios = require('axios');

async function testFixedFlutterJWT() {
  console.log('\n🔐 TESTING FIXED FLUTTER JWT CONNECTION');
  console.log('='.repeat(80));
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test the corrected Flutter request
    console.log('\n📡 Testing corrected Flutter JWT login...');
    
    const loginData = {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    };
    
    console.log('   Request URL:', `${baseURL}/api/auth/login`);
    console.log('   Request Data:', loginData);
    
    const response = await axios.post(`${baseURL}/api/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log('✅ JWT Login successful!');
    console.log('   Status:', response.status);
    console.log('   Success:', response.data.success);
    console.log('   Message:', response.data.message);
    
    if (response.data.data && response.data.data.token) {
      console.log('✅ JWT Token received');
      console.log('   Token length:', response.data.data.token.length);
      console.log('   User ID:', response.data.data.user.id);
      console.log('   User Email:', response.data.data.user.email);
      console.log('   User Role:', response.data.data.user.role);
      console.log('   User Name:', response.data.data.user.name);
      
      // Test token verification
      console.log('\n📡 Testing token verification...');
      const verifyResponse = await axios.get(`${baseURL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${response.data.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Token verification successful!');
      console.log('   Verified User ID:', verifyResponse.data.data.user.userId);
      console.log('   Verified Role:', verifyResponse.data.data.user.role);
      console.log('   Verified Email:', verifyResponse.data.data.user.email);
      
      console.log('\n🎉 FLUTTER JWT AUTHENTICATION IS NOW WORKING!');
      console.log('   ✅ Login endpoint: /api/auth/login');
      console.log('   ✅ Token verification: /api/auth/me');
      console.log('   ✅ JWT token format: Bearer <token>');
      console.log('   ✅ Response format: { success: true, data: { token, user } }');
      
    } else {
      console.log('❌ No token in response');
    }
    
  } catch (error) {
    console.log('❌ Test failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.message);
    
    if (error.response?.data) {
      console.log('   Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
  
  console.log('\n' + '='.repeat(80));
}

// Run the test
testFixedFlutterJWT().catch(console.error);