// Test the health endpoint that Flutter should be able to reach
const axios = require('axios');

async function testHealthEndpoint() {
  console.log('🔍 Testing health endpoint that Flutter app should reach...');
  
  try {
    console.log('📡 Making request to: http://localhost:3001/health');
    
    const response = await axios.get('http://localhost:3001/health', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('✅ Health endpoint works!');
    console.log('   Status:', response.status);
    console.log('   Data:', response.data);
    
    return true;
  } catch (error) {
    console.log('❌ Health endpoint failed:');
    console.log('   Error:', error.message);
    console.log('   Code:', error.code);
    
    if (error.response) {
      console.log('   Response Status:', error.response.status);
      console.log('   Response Data:', error.response.data);
    }
    
    return false;
  }
}

testHealthEndpoint();