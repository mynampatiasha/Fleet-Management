const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin Login...\n');
    
    const loginData = {
      email: 'admin@abrafleet.com',
      password: 'Admin123!'
    };
    
    console.log('📧 Email:', loginData.email);
    console.log('🔑 Password:', loginData.password);
    console.log('\n🔄 Sending login request...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', loginData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Login Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Message:', response.data.message);
    console.log('User Role:', response.data.user?.role);
    console.log('User Email:', response.data.user?.email);
    console.log('Token Present:', !!response.data.token);
    
    if (response.data.success) {
      console.log('\n🎉 Admin login successful!');
      
      // Test a protected route
      console.log('\n🧪 Testing protected route...');
      const token = response.data.token;
      
      const protectedResponse = await axios.get('http://localhost:3001/api/admin/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('Protected route status:', protectedResponse.status);
      console.log('Protected route success:', protectedResponse.data.success);
      console.log('Vehicles count:', protectedResponse.data.vehicles?.length || 0);
      
      console.log('\n🎉 All tests passed! Admin permissions are working!');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAdminLogin();