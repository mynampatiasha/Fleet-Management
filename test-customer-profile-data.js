const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testCustomerProfile() {
  try {
    console.log('🧪 Testing Customer Profile Data Fetch\n');
    
    // Step 1: Login as customer
    console.log('Step 1: Logging in as customer...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'customer123@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    const userData = loginResponse.data.user;
    
    console.log('✅ Login successful');
    console.log('User ID:', userData.id);
    console.log('User Name:', userData.name);
    console.log('User Email:', userData.email);
    console.log('User Role:', userData.role);
    console.log('Token:', token.substring(0, 20) + '...\n');
    
    // Step 2: Fetch profile data
    console.log('Step 2: Fetching profile data...');
    const profileResponse = await axios.get(`${BASE_URL}/api/customer/stats/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile data fetched successfully\n');
    console.log('📋 Profile Data:');
    console.log(JSON.stringify(profileResponse.data, null, 2));
    
    // Step 3: Check what fields are missing
    console.log('\n🔍 Checking for missing fields:');
    const data = profileResponse.data.data;
    
    const fields = [
      'name', 'email', 'phoneNumber', 'alternativePhone',
      'companyName', 'department', 'employeeId', 'designation',
      'photoUrl', 'role', 'status'
    ];
    
    fields.forEach(field => {
      const value = data[field];
      const status = value ? '✅' : '❌';
      console.log(`${status} ${field}: ${value || 'NOT PROVIDED'}`);
    });
    
    // Step 4: Check database directly
    console.log('\n📊 Checking database directly...');
    const { MongoClient } = require('mongodb');
    const client = new MongoClient('mongodb://localhost:27017');
    
    await client.connect();
    const db = client.db('abra_fleet');
    
    const customer = await db.collection('customers').findOne({
      email: 'customer123@test.com'
    });
    
    console.log('\n📦 Raw database record:');
    console.log(JSON.stringify(customer, null, 2));
    
    await client.close();
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCustomerProfile();
