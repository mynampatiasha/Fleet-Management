// test-flutter-jwt-connection.js - Test Flutter JWT connection issue
const axios = require('axios');

async function testFlutterJWTConnection() {
  console.log('\n🔐 FLUTTER JWT CONNECTION TEST');
  console.log('='.repeat(80));
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test the exact same request that Flutter would make
    console.log('\n📡 Testing Flutter-style JWT login request...');
    
    const loginData = {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    };
    
    console.log('   Request URL:', `${baseURL}/auth/login`);
    console.log('   Request Data:', loginData);
    console.log('   Headers: Content-Type: application/json');
    
    // Test 1: Try the exact Flutter request format
    try {
      const response = await axios.post(`${baseURL}/auth/login`, loginData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      console.log('✅ Flutter-style request successful!');
      console.log('   Status:', response.status);
      console.log('   Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      console.log('❌ Flutter-style request failed');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.message);
      
      if (error.response?.status === 404) {
        console.log('\n🔍 Trying alternative endpoints...');
        
        // Test alternative endpoints
        const alternatives = [
          '/api/auth/login',
          '/api/jwt/login', 
          '/jwt/login'
        ];
        
        for (const endpoint of alternatives) {
          try {
            console.log(`   Testing: ${baseURL}${endpoint}`);
            const altResponse = await axios.post(`${baseURL}${endpoint}`, loginData, {
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000
            });
            
            console.log(`   ✅ SUCCESS: ${endpoint}`);
            console.log(`   Token received: ${altResponse.data.data?.token ? 'YES' : 'NO'}`);
            
            if (altResponse.data.data?.token) {
              console.log('\n🔧 SOLUTION FOUND:');
              console.log(`   Flutter should use: ${baseURL}${endpoint}`);
              console.log('   Update ApiService baseUrl or endpoint path');
              return;
            }
            
          } catch (altError) {
            if (altError.response?.status === 401 || altError.response?.status === 400) {
              console.log(`   ✅ ENDPOINT EXISTS: ${endpoint} (auth error expected)`);
            } else {
              console.log(`   ❌ FAILED: ${endpoint} - ${altError.response?.status || altError.message}`);
            }
          }
        }
      }
    }
    
    // Test 2: Check if Flutter's API service base URL is correct
    console.log('\n📡 Testing API service configuration...');
    
    // Simulate Flutter's API service behavior
    const flutterApiBaseUrl = 'http://localhost:3001'; // From Flutter .env
    const flutterEndpoint = '/auth/login'; // From JWT auth repository
    const fullUrl = `${flutterApiBaseUrl}${flutterEndpoint}`;
    
    console.log('   Flutter API Base URL:', flutterApiBaseUrl);
    console.log('   Flutter Endpoint:', flutterEndpoint);
    console.log('   Full URL:', fullUrl);
    
    try {
      const flutterResponse = await axios.post(fullUrl, loginData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('✅ Flutter API configuration is correct!');
      console.log('   Response:', JSON.stringify(flutterResponse.data, null, 2));
      
    } catch (flutterError) {
      console.log('❌ Flutter API configuration issue detected');
      console.log('   Status:', flutterError.response?.status);
      console.log('   Error:', flutterError.message);
      
      if (flutterError.response?.data) {
        console.log('   Response:', JSON.stringify(flutterError.response.data, null, 2));
      }
      
      // Provide solution
      console.log('\n🔧 RECOMMENDED SOLUTION:');
      console.log('   1. Update Flutter ApiService to use: /api/auth/login');
      console.log('   2. Or update backend to mount JWT router at /auth');
      console.log('   3. Current working endpoint: /api/auth/login');
    }
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(80));
}

// Run the test
testFlutterJWTConnection().catch(console.error);