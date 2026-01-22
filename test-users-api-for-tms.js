// Test script to check /api/users endpoint for TMS raise ticket functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testUsersAPI() {
  console.log('🧪 Testing /api/users endpoint for TMS raise ticket...\n');
  
  try {
    // Test without authentication first
    console.log('1️⃣ Testing without authentication...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users?limit=100`);
      console.log('✅ Response received without auth:', response.status);
      console.log('   Data count:', response.data?.data?.length || 0);
    } catch (error) {
      console.log('❌ Failed without auth:', error.response?.status, error.response?.data?.msg || error.message);
    }
    
    console.log('\n2️⃣ Testing with admin token...');
    
    // Get admin token first
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Admin login successful');
      
      const token = loginResponse.data.token;
      const headers = { Authorization: `Bearer ${token}` };
      
      // Test the users endpoint
      const usersResponse = await axios.get(`${API_BASE_URL}/api/users?limit=100`, { headers });
      
      console.log('✅ Users API Response:');
      console.log('   Status:', usersResponse.status);
      console.log('   Success:', usersResponse.data.success);
      console.log('   Data type:', typeof usersResponse.data.data);
      console.log('   Users count:', usersResponse.data.data?.length || 0);
      
      if (usersResponse.data.data && usersResponse.data.data.length > 0) {
        console.log('\n📋 Sample user data:');
        const sampleUser = usersResponse.data.data[0];
        console.log('   ID:', sampleUser._id);
        console.log('   Name:', sampleUser.name);
        console.log('   Email:', sampleUser.email);
        console.log('   Role:', sampleUser.role);
      } else {
        console.log('\n⚠️ No users found in response');
      }
      
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testUsersAPI();