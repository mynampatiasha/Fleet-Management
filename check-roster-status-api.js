// Check roster status via API
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function checkRosterStatus() {
  try {
    console.log('🔍 Checking roster status via API...\n');
    
    // Get admin token first
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@abrafleet.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Get pending rosters
    const rostersResponse = await axios.get(`${BASE_URL}/api/roster/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const rosters = rostersResponse.data.data || rostersResponse.data;
    console.log(`📋 Found ${rosters.length} rosters\n`);
    
    // Check status of each roster
    rosters.forEach((roster, index) => {
      console.log(`${index + 1}. ${roster.customerName || roster.employeeDetails?.name || 'Unknown'}`);
      console.log(`   Status: ${roster.status}`);
      console.log(`   Vehicle: ${roster.vehicleNumber || roster.assignedVehicleReg || 'Not assigned'}`);
      console.log(`   Driver: ${roster.driverName || roster.assignedDriverName || 'Not assigned'}`);
      console.log(`   ID: ${roster._id}`);
      console.log('');
    });
    
    // Count by status
    const statusCounts = rosters.reduce((acc, roster) => {
      acc[roster.status] = (acc[roster.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📊 Status Summary:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkRosterStatus();