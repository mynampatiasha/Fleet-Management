// test-user-management-integration.js
// Test script to verify User Management integration

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testUserManagementIntegration() {
  console.log('\n🧪 Testing User Management Integration');
  console.log('='.repeat(60));

  try {
    // Step 1: Test fetching users
    console.log('\n1️⃣ Testing fetch users endpoint...');
    const usersResponse = await axios.get(`${BASE_URL}/api/user-management/users`);
    
    if (usersResponse.data.success) {
      console.log('✅ Users fetched successfully');
      console.log('   Total users:', usersResponse.data.data.length);
      if (usersResponse.data.data.length > 0) {
        console.log('   Sample user:', usersResponse.data.data[0].name_parson);
      }
    }

    // Step 2: Test creating a user
    console.log('\n2️⃣ Testing create user endpoint...');
    const testUser = {
      name_parson: 'Test User',
      name: 'testuser',
      email: 'testuser@example.com',
      phone: '1234567890',
      pwd: 'password123'
    };

    const createResponse = await axios.post(`${BASE_URL}/api/user-management/users`, testUser);
    
    if (createResponse.data.success) {
      const userId = createResponse.data.data.id;
      console.log('✅ User created successfully');
      console.log('   User ID:', userId);

      // Step 3: Test fetching user permissions
      console.log('\n3️⃣ Testing fetch user permissions...');
      const permissionsResponse = await axios.get(`${BASE_URL}/api/user-management/users/${userId}/permissions`);
      
      if (permissionsResponse.data.success) {
        console.log('✅ User permissions fetched successfully');
        console.log('   Permissions count:', Object.keys(permissionsResponse.data.data.permissions || {}).length);
      }

      // Step 4: Test updating user permissions
      console.log('\n4️⃣ Testing update user permissions...');
      const updatePermissions = {
        dashboard: { can_access: true, edit_delete: false },
        fleet_management: { can_access: true, edit_delete: true }
      };

      const updateResponse = await axios.put(
        `${BASE_URL}/api/user-management/users/${userId}/permissions`,
        { permissions: updatePermissions }
      );
      
      if (updateResponse.data.success) {
        console.log('✅ User permissions updated successfully');
      }

      // Step 5: Test deleting the user
      console.log('\n5️⃣ Testing delete user...');
      const deleteResponse = await axios.delete(`${BASE_URL}/api/user-management/users/${userId}`);
      
      if (deleteResponse.data.success) {
        console.log('✅ User deleted successfully');
      }
    }

    console.log('\n🎉 All user management tests passed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.log('='.repeat(60));
  }
}

// Run the test
testUserManagementIntegration();