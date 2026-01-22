const axios = require('axios');

async function testRouteMatching() {
  const baseURL = 'http://localhost:3001';
  const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ3VzdG9tZXIiLCJyb2xlIjoiY3VzdG9tZXIiLCJvcmdhbml6YXRpb25OYW1lIjoiQWJyYSBUcmF2ZWxzIERlbW8gT3JnIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2FicmFmbGVldC1jZWM5NCIsImF1ZCI6ImFicmFmbGVldC1jZWM5NCIsImF1dGhfdGltZSI6MTc2ODMwMDc3NiwidXNlcl9pZCI6ImI1YW9sb1ZSN3hZSTZTSUNpYkNJV2VjQmFmODIiLCJzdWIiOiJiNWFvbG9WUjd4WUk2U0lDaWJDSVdlY0JhZjgyIiwiaWF0IjoxNzY4MzAwNzg5LCJleHAiOjE3NjgzMDQzODksImVtYWlsIjoiY3VzdG9tZXIxMjNAYWJyYWZsZWV0LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJjdXN0b21lcjEyM0BhYnJhZmxlZXQuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.LItKQceKBk2EK8QhGUxJ5yxcBgXOhdnsZHE1z9vSms5tV8I6F3Qrxdn4ASt3ZdjRwz9ubtgsSY_BOtEq5ncsh8g-WNDKiwZt1SEifUwdxqq4W3E4Ly_lqXi68ipNutHLOyDvorvkA72jSMy3-74sBDKuqBWtktn2oR6q95fLpgb_1CFHcsZDQGtv_Xs8dObs9fakriHQq0J68HPRD0lE3TaYA1OjdsJM_koEwHsAi37PXnaFkQ17D9vrWtMEf02kQxDP-QMQdrfHEVEY58V6Fx02CG2xjrjZJ2cEwPUFSVvCaQTho-L5MxWbU6sPK2hb6CentbMvM0RN5zZ1R8Z7SQ';
  
  console.log('🧪 Testing Route Matching');
  console.log('=========================');
  console.log('');
  
  // Test different variations of the customer stats route
  const testRoutes = [
    '/api/customer/stats/dashboard',
    '/api/customer/stats',
    '/api/customer',
    '/api/auth/profile'  // This one works as a control
  ];
  
  for (const route of testRoutes) {
    console.log(`🔍 Testing: ${route}`);
    
    try {
      const response = await axios.get(`${baseURL}${route}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000,
        validateStatus: function (status) {
          return true; // Don't throw error for any status code
        }
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`   ✅ SUCCESS`);
      } else if (response.status === 403) {
        console.log(`   ❌ FORBIDDEN - ${response.data.message || 'No message'}`);
      } else if (response.status === 404) {
        console.log(`   ❌ NOT FOUND`);
      } else {
        console.log(`   ❓ OTHER - ${response.data.message || 'No message'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log('');
  }
}

testRouteMatching().catch(console.error);