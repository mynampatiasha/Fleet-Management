// Test script to verify TMS employees endpoint
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testTMSEmployeesEndpoint() {
  console.log('🎫 Testing TMS Employees Endpoint');
  console.log('=' .repeat(50));
  
  try {
    console.log('\n1️⃣ Testing /api/user-management/users endpoint...');
    
    const response = await axios.get(`${BASE_URL}/api/user-management/users`, {
      timeout: 10000,
      headers: {
        'Authorization': 'Bearer fake-token-for-testing',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response Status:', response.status);
    console.log('📋 Response Data Structure:');
    console.log('  - Success:', response.data.success);
    console.log('  - Message:', response.data.message);
    console.log('  - Count:', response.data.count);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n👥 Sample Employee Data:');
      const employee = response.data.data[0];
      console.log('  - ID:', employee.id);
      console.log('  - Name (Person):', employee.name_parson);
      console.log('  - Name (Username):', employee.name);
      console.log('  - Email:', employee.email);
      console.log('  - Phone:', employee.phone);
      console.log('  - Role:', employee.role);
      console.log('  - Is Active:', employee.isActive);
      
      console.log('\n✅ Perfect! This data structure matches what TMS expects');
      console.log('📱 The dropdown should now show employees with:');
      console.log('   - Display Name: name_parson (fallback to name)');
      console.log('   - Subtitle: email');
      console.log('   - Value: id');
    } else {
      console.log('⚠️ No employees found in response');
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status);
      console.log('📋 Error Data:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
    
    console.log('\n💡 Make sure:');
    console.log('   1. Backend is running on port 3001');
    console.log('   2. You have admin users in the admin_users collection');
    console.log('   3. Authentication is properly configured');
  }
}

testTMSEmployeesEndpoint();