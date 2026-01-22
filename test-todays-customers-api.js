const axios = require('axios');

// Simple test for the todays-customers API
async function testTodaysCustomersAPI() {
  try {
    console.log('\n🔍 ========== TESTING TODAYS-CUSTOMERS API ==========');
    console.log('📅 Timestamp:', new Date().toISOString());

    // Test with the token from the logs
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4OGQ1YTM3OWI3OGJkZjFlNTBhNDA5MTEzZjJiMGM3NWU0NTJlNDciLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiUmFqZXNoIEt1bWFyIiwicm9sZSI6ImRyaXZlciIsImRyaXZlcklkIjoiRFJWLTEwMDAwMSIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9hYnJhZmxlZXQtY2VjOTQiLCJhdWQiOiJhYnJhZmxlZXQtY2VjOTQiLCJhdXRoX3RpbWUiOjE3NjY4MDcxNzMsInVzZXJfaWQiOiJhVklGOUFobHVpZzk5M2ZDTnlaUnJJREMzS08yIiwic3ViIjoiYVZJRjlBaGx1aWc5OTNmQ055WlJySURDM0tPMiIsImlhdCI6MTc2NjgwOTI2NSwiZXhwIjoxNzY2ODEyODY1LCJlbWFpbCI6InJhamVzaC5rdW1hckBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsicmFqZXNoLmt1bWFyQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.ZV-IvYRKY8tzlsiKrKiRcBupmC2Km_gWmANpeWhpAek7pv8t8UvBuJy8x9Q7tvGemEy0rzT54PGuS0eASqEaKP0UCJN7xJEOTLCzV2sq5Lvzz_b-twG6-CmnQBT-yy0zGXQsKzLj4IsDHI6pTp29wJ7e4vcMc20zphVE30mENkUY16Mvje-gap-WL6f6IeArpIL50KEhkLQCOuc1Dqj_g2V1w5B-xn2X3FBVgsHaRKbukxCEtgGBcBCgKyXizwwcWlLrmXbuCu6NgT_bF_zmMBJKuAcKNrw2yzoP3ODFHhiWu0qqHyubFBtoLZohITfnpAZkJaTcLpkEBpGXlhzOTA';

    const baseUrl = 'http://localhost:3001'; // From the logs
    const apiUrl = `${baseUrl}/api/driver/todays-customers`;

    console.log('🔄 Testing API endpoint:', apiUrl);

    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📡 API Response:');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));

    if (response.data.status === 'success') {
      const customers = response.data.data?.customers || [];
      console.log('\n📊 Customer Analysis:');
      console.log('   Total customers:', customers.length);
      
      if (customers.length === 0) {
        console.log('\n⚠️  No customers found. Possible reasons:');
        console.log('   1. No rosters assigned for today');
        console.log('   2. Driver not found in database');
        console.log('   3. Date filtering excluded all rosters');
        console.log('   4. Driver ID mismatch between collections');
      }
    }

    // Now test the working endpoint for comparison
    console.log('\n🔄 Testing working endpoint for comparison...');
    const workingUrl = `${baseUrl}/api/driver/route/today`;
    
    const workingResponse = await axios.get(workingUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n📡 Working API Response:');
    console.log('   Status:', workingResponse.status);
    console.log('   Has Route:', workingResponse.data.hasRoute);
    console.log('   Customers Count:', workingResponse.data.customers?.length || 0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testTodaysCustomersAPI()
  .then(() => {
    console.log('\n========== TEST COMPLETE ==========\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  });