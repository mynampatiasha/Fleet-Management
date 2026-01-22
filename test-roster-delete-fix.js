const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testRosterDeleteFix() {
  console.log('🧪 Testing Roster Delete Fix...\n');

  try {
    // Step 1: Get a fresh Firebase token for customer123
    console.log('1️⃣ Getting Firebase token for customer123...');
    
    const authResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'customer123@example.com',
      password: 'password123'
    });

    if (!authResponse.data.success) {
      throw new Error('Failed to authenticate customer123');
    }

    const token = authResponse.data.token;
    console.log('✅ Authentication successful');

    // Step 2: Get customer's rosters to find one to delete
    console.log('\n2️⃣ Fetching customer rosters...');
    
    const rostersResponse = await axios.get(`${BASE_URL}/api/roster/customer/my-rosters`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!rostersResponse.data.success || !rostersResponse.data.data.length) {
      console.log('❌ No rosters found for customer123');
      return;
    }

    const rosters = rostersResponse.data.data;
    console.log(`✅ Found ${rosters.length} rosters`);

    // Find a roster that can be cancelled (not completed or already cancelled)
    const cancellableRoster = rosters.find(r => 
      r.status !== 'completed' && 
      r.status !== 'cancelled'
    );

    if (!cancellableRoster) {
      console.log('❌ No cancellable rosters found');
      return;
    }

    console.log(`📋 Testing with roster: ${cancellableRoster._id}`);
    console.log(`   Status: ${cancellableRoster.status}`);
    console.log(`   Customer Email: ${cancellableRoster.customerEmail}`);

    // Step 3: Test DELETE request
    console.log('\n3️⃣ Testing DELETE request...');
    
    const deleteResponse = await axios.delete(
      `${BASE_URL}/api/roster/customer/${cancellableRoster._id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (deleteResponse.data.success) {
      console.log('✅ DELETE SUCCESS!');
      console.log('📄 Response:', deleteResponse.data);
    } else {
      console.log('❌ DELETE FAILED:', deleteResponse.data.message);
    }

    // Step 4: Verify the roster was cancelled
    console.log('\n4️⃣ Verifying roster cancellation...');
    
    const verifyResponse = await axios.get(`${BASE_URL}/api/roster/customer/my-rosters`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedRoster = verifyResponse.data.data.find(r => r._id === cancellableRoster._id);
    
    if (updatedRoster && updatedRoster.status === 'cancelled') {
      console.log('✅ VERIFICATION SUCCESS: Roster status updated to cancelled');
    } else {
      console.log('❌ VERIFICATION FAILED: Roster status not updated');
      console.log('Current status:', updatedRoster?.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Test with wrong user (should fail with 403)
async function testUnauthorizedDelete() {
  console.log('\n🔒 Testing unauthorized delete (should fail with 403)...\n');

  try {
    // Get token for a different user
    console.log('1️⃣ Getting token for different user...');
    
    const authResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'pooja.joshi@example.com',
      password: 'password123'
    });

    if (!authResponse.data.success) {
      console.log('⚠️ Could not authenticate pooja.joshi, skipping unauthorized test');
      return;
    }

    const token = authResponse.data.token;
    console.log('✅ Authentication successful for pooja.joshi');

    // Try to delete customer123's roster (should fail)
    console.log('\n2️⃣ Attempting to delete another user\'s roster...');
    
    // Use a known roster ID from customer123
    const testRosterId = '694ce9909ceaf59f79334344'; // From the error message
    
    const deleteResponse = await axios.delete(
      `${BASE_URL}/api/roster/customer/${testRosterId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('❌ SECURITY ISSUE: Delete should have failed but succeeded!');
    console.log('Response:', deleteResponse.data);

  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('✅ SECURITY SUCCESS: Got expected 403 Forbidden');
      console.log('Message:', error.response.data.message);
    } else {
      console.error('❌ Unexpected error:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Roster Delete Fix Tests\n');
  console.log('=' .repeat(50));
  
  await testRosterDeleteFix();
  await testUnauthorizedDelete();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 Tests completed');
}

runAllTests();