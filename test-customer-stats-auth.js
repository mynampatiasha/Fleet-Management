// Test script to debug the 403 error on customer stats endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCustomerStatsAuth() {
  console.log('🔍 Testing Customer Stats Authentication');
  console.log('=' * 60);
  
  try {
    // Test 1: Check if backend is running
    console.log('\n1. Testing backend health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Backend is running:', healthResponse.status);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }

    // Test 2: Test the endpoint without authentication
    console.log('\n2. Testing endpoint without auth...');
    try {
      const noAuthResponse = await axios.get(`${BASE_URL}/api/customer/stats/monthly-distance`);
      console.log('❌ Unexpected: Endpoint allowed access without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returns 401 without auth');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }

    // Test 3: Test with invalid token
    console.log('\n3. Testing with invalid token...');
    try {
      const invalidTokenResponse = await axios.get(`${BASE_URL}/api/customer/stats/monthly-distance`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('❌ Unexpected: Endpoint allowed access with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returns 401 with invalid token');
      } else if (error.response?.status === 403) {
        console.log('⚠️  Returns 403 with invalid token (should be 401)');
        console.log('Response:', error.response?.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.message);
      }
    }

    // Test 4: Test with test mode header (if in development)
    console.log('\n4. Testing with test mode header...');
    try {
      const testModeResponse = await axios.get(`${BASE_URL}/api/customer/stats/monthly-distance`, {
        headers: {
          'x-test-firebase-uid': 'test-customer-123'
        }
      });
      console.log('✅ Test mode works:', testModeResponse.status);
      console.log('Response data keys:', Object.keys(testModeResponse.data));
    } catch (error) {
      console.log('❌ Test mode failed:', error.response?.status, error.response?.data?.message);
    }

    // Test 5: Check if there are any CORS issues
    console.log('\n5. Testing CORS...');
    try {
      const corsResponse = await axios.options(`${BASE_URL}/api/customer/stats/monthly-distance`);
      console.log('✅ CORS preflight works:', corsResponse.status);
    } catch (error) {
      console.log('⚠️  CORS preflight failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCustomerStatsAuth();