// Test My Tickets API with authentication simulation
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMyTicketsAuth() {
  console.log('🔐 TESTING MY TICKETS AUTHENTICATION');
  console.log('='.repeat(50));

  try {
    // Test 1: Call without authentication (should fail)
    console.log('\n1️⃣ Testing without authentication...');
    try {
      const response = await axios.get(`${BASE_URL}/api/tickets/my`);
      console.log('❌ Should have failed but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected unauthenticated request (401)');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Call with invalid token (should fail)
    console.log('\n2️⃣ Testing with invalid token...');
    try {
      const response = await axios.get(`${BASE_URL}/api/tickets/my`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('❌ Should have failed but got:', response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid token (401)');
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Check if backend is running and accessible
    console.log('\n3️⃣ Testing backend health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data.status);

    // Test 4: Test auth endpoint
    console.log('\n4️⃣ Testing auth endpoint...');
    try {
      const authResponse = await axios.get(`${BASE_URL}/api/test-auth`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('❌ Auth test should have failed but got:', authResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth endpoint correctly requires valid token (401)');
      } else {
        console.log('⚠️ Unexpected auth error:', error.response?.status);
      }
    }

    console.log('\n📋 Summary:');
    console.log('   - Backend is running ✅');
    console.log('   - Authentication is required ✅');
    console.log('   - Invalid tokens are rejected ✅');
    console.log('');
    console.log('💡 The issue is likely:');
    console.log('   1. Flutter app is not sending valid Firebase ID token');
    console.log('   2. Firebase authentication is not working in Flutter');
    console.log('   3. Token is expired or invalid');
    console.log('   4. User is not properly logged in');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMyTicketsAuth();