// Check what organizations exist in pending rosters
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function checkRosterOrganizations() {
  console.log('🔍 CHECKING ROSTER ORGANIZATIONS');
  console.log('='.repeat(50));
  
  try {
    const rostersResponse = await axios.get(`${BASE_URL}/roster/admin/pending`, {
      headers: {
        'x-test-firebase-uid': 'test-admin-uid'
      }
    });
    
    const pendingRosters = rostersResponse.data.data || [];
    console.log(`✅ Found ${pendingRosters.length} pending rosters`);
    
    // Group by organization
    const orgGroups = {};
    
    pendingRosters.forEach(roster => {
      // Extract organization from email domain
      const email = roster.customerEmail || roster.employeeDetails?.email;
      let org = 'Unknown Organization';
      
      if (email) {
        const domain = email.split('@')[1];
        switch (domain) {
          case 'techcorp.com':
            org = 'TechCorp Solutions';
            break;
          case 'innovate.com':
            org = 'Innovate Labs';
            break;
          case 'abrafleet.com':
            org = 'Abra Fleet Demo';
            break;
          case 'gmail.com':
            org = 'Individual Customer';
            break;
          default:
            // Use domain as organization name
            org = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1) + ' Corp';
            break;
        }
      }
      
      // Fallback to stored organization field if available
      if (!org || org === 'Unknown Organization') {
        org = roster.organization || 
              roster.employeeDetails?.organization || 
              roster.companyName || 
              roster.company || 
              'Unknown Organization';
      }
      
      if (!orgGroups[org]) {
        orgGroups[org] = [];
      }
      orgGroups[org].push(roster);
    });
    
    console.log('\n📊 Organizations found:');
    console.log('-'.repeat(50));
    
    Object.entries(orgGroups).forEach(([org, rosters]) => {
      console.log(`\n🏢 ${org}: ${rosters.length} rosters`);
      rosters.slice(0, 3).forEach((roster, index) => {
        const name = roster.customerName || roster.employeeDetails?.name || 'Unknown';
        const status = roster.status || 'unknown';
        console.log(`   ${index + 1}. ${name} (${status})`);
      });
      if (rosters.length > 3) {
        console.log(`   ... and ${rosters.length - 3} more`);
      }
    });
    
    console.log('\n🎯 SUITABLE FOR TESTING:');
    console.log('-'.repeat(50));
    
    Object.entries(orgGroups).forEach(([org, rosters]) => {
      if (rosters.length >= 3) {
        console.log(`✅ ${org}: ${rosters.length} rosters (can test with 3-4 customers)`);
      } else {
        console.log(`⚠️  ${org}: ${rosters.length} rosters (too few for testing)`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the check
checkRosterOrganizations();