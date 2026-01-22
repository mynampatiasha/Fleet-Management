// Test script to verify driver profile data flow
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDriverProfileFlow() {
  console.log('🔍 Testing Driver Profile Data Flow');
  console.log('=' * 50);
  
  try {
    // Step 1: Login as a driver to get JWT token
    console.log('Step 1: Logging in as driver...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'rajesh.kumar@abrafleet.com', // Use a known driver email
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Login successful');
    console.log('   - User ID:', user.id);
    console.log('   - Email:', user.email);
    console.log('   - Role:', user.role);
    console.log('   - Token length:', token.length);
    
    // Step 2: Test the driver profile endpoint
    console.log('\nStep 2: Fetching driver profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/drivers/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!profileResponse.data.success) {
      throw new Error('Profile fetch failed: ' + profileResponse.data.message);
    }
    
    const profileData = profileResponse.data.data;
    
    console.log('✅ Profile fetch successful');
    console.log('   - Driver ID:', profileData.driverId);
    console.log('   - Name:', profileData.name);
    console.log('   - Email:', profileData.email);
    console.log('   - Phone:', profileData.phoneNumber);
    console.log('   - Personal Info:', JSON.stringify(profileData.personalInfo, null, 2));
    console.log('   - License:', JSON.stringify(profileData.license, null, 2));
    console.log('   - Assigned Vehicle:', JSON.stringify(profileData.assignedVehicle, null, 2));
    
    // Step 3: Test the driver documents endpoint
    console.log('\nStep 3: Fetching driver documents...');
    try {
      const documentsResponse = await axios.get(`${BASE_URL}/api/driver-documents/status/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Documents fetch successful');
      console.log('   - Documents status:', JSON.stringify(documentsResponse.data.data, null, 2));
    } catch (docError) {
      console.log('⚠️ Documents fetch failed:', docError.response?.data?.message || docError.message);
    }
    
    console.log('\n🎉 Driver profile data flow test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testDriverProfileFlow();