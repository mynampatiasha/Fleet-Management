const http = require('http');
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./abra_fleet_backend/abra-fleet-firebase-adminsdk.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://abrafleet-cec94-default-rtdb.firebaseio.com"
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.log('⚠️ Firebase Admin initialization failed:', error.message);
  }
}

async function createTestToken() {
  try {
    // Create a custom token for testing
    const customToken = await admin.auth().createCustomToken('test-user-billing', {
      role: 'admin',
      organizationId: 'test-org'
    });
    
    console.log('✅ Test token created');
    return customToken;
  } catch (error) {
    console.error('❌ Error creating test token:', error);
    return null;
  }
}

async function testBillingAPI() {
  console.log('🚀 Testing Billing API with Authentication...');
  console.log('='.repeat(60));
  
  const token = await createTestToken();
  if (!token) {
    console.log('❌ Cannot proceed without authentication token');
    return;
  }
  
  // Test 1: Health Check
  console.log('🏥 Testing health endpoint...');
  await makeRequest('/api/billing/health', 'GET', token);
  
  // Test 2: Seed Sample Data
  console.log('\n🌱 Seeding sample data...');
  await makeRequest('/api/billing/seed-data', 'POST', token);
  
  // Test 3: Get Dashboard Summary
  console.log('\n📊 Testing dashboard summary...');
  await makeRequest('/api/billing/dashboard/summary', 'GET', token);
  
  // Test 4: Get Receivables
  console.log('\n💰 Testing receivables...');
  await makeRequest('/api/billing/receivables/summary', 'GET', token);
  
  // Test 5: Get Payables
  console.log('\n💸 Testing payables...');
  await makeRequest('/api/billing/payables/summary', 'GET', token);
  
  // Test 6: Get Cash Flow
  console.log('\n📈 Testing cash flow...');
  await makeRequest('/api/billing/cash-flow', 'GET', token);
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ BILLING API TEST COMPLETE!');
  console.log('='.repeat(60));
}

function makeRequest(path, method = 'GET', token = null, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`   ✅ ${method} ${path} - Status: ${res.statusCode}`);
            if (parsed.data) {
              console.log(`      Data keys: ${Object.keys(parsed.data).join(', ')}`);
            }
          } else {
            console.log(`   ❌ ${method} ${path} - Status: ${res.statusCode}`);
            console.log(`      Error: ${parsed.message || parsed.error}`);
          }
          resolve(parsed);
        } catch (error) {
          console.log(`   ❌ ${method} ${path} - Parse Error: ${error.message}`);
          console.log(`      Raw response: ${responseData.substring(0, 200)}...`);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ ${method} ${path} - Network Error: ${error.message}`);
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Run the test
if (require.main === module) {
  testBillingAPI()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testBillingAPI };