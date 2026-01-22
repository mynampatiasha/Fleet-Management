// check-driver-via-backend.js
// Check driver through backend API

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function checkDriver() {
  try {
    console.log('🔍 Checking Driver Through Backend API');
    console.log('='.repeat(60));
    
    // First, let's login as admin to check drivers
    console.log('\n1. Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@abrafleet.com',
      password: 'Admin@123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Get all drivers
    console.log('\n2. Getting all drivers...');
    try {
      const driversResponse = await axios.get(
        `${BASE_URL}/api/admin-drivers`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const drivers = driversResponse.data.drivers || driversResponse.data.data || [];
      console.log(`✅ Found ${drivers.length} drivers`);
      
      // Show first few drivers
      console.log('\n📋 Available Drivers:');
      drivers.slice(0, 5).forEach((driver, index) => {
        console.log(`\n${index + 1}. ${driver.name || driver.personalInfo?.name}`);
        console.log(`   Email: ${driver.email || driver.personalInfo?.email}`);
        console.log(`   Driver ID: ${driver.driverId || driver._id}`);
        console.log(`   Firebase UID: ${driver.firebaseUid || 'Not set'}`);
      });
      
      // Try to find a driver with email containing 'driver'
      const testDriver = drivers.find(d => 
        (d.email || d.personalInfo?.email || '').toLowerCase().includes('driver')
      );
      
      if (testDriver) {
        console.log('\n3. Found test driver:');
        console.log('   Name:', testDriver.name || testDriver.personalInfo?.name);
        console.log('   Email:', testDriver.email || testDriver.personalInfo?.email);
        console.log('   Driver ID:', testDriver.driverId || testDriver._id);
        console.log('   Firebase UID:', testDriver.firebaseUid || 'Not set');
        
        // Try to get document status for this driver
        const driverId = testDriver.firebaseUid || testDriver.driverId || testDriver._id;
        console.log('\n4. Getting document status for this driver...');
        console.log('   Using ID:', driverId);
        
        try {
          const statusResponse = await axios.get(
            `${BASE_URL}/api/driver-documents/status/${driverId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          console.log('✅ Status retrieved successfully');
          console.log('   Response:', JSON.stringify(statusResponse.data, null, 2));
        } catch (error) {
          console.log('❌ Failed to get status:', error.response?.status, error.response?.data?.message);
          console.log('   Full error:', error.response?.data);
        }
      }
      
    } catch (error) {
      console.log('❌ Failed to get drivers:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

checkDriver();
