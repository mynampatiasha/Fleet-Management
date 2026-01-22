// Test My Tickets API with proper authentication
const axios = require('axios');
const admin = require('./abra_fleet_backend/config/firebase');

const BASE_URL = 'http://localhost:3001';

async function testMyTicketsAPI() {
  console.log('🎫 TESTING MY TICKETS API');
  console.log('='.repeat(50));

  try {
    // Step 1: Create a custom token for admin@abrafleet.com
    console.log('\n1️⃣ Creating Firebase custom token...');
    const customToken = await admin.auth().createCustomToken('qnwp8d0clDSSNuSm3ugmXYLSI3K2', {
      email: 'admin@abrafleet.com',
      role: 'admin',
      name: 'Admin User'
    });
    console.log('✅ Custom token created');

    // Step 2: Exchange custom token for ID token
    console.log('\n2️⃣ Getting ID token...');
    const signInResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_API_KEY || 'demo-key'}`,
      {
        token: customToken,
        returnSecureToken: true
      }
    );
    
    const idToken = signInResponse.data.idToken;
    console.log('✅ ID token obtained');

    // Step 3: Test My Tickets API
    console.log('\n3️⃣ Testing /api/tickets/my endpoint...');
    
    try {
      const response = await axios.get(`${BASE_URL}/api/tickets/my`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ API call successful');
      console.log('Response status:', response.status);
      console.log('Response data:', JSON.stringify(response.data, null, 2));

      if (response.data.success && response.data.data) {
        console.log(`\n📊 Found ${response.data.data.length} tickets:`);
        response.data.data.forEach((ticket, index) => {
          console.log(`   ${index + 1}. ${ticket.ticketNumber} - ${ticket.subject} (${ticket.status})`);
        });
      }

    } catch (apiError) {
      console.error('❌ API call failed:');
      console.error('Status:', apiError.response?.status);
      console.error('Error:', apiError.response?.data);
      
      if (apiError.response?.status === 401) {
        console.log('🔍 Authentication issue - checking token...');
      }
    }

    // Step 4: Test with different query parameters
    console.log('\n4️⃣ Testing with different filters...');
    
    try {
      const allStatusResponse = await axios.get(`${BASE_URL}/api/tickets/my?status=all`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ All status API call successful');
      if (allStatusResponse.data.success && allStatusResponse.data.data) {
        console.log(`📊 Found ${allStatusResponse.data.data.length} tickets (including closed):`);
        allStatusResponse.data.data.forEach((ticket, index) => {
          console.log(`   ${index + 1}. ${ticket.ticketNumber} - ${ticket.subject} (${ticket.status})`);
        });
      }

    } catch (allStatusError) {
      console.error('❌ All status API call failed:', allStatusError.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMyTicketsAPI().catch(console.error);