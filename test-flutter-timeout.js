// Test script to simulate Flutter app behavior
const http = require('http');

console.log('🔍 Testing Flutter-like HTTP behavior...');

// Test 1: Simple GET request with timeout
const testSimpleRequest = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/api/admin/drivers', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 second timeout like Flutter
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ Request completed');
        console.log('Status:', res.statusCode);
        console.log('Response:', data.substring(0, 200));
        resolve(data);
      });
    });

    req.on('timeout', () => {
      console.log('❌ Request timed out after 30 seconds');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.on('error', (err) => {
      console.log('❌ Request error:', err.message);
      reject(err);
    });

    console.log('📡 Request sent, waiting for response...');
  });
};

// Test 2: Check if server is accepting connections
const testConnection = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/', (res) => {
      console.log('✅ Basic connection works, status:', res.statusCode);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log('❌ Connection failed:', err.message);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Connection timeout');
      req.destroy();
      reject(new Error('Connection timeout'));
    });
  });
};

async function runTests() {
  try {
    console.log('\n1. Testing basic connection...');
    await testConnection();
    
    console.log('\n2. Testing API endpoint...');
    await testSimpleRequest();
    
  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
  }
}

runTests();