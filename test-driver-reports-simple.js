const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Simple test without authentication first
async function testDriverReportsSimple() {
  console.log('🔍 Testing Driver Reports API (Simple)...\n');

  // Test without auth to see what error we get
  try {
    const response = await axios.get(`${BASE_URL}/api/driver/reports/performance-summary`, {
      timeout: 5000
    });
    console.log('✅ Performance Summary (no auth):', response.data);
  } catch (error) {
    console.log('❌ Performance Summary Error (expected):', error.response?.status, error.response?.data?.message || error.message);
  }

  // Test with a fake token to see if the endpoint exists
  try {
    const response = await axios.get(`${BASE_URL}/api/driver/reports/performance-summary`, {
      headers: {
        'Authorization': 'Bearer fake-token'
      },
      timeout: 5000
    });
    console.log('✅ Performance Summary (fake token):', response.data);
  } catch (error) {
    console.log('❌ Performance Summary Error (fake token):', error.response?.status, error.response?.data?.message || error.message);
  }

  // Test if backend is reachable at all
  try {
    const response = await axios.get(`${BASE_URL}/api/health`, {
      timeout: 5000
    });
    console.log('✅ Backend health check:', response.data);
  } catch (error) {
    console.log('❌ Backend health check error:', error.message);
  }
}

testDriverReportsSimple();