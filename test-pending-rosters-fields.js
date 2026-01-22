// Test the pending rosters API to verify all fields are returned
const axios = require('axios');

async function testPendingRostersFields() {
  console.log('🧪 TESTING PENDING ROSTERS API FIELDS');
  console.log('='.repeat(50));
  
  const baseURL = 'http://localhost:3001';
  
  try {
    console.log('🔍 Checking server status...');
    await axios.get(`${baseURL}/health`, { timeout: 5000 });
    console.log('✅ Server is running');
    
    console.log('\n📤 Testing pending rosters endpoint...');
    console.log('   Endpoint: GET /api/roster/admin/pending');
    
    const response = await axios.get(
      `${baseURL}/api/roster/admin/pending`,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-test-firebase-uid': 'test-admin-uid' // Test mode
        },
        timeout: 10000
      }
    );
    
    console.log('\n📥 Response received:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Count: ${response.data.count}`);
    
    if (response.data.success && response.data.data && response.data.data.length > 0) {
      const firstRoster = response.data.data[0];
      
      console.log('\n🔍 FIRST ROSTER FIELDS:');
      console.log('='.repeat(50));
      
      // Check all the fields we're interested in
      const fieldsToCheck = [
        'customerName', 'customerEmail', 'customerPhone', 'phone', 'phoneNumber',
        'employeeId', 'department', 'companyName', 'organization', 'organizationName',
        'address', 'officeLocation', 'rosterType',
        'startDate', 'endDate', 'startTime', 'endTime',
        'loginPickupAddress', 'logoutDropAddress', 'pickupLocation', 'dropLocation',
        'locations', 'weekdays', 'weeklyOffDays', 'status'
      ];
      
      fieldsToCheck.forEach(field => {
        const value = firstRoster[field];
        const exists = value !== undefined && value !== null;
        const status = exists ? '✅' : '❌';
        let preview = 'NOT FOUND';
        
        if (exists) {
          if (typeof value === 'object') {
            preview = Array.isArray(value) ? `[${value.length} items]` : '{object}';
          } else {
            preview = value.toString().length > 50 ? 
              value.toString().substring(0, 50) + '...' : 
              value.toString();
          }
        }
        
        console.log(`   ${status} ${field}: ${preview}`);
      });
      
      // Check nested locations object specifically
      if (firstRoster.locations) {
        console.log('\n🔍 LOCATIONS OBJECT DETAILS:');
        console.log('   locations:', JSON.stringify(firstRoster.locations, null, 2));
        
        if (firstRoster.locations.pickup) {
          console.log(`   ✅ pickup.address: ${firstRoster.locations.pickup.address || 'N/A'}`);
        }
        if (firstRoster.locations.drop) {
          console.log(`   ✅ drop.address: ${firstRoster.locations.drop.address || 'N/A'}`);
        }
      }
      
      console.log('\n🎯 SUMMARY FOR FRONTEND:');
      console.log('='.repeat(50));
      
      // Simulate what the frontend should extract
      const extractedData = {
        customerName: firstRoster.customerName || 'Unknown',
        customerEmail: firstRoster.customerEmail || 'N/A',
        customerPhone: firstRoster.customerPhone || firstRoster.phone || firstRoster.phoneNumber || 'N/A',
        employeeId: firstRoster.employeeId || 'N/A',
        department: firstRoster.department || 'N/A',
        companyName: firstRoster.companyName || firstRoster.organization || firstRoster.organizationName || 'N/A',
        address: firstRoster.address || 'N/A',
        officeLocation: firstRoster.officeLocation || 'N/A',
        pickupLocation: firstRoster.loginPickupAddress || 
                       firstRoster.locations?.pickup?.address || 
                       firstRoster.pickupLocation || 'Not specified',
        dropLocation: firstRoster.logoutDropAddress || 
                     firstRoster.locations?.drop?.address || 
                     firstRoster.dropLocation || 'Not specified',
        rosterType: firstRoster.rosterType || 'both',
        startTime: firstRoster.startTime || 'N/A',
        endTime: firstRoster.endTime || 'N/A',
        weekdays: firstRoster.weekdays || firstRoster.weeklyOffDays || []
      };
      
      console.log('📊 EXTRACTED DATA (what frontend should show):');
      Object.entries(extractedData).forEach(([key, value]) => {
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
        const status = (value && value !== 'N/A' && value !== 'Not specified') ? '✅' : '⚠️';
        console.log(`   ${status} ${key}: ${displayValue}`);
      });
      
    } else {
      console.log('\n❌ No roster data returned or API failed');
      console.log('   Response data:', response.data);
    }
    
  } catch (error) {
    console.log('\n❌ REQUEST FAILED');
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.error || 'Unknown'}`);
      console.log(`   Message: ${error.response.data?.message || 'No message'}`);
    } else {
      console.log(`   Connection error: ${error.message}`);
    }
  }
}

testPendingRostersFields().catch(console.error);