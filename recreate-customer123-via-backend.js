// recreate-customer123-via-backend.js
// Use the backend to recreate customer123 user

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function recreateCustomer123ViaBackend() {
  console.log('🔧 RECREATING CUSTOMER123 VIA BACKEND');
  console.log('='.repeat(50));
  
  try {
    // Test backend connection
    console.log('\n1️⃣ Testing backend connection...');
    const healthResponse = await axios.get(`${BACKEND_URL}/health`);
    console.log('✅ Backend is running:', healthResponse.data.status);
    console.log('   MongoDB status:', healthResponse.data.mongodb);
    
    // Create a test endpoint call to recreate the user
    console.log('\n2️⃣ Creating customer123 via backend database...');
    
    // We'll use the test-db endpoint to execute our user creation
    try {
      const dbTestResponse = await axios.get(`${BACKEND_URL}/test-db`);
      console.log('✅ Database connection working:', dbTestResponse.data.status);
      
      // Now let's create a custom endpoint to recreate the user
      // Since we can't modify the backend easily, let's use the auth middleware to create the user
      
      console.log('\n3️⃣ Testing user creation via auth middleware...');
      
      // The auth middleware automatically creates users if they don't exist
      // So we just need to make a request with the Firebase UID
      const authResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': 'customer123-firebase-uid'
        },
        timeout: 10000
      });
      
      console.log('✅ User created/found:', authResponse.data.user?.email);
      console.log('   Role:', authResponse.data.user?.role);
      console.log('   Collection:', authResponse.data.user?.collectionName);
      
    } catch (authError) {
      if (authError.response?.status === 404) {
        console.log('❌ User still not found after auth middleware');
        console.log('   The auth middleware should have created the user automatically');
        console.log('   Let\'s check what\'s happening...');
        
        // Let's examine the auth middleware behavior
        console.log('\n4️⃣ Debugging auth middleware...');
        
        // Try with a different approach - use a known working endpoint
        try {
          const statsResponse = await axios.get(`${BACKEND_URL}/api/customer/stats/dashboard`, {
            headers: {
              'x-test-firebase-uid': 'customer123-firebase-uid'
            },
            timeout: 10000
          });
          
          console.log('✅ Customer stats working! User was created automatically');
          console.log('   Status:', statsResponse.status);
          
          // Now test auth profile again
          const retryAuthResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
            headers: {
              'x-test-firebase-uid': 'customer123-firebase-uid'
            },
            timeout: 5000
          });
          
          console.log('✅ Auth profile now working:', retryAuthResponse.data.user?.email);
          
        } catch (statsError) {
          console.log('❌ Customer stats also failing:', statsError.response?.status);
          console.log('   Error:', statsError.response?.data?.message);
          
          // The issue might be in the auth middleware logic
          console.log('\n5️⃣ The auth middleware might have an issue...');
          console.log('   Let\'s check if we can manually trigger user creation');
          
          // Try to make multiple requests to trigger the user creation logic
          for (let i = 0; i < 3; i++) {
            try {
              console.log(`   Attempt ${i + 1}...`);
              const attemptResponse = await axios.get(`${BACKEND_URL}/api/customer/stats/dashboard`, {
                headers: {
                  'x-test-firebase-uid': 'customer123-firebase-uid'
                },
                timeout: 5000
              });
              console.log(`   ✅ Attempt ${i + 1} succeeded:`, attemptResponse.status);
              break;
            } catch (attemptError) {
              console.log(`   ❌ Attempt ${i + 1} failed:`, attemptError.response?.status);
              if (i === 2) {
                console.log('   All attempts failed - there\'s a deeper issue');
              }
            }
          }
        }
      } else {
        console.log('❌ Auth error:', authError.response?.status, authError.response?.data?.message);
      }
    }
    
    // Final verification
    console.log('\n6️⃣ Final verification...');
    try {
      const finalAuthResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': 'customer123-firebase-uid'
        },
        timeout: 5000
      });
      
      const finalStatsResponse = await axios.get(`${BACKEND_URL}/api/customer/stats/dashboard`, {
        headers: {
          'x-test-firebase-uid': 'customer123-firebase-uid'
        },
        timeout: 5000
      });
      
      console.log('🎉 SUCCESS! Customer123 is working:');
      console.log('   Auth Profile:', finalAuthResponse.status);
      console.log('   Customer Stats:', finalStatsResponse.status);
      console.log('   User:', finalAuthResponse.data.user?.email);
      console.log('   Role:', finalAuthResponse.data.user?.role);
      
    } catch (finalError) {
      console.log('❌ Final verification failed');
      console.log('   Auth Profile Error:', finalError.response?.status);
      console.log('   Message:', finalError.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the recreation
recreateCustomer123ViaBackend().catch(console.error);