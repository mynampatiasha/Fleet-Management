const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testItemBillingAPI() {
  console.log('🧪 Testing Item Billing API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);

    // Test 2: Get Units (no auth required for utility endpoints)
    console.log('\n2. Testing units endpoint...');
    try {
      const unitsResponse = await axios.get(`${BASE_URL}/units`);
      console.log('✅ Units:', unitsResponse.data);
    } catch (error) {
      console.log('⚠️  Units endpoint requires auth:', error.response?.status);
    }

    // Test 3: Get Vendors (requires auth)
    console.log('\n3. Testing vendors endpoint (requires auth)...');
    try {
      const vendorsResponse = await axios.get(`${BASE_URL}/vendors`);
      console.log('✅ Vendors:', vendorsResponse.data);
    } catch (error) {
      console.log('⚠️  Vendors endpoint requires auth:', error.response?.status);
    }

    // Test 4: Get Items (requires auth)
    console.log('\n4. Testing items endpoint (requires auth)...');
    try {
      const itemsResponse = await axios.get(`${BASE_URL}/items`);
      console.log('✅ Items:', itemsResponse.data);
    } catch (error) {
      console.log('⚠️  Items endpoint requires auth:', error.response?.status);
    }

    console.log('\n✅ Item Billing API is accessible!');
    console.log('📝 Note: Protected endpoints require authentication token');

  } catch (error) {
    console.error('❌ API Test Failed:');
    console.error('   Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   💡 Make sure the backend server is running on port 3001');
      console.error('   💡 Run: cd abra_fleet_backend && npm start');
    }
  }
}

// Run the test
testItemBillingAPI();