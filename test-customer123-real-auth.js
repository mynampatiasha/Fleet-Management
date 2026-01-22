// test-customer123-real-auth.js
// Test customer123 with their real Firebase UID

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testCustomer123RealAuth() {
  console.log('🔍 TESTING CUSTOMER123 WITH REAL FIREBASE UID');
  console.log('='.repeat(60));
  
  try {
    // First, let's check what Firebase UID customer123 has in the database
    console.log('\n1️⃣ Checking customer123 in database...');
    
    // Test with the Firebase UID we know customer123 should have
    const customer123Uid = 'customer123-firebase-uid'; // This should be their actual UID
    
    console.log('   Using Firebase UID:', customer123Uid);
    
    // Test 1: Auth profile
    console.log('\n2️⃣ Testing auth profile...');
    try {
      const authResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': customer123Uid
        },
        timeout: 5000
      });
      console.log('✅ Auth profile works:', authResponse.status);
      console.log('   User:', authResponse.data.user?.email);
      console.log('   Role:', authResponse.data.user?.role);
      console.log('   Collection:', authResponse.data.user?.collectionName);
    } catch (error) {
      console.log('❌ Auth profile failed:', error.response?.status, error.response?.data?.message);
    }

    // Test 2: Customer stats dashboard
    console.log('\n3️⃣ Testing customer stats dashboard...');
    try {
      const statsResponse = await axios.get(`${BACKEND_URL}/api/customer/stats/dashboard`, {
        headers: {
          'x-test-firebase-uid': customer123Uid
        },
        timeout: 10000
      });
      console.log('✅ Customer stats works:', statsResponse.status);
      console.log('   Total trips:', statsResponse.data.data?.totalTrips?.total);
      console.log('   Recent trip:', statsResponse.data.data?.recentTrip ? 'Available' : 'None');
    } catch (error) {
      console.log('❌ Customer stats failed:', error.response?.status);
      console.log('   Error:', error.response?.data?.message);
      console.log('   Details:', error.response?.data?.error);
    }

    // Test 3: My rosters
    console.log('\n4️⃣ Testing my rosters...');
    try {
      const rostersResponse = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
        headers: {
          'x-test-firebase-uid': customer123Uid
        },
        timeout: 5000
      });
      console.log('✅ My rosters works:', rostersResponse.status);
      console.log('   Rosters count:', rostersResponse.data.data?.length || 0);
    } catch (error) {
      console.log('❌ My rosters failed:', error.response?.status);
      console.log('   Error:', error.response?.data?.message);
    }

    // Test 4: Try with different UIDs to see which one works
    console.log('\n5️⃣ Testing different Firebase UIDs...');
    const testUids = [
      'customer123-firebase-uid',
      'customer123-test-uid', 
      'customer123',
      'test-customer-123'
    ];

    for (const uid of testUids) {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
          headers: {
            'x-test-firebase-uid': uid
          },
          timeout: 3000
        });
        console.log(`   ✅ ${uid}: Found user ${response.data.user?.email} (${response.data.user?.role})`);
      } catch (error) {
        console.log(`   ❌ ${uid}: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCustomer123RealAuth().catch(console.error);