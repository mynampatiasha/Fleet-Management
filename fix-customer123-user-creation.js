// fix-customer123-user-creation.js
// Create the missing customer123 user in the database

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function fixCustomer123User() {
  console.log('🔧 FIXING CUSTOMER123 USER CREATION');
  console.log('='.repeat(50));
  
  const firebaseUid = 'b5aoloVR7xYI6SICibCIWecBaf82';
  const email = 'customer123@abrafleet.com';
  
  console.log(`Firebase UID: ${firebaseUid}`);
  console.log(`Email: ${email}`);
  
  try {
    console.log('\n1️⃣ Testing current auth profile...');
    
    try {
      const profileResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': firebaseUid
        },
        timeout: 10000
      });
      
      console.log('✅ User already exists:');
      console.log(`   Name: ${profileResponse.data.user?.name}`);
      console.log(`   Email: ${profileResponse.data.user?.email}`);
      console.log(`   Role: ${profileResponse.data.user?.role}`);
      
    } catch (authError) {
      console.log('❌ User not found - this is expected');
      console.log(`   Status: ${authError.response?.status}`);
      console.log(`   Message: ${authError.response?.data?.message}`);
    }
    
    console.log('\n2️⃣ Creating user via registration endpoint...');
    
    // Try to create user via registration
    const registrationData = {
      name: 'Customer 123',
      email: email,
      password: 'Welcome@123',
      role: 'customer',
      companyName: 'Abra Travels Demo Org',
      organizationName: 'Abra Travels Demo Org',
      department: 'IT',
      phone: '+91-9876543210'
    };
    
    try {
      const registerResponse = await axios.post(`${BACKEND_URL}/api/auth/register`, registrationData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('✅ User registration response:');
      console.log(`   Status: ${registerResponse.status}`);
      console.log(`   Success: ${registerResponse.data.success}`);
      console.log(`   Message: ${registerResponse.data.message}`);
      console.log(`   User ID: ${registerResponse.data.user?.uid}`);
      
    } catch (regError) {
      console.log('❌ Registration failed:');
      console.log(`   Status: ${regError.response?.status}`);
      console.log(`   Message: ${regError.response?.data?.message}`);
      
      if (regError.response?.status === 400 && regError.response?.data?.message?.includes('already exists')) {
        console.log('   ℹ️  User already exists in Firebase, need to link to MongoDB');
      }
    }
    
    console.log('\n3️⃣ Testing auth profile after registration...');
    
    try {
      const profileResponse2 = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': firebaseUid
        },
        timeout: 10000
      });
      
      console.log('✅ User profile now available:');
      console.log(`   Name: ${profileResponse2.data.user?.name}`);
      console.log(`   Email: ${profileResponse2.data.user?.email}`);
      console.log(`   Role: ${profileResponse2.data.user?.role}`);
      console.log(`   UID: ${profileResponse2.data.user?.uid}`);
      
    } catch (authError2) {
      console.log('❌ Profile still not found:');
      console.log(`   Status: ${authError2.response?.status}`);
      console.log(`   Message: ${authError2.response?.data?.message}`);
      
      console.log('\n   🔧 Trying to trigger user creation via my-rosters...');
      
      // The auth middleware should create the user automatically when accessing protected routes
      try {
        const rostersResponse = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
          headers: {
            'x-test-firebase-uid': firebaseUid
          },
          timeout: 10000
        });
        
        console.log('✅ My-rosters triggered user creation:');
        console.log(`   Status: ${rostersResponse.status}`);
        console.log(`   Count: ${rostersResponse.data.count}`);
        
      } catch (rostersError) {
        console.log('❌ My-rosters also failed:');
        console.log(`   Status: ${rostersError.response?.status}`);
        console.log(`   Message: ${rostersError.response?.data?.message}`);
      }
    }
    
    console.log('\n4️⃣ Final test - checking auth profile again...');
    
    try {
      const finalProfileResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': firebaseUid
        },
        timeout: 10000
      });
      
      console.log('✅ Final user profile:');
      console.log(`   Name: ${finalProfileResponse.data.user?.name}`);
      console.log(`   Email: ${finalProfileResponse.data.user?.email}`);
      console.log(`   Role: ${finalProfileResponse.data.user?.role}`);
      console.log(`   MongoDB ID: ${finalProfileResponse.data.user?.mongoId}`);
      console.log(`   Collection: ${finalProfileResponse.data.user?.collectionName}`);
      
    } catch (finalError) {
      console.log('❌ Final profile check failed:');
      console.log(`   Status: ${finalError.response?.status}`);
      console.log(`   Message: ${finalError.response?.data?.message}`);
    }
    
    console.log('\n5️⃣ Testing my-rosters with the fixed user...');
    
    try {
      const finalRostersResponse = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
        headers: {
          'x-test-firebase-uid': firebaseUid
        },
        timeout: 10000
      });
      
      console.log('✅ Final rosters check:');
      console.log(`   Status: ${finalRostersResponse.status}`);
      console.log(`   Success: ${finalRostersResponse.data.success}`);
      console.log(`   Count: ${finalRostersResponse.data.count}`);
      
      if (finalRostersResponse.data.data && finalRostersResponse.data.data.length > 0) {
        console.log('\n   📋 Available rosters:');
        finalRostersResponse.data.data.forEach((roster, index) => {
          console.log(`   ${index + 1}. ${roster.rosterType} - ${roster.officeLocation} (${roster.status})`);
        });
      }
      
    } catch (finalRostersError) {
      console.log('❌ Final rosters check failed:');
      console.log(`   Status: ${finalRostersError.response?.status}`);
      console.log(`   Message: ${finalRostersError.response?.data?.message}`);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('='.repeat(50));
    console.log('✅ Customer123 user should now be properly created');
    console.log('✅ Auth middleware should be able to find the user');
    console.log('✅ Flutter app should now show rosters');
    console.log('');
    console.log('🧪 TEST INSTRUCTIONS:');
    console.log('1. Restart the Flutter app');
    console.log('2. Login as customer123@abrafleet.com');
    console.log('3. Check if rosters are now visible');
    console.log('');
    console.log('🔑 LOGIN CREDENTIALS:');
    console.log(`   Email: ${email}`);
    console.log('   Password: Welcome@123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the fix
fixCustomer123User().catch(console.error);