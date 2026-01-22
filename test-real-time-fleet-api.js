const admin = require('firebase-admin');
const axios = require('axios');

// Test script for Real-time Fleet Dashboard API
console.log('\n🚐 ========== TESTING REAL-TIME FLEET API ==========');
console.log('📅 Timestamp:', new Date().toISOString());

async function testRealTimeFleetAPI() {
  try {
    // Initialize Firebase Admin (if not already initialized)
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: "https://abra-fleet-default-rtdb.firebaseio.com"
      });
    }

    console.log('✅ Firebase Admin initialized');

    // Create a test token for a driver
    const testDriverUid = 'drivertest'; // Use existing test driver
    const customToken = await admin.auth().createCustomToken(testDriverUid);
    console.log('✅ Custom token created for driver:', testDriverUid);

    // Sign in with the custom token to get an ID token
    const signInResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyBqWKKGhOJWZvJvQvQvQvQvQvQvQvQvQvQ`, // Replace with your API key
      {
        token: customToken,
        returnSecureToken: true
      }
    );

    const idToken = signInResponse.data.idToken;
    console.log('✅ ID token obtained');

    // Test the real-time fleet API
    const baseUrl = 'http://localhost:3001'; // Adjust if different
    const apiUrl = `${baseUrl}/api/driver/todays-customers`;

    console.log('\n🔄 Testing API endpoint:', apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📡 API Response:');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));

    if (response.data.status === 'success') {
      const customers = response.data.data?.customers || [];
      console.log('\n📊 Customer Analysis:');
      console.log('   Total customers:', customers.length);
      console.log('   Pickup customers:', customers.filter(c => c.isLogin).length);
      console.log('   Drop customers:', customers.filter(c => !c.isLogin).length);

      if (customers.length > 0) {
        console.log('\n👥 Customer Details:');
        customers.forEach((customer, index) => {
          console.log(`   ${index + 1}. ${customer.customerName}`);
          console.log(`      ID: ${customer.customerId}`);
          console.log(`      Phone: ${customer.customerPhone}`);
          console.log(`      Type: ${customer.isLogin ? 'PICKUP' : 'DROP'}`);
          console.log(`      Distance: ${customer.distanceFromOffice} km`);
          console.log(`      Sequence: ${customer.sequenceNumber}`);
        });
      } else {
        console.log('\n⚠️  No customers found. This could mean:');
        console.log('   1. No rosters assigned for today');
        console.log('   2. Driver not found in database');
        console.log('   3. Date filtering excluded all rosters');
      }
    } else {
      console.log('\n❌ API returned error status');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testRealTimeFleetAPI()
  .then(() => {
    console.log('\n========== TEST COMPLETE ==========\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });