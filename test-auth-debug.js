// Test script to debug the authentication flow
const admin = require('./abra_fleet_backend/config/firebase');
const axios = require('axios');

async function testAuthDebug() {
  try {
    console.log('🧪 Testing authentication debug...\n');
    
    // Get Firebase token for customer123@abrafleet.com
    const customToken = await admin.auth().createCustomToken('b5aoloVR7xYI6SICibCIWecBaf82');
    console.log('✅ Custom token created for customer');
    
    // Exchange custom token for ID token
    const tokenResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyBQ5F_6J_8VDMbf7b4U_wIk_Z0HdYDRaDo`,
      {
        token: customToken,
        returnSecureToken: true
      }
    );
    
    const idToken = tokenResponse.data.idToken;
    console.log('✅ ID token obtained');
    
    // Decode the token to see what's in it
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log('\n🔍 Decoded token contents:');
    console.log('   UID:', decodedToken.uid);
    console.log('   Email:', decodedToken.email);
    console.log('   Name:', decodedToken.name);
    console.log('   Email verified:', decodedToken.email_verified);
    
    // Test a simple endpoint first to see if auth works
    console.log('\n🔍 Testing a simple endpoint first...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/api/health', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Health endpoint works:', healthResponse.status);
    } catch (healthError) {
      console.log('❌ Health endpoint failed:', healthError.response?.status, healthError.response?.data);
    }
    
    // Now test the my-rosters endpoint
    console.log('\n🔍 Testing /api/roster/customer/my-rosters');
    const response = await axios.get('http://localhost:3001/api/roster/customer/my-rosters', {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Request successful!');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testAuthDebug();