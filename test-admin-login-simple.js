// Simple test to check admin login for TMS
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testAdminLogin() {
  console.log('🧪 Testing admin login for TMS...\n');
  
  const adminCredentials = [
    { email: 'admin@abrafleet.com', password: 'admin123' },
    { email: 'admin@abra.com', password: 'admin123' },
    { email: 'superadmin@abrafleet.com', password: 'admin123' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'admin@admin.com', password: 'admin123' }
  ];
  
  for (const creds of adminCredentials) {
    try {
      console.log(`🔐 Trying login: ${creds.email}`);
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, creds);
      
      if (response.data.token) {
        console.log('✅ Login successful!');
        console.log('   Token received:', response.data.token.substring(0, 20) + '...');
        console.log('   User role:', response.data.user?.role);
        
        // Now test the users endpoint
        const headers = { Authorization: `Bearer ${response.data.token}` };
        
        try {
          const usersResponse = await axios.get(`${API_BASE_URL}/api/users?limit=100`, { headers });
          console.log('✅ Users API Response:');
          console.log('   Status:', usersResponse.status);
          console.log('   Success:', usersResponse.data.success);
          console.log('   Users count:', usersResponse.data.data?.length || 0);
          
          if (usersResponse.data.data && usersResponse.data.data.length > 0) {
            console.log('\n📋 First few users:');
            usersResponse.data.data.slice(0, 3).forEach((user, index) => {
              console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
            });
          }
          
          return; // Success, exit
          
        } catch (apiError) {
          console.log('❌ Users API failed:', apiError.response?.status, apiError.response?.data?.message || apiError.message);
        }
        
      } else {
        console.log('❌ No token in response');
      }
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.status, error.response?.data?.message || error.message);
    }
    
    console.log(''); // Empty line
  }
  
  console.log('❌ All login attempts failed');
}

testAdminLogin();