// test-employee-management.js
// Test the new employee management endpoints

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// You'll need to replace this with a valid Firebase token
const TEST_TOKEN = 'your-firebase-token-here';

async function testEmployeeEndpoints() {
  console.log('\n🧪 TESTING EMPLOYEE MANAGEMENT ENDPOINTS');
  console.log('═'.repeat(80));

  const headers = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Get all employees
    console.log('\n1️⃣  Testing GET /api/employee-management/employees');
    console.log('─'.repeat(50));
    
    try {
      const response = await axios.get(`${BASE_URL}/api/employee-management/employees`, { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Found employees:', response.data.data?.length || 0);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('✅ Sample employee:', {
          name: response.data.data[0].name_parson,
          email: response.data.data[0].email,
          role: response.data.data[0].role
        });
      }
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 2: Create new employee (commented out to avoid creating test data)
    console.log('\n2️⃣  Testing POST /api/employee-management/employees (SKIPPED)');
    console.log('─'.repeat(50));
    console.log('ℹ️  Skipping create test to avoid creating test data');
    console.log('   Uncomment the code below to test employee creation');

    /*
    const newEmployee = {
      name_parson: 'Test Employee',
      name: 'testemployee',
      email: 'test@abrafleet.com',
      phone: '+1234567890',
      pwd: 'password123',
      role: 'employee',
      permissions: {
        dashboard: { can_access: true, edit_delete: false }
      }
    };

    try {
      const response = await axios.post(`${BASE_URL}/api/employee-management/employees`, newEmployee, { headers });
      console.log('✅ Status:', response.status);
      console.log('✅ Created employee:', response.data.data?.user?.email);
    } catch (error) {
      console.log('❌ Error:', error.response?.status, error.response?.data?.message || error.message);
    }
    */

    // Test 3: Test authentication check
    console.log('\n3️⃣  Testing Authentication');
    console.log('─'.repeat(50));
    
    try {
      const response = await axios.get(`${BASE_URL}/api/test-auth`, { headers });
      console.log('✅ Auth Status:', response.status);
      console.log('✅ User role:', response.data.user?.role);
      console.log('✅ User collection:', response.data.user?.userCollection || 'not specified');
    } catch (error) {
      console.log('❌ Auth Error:', error.response?.status, error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n═'.repeat(80));
  console.log('🧪 TESTING COMPLETE');
  console.log('═'.repeat(80));
  console.log('\n📝 NOTES:');
  console.log('• Replace TEST_TOKEN with a valid Firebase token to test properly');
  console.log('• Start your backend server: npm start');
  console.log('• Check server logs for detailed request/response info');
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Server is running:', response.data.message);
    return true;
  } catch (error) {
    console.log('❌ Server not running. Please start with: npm start');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testEmployeeEndpoints();
  }
}

main().catch(console.error);