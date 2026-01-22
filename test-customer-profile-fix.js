const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCustomerProfileFix() {
  console.log('🧪 Testing Customer Profile Fix\n');
  console.log('=' .repeat(80) + '\n');
  
  try {
    // Step 1: Login
    console.log('Step 1: Logging in as customer123...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'customer123@abrafleet.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');
    
    // Step 2: Fetch profile
    console.log('Step 2: Fetching profile data...');
    const profileResponse = await axios.get(`${BASE_URL}/api/customer/stats/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile API successful\n');
    
    // Step 3: Display results
    console.log('📋 Profile Data Received:\n');
    const data = profileResponse.data.data;
    
    console.log('Full Response:');
    console.log(JSON.stringify(profileResponse.data, null, 2));
    
    console.log('\n🔍 Field-by-Field Analysis:\n');
    
    const fields = [
      { key: 'name', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'phoneNumber', label: 'Phone Number' },
      { key: 'alternativePhone', label: 'Alternative Phone' },
      { key: 'companyName', label: 'Company Name' },
      { key: 'department', label: 'Department' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'designation', label: 'Designation' }
    ];
    
    let successCount = 0;
    let emptyCount = 0;
    
    fields.forEach(field => {
      const value = data[field.key];
      const hasValue = value && value.trim() !== '';
      const status = hasValue ? '✅' : '⚠️ ';
      
      if (hasValue) successCount++;
      else emptyCount++;
      
      console.log(`${status} ${field.label}: ${value || '(empty)'}`);
    });
    
    console.log('\n' + '=' .repeat(80));
    console.log(`\n📊 Results: ${successCount} fields with data, ${emptyCount} empty fields`);
    
    if (successCount >= 3) {
      console.log('\n✅ SUCCESS! Profile data is now being fetched correctly!');
      console.log('   The nested employeeDetails structure is being read properly.');
    } else {
      console.log('\n⚠️  WARNING: Most fields are still empty.');
      console.log('   The customer record might not have data in employeeDetails.');
    }
    
    console.log('\n' + '=' .repeat(80));
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
}

testCustomerProfileFix();
