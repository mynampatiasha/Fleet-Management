// debug-customer-auth-token.js - Debug customer authentication token issue
const axios = require('axios');

console.log('\n🔍 DEBUGGING CUSTOMER AUTH TOKEN ISSUE');
console.log('='.repeat(80));

async function debugCustomerAuth() {
  try {
    console.log('\n1. Testing API endpoint without auth...');
    
    // Test the endpoint directly
    const response = await axios.get('http://localhost:3001/api/customer/stats/dashboard', {
      timeout: 5000,
      validateStatus: function (status) {
        return status < 500; // Don't throw for 4xx errors
      }
    });
    
    console.log('   Status:', response.status);
    console.log('   Response:', response.data);
    
    if (response.status === 401) {
      console.log('\n✅ EXPECTED: 401 Unauthorized - endpoint requires authentication');
    } else if (response.status === 403) {
      console.log('\n❌ UNEXPECTED: 403 Forbidden - this suggests auth token is present but invalid');
    }
    
    console.log('\n2. Testing with test mode header...');
    
    const testResponse = await axios.get('http://localhost:3001/api/customer/stats/dashboard', {
      headers: {
        'x-test-firebase-uid': 'customer123-test-uid'
      },
      timeout: 5000,
      validateStatus: function (status) {
        return status < 500;
      }
    });
    
    console.log('   Test mode status:', testResponse.status);
    console.log('   Test mode response:', JSON.stringify(testResponse.data, null, 2));
    
    if (testResponse.status === 200) {
      console.log('\n✅ SUCCESS: Test mode works - backend is functioning correctly');
      console.log('🔍 DIAGNOSIS: The issue is with Firebase token authentication in Flutter');
      
      console.log('\n🛠️ SOLUTIONS:');
      console.log('1. Check if user is properly logged into Firebase in Flutter app');
      console.log('2. Verify Firebase token is being sent correctly');
      console.log('3. Check if token has expired and needs refresh');
      console.log('4. Ensure API_BASE_URL in Flutter .env matches backend URL');
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔍 DIAGNOSIS: Backend server is not running');
      console.log('🛠️ SOLUTION: Start the backend server with: npm start or node index.js');
    }
  }
}

debugCustomerAuth();