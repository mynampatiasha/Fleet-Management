// debug-smart-grouping-issue.js
// Check why smart grouping shows 47 groups when there are only 29 pending rosters

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet_management';

async function debugSmartGrouping() {
  let client;
  
  try {
    console.log('🔍 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db();
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DEBUGGING SMART GROUPING ISSUE');
    console.log('='.repeat(80));
    
    // 1. Check total pending rosters
    console.log('\n📋 Step 1: Checking pending rosters...');
    const pendingRosters = await db.collection('rosters')
      .find({
        status: { $in: ['pending', 'pending_assignment', 'created'] },
        customerEmail: { $ne: 'admin@abrafleet.com' }
      })
      .toArray();
    
    console.log(`✅ Found ${pendingRosters.length} pending rosters`);
    
    if (pendingRosters.length === 0) {
      console.log('❌ No pending rosters found!');
      return;
    }
    
    // 2. Show first few rosters for debugging
    console.log('\n📊 Step 2: Sample roster data...');
    pendingRosters.slice(0, 5).forEach((roster, idx) => {
      console.log(`\n   Roster ${idx + 1}:`);
      console.log(`   - ID: ${roster._id}`);
      console.log(`   - Customer: ${roster.customerName || 'Unknown'}`);
      console.log(`   - Email: ${roster.customerEmail || 'No email'}`);
      console.log(`   - Office: ${roster.officeLocation || 'No location'}`);
      console.log(`   - Times: ${roster.startTime || roster.fromTime || 'No start'} - ${roster.endTime || roster.toTime || 'No end'}`);
      console.log(`   - Type: ${roster.rosterType || 'No type'}`);
      console.log(`   - Weekdays: ${JSON.stringify(roster.weekdays || roster.weeklyOffDays || [])}`);
      console.log(`   - Status: ${roster.status}`);
    });
    
    // 3. Simulate the grouping logic
    console.log('\n🔍 Step 3: Simulating grouping logic...');
    
    function getEmailDomain(email) {
      if (!email || typeof email !== 'string') return 'unknown';
      try {
        const atIndex = email.indexOf('@');
        if (atIndex === -1) return 'unknown';
        const domain = email.substring(atIndex);
        return domain.toLowerCase().trim();
      } catch (e) {
        return 'unknown';
      }
    }
    
    const groups = {};
    
    for (const roster of pendingRosters) {
      const email = roster.customerEmail ||
        roster.employeeDetails?.email ||
        roster.employeeData?.email || '';
      
      const emailDomain = getEmailDomain(email);
      const loginTime = roster.startTime || roster.loginTime || roster.fromTime || 'Unknown';
      const logoutTime = roster.endTime || roster.logoutTime || roster.toTime || 'Unknown';
      const location = (roster.officeLocation || 'Unknown').toLowerCase().trim();
      const rosterType = (roster.rosterType || 'both').toLowerCase();
      const weekdays = roster.weekdays || roster.weeklyOffDays || [];
      const weekdayKey = [...weekdays].sort().join(',').toLowerCase();
      
      const groupKey = `${emailDomain}|${loginTime}|${logoutTime}|${location}|${rosterType}|${weekdayKey}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = {
          groupKey,
          emailDomain,
          loginTime,
          logoutTime,
          location: roster.officeLocation || 'Unknown',
          rosterType,
          weekdays,
          employees: [],
          count: 0
        };
      }
      
      groups[groupKey].employees.push({
        name: roster.customerName || 'Unknown',
        email: email,
        rosterId: roster._id.toString()
      });
      groups[groupKey].count++;
    }
    
    const groupArray = Object.values(groups);
    console.log(`\n📊 Created ${groupArray.length} groups from ${pendingRosters.length} rosters`);
    
    // 4. Show all groups
    console.log('\n📋 Step 4: All groups created...');
    groupArray.forEach((group, idx) => {
      console.log(`\n   Group ${idx + 1}:`);
      console.log(`   - Key: ${group.groupKey}`);
      console.log(`   - Domain: ${group.emailDomain}`);
      console.log(`   - Location: ${group.location}`);
      console.log(`   - Times: ${group.loginTime} - ${group.logoutTime}`);
      console.log(`   - Type: ${group.rosterType}`);
      console.log(`   - Weekdays: ${JSON.stringify(group.weekdays)}`);
      console.log(`   - Count: ${group.count}`);
      console.log(`   - Members: ${group.employees.map(e => e.name).join(', ')}`);
    });
    
    // 5. Analyze the issue
    console.log('\n🔍 Step 5: Analysis...');
    
    // Count unique email domains
    const uniqueDomains = new Set();
    const uniqueLocations = new Set();
    const uniqueTimes = new Set();
    const uniqueTypes = new Set();
    
    pendingRosters.forEach(roster => {
      const email = roster.customerEmail || '';
      const domain = getEmailDomain(email);
      uniqueDomains.add(domain);
      uniqueLocations.add((roster.officeLocation || 'Unknown').toLowerCase().trim());
      uniqueTimes.add(`${roster.startTime || 'Unknown'}-${roster.endTime || 'Unknown'}`);
      uniqueTypes.add(roster.rosterType || 'both');
    });
    
    console.log(`\n📊 Unique values found:`);
    console.log(`   - Email domains: ${uniqueDomains.size}`);
    console.log(`   - Office locations: ${uniqueLocations.size}`);
    console.log(`   - Time combinations: ${uniqueTimes.size}`);
    console.log(`   - Roster types: ${uniqueTypes.size}`);
    
    console.log(`\n📋 Email domains:`);
    [...uniqueDomains].forEach(domain => console.log(`   - ${domain}`));
    
    console.log(`\n📋 Office locations:`);
    [...uniqueLocations].forEach(location => console.log(`   - ${location}`));
    
    console.log(`\n📋 Time combinations:`);
    [...uniqueTimes].forEach(time => console.log(`   - ${time}`));
    
    // 6. Root cause analysis
    console.log('\n🔍 Step 6: Root cause analysis...');
    
    if (groupArray.length > pendingRosters.length) {
      console.log('❌ ISSUE FOUND: More groups than rosters!');
      console.log('   This should never happen - each roster should belong to exactly one group');
    } else if (groupArray.length === pendingRosters.length) {
      console.log('⚠️  ISSUE FOUND: Each roster is in its own group!');
      console.log('   This means no rosters are being grouped together');
      console.log('   Possible causes:');
      console.log('   - Different email domains for each employee');
      console.log('   - Different office locations');
      console.log('   - Different time schedules');
      console.log('   - Different roster types');
      console.log('   - Different weekday patterns');
    } else {
      console.log('✅ Grouping is working correctly');
      console.log(`   ${pendingRosters.length} rosters grouped into ${groupArray.length} groups`);
    }
    
    // 7. Show groups with multiple members
    const multiMemberGroups = groupArray.filter(g => g.count > 1);
    console.log(`\n📊 Groups with multiple members: ${multiMemberGroups.length}`);
    
    if (multiMemberGroups.length > 0) {
      multiMemberGroups.forEach((group, idx) => {
        console.log(`\n   Multi-member Group ${idx + 1}:`);
        console.log(`   - Members: ${group.count}`);
        console.log(`   - Domain: ${group.emailDomain}`);
        console.log(`   - Location: ${group.location}`);
        console.log(`   - Names: ${group.employees.map(e => e.name).join(', ')}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ DEBUGGING COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

debugSmartGrouping();