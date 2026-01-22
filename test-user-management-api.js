// Test the user management API to see what users are being returned
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testUserManagementAPI() {
  try {
    console.log('🔍 Testing User Management API...');
    console.log('─'.repeat(80));
    console.log('Base URL:', BASE_URL);
    
    // Test the API endpoint that the frontend is calling
    console.log('\n1️⃣ Testing GET /api/user-management/users');
    console.log('This is the endpoint your Flutter app calls');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/user-management/users`, {
        headers: {
          'Authorization': 'Bearer fake-token-for-testing'
        }
      });
      
      console.log('✅ API Response received');
      console.log('Status:', response.status);
      console.log('Data structure:', typeof response.data);
      
      if (response.data && response.data.data) {
        const users = response.data.data;
        console.log(`Found ${users.length} users:`);
        
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name || 'No name'} (${user.email || 'No email'}) - Role: ${user.role || 'No role'}`);
        });
        
        // Check if any non-admin roles are present
        const nonAdminRoles = ['driver', 'customer', 'client'];
        const nonAdminUsers = users.filter(user => 
          nonAdminRoles.includes(user.role?.toLowerCase())
        );
        
        if (nonAdminUsers.length > 0) {
          console.log('\n❌ PROBLEM FOUND: Non-admin users detected!');
          nonAdminUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role} ← Should not be here!`);
          });
        } else {
          console.log('\n✅ Good: Only admin roles found');
        }
        
      } else {
        console.log('No users data in response');
      }
      
    } catch (error) {
      if (error.response) {
        console.log('❌ API Error:', error.response.status);
        console.log('Error message:', error.response.data);
        
        if (error.response.status === 401) {
          console.log('\n💡 This is expected - API requires authentication');
          console.log('The frontend should be sending a valid Firebase token');
        }
      } else {
        console.log('❌ Network Error:', error.message);
      }
    }
    
    console.log('\n2️⃣ Expected Behavior:');
    console.log('✅ Should only return admin roles:');
    console.log('   - super_admin, superadmin, admin');
    console.log('   - org_admin, organization_admin');
    console.log('   - fleet_manager, operations, hr_manager, finance');
    
    console.log('\n❌ Should NOT return:');
    console.log('   - driver, customer, client');
    
    console.log('\n3️⃣ Solution:');
    console.log('If non-admin users are showing up, the backend needs to:');
    console.log('   1. Query only the admin_users collection');
    console.log('   2. Filter by admin roles only');
    console.log('   3. Exclude driver/customer/client collections');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUserManagementAPI();