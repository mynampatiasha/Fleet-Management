const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test driver reports API endpoints
async function testDriverReportsAPI() {
  try {
    console.log('🔍 Testing Driver Reports API...\n');

    // Test 1: Performance Summary
    console.log('1. Testing Performance Summary...');
    try {
      const perfResponse = await axios.get(`${BASE_URL}/api/driver/reports/performance-summary`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Performance Summary:', perfResponse.data);
    } catch (error) {
      console.log('❌ Performance Summary Error:', error.response?.data || error.message);
    }

    console.log('\n');

    // Test 2: Daily Analytics
    console.log('2. Testing Daily Analytics...');
    try {
      const dailyResponse = await axios.get(`${BASE_URL}/api/driver/reports/daily-analytics`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Daily Analytics:', dailyResponse.data);
    } catch (error) {
      console.log('❌ Daily Analytics Error:', error.response?.data || error.message);
    }

    console.log('\n');

    // Test 3: Trips
    console.log('3. Testing Trips...');
    try {
      const tripsResponse = await axios.get(`${BASE_URL}/api/driver/reports/trips`, {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });
      console.log('✅ Trips:', tripsResponse.data);
    } catch (error) {
      console.log('❌ Trips Error:', error.response?.data || error.message);
    }

    console.log('\n');

    // Test 4: Generate Report
    console.log('4. Testing Generate Report...');
    try {
      const generateResponse = await axios.post(`${BASE_URL}/api/driver/reports/generate`, {
        type: 'daily'
      }, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Generate Report:', generateResponse.data);
    } catch (error) {
      console.log('❌ Generate Report Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Check if backend is running
async function checkBackendStatus() {
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Backend is running');
    return true;
  } catch (error) {
    try {
      // Try a different endpoint
      const response2 = await axios.get(`${BASE_URL}/api/notifications`);
      console.log('✅ Backend is running (notifications endpoint)');
      return true;
    } catch (error2) {
      console.log('❌ Backend is not running. Please start the backend first.');
      console.log('Error:', error.message);
      return false;
    }
  }
}

async function main() {
  const isBackendRunning = await checkBackendStatus();
  if (isBackendRunning) {
    await testDriverReportsAPI();
  }
}

main();