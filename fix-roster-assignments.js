// Fix roster assignments - Reset assigned rosters to pending
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function fixRosterAssignments() {
  try {
    console.log('🔧 Fixing roster assignments...\n');
    
    // Try to get Firebase token from the browser logs
    // You'll need to copy the token from the browser console
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4OGQ1YTM3OWI3OGJkZjFlNTBhNDA5MTEzZjJiMGM3NWU0NTJlNDciLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY2NzYxMzc4LCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3NjY3NjQyMTMsImV4cCI6MTc2Njc2NzgxMywiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.XYieLXVVUejegVjKCrTvK8BsBoBvTisEj7ERDmclutp_fkQ9ZNW8VMpBVu00ztkEhkQIyUqEQw2KSmDqe6OZBzdRetmZuIvvRS2E_Qhob6yl8dJn_3vTvPfwiCLBUKCsBJHU4sJInPsF2hLa9HTVacfajAlq7-8UHdUSUu1jIo2ywUU2Mfj82fKwbR1tCLdWzARDBWWegoCRjVPqK-98K3dqv-l_Rzw5TglGG63fbnkBCd-4yNetiXB-FbELkMYYj9zpvdFhJfCUoav9I3LhvOEPmGw8ZB6H-AKMCp7EWac7rVacXXYC84AVd0sb7DuC7_KtTv2h6LLHVyiSTr3rwA';
    
    console.log('✅ Using Firebase token from browser');
    
    // Get all rosters
    const rostersResponse = await axios.get(`${BASE_URL}/api/roster/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const rosters = rostersResponse.data.data || rostersResponse.data;
    console.log(`📋 Found ${rosters.length} total rosters\n`);
    
    // Find assigned rosters for Nisha Jain and Ramesh Naidu
    const targetCustomers = ['Nisha Jain', 'Ramesh Naidu'];
    const assignedRosters = rosters.filter(roster => {
      const customerName = roster.customerName || roster.employeeDetails?.name || '';
      return targetCustomers.includes(customerName) && roster.status === 'assigned';
    });
    
    console.log(`🎯 Found ${assignedRosters.length} assigned rosters for target customers:`);
    assignedRosters.forEach(roster => {
      const customerName = roster.customerName || roster.employeeDetails?.name;
      console.log(`   - ${customerName} (ID: ${roster._id}) - Vehicle: ${roster.vehicleNumber || 'Unknown'}`);
    });
    
    if (assignedRosters.length === 0) {
      console.log('✅ No assigned rosters found for target customers. They should be available for assignment.');
      return;
    }
    
    // Reset these rosters to pending status
    console.log('\n🔄 Resetting rosters to pending status...');
    
    for (const roster of assignedRosters) {
      try {
        const resetResponse = await axios.put(`${BASE_URL}/api/roster/${roster._id}/reset`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const customerName = roster.customerName || roster.employeeDetails?.name;
        console.log(`   ✅ ${customerName} - Reset to pending`);
      } catch (error) {
        console.log(`   ❌ Failed to reset ${roster.customerName}: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n✅ Roster reset complete. You can now try assigning the route again.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

fixRosterAssignments();