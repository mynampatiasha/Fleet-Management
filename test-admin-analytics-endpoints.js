// Test Admin Analytics Endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test credentials - replace with actual admin credentials
const TEST_ADMIN = {
  email: 'admin@abrafleet.com',
  password: 'admin123'
};

async function testAnalyticsEndpoints() {
  try {
    console.log('🔐 Step 1: Logging in as admin...\n');
    
    // Login to get JWT token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, TEST_ADMIN);
    
    if (!loginResponse.data.token) {
      console.log('❌ Login failed - no token received');
      console.log('   Response:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log(`   User: ${loginResponse.data.user?.email || 'Unknown'}\n`);
    
    // Configure axios with auth header
    const authHeaders = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('📊 Step 2: Testing Analytics Endpoints...\n');
    console.log('='.repeat(80));
    
    // Test 1: Manpower Stats
    console.log('\n1️⃣ Testing Manpower Stats...');
    try {
      const manpowerResponse = await axios.get(
        `${BASE_URL}/api/admin/analytics/manpower-stats`,
        authHeaders
      );
      console.log('✅ Manpower Stats - SUCCESS');
      console.log('   Status:', manpowerResponse.status);
      console.log('   Data:', JSON.stringify(manpowerResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Manpower Stats - FAILED');
      console.log('   Error:', error.response?.data || error.message);
    }
    
    // Test 2: Revenue Stats (Today)
    console.log('\n2️⃣ Testing Revenue Stats (Today)...');
    try {
      const revenueResponse = await axios.get(
        `${BASE_URL}/api/admin/analytics/revenue-stats?filter=today`,
        authHeaders
      );
      console.log('✅ Revenue Stats - SUCCESS');
      console.log('   Status:', revenueResponse.status);
      console.log('   Data:', JSON.stringify(revenueResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Revenue Stats - FAILED');
      console.log('   Error:', error.response?.data || error.message);
    }
    
    // Test 3: Company Stats
    console.log('\n3️⃣ Testing Company Stats...');
    try {
      const companyResponse = await axios.get(
        `${BASE_URL}/api/admin/analytics/company-stats`,
        authHeaders
      );
      console.log('✅ Company Stats - SUCCESS');
      console.log('   Status:', companyResponse.status);
      console.log('   Data:', JSON.stringify(companyResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Company Stats - FAILED');
      console.log('   Error:', error.response?.data || error.message);
    }
    
    // Test 4: Recent Activities
    console.log('\n4️⃣ Testing Recent Activities...');
    try {
      const activitiesResponse = await axios.get(
        `${BASE_URL}/api/admin/recent-activities`,
        authHeaders
      );
      console.log('✅ Recent Activities - SUCCESS');
      console.log('   Status:', activitiesResponse.status);
      console.log('   Activities Count:', activitiesResponse.data.activities?.length || 0);
    } catch (error) {
      console.log('❌ Recent Activities - FAILED');
      console.log('   Error:', error.response?.data || error.message);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Analytics Endpoints Test Complete!\n');
    
  } catch (error) {
    console.log('\n❌ Test Failed!');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔴 Backend server is NOT RUNNING!');
      console.log('   Please start the backend server:');
      console.log('   > start-backend.bat\n');
    } else if (error.response?.status === 401) {
      console.log('\n🔴 Authentication Failed!');
      console.log('   Please check admin credentials in this script');
      console.log('   Current credentials:', TEST_ADMIN);
    } else {
      console.log('   Error:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
  }
}

// Run the test
console.log('🧪 Admin Analytics Endpoints Test\n');
testAnalyticsEndpoints();
