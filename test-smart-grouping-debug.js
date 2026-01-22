// test-smart-grouping-debug.js
// Test smart grouping with admin token

const axios = require('axios');
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = require('./abra_fleet_backend/abra-travels-firebase-adminsdk-oa4qy-b7c1b8b5b8.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://abra-travels-default-rtdb.firebaseio.com"
  });
}

const BASE_URL = 'http://localhost:3001/api';

async function testSmartGroupingWithDebug() {
  try {
    console.log('🔍 Testing Smart Grouping with Debug Info...\n');
    
    // Create admin token
    console.log('🔐 Creating admin token...');
    const customToken = await admin.auth().createCustomToken('admin-test-uid', {
      role: 'admin',
      email: 'admin@abrafleet.com'
    });
    
    // Exchange for ID token
    const tokenResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=AIzaSyBqTOqKJYmKJYmKJYmKJYmKJYmKJYmKJYmK`,
      {
        token: customToken,
        returnSecureToken: true
      }
    );
    
    const idToken = tokenResponse.data.idToken;
    console.log('✅ Admin token created');
    
    // Test smart grouping
    console.log('\n🔍 Testing smart grouping...');
    const groupingResponse = await axios.post(
      `${BASE_URL}/roster/admin/group-similar`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    if (groupingResponse.data.success) {
      const data = groupingResponse.data.data;
      const groups = data.groups || [];
      const totalRosters = data.totalRosters || 0;
      
      console.log(`✅ Smart grouping completed:`);
      console.log(`   - Total rosters: ${totalRosters}`);
      console.log(`   - Total groups: ${groups.length}`);
      
      if (totalRosters === 0) {
        console.log('\n⚠️  No pending rosters found!');
        console.log('   Make sure there are pending rosters in the database.');
        return;
      }
      
      console.log(`   - Ratio: ${(groups.length / totalRosters).toFixed(2)} groups per roster`);
      
      // Analyze the issue
      if (groups.length === totalRosters) {
        console.log('\n❌ ISSUE CONFIRMED: Each roster is in its own group!');
        console.log('   This means no rosters share the same grouping criteria.');
      } else if (groups.length > totalRosters) {
        console.log('\n❌ CRITICAL BUG: More groups than rosters!');
      } else {
        console.log('\n✅ Grouping is working correctly');
      }
      
      // Show detailed group analysis
      console.log('\n📊 Detailed Group Analysis:');
      
      // Count groups by size
      const groupSizes = {};
      groups.forEach(group => {
        const size = group.employeeCount || 0;
        groupSizes[size] = (groupSizes[size] || 0) + 1;
      });
      
      console.log('\n📈 Group size distribution:');
      Object.keys(groupSizes).sort((a, b) => parseInt(a) - parseInt(b)).forEach(size => {
        console.log(`   - ${groupSizes[size]} groups with ${size} member(s)`);
      });
      
      // Show groups with multiple members
      const multiMemberGroups = groups.filter(g => (g.employeeCount || 0) > 1);
      if (multiMemberGroups.length > 0) {
        console.log(`\n✅ Groups with multiple members (${multiMemberGroups.length}):`);
        multiMemberGroups.forEach((group, idx) => {
          console.log(`\n   Group ${idx + 1}:`);
          console.log(`   - Members: ${group.employeeCount}`);
          console.log(`   - Domain: ${group.emailDomain || 'Unknown'}`);
          console.log(`   - Location: ${group.loginLocation || 'Unknown'}`);
          console.log(`   - Times: ${group.loginTime || 'Unknown'} - ${group.logoutTime || 'Unknown'}`);
          console.log(`   - Type: ${group.rosterType || 'Unknown'}`);
          console.log(`   - Names: ${(group.employees || []).map(e => e.name).join(', ')}`);
        });
      }
      
      // Show single-member groups (the problem)
      const singleMemberGroups = groups.filter(g => (g.employeeCount || 0) === 1);
      if (singleMemberGroups.length > 0) {
        console.log(`\n⚠️  Single-member groups (${singleMemberGroups.length}):`);
        console.log('   These are the groups causing the issue...');
        
        // Analyze why they're not grouping
        const domains = new Set();
        const locations = new Set();
        const times = new Set();
        const types = new Set();
        
        singleMemberGroups.slice(0, 10).forEach((group, idx) => {
          console.log(`\n   Single Group ${idx + 1}:`);
          console.log(`   - Domain: ${group.emailDomain || 'Unknown'}`);
          console.log(`   - Location: ${group.loginLocation || 'Unknown'}`);
          console.log(`   - Times: ${group.loginTime || 'Unknown'} - ${group.logoutTime || 'Unknown'}`);
          console.log(`   - Type: ${group.rosterType || 'Unknown'}`);
          console.log(`   - Employee: ${(group.employees || [])[0]?.name || 'Unknown'}`);
          
          domains.add(group.emailDomain || 'Unknown');
          locations.add(group.loginLocation || 'Unknown');
          times.add(`${group.loginTime || 'Unknown'}-${group.logoutTime || 'Unknown'}`);
          types.add(group.rosterType || 'Unknown');
        });
        
        console.log(`\n🔍 Diversity in single-member groups (first 10):`);
        console.log(`   - Unique domains: ${domains.size}`);
        console.log(`   - Unique locations: ${locations.size}`);
        console.log(`   - Unique time slots: ${times.size}`);
        console.log(`   - Unique types: ${types.size}`);
        
        if (domains.size === singleMemberGroups.slice(0, 10).length) {
          console.log('\n❌ ROOT CAUSE: Every employee has a different email domain!');
          console.log('   Each employee is from a different company.');
        } else if (locations.size === singleMemberGroups.slice(0, 10).length) {
          console.log('\n❌ ROOT CAUSE: Every employee has a different office location!');
        } else if (times.size === singleMemberGroups.slice(0, 10).length) {
          console.log('\n❌ ROOT CAUSE: Every employee has different time schedules!');
        } else {
          console.log('\n🔍 ROOT CAUSE: Mixed - employees differ in multiple criteria');
        }
      }
      
      console.log('\n💡 RECOMMENDATIONS:');
      if (singleMemberGroups.length === groups.length) {
        console.log('   1. Consider grouping by location only (ignore company)');
        console.log('   2. Use time ranges instead of exact times (e.g., 8:00-8:30 AM)');
        console.log('   3. Allow manual grouping by admin');
        console.log('   4. Group by proximity (nearby locations)');
      }
      
    } else {
      console.log('❌ Smart grouping failed:', groupingResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

testSmartGroupingWithDebug();