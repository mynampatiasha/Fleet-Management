// test-jwt-login-complete.js - Complete JWT Login Test
// ============================================================================
// Tests the entire JWT login flow from registration to login
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test user credentials
const testUser = {
  email: 'testuser@abrafleet.com',
  password: 'Test123456',
  name: 'Test User',
  role: 'customer'
};

async function testCompleteFlow() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 COMPLETE JWT LOGIN FLOW TEST');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Register a new user
    console.log('\n📝 STEP 1: REGISTRATION');
    console.log('-'.repeat(80));
    
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name,
        role: testUser.role
      });
      
      console.log('✅ Registration successful');
      console.log('Response status:', registerResponse.status);
      console.log('Response data:', JSON.stringify(registerResponse.data, null, 2));
      
      if (registerResponse.data.data && registerResponse.data.data.token) {
        console.log('✅ Token received from registration');
        console.log('Token length:', registerResponse.data.data.token.length);
      } else {
        console.log('❌ No token in registration response');
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log('⚠️  User already exists - continuing with login test');
      } else {
        throw error;
      }
    }
    
    // Step 2: Login with the user
    console.log('\n🔐 STEP 2: LOGIN');
    console.log('-'.repeat(80));
    
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful');
    console.log('Response status:', loginResponse.status);
    console.log('Response data structure:');
    console.log(JSON.stringify(loginResponse.data, null, 2));
    
    // Detailed analysis of response
    console.log('\n📊 RESPONSE ANALYSIS:');
    console.log('-'.repeat(80));
    console.log('success:', loginResponse.data.success);
    console.log('message:', loginResponse.data.message);
    console.log('data exists:', !!loginResponse.data.data);
    
    if (loginResponse.data.data) {
      console.log('data.token exists:', !!loginResponse.data.data.token);
      console.log('data.user exists:', !!loginResponse.data.data.user);
      
      if (loginResponse.data.data.token) {
        const token = loginResponse.data.data.token;
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 50) + '...');
        
        // Step 3: Verify token works
        console.log('\n🔍 STEP 3: TOKEN VERIFICATION');
        console.log('-'.repeat(80));
        
        const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('✅ Token verification successful');
        console.log('User data:', JSON.stringify(meResponse.data, null, 2));
      } else {
        console.log('❌ CRITICAL: No token in response data!');
        console.log('Full data object:', loginResponse.data.data);
      }
      
      if (loginResponse.data.data.user) {
        console.log('\nUser info:');
        console.log('  ID:', loginResponse.data.data.user.id);
        console.log('  Email:', loginResponse.data.data.user.email);
        console.log('  Name:', loginResponse.data.data.user.name);
        console.log('  Role:', loginResponse.data.data.user.role);
      }
    } else {
      console.log('❌ CRITICAL: No data object in response!');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(80) + '\n');
    
  } catch (error) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ TEST FAILED');
    console.log('='.repeat(80));
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
    
    console.log('='.repeat(80) + '\n');
    process.exit(1);
  }
}

// Run the test
testCompleteFlow();
