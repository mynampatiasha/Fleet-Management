// Test script to verify the complete roster creation to My Trips flow
const axios = require('axios');

async function testRosterToMyTripsFlow() {
  try {
    console.log('🧪 Testing complete roster creation to My Trips flow\n');

    // You'll need to replace this with a valid customer token
    // Get this from the Flutter app after login
    const customerToken = 'YOUR_CUSTOMER_TOKEN_HERE';
    
    if (customerToken === 'YOUR_CUSTOMER_TOKEN_HERE') {
      console.log('❌ Please replace YOUR_CUSTOMER_TOKEN_HERE with a valid customer token');
      console.log('📝 To get a token:');
      console.log('   1. Login to the Flutter app as a customer');
      console.log('   2. Check the network requests or debug logs for the Authorization header');
      console.log('   3. Copy the Bearer token (without "Bearer " prefix)');
      console.log('   4. Replace YOUR_CUSTOMER_TOKEN_HERE in this script');
      return;
    }

    const baseUrl = 'http://localhost:3001';

    // Step 1: Test backend health
    console.log('🏥 Step 1: Testing backend health...');
    try {
      const healthResponse = await axios.get(`${baseUrl}/api/health`);
      console.log('✅ Backend is healthy');
    } catch (e) {
      console.log('⚠️ Backend health check failed, but continuing...');
    }

    // Step 2: Create a test roster
    console.log('\n📝 Step 2: Creating a test roster...');
    
    const rosterData = {
      rosterType: 'both',
      officeLocation: 'Test Office Location - ' + new Date().toISOString(),
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      fromDate: new Date().toISOString(),
      toDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      fromTime: '09:00',
      toTime: '18:00',
      loginPickupAddress: 'Test Pickup Address - ' + Date.now(),
      logoutDropAddress: 'Test Drop Address - ' + Date.now(),
      notes: 'Test roster created by automation script'
    };

    console.log('📋 Roster data to create:');
    console.log(JSON.stringify(rosterData, null, 2));

    const createResponse = await axios.post(
      `${baseUrl}/api/roster/customer`,
      rosterData,
      {
        headers: {
          'Authorization': `Bearer ${customerToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('✅ Roster creation response:');
    console.log('   Success:', createResponse.data.success);
    console.log('   Message:', createResponse.data.message);
    console.log('   Roster ID:', createResponse.data.data?.rosterId || createResponse.data.data?._id);

    if (!createResponse.data.success) {
      throw new Error('Roster creation failed: ' + createResponse.data.message);
    }

    const createdRosterId = createResponse.data.data?.rosterId || createResponse.data.data?._id;

    // Step 3: Wait a moment for data to be saved
    console.log('\n⏳ Step 3: Waiting for data to be saved...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Fetch My Rosters
    console.log('\n📋 Step 4: Fetching My Rosters...');
    
    const fetchResponse = await axios.get(
      `${baseUrl}/api/roster/customer/my-rosters`,
      {
        headers: {
          'Authorization': `Bearer ${customerToken}`
        },
        timeout: 10000
      }
    );

    console.log('✅ My Rosters fetch response:');
    console.log('   Success:', fetchResponse.data.success);
    console.log('   Message:', fetchResponse.data.message);
    console.log('   Total rosters:', fetchResponse.data.data?.length || 0);
    console.log('   Count field:', fetchResponse.data.count);

    if (!fetchResponse.data.success) {
      throw new Error('Fetching rosters failed: ' + fetchResponse.data.message);
    }

    // Step 5: Verify the created roster appears
    console.log('\n🔍 Step 5: Verifying created roster appears in My Rosters...');
    
    const rosters = fetchResponse.data.data || [];
    console.log('📊 Available roster IDs:', rosters.map(r => r.rosterId || r._id || r.id));

    const foundRoster = rosters.find(r => 
      (r.rosterId === createdRosterId) || 
      (r._id === createdRosterId) || 
      (r.id === createdRosterId) ||
      (r.officeLocation && r.officeLocation.includes('Test Office Location'))
    );

    if (foundRoster) {
      console.log('🎉 SUCCESS: Created roster appears in My Trips!');
      console.log('📋 Found roster details:');
      console.log('   ID:', foundRoster.id || foundRoster._id);
      console.log('   Roster ID:', foundRoster.rosterId);
      console.log('   Type:', foundRoster.rosterType);
      console.log('   Status:', foundRoster.status);
      console.log('   Office:', foundRoster.officeLocation);
      console.log('   Date Range:', foundRoster.dateRange);
      console.log('   Time Range:', foundRoster.timeRange);
      console.log('   Weekdays:', foundRoster.weekdays);
      
      console.log('\n✅ FLOW TEST PASSED: Roster creation → My Trips display works correctly!');
    } else {
      console.log('❌ ISSUE: Created roster does NOT appear in My Trips');
      console.log('🔍 Debug info:');
      console.log('   Created roster ID:', createdRosterId);
      console.log('   Available rosters:', rosters.length);
      
      if (rosters.length > 0) {
        console.log('   First roster sample:');
        const sample = rosters[0];
        console.log('     ID:', sample.id || sample._id);
        console.log('     Roster ID:', sample.rosterId);
        console.log('     Office:', sample.officeLocation);
        console.log('     Status:', sample.status);
      }
      
      console.log('\n❌ FLOW TEST FAILED: Created roster not found in My Trips');
    }

    // Step 6: Test filtering (optional)
    console.log('\n🔍 Step 6: Testing roster filtering...');
    
    const filterResponse = await axios.get(
      `${baseUrl}/api/roster/customer/my-rosters?status=pending_assignment`,
      {
        headers: {
          'Authorization': `Bearer ${customerToken}`
        }
      }
    );

    console.log('✅ Filtered rosters (pending_assignment):');
    console.log('   Count:', filterResponse.data.data?.length || 0);

  } catch (error) {
    console.error('\n❌ Test failed with error:');
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
      console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('   Network Error: No response received');
      console.error('   Request:', error.request);
    } else {
      console.error('   Error:', error.message);
    }
    
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Make sure the backend is running on localhost:3001');
    console.error('   2. Verify the customer token is valid and not expired');
    console.error('   3. Check that the customer user exists in admin_users collection');
    console.error('   4. Ensure MongoDB is running and accessible');
  }
}

console.log('🚀 Starting Roster → My Trips Flow Test');
console.log('=' .repeat(60));
testRosterToMyTripsFlow();