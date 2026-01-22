const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDriverProfile() {
  console.log('🧪 Testing Driver Profile API\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Login as a driver
    console.log('\n📝 Step 1: Login as driver...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'rajeshkumar@example.com', // Change to your test driver email
      password: 'password123',
      role: 'driver'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login successful');
    console.log('   - Token:', token.substring(0, 20) + '...');
    console.log('   - User ID:', userId);
    console.log('   - Email:', loginResponse.data.user.email);
    console.log('   - Role:', loginResponse.data.user.role);

    // Step 2: Fetch driver profile
    console.log('\n📝 Step 2: Fetching driver profile...');
    const profileResponse = await axios.get(`${BASE_URL}/api/drivers/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!profileResponse.data.success) {
      console.log('❌ Profile fetch failed:', profileResponse.data.message);
      return;
    }

    console.log('✅ Profile fetched successfully\n');
    console.log('=' .repeat(60));
    console.log('📋 DRIVER PROFILE DATA:');
    console.log('=' .repeat(60));
    
    const profile = profileResponse.data.data;
    
    console.log('\n🔹 Basic Info:');
    console.log('   - ID:', profile._id);
    console.log('   - User ID:', profile.userId);
    console.log('   - Driver ID:', profile.driverId);
    console.log('   - Name:', profile.name);
    console.log('   - Email:', profile.email);
    console.log('   - Phone:', profile.phoneNumber);
    console.log('   - Role:', profile.role);
    console.log('   - Status:', profile.status);

    console.log('\n🔹 Personal Info (nested):');
    if (profile.personalInfo) {
      console.log('   - First Name:', profile.personalInfo.firstName);
      console.log('   - Last Name:', profile.personalInfo.lastName);
      console.log('   - Email:', profile.personalInfo.email);
      console.log('   - Phone:', profile.personalInfo.phone);
    } else {
      console.log('   - Not available');
    }

    console.log('\n🔹 License Info:');
    if (profile.license) {
      console.log('   - License Number:', profile.license.licenseNumber);
      console.log('   - Expiry Date:', profile.license.expiryDate);
      console.log('   - Type:', profile.license.type);
    } else {
      console.log('   - Not available');
    }

    console.log('\n🔹 Address:');
    if (profile.address) {
      console.log('   - Street:', profile.address.street);
      console.log('   - City:', profile.address.city);
      console.log('   - State:', profile.address.state);
      console.log('   - Zip:', profile.address.zipCode);
    } else {
      console.log('   - Not available');
    }

    console.log('\n🔹 Emergency Contact:');
    if (profile.emergencyContact) {
      console.log('   - Name:', profile.emergencyContact.name);
      console.log('   - Phone:', profile.emergencyContact.phone);
      console.log('   - Relationship:', profile.emergencyContact.relationship);
    } else {
      console.log('   - Not available');
    }

    console.log('\n🔹 Assigned Vehicle:');
    if (profile.assignedVehicle) {
      console.log('   - Vehicle ID:', profile.assignedVehicle.vehicleId);
      console.log('   - Registration:', profile.assignedVehicle.registrationNumber);
      console.log('   - Make:', profile.assignedVehicle.make);
      console.log('   - Model:', profile.assignedVehicle.model);
      console.log('   - Type:', profile.assignedVehicle.type);
      console.log('   - Status:', profile.assignedVehicle.status);
    } else {
      console.log('   - No vehicle assigned');
    }

    console.log('\n🔹 Statistics:');
    if (profile.stats) {
      console.log('   - Total Trips:', profile.stats.totalTrips);
      console.log('   - Completed Trips:', profile.stats.completedTrips);
      console.log('   - Completion Rate:', profile.stats.completionRate + '%');
    }

    console.log('\n🔹 Recent Trips:');
    if (profile.recentTrips && profile.recentTrips.length > 0) {
      console.log(`   - Found ${profile.recentTrips.length} recent trips`);
      profile.recentTrips.forEach((trip, index) => {
        console.log(`   ${index + 1}. Trip ${trip.tripId} - ${trip.status}`);
      });
    } else {
      console.log('   - No recent trips');
    }

    console.log('\n🔹 Dates:');
    console.log('   - Joined:', profile.joinedDate);
    console.log('   - Created:', profile.createdAt);
    console.log('   - Updated:', profile.updatedAt);

    console.log('\n' + '=' .repeat(60));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('=' .repeat(60));

    // Step 3: Test what Flutter will receive
    console.log('\n📱 FLUTTER MAPPING TEST:');
    console.log('=' .repeat(60));
    console.log('The Driver.fromMap() will receive:');
    console.log('   - name:', profile.name);
    console.log('   - email:', profile.email);
    console.log('   - phoneNumber:', profile.phoneNumber);
    console.log('   - personalInfo.firstName:', profile.personalInfo?.firstName);
    console.log('   - personalInfo.lastName:', profile.personalInfo?.lastName);
    console.log('   - personalInfo.email:', profile.personalInfo?.email);
    console.log('   - personalInfo.phone:', profile.personalInfo?.phone);
    console.log('   - license.licenseNumber:', profile.license?.licenseNumber);
    console.log('   - assignedVehicle:', profile.assignedVehicle?.vehicleId || 'null');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.response) {
      console.error('   - Status:', error.response.status);
      console.error('   - Data:', error.response.data);
    }
  }
}

// Run the test
testDriverProfile();
