const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDriverProfileEndpoint() {
  console.log('🧪 Testing Driver Profile Endpoint\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Login as a driver
    console.log('\n📝 Step 1: Login as driver...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'rajesh.kumar@abrafleet.com', // Real driver email from demo setup
      password: 'Rajesh123!'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.message);
    }

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('   Token:', token.substring(0, 20) + '...');
    console.log('   User:', loginResponse.data.user.name);
    console.log('   Role:', loginResponse.data.user.role);

    // Step 2: Fetch driver profile
    console.log('\n📝 Step 2: Fetching driver profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/drivers/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!profileResponse.data.success) {
      throw new Error('Profile fetch failed: ' + profileResponse.data.message);
    }

    const profile = profileResponse.data.data;
    console.log('✅ Profile fetched successfully');
    console.log('\n📋 Profile Data:');
    console.log('   Name:', profile.name);
    console.log('   Email:', profile.email);
    console.log('   Phone:', profile.phoneNumber);
    console.log('   Driver ID:', profile.driverId);
    console.log('   Status:', profile.status);
    console.log('   License Number:', profile.license?.number || 'Not provided');
    console.log('   License Expiry:', profile.license?.expiryDate || 'Not provided');
    console.log('   Assigned Vehicle:', profile.assignedVehicle?.vehicleId || 'Not assigned');
    console.log('   Address:', profile.address || 'Not provided');
    
    console.log('\n📊 Stats:');
    console.log('   Total Trips:', profile.stats?.totalTrips || 0);
    console.log('   Completed Trips:', profile.stats?.completedTrips || 0);
    console.log('   Completion Rate:', profile.stats?.completionRate || 0, '%');

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    console.log('\n' + '='.repeat(60));
    process.exit(1);
  }
}

// Run the test
testDriverProfileEndpoint();
