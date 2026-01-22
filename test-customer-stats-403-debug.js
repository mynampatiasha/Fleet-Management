// test-customer-stats-403-debug.js
// Debug the 403 error on customer stats routes

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testCustomerStatsRoutes() {
  console.log('🔍 DEBUGGING CUSTOMER STATS 403 ERROR');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Check if backend is running
    console.log('\n1️⃣ Testing backend health...');
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/health`);
      console.log('✅ Backend is running:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Backend not running:', error.message);
      return;
    }

    // Test 2: Test auth endpoint (should work)
    console.log('\n2️⃣ Testing auth endpoint (control test)...');
    try {
      const authResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': 'customer123-test-uid'
        },
        timeout: 5000
      });
      console.log('✅ Auth endpoint works:', authResponse.status);
      console.log('   User:', authResponse.data.user?.email);
    } catch (error) {
      console.log('❌ Auth endpoint failed:', error.response?.status, error.response?.data?.message);
    }

    // Test 3: Test customer stats without auth (should get 401)
    console.log('\n3️⃣ Testing customer stats without auth...');
    try {
      const noAuthResponse = await axios.get(`${BACKEND_URL}/api/customer/stats/dashboard`, {
        timeout: 5000
      });
      console.log('⚠️ Unexpected: Got response without auth:', noAuthResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without auth: 401');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.message);
      }
    }

    // Test 4: Test customer stats with test auth (should work)
    console.log('\n4️⃣ Testing customer stats with test auth...');
    try {
      const statsResponse = await axios.get(`${BACKEND_URL}/api/customer/stats/dashboard`, {
        headers: {
          'x-test-firebase-uid': 'customer123-test-uid'
        },
        timeout: 10000
      });
      console.log('✅ Customer stats works:', statsResponse.status);
      console.log('   Data keys:', Object.keys(statsResponse.data.data || {}));
    } catch (error) {
      console.log('❌ Customer stats failed:', error.response?.status);
      console.log('   Error message:', error.response?.data?.message);
      console.log('   Error details:', error.response?.data?.error);
      
      // Log the full response for debugging
      if (error.response?.data) {
        console.log('   Full response:', JSON.stringify(error.response.data, null, 2));
      }
    }

    // Test 5: Test different customer stats endpoints
    console.log('\n5️⃣ Testing other customer stats endpoints...');
    const endpoints = [
      '/api/customer/stats/trips',
      '/api/customer/stats/monthly-distance',
      '/api/customer/stats/distance'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
          headers: {
            'x-test-firebase-uid': 'customer123-test-uid'
          },
          timeout: 5000
        });
        console.log(`   ✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        console.log(`   ❌ ${endpoint}: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }

    // Test 6: Check route matching
    console.log('\n6️⃣ Testing route matching patterns...');
    const testPaths = [
      '/api/customer/stats/dashboard',
      '/api/customer/stats',
      '/api/customer',
      '/api/auth/profile'
    ];

    for (const path of testPaths) {
      try {
        const response = await axios.get(`${BACKEND_URL}${path}`, {
          headers: {
            'x-test-firebase-uid': 'customer123-test-uid'
          },
          timeout: 5000,
          validateStatus: () => true // Accept any status
        });
        console.log(`   ${path}: ${response.status} - ${response.data?.message || 'OK'}`);
      } catch (error) {
        console.log(`   ${path}: ERROR - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCustomerStatsRoutes().catch(console.error);