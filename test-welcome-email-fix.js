const axios = require('axios');

async function testWelcomeEmail() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING WELCOME EMAIL ENDPOINT');
  console.log('='.repeat(80));
  
  try {
    // Test data
    const testData = {
      customerId: 'test-customer-123',
      customerEmail: 'hostelmatrix19@gmail.com', // Using the same email as SMTP for testing
      customerName: 'Test Customer',
      companyName: 'Test Company Ltd'
    };
    
    console.log('📦 Test Data:');
    console.log('   Customer ID:', testData.customerId);
    console.log('   Customer Email:', testData.customerEmail);
    console.log('   Customer Name:', testData.customerName);
    console.log('   Company Name:', testData.companyName);
    console.log('-'.repeat(80));
    
    // Make request to welcome email endpoint
    console.log('📤 Making request to welcome email endpoint...');
    console.log('🔗 URL: http://localhost:3001/api/customer-approval/send-welcome-email');
    
    const response = await axios.post(
      'http://localhost:3001/api/customer-approval/send-welcome-email',
      testData,
      {
        headers: {
          'Content-Type': 'application/json',
          // Note: In real scenario, this would need a valid Firebase token
          // For testing, we'll see if the endpoint is accessible
        },
        timeout: 30000 // 30 second timeout
      }
    );
    
    console.log('='.repeat(80));
    console.log('✅ SUCCESS: Welcome email endpoint responded');
    console.log('🔹 Status:', response.status);
    console.log('🔹 Response:', JSON.stringify(response.data, null, 2));
    console.log('='.repeat(80));
    
  } catch (error) {
    console.log('='.repeat(80));
    console.log('❌ ERROR: Welcome email test failed');
    console.log('🔹 Error Type:', error.name);
    console.log('🔹 Error Message:', error.message);
    
    if (error.response) {
      console.log('🔹 HTTP Status:', error.response.status);
      console.log('🔹 Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('🔹 Request Error:', error.request.message || 'No response received');
    }
    
    console.log('='.repeat(80));
  }
}

// Run the test
testWelcomeEmail();