// Test Flutter API connection to ratings endpoint
const axios = require('axios');

async function testFlutterApiConnection() {
  console.log('🔍 Testing Flutter API connection to ratings endpoint...\n');
  
  try {
    // Test the exact URL Flutter should be using
    const baseUrl = 'http://localhost:3001';
    const endpoint = '/api/admin/drivers/ratings';
    const fullUrl = `${baseUrl}${endpoint}`;
    
    console.log(`📍 Testing URL: ${fullUrl}`);
    
    // Test without auth (should get 401)
    try {
      const response = await axios.get(fullUrl);
      console.log('❌ Unexpected success:', response.status);
    } catch (error) {
      if (error.response) {
        console.log(`✅ Expected response: ${error.response.status} - ${error.response.data?.message || 'Auth required'}`);
        
        if (error.response.status === 404) {
          console.log('❌ PROBLEM: Getting 404 - Route not found!');
          console.log('   This means the endpoint is not properly registered');
        } else if (error.response.status === 401) {
          console.log('✅ GOOD: Getting 401 - Endpoint exists but requires auth');
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
    // Test other admin endpoints for comparison
    console.log('\n🔍 Testing other admin endpoints for comparison...');
    
    const testEndpoints = [
      '/api/admin/drivers',
      '/api/admin/vehicles',
      '/health'
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await axios.get(`${baseUrl}${endpoint}`);
        console.log(`✅ ${endpoint}: ${response.status}`);
      } catch (error) {
        if (error.response) {
          console.log(`📊 ${endpoint}: ${error.response.status} - ${error.response.data?.message || 'Auth required'}`);
        } else {
          console.log(`❌ ${endpoint}: Network error`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFlutterApiConnection();