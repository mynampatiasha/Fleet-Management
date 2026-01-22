// Test script to verify the 500 error fix in roster deletion
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRosterDeleteFix() {
  console.log('🔧 Testing Roster Delete 500 Error Fix...\n');

  try {
    // Test 1: Invalid roster ID format (should return 400, not 500)
    console.log('1️⃣ Testing invalid roster ID format...');
    
    try {
      const response = await axios.delete(`${BASE_URL}/api/roster/customer/invalid-id-format`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1IiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXVkIjoiYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXV0aF90aW1lIjoxNzM2NTI5NjAwLCJ1c2VyX2lkIjoidGVzdC11c2VyLTEyMyIsInN1YiI6InRlc3QtdXNlci0xMjMiLCJpYXQiOjE3MzY1Mjk2MDAsImV4cCI6MTczNjUzMzIwMCwiZW1haWwiOiJjdXN0b21lcjEyM0BleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImN1c3RvbWVyMTIzQGV4YW1wbGUuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.test-signature'
        },
        timeout: 5000
      });
      
      console.log('❌ Unexpected success with invalid ID:', response.data);
      
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      console.log(`   Status: ${status}`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      
      if (status === 400) {
        console.log('✅ GOOD: Invalid ID now returns 400 (Bad Request) instead of 500');
      } else if (status === 401) {
        console.log('ℹ️  Expected: 401 (Unauthorized) - token validation working');
      } else if (status === 500) {
        console.log('❌ BAD: Still getting 500 error - fix not working');
      } else {
        console.log(`ℹ️  Got status ${status} - check if this is expected`);
      }
    }

    console.log('\n2️⃣ Testing valid ObjectId format but non-existent roster...');
    
    try {
      const response = await axios.delete(`${BASE_URL}/api/roster/customer/507f1f77bcf86cd799439011`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1IiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXVkIjoiYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXV0aF90aW1lIjoxNzM2NTI5NjAwLCJ1c2VyX2lkIjoidGVzdC11c2VyLTEyMyIsInN1YiI6InRlc3QtdXNlci0xMjMiLCJpYXQiOjE3MzY1Mjk2MDAsImV4cCI6MTczNjUzMzIwMCwiZW1haWwiOiJjdXN0b21lcjEyM0BleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImN1c3RvbWVyMTIzQGV4YW1wbGUuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.test-signature'
        },
        timeout: 5000
      });
      
      console.log('❌ Unexpected success with non-existent roster:', response.data);
      
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      console.log(`   Status: ${status}`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      
      if (status === 404) {
        console.log('✅ GOOD: Non-existent roster returns 404 (Not Found)');
      } else if (status === 401) {
        console.log('ℹ️  Expected: 401 (Unauthorized) - token validation working');
      } else if (status === 500) {
        console.log('❌ BAD: Still getting 500 error - fix not working');
      } else {
        console.log(`ℹ️  Got status ${status} - check if this is expected`);
      }
    }

    console.log('\n3️⃣ Testing the original roster ID that caused the 500 error...');
    
    try {
      const response = await axios.delete(`${BASE_URL}/api/roster/customer/694ce9909ceaf59f79334344`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1IiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXVkIjoiYWJyYS1mbGVldC1tYW5hZ2VtZW50IiwiYXV0aF90aW1lIjoxNzM2NTI5NjAwLCJ1c2VyX2lkIjoidGVzdC11c2VyLTEyMyIsInN1YiI6InRlc3QtdXNlci0xMjMiLCJpYXQiOjE3MzY1Mjk2MDAsImV4cCI6MTczNjUzMzIwMCwiZW1haWwiOiJjdXN0b21lcjEyM0BleGFtcGxlLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImN1c3RvbWVyMTIzQGV4YW1wbGUuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.test-signature'
        },
        timeout: 5000
      });
      
      console.log('❌ Unexpected success with original roster ID:', response.data);
      
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      console.log(`   Status: ${status}`);
      console.log(`   Response:`, JSON.stringify(data, null, 2));
      
      if (status === 404 || status === 403) {
        console.log('✅ GOOD: Original roster ID now returns proper error (404/403) instead of 500');
      } else if (status === 401) {
        console.log('ℹ️  Expected: 401 (Unauthorized) - token validation working');
      } else if (status === 500) {
        console.log('❌ BAD: Still getting 500 error - fix not working');
        console.log('   Error details:', data?.error);
      } else {
        console.log(`ℹ️  Got status ${status} - check if this is expected`);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }

  console.log('\n🏁 Test completed');
}

// Run the test
testRosterDeleteFix().catch(console.error);