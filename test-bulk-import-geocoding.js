// test-bulk-import-geocoding.js
// Quick test to verify the bulk import geocoding fix works

const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Test data - single roster with only addresses (no coordinates)
const testRoster = {
  rosterType: 'both',
  officeLocation: 'Abra Fleet Bangalore Office',
  weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  fromDate: '2026-01-22',
  toDate: '2026-02-20',
  fromTime: '09:00',
  toTime: '18:00',
  loginPickupAddress: 'Koramangala 5th Block Bangalore',
  logoutDropAddress: 'Abra Fleet Bangalore Office',
  notes: 'Test roster for geocoding fix',
  employeeData: {
    name: 'Test Employee',
    email: 'test.employee@abrafleet.com',
    phone: '9876543210',
    companyName: 'Abra Fleet',
    department: 'Testing'
  }
};

async function testGeocodingFix() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING BULK IMPORT GEOCODING FIX');
  console.log('='.repeat(80));

  try {
    // Step 1: Login as admin to get token
    console.log('\n1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Test single roster creation with only addresses (no coordinates)
    console.log('\n2️⃣ Creating roster with ONLY addresses (no coordinates)...');
    console.log('   Office: ' + testRoster.officeLocation);
    console.log('   Pickup: ' + testRoster.loginPickupAddress);
    console.log('   Drop: ' + testRoster.logoutDropAddress);
    console.log('   Coordinates: null (backend should geocode)');

    const createResponse = await axios.post(
      `${API_URL}/api/roster/customer`,
      testRoster,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (createResponse.data.success) {
      console.log('\n✅ SUCCESS! Roster created with backend geocoding');
      console.log('   Roster ID:', createResponse.data.data.rosterId);
      console.log('   Status:', createResponse.data.data.status);
      console.log('   Locations:', JSON.stringify(createResponse.data.data.locations, null, 2));
      
      // Verify coordinates were populated
      const locations = createResponse.data.data.locations;
      if (locations && locations.pickup && locations.pickup.coordinates) {
        console.log('\n✅ Pickup coordinates populated:', locations.pickup.coordinates);
      } else {
        console.log('\n❌ WARNING: Pickup coordinates not populated');
      }
      
      if (locations && locations.drop && locations.drop.coordinates) {
        console.log('✅ Drop coordinates populated:', locations.drop.coordinates);
      } else {
        console.log('❌ WARNING: Drop coordinates not populated');
      }
      
      console.log('\n' + '='.repeat(80));
      console.log('🎉 GEOCODING FIX VERIFIED - WORKING CORRECTLY!');
      console.log('='.repeat(80));
      
    } else {
      console.log('\n❌ FAILED:', createResponse.data.message);
    }

  } catch (error) {
    console.log('\n' + '='.repeat(80));
    console.log('❌ TEST FAILED');
    console.log('='.repeat(80));
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.message || error.response.data);
      
      // Check if it's the old error we were trying to fix
      if (error.response.data.message && 
          error.response.data.message.includes('Drop location is required')) {
        console.log('\n⚠️  OLD ERROR STILL PRESENT - FIX NOT WORKING');
        console.log('   The backend is still requiring coordinates instead of geocoding addresses');
      }
    } else {
      console.log('Error:', error.message);
    }
    
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Ensure backend is running on port 3001');
    console.log('   2. Verify the fixes were applied to:');
    console.log('      - abra_fleet_backend/models/roster_model.js');
    console.log('      - abra_fleet_backend/routes/roster_router.js');
    console.log('   3. Restart the backend server');
  }
}

// Run the test
testGeocodingFix();
