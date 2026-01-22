// test-real-firebase-token-format.js
// Test the actual issue: Flutter uses real Firebase token, not test header

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testRealTokenFormat() {
  console.log('🔍 TESTING REAL FIREBASE TOKEN FORMAT');
  console.log('='.repeat(60));
  
  // From the Flutter logs, this is the actual token being sent
  const actualToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ3VzdG9tZXIiLCJyb2xlIjoiY3VzdG9tZXIiLCJvcmdhbml6YXRpb25OYW1lIjoiQWJyYSBUcmF2ZWxzIERlbW8gT3JnIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2FicmFmbGVldC1jZWM5NCIsImF1ZCI6ImFicmFmbGVldC1jZWM5NCIsImF1dGhfdGltZSI6MTc2ODMwMDc3NiwidXNlcl9pZCI6ImI1YW9sb1ZSN3hZSTZTSUNpYkNJV2VjQmFmODIiLCJzdWIiOiJiNWFvbG9WUjd4WUk2U0lDaWJDSVdlY0JhZjgyIiwiaWF0IjoxNzY4MzAzNzIwLCJleHAiOjE3NjgzMDczMjAsImVtYWlsIjoiY3VzdG9tZXIxMjNAYWJyYWZsZWV0LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJjdXN0b21lcjEyM0BhYnJhZmxlZXQuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.gUbr7HpFo971uZk2dZqytvn1L4_GswLZev9bQprofC0TpWj3dhOcB5365mIRNYW15C5fLo996AOEUxzR4TNwlFTLEa6EVTFqIJLhy8c-Jk4241UKi5fMpmSN21Z6liHgyKg0Llqu2iT71Z3CR68AFoWV4B1_XMrlOIcxOpo0jkePw8GSubncaHfq8ldCDt59oyIxNePqihKBKS5GGCdzxG6evCHrNJVV11cXVq-VQD-chaa1sEt5z5Kam7foiBdKPwHK4K-ODGX4j9_PeJcaxLyETocjonDGtJQ7HcYZ1pNlD5jqqENrcNLqBpzhiOUmwj6-VK88MeZIP1iMZA3fUg';
  
  console.log('Token length:', actualToken.length);
  console.log('Token starts with:', actualToken.substring(0, 50) + '...');
  
  try {
    console.log('\n1️⃣ Testing with REAL Firebase token (like Flutter app)...');
    
    const realTokenResponse = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
      headers: {
        'Authorization': `Bearer ${actualToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Real token response:');
    console.log(`   Status: ${realTokenResponse.status}`);
    console.log(`   Success: ${realTokenResponse.data.success}`);
    console.log(`   Message: ${realTokenResponse.data.message}`);
    console.log(`   Count: ${realTokenResponse.data.count}`);
    console.log(`   Data length: ${realTokenResponse.data.data?.length || 0}`);
    
    if (realTokenResponse.data.data && realTokenResponse.data.data.length > 0) {
      console.log('\n   📋 Rosters with real token:');
      realTokenResponse.data.data.forEach((roster, index) => {
        console.log(`   ${index + 1}. ${roster.rosterType} - ${roster.officeLocation} (${roster.status})`);
      });
    } else {
      console.log('   ❌ No rosters returned with real token - THIS IS THE ISSUE!');
    }
    
  } catch (realTokenError) {
    console.log('❌ Real token failed:');
    console.log(`   Status: ${realTokenError.response?.status}`);
    console.log(`   Message: ${realTokenError.response?.data?.message}`);
    console.log(`   Error: ${realTokenError.message}`);
    
    if (realTokenError.response?.status === 401) {
      console.log('   🔍 Token might be expired or invalid');
    }
  }
  
  console.log('\n2️⃣ Comparing with test header (which works)...');
  
  try {
    const testHeaderResponse = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
      headers: {
        'x-test-firebase-uid': 'b5aoloVR7xYI6SICibCIWecBaf82'
      },
      timeout: 10000
    });
    
    console.log('✅ Test header response:');
    console.log(`   Status: ${testHeaderResponse.status}`);
    console.log(`   Success: ${testHeaderResponse.data.success}`);
    console.log(`   Message: ${testHeaderResponse.data.message}`);
    console.log(`   Count: ${testHeaderResponse.data.count}`);
    console.log(`   Data length: ${testHeaderResponse.data.data?.length || 0}`);
    
  } catch (testError) {
    console.log('❌ Test header failed:');
    console.log(`   Status: ${testError.response?.status}`);
    console.log(`   Message: ${testError.response?.data?.message}`);
  }
  
  console.log('\n3️⃣ Decoding the Firebase token to check user info...');
  
  try {
    // Decode the JWT token (just the payload, not verifying signature)
    const parts = actualToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      console.log('📋 Token payload:');
      console.log(`   User ID: ${payload.user_id}`);
      console.log(`   Email: ${payload.email}`);
      console.log(`   Name: ${payload.name}`);
      console.log(`   Role: ${payload.role}`);
      console.log(`   Organization: ${payload.organizationName}`);
      console.log(`   Issued at: ${new Date(payload.iat * 1000).toISOString()}`);
      console.log(`   Expires at: ${new Date(payload.exp * 1000).toISOString()}`);
      console.log(`   Is expired: ${Date.now() > payload.exp * 1000}`);
      
      if (Date.now() > payload.exp * 1000) {
        console.log('   ❌ TOKEN IS EXPIRED! This is why Flutter gets 0 rosters');
        console.log('   🔧 Solution: Flutter app needs to refresh the token');
      } else {
        console.log('   ✅ Token is still valid');
      }
    }
    
  } catch (decodeError) {
    console.log('❌ Could not decode token:', decodeError.message);
  }
  
  console.log('\n📋 DIAGNOSIS:');
  console.log('='.repeat(60));
  console.log('The issue is likely one of these:');
  console.log('1. 🕒 Firebase token is expired');
  console.log('2. 🔐 Token verification failing in production');
  console.log('3. 👤 User created with test header but not linked to real Firebase UID');
  console.log('4. 🔄 Flutter app needs to refresh token');
  console.log('');
  console.log('🔧 SOLUTIONS:');
  console.log('1. Restart Flutter app to get fresh token');
  console.log('2. Re-login in Flutter app');
  console.log('3. Check Firebase token expiration handling');
  console.log('4. Ensure user is created with correct Firebase UID');
}

// Run the test
testRealTokenFormat().catch(console.error);