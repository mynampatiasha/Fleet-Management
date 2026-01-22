const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testMyRostersFetch() {
  try {
    console.log('🧪 Testing My Rosters Fetch Issue\n');
    console.log('=' .repeat(60));
    
    // Step 1: Check if backend is running
    console.log('\n1️⃣ Checking backend health...');
    try {
      const healthResponse = await axios.get(`${BACKEND_URL}/health`);
      console.log('✅ Backend is running');
    } catch (error) {
      console.log('❌ Backend is not running. Please start it first.');
      return;
    }
    
    // Step 2: Test with a test Firebase UID (simulating customer login)
    const testFirebaseUid = 'test-customer-uid-123';
    const testEmail = 'testcustomer@abrafleet.com';
    
    console.log('\n2️⃣ Testing my-rosters endpoint...');
    console.log(`   Using Firebase UID: ${testFirebaseUid}`);
    console.log(`   Using Email: ${testEmail}`);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/roster/customer/my-rosters`, {
        headers: {
          'x-test-firebase-uid': testFirebaseUid,
          'x-test-email': testEmail
        }
      });
      
      console.log('\n✅ API Response:');
      console.log(`   Success: ${response.data.success}`);
      console.log(`   Message: ${response.data.message}`);
      console.log(`   Rosters Count: ${response.data.data?.length || 0}`);
      
      if (response.data.data && response.data.data.length > 0) {
        console.log('\n📋 Sample Roster Data:');
        const firstRoster = response.data.data[0];
        console.log(`   ID: ${firstRoster._id}`);
        console.log(`   Status: ${firstRoster.status}`);
        console.log(`   Office Location: ${firstRoster.officeLocation}`);
        console.log(`   Customer Email: ${firstRoster.customerEmail}`);
        console.log(`   Date Range: ${JSON.stringify(firstRoster.dateRange)}`);
        console.log(`   Time Range: ${JSON.stringify(firstRoster.timeRange)}`);
      } else {
        console.log('\n⚠️  No rosters found for this user');
        console.log('   This could mean:');
        console.log('   1. No rosters have been created yet');
        console.log('   2. The user email doesn\'t match any rosters in DB');
        console.log('   3. The rosters are stored with a different email format');
      }
      
    } catch (error) {
      console.log('\n❌ Error fetching rosters:');
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || error.message}`);
        console.log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   ${error.message}`);
      }
    }
    
    // Step 3: Check database directly
    console.log('\n3️⃣ Checking database directly...');
    console.log('   Run this MongoDB query to check rosters:');
    console.log('   db.rosters.find({}).limit(5).pretty()');
    console.log('\n   Or check for specific user:');
    console.log(`   db.rosters.find({ customerEmail: "${testEmail}" }).pretty()`);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
  }
}

testMyRostersFetch();
