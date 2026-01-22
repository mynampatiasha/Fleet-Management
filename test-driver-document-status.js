// test-driver-document-status.js
// Test driver document status through the API

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDriverDocumentStatus() {
  try {
    console.log('🔍 Testing Driver Document Status');
    console.log('='.repeat(60));
    
    // Login as driver
    console.log('\n1. Logging in as drivertest@abrafleet.com...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'drivertest@abrafleet.com',
      password: 'Driver@123'
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id || loginResponse.data.user._id;
    const firebaseUid = loginResponse.data.user.firebaseUid;
    
    console.log('✅ Login successful');
    console.log('   User ID:', userId);
    console.log('   Firebase UID:', firebaseUid);
    console.log('   Token:', token.substring(0, 30) + '...');
    
    // Try to get document status with the user ID from login
    console.log('\n2. Getting document status with user ID from login...');
    try {
      const statusResponse = await axios.get(
        `${BASE_URL}/api/driver-documents/status/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ Status retrieved successfully');
      console.log('   Response:', JSON.stringify(statusResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Failed with user ID:', error.response?.status, error.response?.data?.message);
    }
    
    // Try with Firebase UID
    if (firebaseUid) {
      console.log('\n3. Getting document status with Firebase UID...');
      try {
        const statusResponse = await axios.get(
          `${BASE_URL}/api/driver-documents/status/${firebaseUid}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log('✅ Status retrieved successfully');
        console.log('   Response:', JSON.stringify(statusResponse.data, null, 2));
      } catch (error) {
        console.log('❌ Failed with Firebase UID:', error.response?.status, error.response?.data?.message);
      }
    }
    
    // Try the problematic ID from the error
    console.log('\n4. Testing with the problematic ID from error: 695e5018f9dc949dca499370');
    try {
      const statusResponse = await axios.get(
        `${BASE_URL}/api/driver-documents/status/695e5018f9dc949dca499370`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('✅ Status retrieved successfully');
      console.log('   Response:', JSON.stringify(statusResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Failed with problematic ID:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test complete');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testDriverDocumentStatus();
