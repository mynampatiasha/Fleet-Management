// Quick test to check driver dashboard data
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testDriverDashboard() {
  console.log('🧪 Testing Driver Dashboard Data...\n');
  
  // Test credentials
  const driverEmail = 'drivertest@gmail.com';
  const driverPassword = 'drivertest';
  
  try {
    // 1. Login
    console.log('1️⃣ Logging in as driver...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: driverEmail,
      password: driverPassword
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log(`✅ Login successful - User ID: ${userId}\n`);
    
    const headers = { Authorization: `Bearer ${token}` };
    
    // 2. Test Dashboard Stats
    console.log('2️⃣ Fetching dashboard stats...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/driver/dashboard/stats`, { headers });
      console.log('✅ Dashboard Stats:', JSON.stringify(statsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Dashboard Stats Error:', error.response?.data || error.message);
    }
    console.log('');
    
    // 3. Test Vehicle Check
    console.log('3️⃣ Fetching vehicle check...');
    try {
      const vehicleResponse = await axios.get(`${BASE_URL}/api/driver/vehicle/check`, { headers });
      console.log('✅ Vehicle Check:', JSON.stringify(vehicleResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Vehicle Check Error:', error.response?.data || error.message);
    }
    console.log('');
    
    // 4. Test Today's Route
    console.log('4️⃣ Fetching today\'s route...');
    try {
      const routeResponse = await axios.get(`${BASE_URL}/api/driver/route/today`, { headers });
      console.log('✅ Today\'s Route:');
      console.log('   - Has Route:', routeResponse.data.hasRoute);
      console.log('   - Vehicle:', routeResponse.data.vehicle?.registrationNumber || 'None');
      console.log('   - Customers:', routeResponse.data.customers?.length || 0);
      
      if (routeResponse.data.customers && routeResponse.data.customers.length > 0) {
        console.log('\n   Customer Details:');
        routeResponse.data.customers.forEach((customer, index) => {
          console.log(`   ${index + 1}. ${customer.name}`);
          console.log(`      - Phone: ${customer.phone}`);
          console.log(`      - Sequence: ${customer.pickupSequence || 'N/A'}`);
          console.log(`      - From: ${customer.fromLocation || 'N/A'}`);
          console.log(`      - To: ${customer.toLocation || 'N/A'}`);
          console.log(`      - Distance: ${customer.distance || 'N/A'} KM`);
          console.log(`      - Status: ${customer.status || 'N/A'}`);
        });
      }
    } catch (error) {
      console.log('❌ Today\'s Route Error:', error.response?.data || error.message);
    }
    console.log('');
    
    // 5. Test SOS History
    console.log('5️⃣ Fetching SOS history...');
    try {
      const sosResponse = await axios.get(`${BASE_URL}/api/sos/history/${userId}`, { headers });
      console.log('✅ SOS History:', sosResponse.data.data?.length || 0, 'alerts');
    } catch (error) {
      console.log('❌ SOS History Error:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Driver Dashboard Test Complete!');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
  }
}

testDriverDashboard();
