// Check pending rosters via API
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function checkPendingRosters() {
  try {
    console.log('🔍 Checking pending rosters via API...\n');
    
    // Use the Firebase token from the browser logs
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4OGQ1YTM3OWI3OGJkZjFlNTBhNDA5MTEzZjJiMGM3NWU0NTJlNDciLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY2NzYxMzc4LCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3NjY3NjQyMTMsImV4cCI6MTc2Njc2NzgxMywiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.XYieLXVVUejegVjKCrTvK8BsBoBvTisEj7ERDmclutp_fkQ9ZNW8VMpBVu00ztkEhkQIyUqEQw2KSmDqe6OZBzdRetmZuIvvRS2E_Qhob6yl8dJn_3vTvPfwiCLBUKCsBJHU4sJInPsF2hLa9HTVacfajAlq7-8UHdUSUu1jIo2ywUU2Mfj82fKwbR1tCLdWzARDBWWegoCRjVPqK-98K3dqv-l_Rzw5TglGG63fbnkBCd-4yNetiXB-FbELkMYYj9zpvdFhJfCUoav9I3LhvOEPmGw8ZB6H-AKMCp7EWac7rVacXXYC84AVd0sb7DuC7_KtTv2h6LLHVyiSTr3rwA';
    
    console.log('✅ Using Firebase token from browser');
    
    // Get pending rosters
    const rostersResponse = await axios.get(`${BASE_URL}/api/roster/admin/pending`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const rosters = rostersResponse.data.data || rostersResponse.data;
    console.log(`📋 Found ${rosters.length} pending rosters\n`);
    
    // Look for Nisha Jain and Ramesh Naidu specifically
    const targetCustomers = ['Nisha Jain', 'Ramesh Naidu'];
    
    rosters.forEach((roster, index) => {
      const customerName = roster.customerName || roster.employeeDetails?.name || 'Unknown';
      const isTarget = targetCustomers.includes(customerName);
      
      console.log(`${index + 1}. ${customerName} ${isTarget ? '🎯' : ''}`);
      console.log(`   Status: ${roster.status}`);
      console.log(`   Vehicle: ${roster.vehicleNumber || roster.assignedVehicleReg || 'Not assigned'}`);
      console.log(`   Driver: ${roster.driverName || roster.assignedDriverName || 'Not assigned'}`);
      console.log(`   ID: ${roster._id}`);
      console.log('');
    });
    
    // Check if target customers are in pending status
    const targetRosters = rosters.filter(roster => {
      const customerName = roster.customerName || roster.employeeDetails?.name || '';
      return targetCustomers.includes(customerName);
    });
    
    console.log(`🎯 Target customers found: ${targetRosters.length}`);
    targetRosters.forEach(roster => {
      const customerName = roster.customerName || roster.employeeDetails?.name;
      console.log(`   - ${customerName}: Status = ${roster.status}`);
    });
    
    if (targetRosters.length === 0) {
      console.log('\n❌ Target customers (Nisha Jain, Ramesh Naidu) not found in pending rosters!');
      console.log('💡 This means they are likely already assigned to other vehicles.');
      console.log('\n🔍 Let\'s check all rosters...');
      
      // Get all rosters
      const allRostersResponse = await axios.get(`${BASE_URL}/api/roster/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allRosters = allRostersResponse.data.data || allRostersResponse.data;
      console.log(`📋 Found ${allRosters.length} total rosters\n`);
      
      const allTargetRosters = allRosters.filter(roster => {
        const customerName = roster.customerName || roster.employeeDetails?.name || '';
        return targetCustomers.includes(customerName);
      });
      
      console.log(`🎯 Target customers in all rosters: ${allTargetRosters.length}`);
      allTargetRosters.forEach(roster => {
        const customerName = roster.customerName || roster.employeeDetails?.name;
        console.log(`   - ${customerName}: Status = ${roster.status}, Vehicle = ${roster.vehicleNumber || 'None'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkPendingRosters();