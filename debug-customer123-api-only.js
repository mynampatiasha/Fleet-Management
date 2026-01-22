// debug-customer123-api-only.js
// Debug customer123 issue using API calls only

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function debugCustomer123API() {
  console.log('🔍 DEBUGGING CUSTOMER123 VIA API');
  console.log('='.repeat(50));
  
  // From Flutter logs
  const firebaseUid = 'b5aoloVR7xYI6SICibCIWecBaf82';
  const email = 'customer123@abrafleet.com';
  
  console.log(`Firebase UID: ${firebaseUid}`);
  console.log(`Email: ${email}`);
  
  try {
    console.log('\n1️⃣ Testing my-rosters endpoint...');
    
    const rostersResponse = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
      headers: {
        'x-test-firebase-uid': firebaseUid
      },
      timeout: 10000
    });
    
    console.log('✅ My-rosters API Response:');
    console.log(`   Status: ${rostersResponse.status}`);
    console.log(`   Success: ${rostersResponse.data.success}`);
    console.log(`   Message: ${rostersResponse.data.message}`);
    console.log(`   Count: ${rostersResponse.data.count}`);
    
    if (rostersResponse.data.data && rostersResponse.data.data.length > 0) {
      console.log('\n   📋 Rosters found:');
      rostersResponse.data.data.forEach((roster, index) => {
        console.log(`   ${index + 1}. ${roster.rosterType} - ${roster.officeLocation}`);
        console.log(`      Status: ${roster.status}`);
        console.log(`      Customer: ${roster.customerName} (${roster.customerEmail})`);
        console.log(`      Dates: ${roster.dateRange?.from} to ${roster.dateRange?.to}`);
        console.log(`      Times: ${roster.timeRange?.from} to ${roster.timeRange?.to}`);
        console.log('');
      });
    } else {
      console.log('   ❌ No rosters returned');
    }
    
  } catch (error) {
    console.log('❌ My-rosters API failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message}`);
    console.log(`   Error: ${error.message}`);
  }
  
  try {
    console.log('\n2️⃣ Testing auth profile endpoint...');
    
    const profileResponse = await axios.get(`${BACKEND_URL}/api/auth/profile`, {
      headers: {
        'x-test-firebase-uid': firebaseUid
      },
      timeout: 10000
    });
    
    console.log('✅ Auth profile response:');
    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   User: ${profileResponse.data.user?.name}`);
    console.log(`   Email: ${profileResponse.data.user?.email}`);
    console.log(`   Role: ${profileResponse.data.user?.role}`);
    console.log(`   UID: ${profileResponse.data.user?.uid}`);
    
  } catch (authError) {
    console.log('❌ Auth profile failed:');
    console.log(`   Status: ${authError.response?.status}`);
    console.log(`   Message: ${authError.response?.data?.message}`);
    console.log(`   This explains why Flutter shows 0 rosters!`);
  }
  
  try {
    console.log('\n3️⃣ Creating test rosters for customer123...');
    
    const testRosterData = {
      rosters: [
        {
          rosterType: 'both',
          officeLocation: 'Koramangala Office, Bangalore',
          weekdays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          fromDate: '2025-01-01',
          toDate: '2025-12-31',
          fromTime: '09:00',
          toTime: '18:00',
          loginPickupAddress: 'HSR Layout, Bangalore',
          logoutDropAddress: 'HSR Layout, Bangalore',
          notes: 'Test roster for customer123',
          employeeData: {
            name: 'Customer 123',
            email: email,
            phone: '+91-9876543210',
            department: 'IT',
            companyName: 'Abra Travels Demo Org'
          }
        }
      ]
    };
    
    const createResponse = await axios.post(`${BACKEND_URL}/api/roster/customer/bulk`, testRosterData, {
      headers: {
        'x-test-firebase-uid': firebaseUid,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ Roster creation response:');
    console.log(`   Status: ${createResponse.status}`);
    console.log(`   Success: ${createResponse.data.success}`);
    console.log(`   Message: ${createResponse.data.message}`);
    console.log(`   Successful: ${createResponse.data.data?.summary?.successful || 0}`);
    console.log(`   Failed: ${createResponse.data.data?.summary?.failed || 0}`);
    
  } catch (createError) {
    console.log('❌ Roster creation failed:');
    console.log(`   Status: ${createError.response?.status}`);
    console.log(`   Message: ${createError.response?.data?.message}`);
    console.log(`   Error: ${createError.message}`);
  }
  
  try {
    console.log('\n4️⃣ Testing my-rosters again after creation...');
    
    const rostersResponse2 = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
      headers: {
        'x-test-firebase-uid': firebaseUid
      },
      timeout: 10000
    });
    
    console.log('✅ My-rosters API Response (after creation):');
    console.log(`   Status: ${rostersResponse2.status}`);
    console.log(`   Success: ${rostersResponse2.data.success}`);
    console.log(`   Message: ${rostersResponse2.data.message}`);
    console.log(`   Count: ${rostersResponse2.data.count}`);
    
    if (rostersResponse2.data.data && rostersResponse2.data.data.length > 0) {
      console.log('\n   📋 Rosters now available:');
      rostersResponse2.data.data.forEach((roster, index) => {
        console.log(`   ${index + 1}. ${roster.rosterType} - ${roster.officeLocation} (${roster.status})`);
      });
    } else {
      console.log('   ❌ Still no rosters returned');
    }
    
  } catch (error) {
    console.log('❌ Second my-rosters API failed:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message}`);
  }
  
  console.log('\n📋 DIAGNOSIS:');
  console.log('='.repeat(50));
  console.log('The issue is likely that:');
  console.log('1. Customer123 user exists but rosters are not linked correctly');
  console.log('2. Auth profile endpoint is failing (404)');
  console.log('3. User might be in wrong collection or missing Firebase UID');
  console.log('');
  console.log('🔧 SOLUTION:');
  console.log('1. Create/update customer123 user with correct Firebase UID');
  console.log('2. Create test rosters linked to the user');
  console.log('3. Ensure auth middleware can find the user');
}

// Run the debug
debugCustomer123API().catch(console.error);