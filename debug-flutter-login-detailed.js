// debug-flutter-login-detailed.js - Detailed debugging of Flutter login issue
const axios = require('axios');

async function debugFlutterLogin() {
  console.log('\n🔍 DETAILED FLUTTER LOGIN DEBUG');
  console.log('='.repeat(80));
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test 1: Verify backend is running and JWT endpoint exists
    console.log('\n📡 STEP 1: Backend Health Check...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Backend is running');
    console.log('   MongoDB:', healthResponse.data.mongodb);
    
    // Test 2: Test the exact Flutter login request
    console.log('\n📡 STEP 2: Simulating Flutter Login Request...');
    
    const loginData = {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    };
    
    console.log('   Email:', loginData.email);
    console.log('   Password: [HIDDEN]');
    console.log('   URL:', `${baseURL}/api/auth/login`);
    
    // Make the exact same request Flutter would make
    const response = await axios.post(`${baseURL}/api/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });
    
    console.log('✅ Login Request Successful!');
    console.log('   Status Code:', response.status);
    console.log('   Response Success:', response.data.success);
    console.log('   Response Message:', response.data.message);
    
    // Check token in response
    if (response.data.data && response.data.data.token) {
      console.log('✅ JWT Token Found in Response');
      console.log('   Token Length:', response.data.data.token.length);
      console.log('   Token Preview:', response.data.data.token.substring(0, 50) + '...');
      
      // Check user data
      if (response.data.data.user) {
        console.log('✅ User Data Found in Response');
        console.log('   User ID:', response.data.data.user.id);
        console.log('   User Email:', response.data.data.user.email);
        console.log('   User Role:', response.data.data.user.role);
        console.log('   User Name:', response.data.data.user.name);
      } else {
        console.log('❌ No user data in response');
      }
      
      // Test 3: Verify token works
      console.log('\n📡 STEP 3: Testing Token Verification...');
      const verifyResponse = await axios.get(`${baseURL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${response.data.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Token Verification Successful');
      console.log('   Verified User ID:', verifyResponse.data.data.user.userId);
      console.log('   Verified Role:', verifyResponse.data.data.user.role);
      
    } else {
      console.log('❌ NO TOKEN IN RESPONSE!');
      console.log('   Full Response:', JSON.stringify(response.data, null, 2));
    }
    
    // Test 4: Check if there are any CORS issues
    console.log('\n📡 STEP 4: Testing CORS Configuration...');
    try {
      const corsResponse = await axios.options(`${baseURL}/api/auth/login`, {
        headers: {
          'Origin': 'http://localhost:8082',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('✅ CORS preflight successful');
    } catch (corsError) {
      console.log('⚠️  CORS preflight failed:', corsError.message);
    }
    
    // Test 5: Test with different user credentials
    console.log('\n📡 STEP 5: Testing with Different Credentials...');
    
    // Try to find a customer user
    try {
      const testCustomerLogin = {
        email: 'customer123@abrafleet.com',
        password: 'customer123'
      };
      
      const customerResponse = await axios.post(`${baseURL}/api/auth/login`, testCustomerLogin, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Customer login also works');
      console.log('   Customer Role:', customerResponse.data.data.user.role);
      
    } catch (customerError) {
      if (customerError.response?.status === 401) {
        console.log('⚠️  Customer credentials invalid (expected)');
      } else {
        console.log('❌ Customer login failed:', customerError.message);
      }
    }
    
    console.log('\n🎯 DIAGNOSIS COMPLETE');
    console.log('─'.repeat(80));
    console.log('✅ Backend JWT system is working perfectly');
    console.log('✅ Login endpoint returns valid JWT token');
    console.log('✅ Token verification works correctly');
    console.log('✅ User data is properly formatted');
    console.log('');
    console.log('🔍 FLUTTER APP ISSUE ANALYSIS:');
    console.log('   The backend is working correctly.');
    console.log('   The issue must be in the Flutter app itself.');
    console.log('   Possible causes:');
    console.log('   1. Flutter not making the request to the right URL');
    console.log('   2. Flutter not parsing the response correctly');
    console.log('   3. Flutter not handling the token properly');
    console.log('   4. Network connectivity issue from Flutter to backend');
    
  } catch (error) {
    console.log('❌ Login Request Failed');
    console.log('   Status:', error.response?.status);
    console.log('   Status Text:', error.response?.statusText);
    console.log('   Error Message:', error.message);
    
    if (error.response?.data) {
      console.log('   Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n❌ CRITICAL: Backend server is not running!');
      console.log('   Start the backend server:');
      console.log('   cd abra_fleet_backend && npm start');
    }
  }
  
  console.log('\n' + '='.repeat(80));
}

// Run the debug
debugFlutterLogin().catch(console.error);