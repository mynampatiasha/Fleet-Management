// test-employee-update-permissions.js
// Test updating employee details and permissions

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testEmployeeUpdateAndPermissions() {
  console.log('\n🧪 TESTING EMPLOYEE UPDATE & PERMISSIONS');
  console.log('='.repeat(80));

  try {
    // Step 1: Login as admin
    console.log('\n📝 Step 1: Login as admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token || loginResponse.data.data?.token;
    if (!token) {
      throw new Error('No token received');
    }
    console.log('✅ Login successful');

    // Step 2: Get list of employees
    console.log('\n📝 Step 2: Fetching employees...');
    const listResponse = await axios.get(
      `${API_URL}/employee-management/employees`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const employees = listResponse.data.data;
    console.log(`✅ Found ${employees.length} employees`);

    if (employees.length === 0) {
      console.log('⚠️  No employees to test with');
      return;
    }

    // Pick the first non-admin employee
    const testEmployee = employees.find(e => e.role !== 'super_admin') || employees[0];
    console.log(`\n📝 Testing with employee: ${testEmployee.name} (${testEmployee.email})`);
    console.log(`   ID: ${testEmployee._id}`);
    console.log(`   Role: ${testEmployee.role}`);

    // Step 3: Update employee details (without password)
    console.log('\n📝 Step 3: Updating employee details...');
    const updateDetailsResponse = await axios.put(
      `${API_URL}/employee-management/employees/${testEmployee._id}`,
      {
        name_parson: testEmployee.name_parson,
        name: testEmployee.name,
        phone: testEmployee.phone || '+91 9876543210',
        isActive: true
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ UPDATE EMPLOYEE DETAILS SUCCESSFUL');
    console.log('   Response:', updateDetailsResponse.data.message);

    // Step 4: Update employee permissions
    console.log('\n📝 Step 4: Updating employee permissions...');
    const updatePermissionsResponse = await axios.put(
      `${API_URL}/employee-management/employees/${testEmployee._id}/permissions`,
      {
        permissions: {
          dashboard: {
            can_access: true,
            edit_delete: false
          },
          fleet_vehicles: {
            can_access: true,
            edit_delete: true
          },
          customer_management: {
            can_access: true,
            edit_delete: false
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ UPDATE PERMISSIONS SUCCESSFUL');
    console.log('   Response:', updatePermissionsResponse.data.message);

    // Step 5: Verify the updates
    console.log('\n📝 Step 5: Verifying updates...');
    const verifyResponse = await axios.get(
      `${API_URL}/employee-management/employees/${testEmployee._id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const updatedEmployee = verifyResponse.data.data.user;
    console.log('✅ Employee data verified:');
    console.log('   Name:', updatedEmployee.name_parson);
    console.log('   Email:', updatedEmployee.email);
    console.log('   Phone:', updatedEmployee.phone);
    console.log('   Active:', updatedEmployee.isActive);
    console.log('   Permissions:', Object.keys(updatedEmployee.permissions || {}).length, 'items');

    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL TESTS PASSED SUCCESSFULLY');
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
testEmployeeUpdateAndPermissions();
