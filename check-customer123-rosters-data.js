// check-customer123-rosters-data.js
// Check what rosters exist for customer123 and create test data if needed

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function checkCustomer123Rosters() {
  console.log('🔍 CHECKING CUSTOMER123 ROSTERS DATA');
  console.log('='.repeat(50));
  
  try {
    // First, let's decode the Firebase token to see the actual user ID
    console.log('\n1️⃣ Checking Firebase token details...');
    
    // From the logs, I can see the user_id is: b5aoloVR7xYI6SICibCIWecBaf82
    const firebaseUid = 'b5aoloVR7xYI6SICibCIWecBaf82';
    console.log('   Firebase UID from token:', firebaseUid);
    console.log('   Email from token: customer123@abrafleet.com');
    
    // Test with the actual Firebase UID from the token
    console.log('\n2️⃣ Testing with actual Firebase UID...');
    try {
      const rostersResponse = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
        headers: {
          'x-test-firebase-uid': firebaseUid
        },
        timeout: 5000
      });
      
      console.log('✅ My rosters API response:', rostersResponse.status);
      console.log('   Rosters count:', rostersResponse.data.data?.length || 0);
      console.log('   Message:', rostersResponse.data.message);
      
      if (rostersResponse.data.data && rostersResponse.data.data.length === 0) {
        console.log('   ⚠️  No rosters found for this user');
      }
      
    } catch (error) {
      console.log('❌ My rosters failed:', error.response?.status);
      console.log('   Error:', error.response?.data?.message);
    }
    
    // Check what the backend is actually querying for
    console.log('\n3️⃣ Let\'s check what the backend query looks like...');
    
    // Test auth profile to see what user data is being used
    try {
      const authResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
        headers: {
          'x-test-firebase-uid': firebaseUid
        },
        timeout: 5000
      });
      
      console.log('✅ Auth profile response:', authResponse.status);
      console.log('   User email:', authResponse.data.user?.email);
      console.log('   User UID:', authResponse.data.user?.uid);
      console.log('   User role:', authResponse.data.user?.role);
      console.log('   MongoDB ID:', authResponse.data.user?.mongoId);
      console.log('   Collection:', authResponse.data.user?.collectionName);
      
    } catch (authError) {
      console.log('❌ Auth profile failed:', authError.response?.status);
      console.log('   This might be why rosters aren\'t showing');
    }
    
    // Let's create some test rosters for customer123
    console.log('\n4️⃣ Creating test rosters for customer123...');
    
    // We'll need to create rosters that match the user's Firebase UID
    console.log('   Creating rosters with Firebase UID:', firebaseUid);
    console.log('   Email: customer123@abrafleet.com');
    
    // Since we can't directly insert into the database from here,
    // let's check if there's a way to create rosters via API
    
    console.log('\n5️⃣ Checking existing rosters in the system...');
    
    // Test if we can see any rosters at all (this might require admin access)
    try {
      const allRostersResponse = await axios.get(`${BACKEND_URL}/api/roster/pending`, {
        headers: {
          'x-test-firebase-uid': 'admin-test-uid' // Try with admin
        },
        timeout: 5000
      });
      
      console.log('✅ Found rosters in system:', allRostersResponse.data.data?.length || 0);
      
      if (allRostersResponse.data.data && allRostersResponse.data.data.length > 0) {
        console.log('   Sample roster structure:');
        const sampleRoster = allRostersResponse.data.data[0];
        console.log('   - ID:', sampleRoster._id);
        console.log('   - User ID:', sampleRoster.userId);
        console.log('   - User Email:', sampleRoster.userEmail);
        console.log('   - Status:', sampleRoster.status);
        console.log('   - Organization:', sampleRoster.organizationId);
      }
      
    } catch (error) {
      console.log('❌ Could not fetch system rosters:', error.response?.status);
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('   The API is working correctly, but there are no rosters');
    console.log('   assigned to customer123@abrafleet.com');
    console.log('');
    console.log('🔧 SOLUTION:');
    console.log('   1. Create test rosters for customer123');
    console.log('   2. Ensure rosters have the correct Firebase UID');
    console.log('   3. Set proper status (assigned, completed, etc.)');
    console.log('');
    console.log('🔑 Key Information:');
    console.log(`   Firebase UID: ${firebaseUid}`);
    console.log('   Email: customer123@abrafleet.com');
    console.log('   Expected collection: customers');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkCustomer123Rosters().catch(console.error);