// test-maintenance-email.js - Test maintenance email functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

// Test data
const testMaintenanceData = {
  vehicleId: 'KA01AB1234', // This should be a real vehicle ID from your database
  maintenanceType: 'Oil Change',
  scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  vendorEmail: 'test@example.com', // Change this to your test email
  vendorName: 'Test Auto Service',
  vendorPhone: '+91 9876543210',
  description: 'Regular oil change service - Test email functionality',
  estimatedCost: 1500,
  priority: 'medium'
};

async function testMaintenanceEmail() {
  try {
    console.log('🔧 ========== TESTING MAINTENANCE EMAIL ==========');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Test Data:', JSON.stringify(testMaintenanceData, null, 2));
    console.log('===============================================\n');

    // Test 1: Check if backend is running
    console.log('1️⃣ Testing backend connection...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/health`);
      console.log('✅ Backend is running:', healthResponse.data);
    } catch (error) {
      console.log('❌ Backend connection failed:', error.message);
      console.log('💡 Make sure to run: npm start or node index.js in abra_fleet_backend folder');
      return;
    }

    // Test 2: Check email service configuration
    console.log('\n2️⃣ Testing email service configuration...');
    try {
      const emailTestResponse = await axios.get(`${API_BASE_URL}/api/test-email-config`);
      console.log('✅ Email service configured:', emailTestResponse.data);
    } catch (error) {
      console.log('⚠️ Email config test not available:', error.response?.data || error.message);
    }

    // Test 3: Schedule maintenance with email (without auth for testing)
    console.log('\n3️⃣ Testing maintenance scheduling with email...');
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/maintenance/schedule`,
        testMaintenanceData,
        {
          headers: {
            'Content-Type': 'application/json',
            // Note: In production, you need proper Firebase auth token
            // For testing, you might need to temporarily disable auth middleware
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      console.log('✅ Maintenance scheduled successfully!');
      console.log('Response:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log('\n📧 EMAIL STATUS:');
        console.log('   - Email should be sent to:', testMaintenanceData.vendorEmail);
        console.log('   - Check your email inbox for the maintenance request');
        console.log('   - Check backend logs for email sending details');
      }

    } catch (error) {
      console.log('❌ Maintenance scheduling failed:');
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 401) {
          console.log('\n💡 AUTHENTICATION REQUIRED:');
          console.log('   This endpoint requires Firebase authentication.');
          console.log('   To test without auth, temporarily comment out the auth middleware in index.js');
          console.log('   Line: app.use(\'/api/maintenance\', verifyToken, checkPermission(\'fleet\'), maintenanceRoutes);');
          console.log('   Change to: app.use(\'/api/maintenance\', maintenanceRoutes);');
        }
      } else {
        console.log('   Error:', error.message);
      }
    }

    // Test 4: Check if vehicles exist in database
    console.log('\n4️⃣ Testing vehicle existence...');
    try {
      const vehiclesResponse = await axios.get(`${API_BASE_URL}/api/admin/vehicles?limit=5`);
      if (vehiclesResponse.data.success && vehiclesResponse.data.data.length > 0) {
        console.log('✅ Vehicles found in database:');
        vehiclesResponse.data.data.forEach((vehicle, index) => {
          console.log(`   ${index + 1}. ${vehicle.registrationNumber || vehicle.vehicleNumber} (${vehicle.make} ${vehicle.model})`);
        });
        
        const firstVehicle = vehiclesResponse.data.data[0];
        console.log(`\n💡 Use this vehicle ID for testing: ${firstVehicle._id || firstVehicle.id}`);
        console.log(`   Registration: ${firstVehicle.registrationNumber || firstVehicle.vehicleNumber}`);
      } else {
        console.log('⚠️ No vehicles found in database');
        console.log('   Add some vehicles first before testing maintenance scheduling');
      }
    } catch (error) {
      console.log('❌ Failed to fetch vehicles:', error.response?.data || error.message);
    }

    console.log('\n🔧 ========== TEST COMPLETED ==========');
    console.log('📧 EMAIL VERIFICATION STEPS:');
    console.log('1. Check your email inbox for maintenance request');
    console.log('2. Check backend console logs for email sending status');
    console.log('3. Verify SMTP configuration in .env file');
    console.log('4. Make sure Gmail app password is correct');
    console.log('=====================================');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMaintenanceEmail();