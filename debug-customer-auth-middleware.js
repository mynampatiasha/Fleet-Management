const axios = require('axios');

async function debugCustomerAuth() {
  const baseURL = 'http://localhost:3001';
  
  // Use the actual token from the login logs
  const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ3VzdG9tZXIiLCJyb2xlIjoiY3VzdG9tZXIiLCJvcmdhbml6YXRpb25OYW1lIjoiQWJyYSBUcmF2ZWxzIERlbW8gT3JnIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2FicmFmbGVldC1jZWM5NCIsImF1ZCI6ImFicmFmbGVldC1jZWM5NCIsImF1dGhfdGltZSI6MTc2ODMwMDc3NiwidXNlcl9pZCI6ImI1YW9sb1ZSN3hZSTZTSUNpYkNJV2VjQmFmODIiLCJzdWIiOiJiNWFvbG9WUjd4WUk2U0lDaWJDSVdlY0JhZjgyIiwiaWF0IjoxNzY4MzAwNzg5LCJleHAiOjE3NjgzMDQzODksImVtYWlsIjoiY3VzdG9tZXIxMjNAYWJyYWZsZWV0LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJjdXN0b21lcjEyM0BhYnJhZmxlZXQuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.LItKQceKBk2EK8QhGUxJ5yxcBgXOhdnsZHE1z9vSms5tV8I6F3Qrxdn4ASt3ZdjRwz9ubtgsSY_BOtEq5ncsh8g-WNDKiwZt1SEifUwdxqq4W3E4Ly_lqXi68ipNutHLOyDvorvkA72jSMy3-74sBDKuqBWtktn2oR6q95fLpgb_1CFHcsZDQGtv_Xs8dObs9fakriHQq0J68HPRD0lE3TaYA1OjdsJM_koEwHsAi37PXnaFkQ17D9vrWtMEf02kQxDP-QMQdrfHEVEY58V6Fx02CG2xjrjZJ2cEwPUFSVvCaQTho-L5MxWbU6sPK2hb6CentbMvM0RN5zZ1R8Z7SQ';
  
  console.log('🔍 Debugging Customer Authentication Middleware');
  console.log('===============================================');
  console.log('');
  
  console.log('📋 Token Info:');
  console.log(`   Length: ${token.length}`);
  console.log(`   Starts with: ${token.substring(0, 50)}...`);
  console.log('');
  
  // Test different endpoints to see which ones work
  const endpoints = [
    '/api/auth/profile',
    '/api/customer/stats/dashboard',
    '/api/roster/customer/my-rosters'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`🧪 Testing ${endpoint}...`);
    
    try {
      const response = await axios.get(`${baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`   ✅ SUCCESS - Status: ${response.status}`);
      
      // Log specific details for each endpoint
      if (endpoint === '/api/auth/profile' && response.data.user) {
        console.log(`   👤 User: ${response.data.user.email} (${response.data.user.role})`);
      } else if (endpoint === '/api/customer/stats/dashboard' && response.data.data) {
        console.log(`   📊 Dashboard data available`);
      } else if (endpoint === '/api/roster/customer/my-rosters' && response.data.data) {
        console.log(`   📋 Rosters: ${response.data.data.length} found`);
      }
      
    } catch (error) {
      console.log(`   ❌ FAILED - Status: ${error.response?.status || 'No response'}`);
      console.log(`   📝 Error: ${error.response?.data?.message || error.message}`);
      
      // Log additional error details for debugging
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.code) console.log(`   🔧 Code: ${errorData.code}`);
        if (errorData.userRole) console.log(`   👤 User Role: ${errorData.userRole}`);
        if (errorData.details) console.log(`   📋 Details: ${errorData.details}`);
      }
    }
    
    console.log('');
  }
  
  console.log('🏁 Debug Complete');
  console.log('');
  console.log('💡 Analysis:');
  console.log('   - If auth/profile works but stats/dashboard fails, it\'s a permission issue');
  console.log('   - If roster endpoint works, the collection fix was successful');
  console.log('   - Check backend logs for detailed auth middleware output');
}

debugCustomerAuth().catch(console.error);