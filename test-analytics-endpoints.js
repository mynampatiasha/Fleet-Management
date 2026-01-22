// Test the analytics endpoints that were returning 404
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAnalyticsEndpoints() {
  try {
    console.log('🔍 Testing Analytics Endpoints...\n');

    // Test 1: Company Analytics
    console.log('1️⃣ Testing Company Analytics...');
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/analytics/company-analytics?filter=today&company=all`);
      console.log('✅ Company Analytics Status:', response.status);
      console.log('   Success:', response.data.success);
    } catch (error) {
      console.log('❌ Company Analytics Error:', error.response?.status || error.message);
    }

    // Test 2: Manpower Stats
    console.log('\n2️⃣ Testing Manpower Stats...');
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/analytics/manpower-stats`);
      console.log('✅ Manpower Stats Status:', response.status);
      console.log('   Success:', response.data.success);
    } catch (error) {
      console.log('❌ Manpower Stats Error:', error.response?.status || error.message);
    }

    // Test 3: Revenue Stats
    console.log('\n3️⃣ Testing Revenue Stats...');
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/analytics/revenue-stats?filter=today`);
      console.log('✅ Revenue Stats Status:', response.status);
      console.log('   Success:', response.data.success);
    } catch (error) {
      console.log('❌ Revenue Stats Error:', error.response?.status || error.message);
    }

    // Test 4: Active Trips
    console.log('\n4️⃣ Testing Active Trips...');
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/analytics/trips/active`);
      console.log('✅ Active Trips Status:', response.status);
      console.log('   Success:', response.data.success);
    } catch (error) {
      console.log('❌ Active Trips Error:', error.response?.status || error.message);
    }

    // Test 5: Completed Trips Today
    console.log('\n5️⃣ Testing Completed Trips Today...');
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/analytics/trips/completed-today`);
      console.log('✅ Completed Trips Status:', response.status);
      console.log('   Success:', response.data.success);
    } catch (error) {
      console.log('❌ Completed Trips Error:', error.response?.status || error.message);
    }

    // Test 6: Driver Ratings
    console.log('\n6️⃣ Testing Driver Ratings...');
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/drivers/ratings`);
      console.log('✅ Driver Ratings Status:', response.status);
      console.log('   Success:', response.data.success);
    } catch (error) {
      console.log('❌ Driver Ratings Error:', error.response?.status || error.message);
    }

    console.log('\n🎯 Summary:');
    console.log('If all endpoints return 401/403: Authentication required (expected)');
    console.log('If endpoints return 404: Route not found (needs fixing)');
    console.log('If endpoints return 200: Working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAnalyticsEndpoints();