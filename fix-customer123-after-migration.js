// fix-customer123-after-migration.js
// Recreate customer123 user after migration

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function fixCustomer123() {
  console.log('🔧 FIXING CUSTOMER123 AFTER MIGRATION');
  console.log('='.repeat(50));
  
  try {
    // First, test if backend is running
    console.log('\n1️⃣ Testing backend connection...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data.status);
    
    // Test current auth status
    console.log('\n2️⃣ Testing current auth status...');
    try {
      const authResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': 'customer123-firebase-uid'
        },
        timeout: 5000
      });
      console.log('✅ Customer123 found:', authResponse.data.user?.email);
      console.log('   Role:', authResponse.data.user?.role);
      console.log('   Collection:', authResponse.data.user?.collectionName);
      
      // If user exists, test customer stats
      console.log('\n3️⃣ Testing customer stats...');
      const statsResponse = await axios.get(`${BACKEND_URL}/api/customer/stats/dashboard`, {
        headers: {
          'x-test-firebase-uid': 'customer123-firebase-uid'
        },
        timeout: 5000
      });
      console.log('✅ Customer stats working:', statsResponse.status);
      
      console.log('\n🎉 CUSTOMER123 IS WORKING CORRECTLY!');
      console.log('   The issue might be with the real Firebase token, not the test mode.');
      
    } catch (error) {
      if (error.response?.status === 404 && error.response?.data?.message?.includes('User profile not found')) {
        console.log('❌ Customer123 not found in database');
        console.log('   This confirms the user was lost during migration');
        
        // Create the user via API
        console.log('\n3️⃣ Recreating customer123 user...');
        
        // Use the unified registration endpoint to create the user
        try {
          const createResponse = await axios.post(`${BACKEND_URL}/api/auth/register-customer`, {
            name: 'Customer 123',
            email: 'customer123@abrafleet.com',
            phone: '+91-9876543210',
            address: '123 Test Street, Bangalore',
            firebaseUid: 'customer123-firebase-uid',
            role: 'customer'
          });
          
          console.log('✅ Customer123 recreated:', createResponse.status);
          
          // Test again
          console.log('\n4️⃣ Testing after recreation...');
          const testResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
            headers: {
              'x-test-firebase-uid': 'customer123-firebase-uid'
            },
            timeout: 5000
          });
          console.log('✅ Customer123 now works:', testResponse.data.user?.email);
          
        } catch (createError) {
          console.log('❌ Failed to recreate user:', createError.response?.status);
          console.log('   Error:', createError.response?.data?.message);
          
          // Try direct database insertion approach
          console.log('\n4️⃣ Trying direct database approach...');
          
          // Create a simple script to insert directly
          const insertResponse = await axios.post(`${BACKEND_URL}/api/test-create-customer123`, {
            // This endpoint doesn't exist, but we can create it
          }).catch(() => {
            console.log('   Direct insertion endpoint not available');
            console.log('   Manual database insertion required');
          });
        }
      } else {
        console.log('❌ Other auth error:', error.response?.status, error.response?.data?.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
fixCustomer123().catch(console.error);