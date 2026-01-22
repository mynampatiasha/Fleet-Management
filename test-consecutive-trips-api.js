// Test consecutive trips API endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testConsecutiveTripsAPI() {
  console.log('🧪 Testing Consecutive Trips API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test 2: Test consecutive trips endpoint (without auth for now)
    console.log('\n2. Testing consecutive trips endpoint...');
    const vehicleId = 'VH234567'; // Sample vehicle ID
    
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/fleet/vehicle/${vehicleId}/consecutive-trips`);
      console.log('✅ Consecutive trips endpoint response:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️  Consecutive trips endpoint requires authentication (expected)');
        console.log('   Status:', error.response.status);
        console.log('   Message:', error.response.data?.message || 'Unauthorized');
      } else {
        console.log('❌ Consecutive trips endpoint error:', error.message);
        if (error.response) {
          console.log('   Status:', error.response.status);
          console.log('   Data:', error.response.data);
        }
      }
    }

    // Test 3: Test WebSocket endpoint info
    console.log('\n3. WebSocket endpoint should be available at:');
    console.log('   ws://localhost:3001');
    
    console.log('\n✅ API tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Server is not running on port 3000');
      console.error('   Please start the backend server first');
    }
  }
}

// Run the test
testConsecutiveTripsAPI();