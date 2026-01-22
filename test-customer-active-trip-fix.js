// test-customer-active-trip-fix.js
// Test script to verify the customer active trip detection fix

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test customer ID (customer123@abrafleet.com)
const CUSTOMER_ID = 'b5aoloVR7xYI6SICibCIWecBaf82';

async function testActiveTrip() {
  console.log('🧪 Testing Customer Active Trip Detection Fix');
  console.log('='.repeat(50));
  
  try {
    // Test the roster-based active trip endpoint
    console.log('\n📍 Test 1: Check roster-based active trip endpoint');
    const response = await axios.get(`${BASE_URL}/api/rosters/active-trip/${CUSTOMER_ID}`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.hasActiveTrip) {
      console.log('🎉 SUCCESS: Active trip found!');
      console.log(`   Trip ID: ${response.data.trip.tripId}`);
      console.log(`   Status: ${response.data.trip.status}`);
      console.log(`   Vehicle: ${response.data.trip.vehicleNumber || 'Not assigned'}`);
    } else {
      console.log('⚠️  No active trip found');
    }
    
  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status);
      console.log('❌ Error Data:', error.response.data);
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Test Complete');
}

// Run the test
testActiveTrip();