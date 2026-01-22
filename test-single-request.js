const axios = require('axios');

async function testSingleRequest() {
  const baseURL = 'http://localhost:3001';
  const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ4Mjg5MmZhMzJlY2QxM2E0ZTBhZWZlNjI4ZGQ5YWFlM2FiYThlMWUiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ3VzdG9tZXIiLCJyb2xlIjoiY3VzdG9tZXIiLCJvcmdhbml6YXRpb25OYW1lIjoiQWJyYSBUcmF2ZWxzIERlbW8gT3JnIiwiaXNzIjoiaHR0cHM6Ly9zZWN1cmV0b2tlbi5nb29nbGUuY29tL2FicmFmbGVldC1jZWM5NCIsImF1ZCI6ImFicmFmbGVldC1jZWM5NCIsImF1dGhfdGltZSI6MTc2ODMwMDc3NiwidXNlcl9pZCI6ImI1YW9sb1ZSN3hZSTZTSUNpYkNJV2VjQmFmODIiLCJzdWIiOiJiNWFvbG9WUjd4WUk2U0lDaWJDSVdlY0JhZjgyIiwiaWF0IjoxNzY4MzAwNzg5LCJleHAiOjE3NjgzMDQzODksImVtYWlsIjoiY3VzdG9tZXIxMjNAYWJyYWZsZWV0LmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJjdXN0b21lcjEyM0BhYnJhZmxlZXQuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.LItKQceKBk2EK8QhGUxJ5yxcBgXOhdnsZHE1z9vSms5tV8I6F3Qrxdn4ASt3ZdjRwz9ubtgsSY_BOtEq5ncsh8g-WNDKiwZt1SEifUwdxqq4W3E4Ly_lqXi68ipNutHLOyDvorvkA72jSMy3-74sBDKuqBWtktn2oR6q95fLpgb_1CFHcsZDQGtv_Xs8dObs9fakriHQq0J68HPRD0lE3TaYA1OjdsJM_koEwHsAi37PXnaFkQ17D9vrWtMEf02kQxDP-QMQdrfHEVEY58V6Fx02CG2xjrjZJ2cEwPUFSVvCaQTho-L5MxWbU6sPK2hb6CentbMvM0RN5zZ1R8Z7SQ';
  
  console.log('🧪 Making single request to customer stats...');
  console.log('📡 Check backend logs for detailed error information');
  
  try {
    const response = await axios.get(`${baseURL}/api/customer/stats/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: function (status) {
        return true; // Don't throw error for any status code
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Response: ${JSON.stringify(response.data, null, 2)}`);
    
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
  }
}

testSingleRequest().catch(console.error);