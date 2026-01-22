// Test script to verify the assign-batch endpoint fix
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = require('./abra_fleet_backend/abrafleet-cec94-firebase-adminsdk-hnk8s-ea0d4c9c7e.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://abrafleet-cec94-default-rtdb.firebaseio.com"
  });
}

async function testAssignBatch() {
  try {
    console.log('🧪 Testing assign-batch endpoint...');
    
    // Get a fresh Firebase token
    const customToken = await admin.auth().createCustomToken('qnwp8d0clDSSNuSm3ugmXYLSI3K2', {
      role: 'admin'
    });
    
    const idToken = await admin.auth().verifyIdToken(customToken);
    console.log('✅ Got admin token');
    
    // Test data - using the same data from the error logs
    const testData = {
      vehicleId: '694a7cddc1882931f34d491f', // VH234588 - KA18FG5678 with Rajesh Kumar
      rosterIds: [
        '694a8a867dad313c6ad8b976', // Priya Sharma
        '694a8a867dad313c6ad8b97d', // Ravi Desai
        '694a8a867dad313c6ad8b97c'  // Naveen Menon
      ],
      routeDetails: {
        optimized: true,
        totalDistance: 15.2,
        estimatedTime: 45
      }
    };
    
    console.log('📦 Test data:', JSON.stringify(testData, null, 2));
    
    // Make the API call
    const response = await fetch('http://localhost:3001/api/roster/admin/assign-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customToken}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📡 Response status:', response.status);
    
    const result = await response.json();
    console.log('📋 Response:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ SUCCESS: assign-batch endpoint is working!');
    } else {
      console.log('❌ FAILED: assign-batch endpoint returned error');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAssignBatch();