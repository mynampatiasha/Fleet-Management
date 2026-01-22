// Check the actual structure of pending rosters
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function checkRosterStructure() {
  console.log('🔍 CHECKING ROSTER STRUCTURE');
  console.log('='.repeat(50));
  
  try {
    const rostersResponse = await axios.get(`${BASE_URL}/roster/admin/pending`, {
      headers: {
        'x-test-firebase-uid': 'test-admin-uid'
      }
    });
    
    const pendingRosters = rostersResponse.data.data || [];
    console.log(`✅ Found ${pendingRosters.length} pending rosters`);
    
    if (pendingRosters.length > 0) {
      console.log('\n📋 First roster structure:');
      console.log('-'.repeat(50));
      const firstRoster = pendingRosters[0];
      
      // Show all fields
      Object.keys(firstRoster).forEach(key => {
        const value = firstRoster[key];
        if (typeof value === 'object' && value !== null) {
          console.log(`${key}:`);
          if (Array.isArray(value)) {
            console.log(`   [Array with ${value.length} items]`);
          } else {
            Object.keys(value).forEach(subKey => {
              console.log(`   ${subKey}: ${value[subKey]}`);
            });
          }
        } else {
          console.log(`${key}: ${value}`);
        }
      });
      
      console.log('\n🎯 Organization fields check:');
      console.log('-'.repeat(50));
      console.log(`organization: ${firstRoster.organization}`);
      console.log(`companyName: ${firstRoster.companyName}`);
      console.log(`company: ${firstRoster.company}`);
      console.log(`employeeDetails?.organization: ${firstRoster.employeeDetails?.organization}`);
      console.log(`employeeDetails?.company: ${firstRoster.employeeDetails?.company}`);
      
      // Check a few more rosters
      console.log('\n📋 Sample of other rosters:');
      console.log('-'.repeat(50));
      pendingRosters.slice(1, 6).forEach((roster, index) => {
        const name = roster.customerName || roster.employeeDetails?.name || 'Unknown';
        const org = roster.organization || 
                   roster.employeeDetails?.organization || 
                   roster.companyName || 
                   roster.company || 
                   'Unknown';
        console.log(`${index + 2}. ${name} - ${org}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the check
checkRosterStructure();