// test-create-employee-user.js
// Test creating a new employee user via the employee management API

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testCreateEmployeeUser() {
  console.log('\n🧪 TESTING CREATE EMPLOYEE USER');
  console.log('='.repeat(80));

  try {
    // Step 1: Login as admin to get JWT token
    console.log('\n📝 Step 1: Login as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }

    const token = loginResponse.data.token || loginResponse.data.data?.token;
    if (!token) {
      console.error('❌ No token in response:', loginResponse.data);
      throw new Error('No token received');
    }
    console.log('✅ Login successful');
    console.log('   Token:', token.substring(0, 50) + '...');

    // Step 2: Create new employee user
    console.log('\n📝 Step 2: Creating new employee user...');
    const newUser = {
      name_parson: 'Test Employee',
      name: 'Test Employee',
      email: `test.employee.${Date.now()}@abrafleet.com`,
      phone: '+91 9876543210',
      pwd: 'password123',
      role: 'fleet_manager',
      permissions: {}
    };

    console.log('   User data:', {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });

    const createResponse = await axios.post(
      `${API_URL}/employee-management/employees`,
      newUser,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ CREATE EMPLOYEE USER SUCCESSFUL');
    console.log('   Response:', JSON.stringify(createResponse.data, null, 2));

    // Step 3: Verify user was created
    console.log('\n📝 Step 3: Fetching all employees...');
    const listResponse = await axios.get(
      `${API_URL}/employee-management/employees`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Employees fetched:', listResponse.data.data.length);
    
    const createdUser = listResponse.data.data.find(u => u.email === newUser.email);
    if (createdUser) {
      console.log('✅ New user found in list:');
      console.log('   ID:', createdUser._id);
      console.log('   Name:', createdUser.name);
      console.log('   Email:', createdUser.email);
      console.log('   Role:', createdUser.role);
      console.log('   Firebase UID:', createdUser.firebaseUid);
    } else {
      console.log('⚠️  New user not found in list');
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('='.repeat(80));
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    
    console.error('='.repeat(80) + '\n');
    process.exit(1);
  }
}

// Run test
testCreateEmployeeUser();
