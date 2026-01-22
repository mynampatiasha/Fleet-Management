// Debug script to investigate the 500 error in roster deletion
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function debugRosterDelete() {
  console.log('🔍 Debugging Roster Delete 500 Error...\n');

  try {
    // Test with the roster ID from the error log
    const rosterId = '694ce9909ceaf59f79334344';
    
    console.log(`📋 Testing DELETE for roster: ${rosterId}`);
    
    // First, let's check if the roster exists
    console.log('\n1️⃣ Checking if roster exists in database...');
    
    // We'll make the DELETE request and see what error we get
    console.log('\n2️⃣ Making DELETE request...');
    
    try {
      const response = await axios.delete(`${BASE_URL}/api/roster/customer/${rosterId}`, {
        headers: {
          'Authorization': 'Bearer test-token-will-fail-but-show-error'
        },
        timeout: 10000
      });
      
      console.log('✅ Unexpected success:', response.data);
      
    } catch (error) {
      console.log('❌ Expected error occurred:');
      console.log('   Status:', error.response?.status);
      console.log('   Status Text:', error.response?.statusText);
      console.log('   Data:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.response?.status === 500) {
        console.log('\n🚨 500 Internal Server Error detected!');
        console.log('   This indicates a server-side error in the DELETE endpoint');
        
        // Check if there are any specific error details
        if (error.response?.data?.error) {
          console.log('   Error details:', error.response.data.error);
        }
        
        if (error.response?.data?.message) {
          console.log('   Error message:', error.response.data.message);
        }
      }
    }
    
    console.log('\n3️⃣ Testing with invalid roster ID format...');
    
    try {
      const response = await axios.delete(`${BASE_URL}/api/roster/customer/invalid-id`, {
        headers: {
          'Authorization': 'Bearer test-token'
        },
        timeout: 5000
      });
      
      console.log('✅ Unexpected success with invalid ID:', response.data);
      
    } catch (error) {
      console.log('❌ Error with invalid ID:');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the debug
debugRosterDelete().catch(console.error);