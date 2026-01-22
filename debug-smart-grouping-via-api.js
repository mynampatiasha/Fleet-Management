// debug-smart-grouping-via-api.js
// Debug smart grouping issue via backend API

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function debugSmartGroupingViaAPI() {
  try {
    console.log('🔍 Debugging Smart Grouping via Backend API...\n');
    
    // Step 1: Get pending rosters count
    console.log('📋 Step 1: Checking pending rosters...');
    try {
      const pendingResponse = await axios.get(`${BASE_URL}/roster/admin/pending-rosters`, {
        timeout: 10000
      });
      
      if (pendingResponse.data.success) {
        const pendingRosters = pendingResponse.data.data || [];
        console.log(`✅ Found ${pendingRosters.length} pending rosters`);
        
        // Show first few rosters
        console.log('\n📊 Sample pending rosters:');
        pendingRosters.slice(0, 5).forEach((roster, idx) => {
          console.log(`\n   Roster ${idx + 1}:`);
          console.log(`   - Customer: ${roster.customerName || 'Unknown'}`);
          console.log(`   - Email: ${roster.customerEmail || 'No email'}`);
          console.log(`   - Office: ${roster.officeLocation || 'No location'}`);
          console.log(`   - Times: ${roster.startTime || 'No start'} - ${roster.endTime || 'No end'}`);
          console.log(`   - Type: ${roster.rosterType || 'No type'}`);
          console.log(`   - Status: ${roster.status}`);
        });
        
        // Analyze email domains
        console.log('\n🔍 Email domain analysis:');
        const emailDomains = new Set();
        const officeLocations = new Set();
        const timeSlots = new Set();
        const rosterTypes = new Set();
        
        pendingRosters.forEach(roster => {
          const email = roster.customerEmail || '';
          if (email.includes('@')) {
            const domain = email.substring(email.indexOf('@'));
            emailDomains.add(domain);
          }
          officeLocations.add(roster.officeLocation || 'Unknown');
          timeSlots.add(`${roster.startTime || 'Unknown'}-${roster.endTime || 'Unknown'}`);
          rosterTypes.add(roster.rosterType || 'both');
        });
        
        console.log(`   - Unique email domains: ${emailDomains.size}`);
        console.log(`   - Unique office locations: ${officeLocations.size}`);
        console.log(`   - Unique time slots: ${timeSlots.size}`);
        console.log(`   - Unique roster types: ${rosterTypes.size}`);
        
        console.log('\n📋 Email domains found:');
        [...emailDomains].forEach(domain => console.log(`   - ${domain}`));
        
        console.log('\n📋 Office locations found:');
        [...officeLocations].forEach(location => console.log(`   - ${location}`));
        
        console.log('\n📋 Time slots found:');
        [...timeSlots].forEach(slot => console.log(`   - ${slot}`));
        
      } else {
        console.log('❌ Failed to get pending rosters:', pendingResponse.data.message);
        return;
      }
    } catch (error) {
      console.log('❌ Error getting pending rosters:', error.message);
      return;
    }
    
    // Step 2: Test smart grouping
    console.log('\n🔍 Step 2: Testing smart grouping...');
    try {
      const groupingResponse = await axios.post(`${BASE_URL}/roster/admin/group-similar`, {}, {
        timeout: 15000
      });
      
      if (groupingResponse.data.success) {
        const groups = groupingResponse.data.data.groups || [];
        const totalRosters = groupingResponse.data.data.totalRosters || 0;
        
        console.log(`✅ Smart grouping completed:`);
        console.log(`   - Total rosters: ${totalRosters}`);
        console.log(`   - Total groups: ${groups.length}`);
        console.log(`   - Groups per roster ratio: ${(groups.length / totalRosters).toFixed(2)}`);
        
        if (groups.length === totalRosters) {
          console.log('\n⚠️  ISSUE IDENTIFIED: Each roster is in its own group!');
          console.log('   This means no rosters are being grouped together.');
          console.log('   Root causes could be:');
          console.log('   - Each employee has a different email domain');
          console.log('   - Each employee has a different office location');
          console.log('   - Each employee has different time schedules');
          console.log('   - Each employee has different roster types');
          console.log('   - Each employee has different weekday patterns');
        } else if (groups.length > totalRosters) {
          console.log('\n❌ CRITICAL ISSUE: More groups than rosters!');
          console.log('   This should never happen - there\'s a bug in the grouping logic.');
        } else {
          console.log('\n✅ Grouping is working correctly');
        }
        
        // Show all groups
        console.log('\n📊 All groups created:');
        groups.forEach((group, idx) => {
          console.log(`\n   Group ${idx + 1}:`);
          console.log(`   - Organization: ${group.organization || group.emailDomain || 'Unknown'}`);
          console.log(`   - Email Domain: ${group.emailDomain || 'Unknown'}`);
          console.log(`   - Location: ${group.loginLocation || 'Unknown'}`);
          console.log(`   - Times: ${group.loginTime || 'Unknown'} - ${group.logoutTime || 'Unknown'}`);
          console.log(`   - Type: ${group.rosterType || 'Unknown'}`);
          console.log(`   - Employee Count: ${group.employeeCount || 0}`);
          console.log(`   - Employees: ${(group.employees || []).map(e => e.name).join(', ') || 'None'}`);
        });
        
        // Show groups with multiple members
        const multiMemberGroups = groups.filter(g => (g.employeeCount || 0) > 1);
        console.log(`\n📊 Groups with multiple members: ${multiMemberGroups.length}`);
        
        if (multiMemberGroups.length > 0) {
          console.log('\n✅ Multi-member groups:');
          multiMemberGroups.forEach((group, idx) => {
            console.log(`\n   Group ${idx + 1}:`);
            console.log(`   - Members: ${group.employeeCount}`);
            console.log(`   - Organization: ${group.organization || group.emailDomain}`);
            console.log(`   - Location: ${group.loginLocation}`);
            console.log(`   - Names: ${(group.employees || []).map(e => e.name).join(', ')}`);
          });
        } else {
          console.log('\n⚠️  No groups with multiple members found');
          console.log('   This explains why you see so many groups!');
        }
        
        // Analysis
        console.log('\n🔍 Analysis:');
        if (groups.length === totalRosters) {
          console.log('❌ ROOT CAUSE: Every employee has unique grouping criteria');
          console.log('   Each employee differs in at least one of:');
          console.log('   - Email domain (company)');
          console.log('   - Office location');
          console.log('   - Time schedule');
          console.log('   - Roster type (login/logout/both)');
          console.log('   - Weekday pattern');
          
          console.log('\n💡 SOLUTIONS:');
          console.log('   1. Group by broader criteria (e.g., ignore exact times)');
          console.log('   2. Group by location only (ignore company)');
          console.log('   3. Group by time slots (e.g., morning/evening)');
          console.log('   4. Allow manual grouping override');
        }
        
      } else {
        console.log('❌ Smart grouping failed:', groupingResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Error in smart grouping:', error.message);
      if (error.code === 'ECONNABORTED') {
        console.log('   → Request timed out (grouping is taking too long)');
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ DEBUGGING COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  }
}

debugSmartGroupingViaAPI();