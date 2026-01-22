// Debug script to test fleet vehicles authentication
const axios = require('axios');

async function testFleetVehiclesAuth() {
  console.log('\n🔍 DEBUGGING FLEET VEHICLES AUTH ISSUE');
  console.log('='.repeat(80));
  
  try {
    // Test 1: Check if backend is running
    console.log('\n1️⃣ Testing backend health...');
    try {
      const healthResponse = await axios.get('http://localhost:3001/health');
      console.log('✅ Backend is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend health check failed:', error.message);
      return;
    }
    
    // Test 2: Test the endpoint without auth (should get 401)
    console.log('\n2️⃣ Testing endpoint without authentication...');
    try {
      const noAuthResponse = await axios.get('http://localhost:3001/api/admin/fleet/vehicles/live-status');
      console.log('❌ Unexpected success without auth:', noAuthResponse.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly returns 401 without auth');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test 3: Test with invalid token (should get 403)
    console.log('\n3️⃣ Testing endpoint with invalid token...');
    try {
      const invalidTokenResponse = await axios.get('http://localhost:3001/api/admin/fleet/vehicles/live-status', {
        headers: {
          'Authorization': 'Bearer invalid-token-123'
        }
      });
      console.log('❌ Unexpected success with invalid token:', invalidTokenResponse.data);
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('✅ Correctly rejects invalid token:', error.response.status);
        console.log('   Error details:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // Test 4: Check if we can get a valid Firebase token
    console.log('\n4️⃣ Checking Firebase Admin SDK...');
    try {
      const admin = require('./abra_fleet_backend/config/firebase');
      
      // Create a test token for admin@abrafleet.com
      const testUid = 'test-admin-uid-123';
      const customToken = await admin.auth().createCustomToken(testUid, {
        email: 'admin@abrafleet.com',
        role: 'super_admin'
      });
      
      console.log('✅ Firebase Admin SDK working');
      console.log('   Custom token created (length):', customToken.length);
      
      // Test with custom token (this won't work directly as it needs to be exchanged)
      console.log('\n5️⃣ Testing with test mode header...');
      try {
        const testResponse = await axios.get('http://localhost:3001/api/admin/fleet/vehicles/live-status', {
          headers: {
            'x-test-firebase-uid': 'admin-test-uid',
            'Authorization': 'Bearer test-token'
          }
        });
        console.log('✅ Test mode works:', testResponse.data);
      } catch (error) {
        console.log('❌ Test mode failed:', error.response?.status, error.response?.data);
      }
      
    } catch (firebaseError) {
      console.log('❌ Firebase Admin SDK error:', firebaseError.message);
    }
    
    console.log('\n='.repeat(80));
    console.log('🔍 DEBUG COMPLETE');
    
  } catch (error) {
    console.error('❌ Debug script error:', error.message);
  }
}

// Run the test
testFleetVehiclesAuth();