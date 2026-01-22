// Test script to verify tickets endpoints are working correctly
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
  console.log('🎫 Testing Tickets API Endpoints');
  console.log('='.repeat(50));

  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing backend health...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data.status);

    // Test 2: Test /api/tickets/closed endpoint (should work)
    console.log('\n2️⃣ Testing /api/tickets/closed endpoint...');
    try {
      const closedResponse = await axios.get(`${BASE_URL}/api/tickets/closed`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ /api/tickets/closed endpoint exists');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ /api/tickets/closed endpoint exists (requires auth)');
      } else if (error.response?.status === 404) {
        console.log('❌ /api/tickets/closed endpoint NOT FOUND');
      } else {
        console.log('⚠️ /api/tickets/closed endpoint error:', error.response?.status);
      }
    }

    // Test 3: Test /api/tickets/stats endpoint (should work)
    console.log('\n3️⃣ Testing /api/tickets/stats endpoint...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/tickets/stats`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ /api/tickets/stats endpoint exists');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ /api/tickets/stats endpoint exists (requires auth)');
      } else if (error.response?.status === 404) {
        console.log('❌ /api/tickets/stats endpoint NOT FOUND');
      } else {
        console.log('⚠️ /api/tickets/stats endpoint error:', error.response?.status);
      }
    }

    // Test 4: Test /api/tickets with query params (should fail with 404)
    console.log('\n4️⃣ Testing /api/tickets?status=closed (should fail)...');
    try {
      const badResponse = await axios.get(`${BASE_URL}/api/tickets?status=closed`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('❌ /api/tickets?status=closed should NOT work but it did');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ /api/tickets?status=closed correctly returns 404');
      } else {
        console.log('⚠️ /api/tickets?status=closed error:', error.response?.status);
      }
    }

    // Test 5: Test /api/tickets/count (should fail with 404)
    console.log('\n5️⃣ Testing /api/tickets/count (should fail)...');
    try {
      const countResponse = await axios.get(`${BASE_URL}/api/tickets/count`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('❌ /api/tickets/count should NOT work but it did');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ /api/tickets/count correctly returns 404');
      } else {
        console.log('⚠️ /api/tickets/count error:', error.response?.status);
      }
    }

    console.log('\n✅ Endpoint testing completed!');
    console.log('🎯 The Flutter app should now work correctly with:');
    console.log('   - /api/tickets/closed for closed tickets');
    console.log('   - /api/tickets/stats for ticket statistics');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEndpoints();