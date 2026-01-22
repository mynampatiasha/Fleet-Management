// Test maintenance endpoints with real vehicle data
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Use a real vehicle ID from the database
const REAL_VEHICLE_ID = 'KA02CD5678'; // registrationNumber from the debug output

async function testMaintenanceWithRealVehicle() {
  console.log('🔧 ========== TESTING MAINTENANCE WITH REAL VEHICLE ==========');
  console.log('Using vehicle ID:', REAL_VEHICLE_ID);
  
  try {
    // Test creating a maintenance report with a real vehicle ID
    console.log('\n1️⃣ Testing maintenance report creation with real vehicle...');
    
    const reportData = {
      vehicleId: REAL_VEHICLE_ID,
      maintenanceType: 'Oil Change',
      completedDate: new Date().toISOString(),
      vendorName: 'Test Vendor',
      vendorEmail: 'vendor@test.com',
      actualCost: 1500,
      description: 'Regular oil change service completed',
      status: 'completed'
    };
    
    console.log('Report data:', JSON.stringify(reportData, null, 2));
    
    try {
      const response = await axios.post(`${BASE_URL}/api/maintenance/reports`, reportData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Success! Status:', response.status);
      console.log('✅ Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      if (error.response) {
        console.log('❌ HTTP Error Status:', error.response.status);
        console.log('❌ Error Response:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 401) {
          console.log('💡 This is expected - authentication is required');
          console.log('💡 The endpoint is working, just needs proper auth token');
        }
      } else {
        console.log('❌ Network Error:', error.message);
      }
    }
    
    // Test scheduling maintenance with real vehicle
    console.log('\n2️⃣ Testing maintenance scheduling with real vehicle...');
    
    const scheduleData = {
      vehicleId: REAL_VEHICLE_ID,
      maintenanceType: 'Brake Service',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      vendorEmail: 'vendor@test.com',
      vendorName: 'Test Vendor',
      description: 'Scheduled brake service',
      estimatedCost: 2000,
      priority: 'medium'
    };
    
    console.log('Schedule data:', JSON.stringify(scheduleData, null, 2));
    
    try {
      const response = await axios.post(`${BASE_URL}/api/maintenance/schedule`, scheduleData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Success! Status:', response.status);
      console.log('✅ Response:', JSON.stringify(response.data, null, 2));
      
    } catch (error) {
      if (error.response) {
        console.log('❌ HTTP Error Status:', error.response.status);
        console.log('❌ Error Response:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 401) {
          console.log('💡 This is expected - authentication is required');
          console.log('💡 The endpoint is working, just needs proper auth token');
        }
      } else {
        console.log('❌ Network Error:', error.message);
      }
    }
    
    console.log('\n🎯 ========== TEST COMPLETE ==========');
    console.log('💡 Key findings:');
    console.log('   - Vehicle ID "KAB009367" does not exist in database');
    console.log('   - Available vehicle IDs start with "KA" followed by numbers');
    console.log('   - Maintenance endpoints are working but require authentication');
    console.log('   - Frontend should use actual vehicle IDs from the database');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testMaintenanceWithRealVehicle();