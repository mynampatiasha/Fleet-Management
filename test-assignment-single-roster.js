// Test script to verify the single assignment endpoint is working after the fix
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testSingleAssignment() {
  console.log('🔍 TESTING SINGLE ASSIGNMENT ENDPOINT AFTER FIX');
  console.log('═'.repeat(80));
  
  try {
    // Test with a valid Firebase token (you'll need to get this from the Flutter app)
    const testToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImEzOGVhNmEwNDA4YjBjYzVkYTE4OWRmYzg4ODgyZDBmMWI3ZmJmMGUiLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY3NjcxNTAzLCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3Njc2ODA1MTQsImV4cCI6MTc2NzY4NDExNCwiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.FUaC6_rvmfVVdQVxFkrl8IiLe4f3DPRsmvsN7H_zPTN7uQvNuM8YVeStlycJ_N89-pnc93oU9zYn3OG8WQ4seXKZbXWxwl5MUyeRcXdR-j-9ZgC6CxBf_kY65ApdnZqYyPFt-UahjNJg0J4cqpAYY_WnJpVWM82pwJU_Lf19kFCTY2uXO1C8xDq1T0HPLzVYz1u5mdLU4e26AdG9KLrneIEbo8frjq7qcXasMicm-Tj5e75KMT9XNz0mgVuD1erz1vinFcIWnq0K4Cm3oSoyTTS47m6U2ihXgQIsJIZ_osJIqLAS8VWe4iYefUJ6AxU-4T-YL4waPS37X36KpxCa6Q';
    
    console.log('\n📡 Test 1: Single Assignment (POST /api/assignment/assign)');
    try {
      const assignResponse = await axios.post(`${BASE_URL}/api/assignment/assign`, {
        rosterId: '507f1f77bcf86cd799439011',
        vehicleId: '507f1f77bcf86cd799439013'
      }, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Single assignment SUCCESS:', assignResponse.status);
      console.log('📄 Response:', JSON.stringify(assignResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Single assignment error:', error.response?.status, error.response?.data || error.message);
      
      if (error.response?.status === 500) {
        console.log('🔍 500 ERROR - This should be fixed now');
        console.log('   Check if the backend was restarted after the fix');
      } else if (error.response?.status === 404) {
        console.log('🔍 404 ERROR - Roster or vehicle not found (expected for test data)');
      } else if (error.response?.status === 401) {
        console.log('🔍 401 ERROR - Token expired or invalid (expected)');
      }
    }
    
    console.log('\n📡 Test 2: Group Assignment (POST /api/assignment/assign-group)');
    try {
      const groupResponse = await axios.post(`${BASE_URL}/api/assignment/assign-group`, {
        rosterIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
        vehicleId: '507f1f77bcf86cd799439013'
      }, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Group assignment SUCCESS:', groupResponse.status);
      console.log('📄 Response:', JSON.stringify(groupResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Group assignment error:', error.response?.status, error.response?.data || error.message);
      
      if (error.response?.status === 500) {
        console.log('🔍 500 ERROR - Unexpected, group assignment should work');
      } else if (error.response?.status === 404) {
        console.log('🔍 404 ERROR - Roster or vehicle not found (expected for test data)');
      } else if (error.response?.status === 401) {
        console.log('🔍 401 ERROR - Token expired or invalid (expected)');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('🏁 Tests completed');
  console.log('💡 Note: 401 errors are expected with test tokens');
  console.log('💡 Note: 404 errors are expected with fake roster/vehicle IDs');
  console.log('💡 The important thing is NO 500 errors should occur');
}

testSingleAssignment();