// Test assign-group endpoint directly
const axios = require('axios');

async function testAssignGroup() {
  try {
    console.log('🧪 Testing POST /api/assignment/assign-group...');
    
    const response = await axios.post('http://localhost:3001/api/assignment/assign-group', {
      rosterIds: ['test-roster-1', 'test-roster-2'],
      vehicleId: 'test-vehicle-1'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Response:', response.status, response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testAssignGroup();