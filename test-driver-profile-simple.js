// Simple test to check driver profile API with proper error handling
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testDriverProfile() {
  try {
    console.log('🔍 Testing driver profile API...');
    console.log('─'.repeat(80));
    
    // Test with a known driver email - you'll need to replace this
    const testCredentials = [
      { email: 'rajesh.kumar@abrafleet.com', password: 'password123' },
      { email: 'drivertest@abrafleet.com', password: 'password123' },
      { email: 'driver@test.com', password: 'password123' },
      { email: 'test.driver@abrafleet.com', password: 'password123' }
    ];
    
    for (const creds of testCredentials) {
      console.log(`\n📝 Attempting login with: ${creds.email}`);
      
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, creds);
        
        if (loginResponse.data.success && loginResponse.data.data.token) {
          const token = loginResponse.data.data.token;
          console.log('✅ Login successful!');
          console.log('   Token received:', token.substring(0, 50) + '...');
          console.log('   User data:', JSON.stringify(loginResponse.data.data.user, null, 2));
          
          // Now test the profile endpoint
          console.log('\n📋 Testing profile endpoint...');
          const profileResponse = await axios.get(`${API_BASE_URL}/api/drivers/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Profile response received!');
          console.log('   Success:', profileResponse.data.success);
          console.log('   Profile data:', JSON.stringify(profileResponse.data.data, null, 2));
          
          // Test successful - exit
          return;
          
        } else {
          console.log('❌ Login failed:', loginResponse.data.message);
        }
        
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('❌ Invalid credentials for', creds.email);
        } else {
          console.log('❌ Login error:', error.response?.data?.message || error.message);
        }
      }
    }
    
    console.log('\n❌ No valid driver credentials found. Please check:');
    console.log('   1. MongoDB is running');
    console.log('   2. Backend server is running on port 3001');
    console.log('   3. Driver accounts exist in admin_users collection');
    console.log('   4. Driver records exist in drivers collection');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDriverProfile();