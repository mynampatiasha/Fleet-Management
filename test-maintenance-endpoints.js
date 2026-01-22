// Test maintenance endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMaintenanceEndpoints() {
  console.log('🔧 ========== TESTING MAINTENANCE ENDPOINTS ==========');
  
  try {
    // Test 1: Get maintenance schedules
    console.log('\n1️⃣ Testing GET /api/maintenance/schedules...');
    try {
      const schedulesResponse = await axios.get(`${BASE_URL}/api/maintenance/schedules`, {
        timeout: 10000
      });
      
      console.log('✅ GET Schedules Status:', schedulesResponse.status);
      console.log('✅ GET Schedules Response:', JSON.stringify(schedulesResponse.data, null, 2));
      
      if (schedulesResponse.data.success) {
        console.log(`📊 Found ${schedulesResponse.data.data?.length || 0} scheduled maintenances`);
      }
    } catch (error) {
      console.log('❌ GET Schedules Error:', error.response?.data || error.message);
    }

    // Test 2: Get maintenance reports
    console.log('\n2️⃣ Testing GET /api/maintenance/reports...');
    try {
      const reportsResponse = await axios.get(`${BASE_URL}/api/maintenance/reports`, {
        timeout: 10000
      });
      
      console.log('✅ GET Reports Status:', reportsResponse.status);
      console.log('✅ GET Reports Response:', JSON.stringify(reportsResponse.data, null, 2));
      
      if (reportsResponse.data.success) {
        console.log(`📊 Found ${reportsResponse.data.data?.length || 0} maintenance reports`);
      }
    } catch (error) {
      console.log('❌ GET Reports Error:', error.response?.data || error.message);
    }

    // Test 3: Get maintenance analytics
    console.log('\n3️⃣ Testing GET /api/maintenance/analytics...');
    try {
      const analyticsResponse = await axios.get(`${BASE_URL}/api/maintenance/analytics?timeframe=30d`, {
        timeout: 10000
      });
      
      console.log('✅ GET Analytics Status:', analyticsResponse.status);
      console.log('✅ GET Analytics Response:', JSON.stringify(analyticsResponse.data, null, 2));
      
      if (analyticsResponse.data.success) {
        console.log('📊 Analytics data retrieved successfully');
      }
    } catch (error) {
      console.log('❌ GET Analytics Error:', error.response?.data || error.message);
    }

    // Test 4: Test schedule maintenance endpoint (without actually scheduling)
    console.log('\n4️⃣ Testing POST /api/maintenance/schedule endpoint structure...');
    try {
      // This will fail validation but shows us the endpoint is accessible
      const scheduleResponse = await axios.post(`${BASE_URL}/api/maintenance/schedule`, {}, {
        timeout: 10000
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Schedule endpoint is accessible (validation error expected)');
        console.log('📝 Validation errors:', error.response.data.errors);
      } else {
        console.log('❌ Schedule endpoint error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎯 ========== MAINTENANCE ENDPOINTS TEST COMPLETE ==========');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testMaintenanceEndpoints();