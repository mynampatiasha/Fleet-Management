// Test script to check what users are being returned by the admin API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAdminUsersAPI() {
  try {
    console.log('🔍 Testing Admin Users API...');
    console.log('─'.repeat(80));
    
    // First, let's test without authentication to see the error
    console.log('\n1️⃣ Testing without authentication (should fail):');
    try {
      const response = await axios.get(`${BASE_URL}/api/user-management/users`);
      console.log('❌ Unexpected success - API should require authentication');
      console.log('Response:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication (401)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test with admin credentials
    console.log('\n2️⃣ Testing with admin credentials:');
    console.log('Please login as admin@abrafleet.com first, then run this test');
    console.log('The API endpoint is: GET /api/user-management/users');
    console.log('It should only return users from admin_users collection');
    
    console.log('\n3️⃣ Expected behavior:');
    console.log('✅ Should only show admin roles:');
    console.log('   - super_admin, superadmin, admin');
    console.log('   - org_admin, organization_admin');
    console.log('   - fleet_manager');
    console.log('   - operations, operations_manager');
    console.log('   - hr_manager');
    console.log('   - finance, finance_admin');
    
    console.log('\n❌ Should NOT show:');
    console.log('   - driver');
    console.log('   - customer');
    console.log('   - client');
    
    console.log('\n4️⃣ Database collections:');
    console.log('   - admin_users: Only admin roles');
    console.log('   - drivers: Driver accounts');
    console.log('   - customers: Customer accounts');
    console.log('   - clients: Client accounts');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminUsersAPI();