// Unassign Nisha Jain and Ramesh Naidu from their current vehicle
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function unassignCustomers() {
  try {
    console.log('🔧 Unassigning customers from current vehicle...\n');
    
    // Use the Firebase token from the browser logs
    const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4OGQ1YTM3OWI3OGJkZjFlNTBhNDA5MTEzZjJiMGM3NWU0NTJlNDciLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWJyYWZsZWV0LWNlYzk0IiwiYXVkIjoiYWJyYWZsZWV0LWNlYzk0IiwiYXV0aF90aW1lIjoxNzY2NzYxMzc4LCJ1c2VyX2lkIjoicW53cDhkMGNsRFNTTnVTbTN1Z21YWUxTSTNLMiIsInN1YiI6InFud3A4ZDBjbERTU051U20zdWdtWFlMU0kzSzIiLCJpYXQiOjE3NjY3NjQyMTMsImV4cCI6MTc2Njc2NzgxMywiZW1haWwiOiJhZG1pbkBhYnJhZmxlZXQuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImFkbWluQGFicmFmbGVldC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.XYieLXVVUejegVjKCrTvK8BsBoBvTisEj7ERDmclutp_fkQ9ZNW8VMpBVu00ztkEhkQIyUqEQw2KSmDqe6OZBzdRetmZuIvvRS2E_Qhob6yl8dJn_3vTvPfwiCLBUKCsBJHU4sJInPsF2hLa9HTVacfajAlq7-8UHdUSUu1jIo2ywUU2Mfj82fKwbR1tCLdWzARDBWWegoCRjVPqK-98K3dqv-l_Rzw5TglGG63fbnkBCd-4yNetiXB-FbELkMYYj9zpvdFhJfCUoav9I3LhvOEPmGw8ZB6H-AKMCp7EWac7rVacXXYC84AVd0sb7DuC7_KtTv2h6LLHVyiSTr3rwA';
    
    console.log('✅ Using Firebase token from browser');
    
    // Get all assigned rosters
    const rostersResponse = await axios.get(`${BASE_URL}/api/roster/admin/approved`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const rosters = rostersResponse.data.data || rostersResponse.data;
    console.log(`📋 Found ${rosters.length} assigned rosters\n`);
    
    // Find Nisha Jain and Ramesh Naidu
    const targetCustomers = ['Nisha Jain', 'Ramesh Naidu'];
    const targetRosters = rosters.filter(roster => {
      const customerName = roster.customerName || roster.employeeDetails?.name || '';
      return targetCustomers.includes(customerName) && roster.status === 'assigned';
    });
    
    console.log(`🎯 Found ${targetRosters.length} assigned rosters for target customers:`);
    targetRosters.forEach(roster => {
      const customerName = roster.customerName || roster.employeeDetails?.name;
      console.log(`   - ${customerName} (ID: ${roster._id}) - Vehicle: ${roster.vehicleNumber || 'Unknown'}`);
    });
    
    if (targetRosters.length === 0) {
      console.log('✅ No assigned rosters found for target customers. They should be available for assignment.');
      return;
    }
    
    // Unassign these rosters
    console.log('\n🔄 Unassigning rosters...');
    
    for (const roster of targetRosters) {
      try {
        // Try different unassign endpoints
        let unassigned = false;
        
        // Method 1: Try updating the roster directly
        try {
          const updateResponse = await axios.put(`${BASE_URL}/api/roster/admin/edit-assignment/${roster._id}`, {
            action: 'unassign',
            status: 'pending_assignment'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const customerName = roster.customerName || roster.employeeDetails?.name;
          console.log(`   ✅ ${customerName} - Unassigned successfully (Method 1)`);
          unassigned = true;
        } catch (error1) {
          console.log(`   ⚠️  Method 1 failed for ${roster.customerName}: ${error1.response?.data?.message || error1.message}`);
        }
        
        // Method 2: Try deleting the assignment
        if (!unassigned) {
          try {
            const deleteResponse = await axios.delete(`${BASE_URL}/api/roster/admin/assignment/${roster._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            const customerName = roster.customerName || roster.employeeDetails?.name;
            console.log(`   ✅ ${customerName} - Unassigned successfully (Method 2)`);
            unassigned = true;
          } catch (error2) {
            console.log(`   ⚠️  Method 2 failed for ${roster.customerName}: ${error2.response?.data?.message || error2.message}`);
          }
        }
        
        if (!unassigned) {
          console.log(`   ❌ Failed to unassign ${roster.customerName} - Try manually in the UI`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error unassigning ${roster.customerName}: ${error.response?.data?.message || error.message}`);
      }
    }
    
    console.log('\n✅ Unassignment process complete.');
    console.log('💡 Now you can try assigning the route again in the UI.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

unassignCustomers();