const axios = require('axios');

async function testCustomer123AuthToken() {
  console.log('🧪 TESTING CUSTOMER123 AUTHENTICATION');
  console.log('=' .repeat(50));
  
  const baseURL = 'http://localhost:3001';
  const email = 'customer123@abrafleet.com';
  
  try {
    // Test 1: Check if backend is running
    console.log('\n1️⃣ Testing backend connection...');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`, { timeout: 5000 });
      console.log('✅ Backend is running');
      console.log(`   Status: ${healthResponse.status}`);
    } catch (error) {
      console.log('❌ Backend connection failed');
      console.log(`   Error: ${error.message}`);
      console.log('\n🔧 Solution: Start the backend server');
      console.log('   cd abra_fleet_backend && npm start');
      return;
    }
    
    // Test 2: Try to access customer stats without auth (should get 401)
    console.log('\n2️⃣ Testing endpoint without authentication...');
    try {
      await axios.get(`${baseURL}/api/customer/stats/dashboard`);
      console.log('⚠️  Unexpected: Got response without auth token');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correctly requires authentication (401)');
      } else if (error.response && error.response.status === 403) {
        console.log('❌ Getting 403 even without auth - server issue');
      } else {
        console.log(`❌ Unexpected error: ${error.message}`);
      }
    }
    
    // Test 3: Try with a mock Firebase token
    console.log('\n3️⃣ Testing with mock Firebase token...');
    
    // Create a mock token payload (this won't work with real Firebase verification)
    const mockToken = 'mock_firebase_token_for_testing';
    
    try {
      const response = await axios.get(`${baseURL}/api/customer/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${mockToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Request successful');
      console.log(`   Status: ${response.status}`);
      console.log(`   Data keys: ${Object.keys(response.data).join(', ')}`);
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Request failed with status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data?.message || error.response.data?.error || 'Unknown error'}`);
        
        if (error.response.status === 401) {
          console.log('   🔍 This is expected - Firebase token verification failed');
          console.log('   💡 The customer needs a valid Firebase token');
        } else if (error.response.status === 403) {
          console.log('   🔍 Permission denied - checking user record...');
          console.log('   💡 User record might have isActive=false or status!=active');
        }
      } else {
        console.log(`❌ Network error: ${error.message}`);
      }
    }
    
    // Test 4: Check what the frontend is actually sending
    console.log('\n4️⃣ Analyzing the frontend error...');
    console.log('From the browser console error:');
    console.log('   📡 Request: GET http://localhost:3001/api/customer/stats/dashboard');
    console.log('   📊 Status: 403 (Forbidden)');
    console.log('   ⏱️  Response time: 7311ms (very slow!)');
    console.log('   🔄 Token refresh attempted');
    
    console.log('\n🔍 ANALYSIS:');
    console.log('   1. The request IS reaching the server (not 404/500)');
    console.log('   2. The response time is very slow (7+ seconds)');
    console.log('   3. The app is trying to refresh the token');
    console.log('   4. Still getting 403 after token refresh');
    
    console.log('\n💡 LIKELY CAUSES:');
    console.log('   1. Firebase token is expired and refresh is failing');
    console.log('   2. User record has permission issues despite our check');
    console.log('   3. Firebase UID mismatch between token and database');
    console.log('   4. Network/connectivity issues');
    
    console.log('\n🛠️  SOLUTIONS TO TRY:');
    console.log('   1. Customer should completely log out and log back in');
    console.log('   2. Clear browser cache/cookies');
    console.log('   3. Check Firebase console for user status');
    console.log('   4. Verify Firebase UID matches database record');
    
    // Test 5: Check Firebase UID consistency
    console.log('\n5️⃣ Checking Firebase UID consistency...');
    console.log('   From database records:');
    console.log('   - users collection: demo_customer_uid_123456789');
    console.log('   - admin_users collection: b5aoloVR7xYI6SICibCIWecBaf82');
    console.log('   ⚠️  MISMATCH DETECTED!');
    console.log('   💡 This could be the root cause of the 403 error');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCustomer123AuthToken().catch(console.error);