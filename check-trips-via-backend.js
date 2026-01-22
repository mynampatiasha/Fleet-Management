const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function checkTripsViaBackend() {
  console.log('🔍 Checking trips via backend API...\n');
  
  try {
    // First, login as admin to get access
    console.log('📝 Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful\n');
    
    // Get all trips (admin endpoint)
    console.log('📊 Step 2: Fetching all trips...');
    const tripsResponse = await axios.get(`${BASE_URL}/api/admin-trips/all`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!tripsResponse.data.success) {
      throw new Error('Failed to fetch trips');
    }
    
    const trips = tripsResponse.data.data || [];
    console.log(`✅ Found ${trips.length} total trips\n`);
    
    if (trips.length === 0) {
      console.log('❌ No trips found in database');
      return;
    }
    
    // Analyze first trip
    console.log('📋 Sample Trip Structure:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(trips[0], null, 2));
    console.log('='.repeat(60));
    
    // Check customer-related fields
    console.log('\n🔍 Customer-related fields in trips:');
    const customerFields = [
      'customerId',
      'customerEmail',
      'customerFirebaseUid',
      'userId',
      'userEmail',
      'firebaseUid',
      'employeeId',
      'employeeEmail'
    ];
    
    const fieldCounts = {};
    customerFields.forEach(field => {
      fieldCounts[field] = trips.filter(trip => trip[field] != null).length;
    });
    
    Object.entries(fieldCounts).forEach(([field, count]) => {
      if (count > 0) {
        console.log(`✅ ${field}: ${count} trips have this field`);
        const sample = trips.find(trip => trip[field] != null);
        if (sample) {
          console.log(`   Sample value: ${sample[field]}`);
          console.log(`   Sample value type: ${typeof sample[field]}`);
        }
      } else {
        console.log(`❌ ${field}: No trips have this field`);
      }
    });
    
    // Check status breakdown
    console.log('\n📊 Trip Status Breakdown:');
    const statusCounts = {};
    trips.forEach(trip => {
      const status = trip.status || 'null';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`   ${status}: ${count} trips`);
      });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

checkTripsViaBackend();
