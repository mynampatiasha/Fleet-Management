// Test script to check what data is returned by the my-rosters endpoint
const axios = require('axios');

async function testMyRostersData() {
  try {
    console.log('🔍 Testing /api/roster/customer/my-rosters endpoint...');
    
    // You'll need to replace this with a valid token from a customer account
    const testToken = 'YOUR_CUSTOMER_TOKEN_HERE';
    
    const response = await axios.get('http://localhost:3001/api/roster/customer/my-rosters', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Response Status:', response.status);
    console.log('📊 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.length > 0) {
      const firstRoster = response.data.data[0];
      console.log('\n🔍 First Roster Details:');
      console.log('   ID:', firstRoster.id);
      console.log('   Status:', firstRoster.status);
      console.log('   Roster Type:', firstRoster.rosterType);
      console.log('   Office Location:', firstRoster.officeLocation);
      console.log('   Date Range:', firstRoster.dateRange);
      console.log('   Time Range:', firstRoster.timeRange);
      console.log('   Weekdays:', firstRoster.weekdays);
      console.log('   Weekly Off Days:', firstRoster.weeklyOffDays);
      console.log('   Start Date:', firstRoster.startDate);
      console.log('   End Date:', firstRoster.endDate);
      console.log('   From Date:', firstRoster.fromDate);
      console.log('   To Date:', firstRoster.toDate);
      console.log('   Locations:', firstRoster.locations);
      console.log('   Created At:', firstRoster.createdAt);
    }
    
  } catch (error) {
    console.error('❌ Error testing my-rosters endpoint:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

// Instructions for getting a customer token
console.log('📝 To test this script:');
console.log('1. Login as a customer in the app');
console.log('2. Get the Firebase ID token from the app');
console.log('3. Replace YOUR_CUSTOMER_TOKEN_HERE with the actual token');
console.log('4. Run: node test-my-rosters-data.js');
console.log('');

// Uncomment the line below and add a real token to test
// testMyRostersData();