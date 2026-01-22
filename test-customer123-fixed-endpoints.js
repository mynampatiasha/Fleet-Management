const axios = require('axios');

async function testFixedEndpoints() {
  const baseURL = 'http://localhost:3001';
  
  // Use the actual token from the login logs
  const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ3VzdG9tZXIiLCJyb2xlIjoiY3VzdG9tZXIiLCJvcmdhbml6YXRpb25OYW1lIjoiQWJyYSBUcmF2ZWxzIERlbW8gT3JnIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2FicmFmbGVldC1jZWM5NCIsImF1ZCI6ImFicmFmbGVldC1jZWM5NCIsImF1dGhfdGltZSI6MTc2ODMwMDc3NiwidXNlcl9pZCI6ImI1YW9sb1ZSN3hZSTZTSUNpYkNJV2VjQmFmODIiLCJzdWIiOiJiNWFvbG9WUjd4WUk2U0lDaWJDSVdlY0JhZjgyIiwiaWF0IjoxNzY4MzAwNzg5LCJleHAiOjE3NjgzMDQzODksImVtYWlsIjoiY3VzdG9tZXIxMjNAYWJyYWZsZWV0LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJjdXN0b21lcjEyM0BhYnJhZmxlZXQuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.LItKQceKBk2EK8QhGUxJ5yxcBgXOhdnsZHE1z9vSms5tV8I6F3Qrxdn4ASt3ZdjRwz9ubtgsSY_BOtEq5ncsh8g-WNDKiwZt1SEifUwdxqq4W3E4Ly_lqXi68ipNutHLOyDvorvkA72jSMy3-74sBDKuqBWtktn2oR6q95fLpgb_1CFHcsZDQGtv_Xs8dObs9fakriHQq0J68HPRD0lE3TaYA1OjdsJM_koEwHsAi37PXnaFkQ17D9vrWtMEf02kQxDP-QMQdrfHEVEY58V6Fx02CG2xjrjZJ2cEwPUFSVvCaQTho-L5MxWbU6sPK2hb6CentbMvM0RN5zZ1R8Z7SQ';
  
  console.log('🧪 Testing Fixed Customer Endpoints');
  console.log('=====================================');
  console.log('');
  
  // Test 1: Customer Stats Dashboard
  console.log('1️⃣ Testing /api/customer/stats/dashboard...');
  try {
    const response = await axios.get(`${baseURL}/api/customer/stats/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Customer stats endpoint working!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Data keys: ${Object.keys(response.data)}`);
    if (response.data.data) {
      console.log(`   Dashboard data keys: ${Object.keys(response.data.data)}`);
    }
  } catch (error) {
    console.log('❌ Customer stats endpoint failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }
  
  console.log('');
  
  // Test 2: My Rosters (Fixed)
  console.log('2️⃣ Testing /api/roster/customer/my-rosters (FIXED)...');
  try {
    const response = await axios.get(`${baseURL}/api/roster/customer/my-rosters`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ My rosters endpoint working!');
    console.log(`   Status: ${response.status}`);
    console.log(`   Data keys: ${Object.keys(response.data)}`);
    if (response.data.data) {
      console.log(`   Rosters count: ${response.data.data.length || 0}`);
    }
  } catch (error) {
    console.log('❌ My rosters endpoint failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }
  
  console.log('');
  
  // Test 3: Auth Profile (should work)
  console.log('3️⃣ Testing /api/auth/profile...');
  try {
    const response = await axios.get(`${baseURL}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Auth profile endpoint working!');
    console.log(`   Status: ${response.status}`);
    console.log(`   User role: ${response.data.user?.role}`);
    console.log(`   User email: ${response.data.user?.email}`);
  } catch (error) {
    console.log('❌ Auth profile endpoint failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
  }
  
  console.log('');
  console.log('🏁 Test Complete');
}

testFixedEndpoints().catch(console.error);