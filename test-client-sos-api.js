// Test Client SOS API with organization filtering
const axios = require('axios');

async function testClientSOSAPI() {
  try {
    console.log('🚨 Testing Client SOS API...\n');

    // Test 1: Get all SOS alerts
    console.log('📡 Test 1: Fetching all SOS alerts...');
    const allAlertsResponse = await axios.get('http://localhost:3001/api/sos', {
      timeout: 10000
    });
    
    console.log(`✅ Status: ${allAlertsResponse.status}`);
    console.log(`📊 Total alerts: ${allAlertsResponse.data.data?.length || 0}`);
    
    if (allAlertsResponse.data.data && allAlertsResponse.data.data.length > 0) {
      console.log('📋 Sample alert:');
      const sample = allAlertsResponse.data.data[0];
      console.log(`   Customer: ${sample.customerName}`);
      console.log(`   Email: ${sample.customerEmail}`);
      console.log(`   Status: ${sample.status}`);
      console.log(`   Address: ${sample.address}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get resolved SOS alerts
    console.log('📡 Test 2: Fetching resolved SOS alerts...');
    const resolvedAlertsResponse = await axios.get('http://localhost:3001/api/sos?status=Resolved&limit=100', {
      timeout: 10000
    });
    
    console.log(`✅ Status: ${resolvedAlertsResponse.status}`);
    console.log(`📊 Resolved alerts: ${resolvedAlertsResponse.data.data?.length || 0}`);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Get SOS alerts with organization filter
    console.log('📡 Test 3: Fetching SOS alerts with organization filter...');
    const orgFilterResponse = await axios.get('http://localhost:3001/api/sos?organizationDomain=@example.com&limit=100', {
      timeout: 10000
    });
    
    console.log(`✅ Status: ${orgFilterResponse.status}`);
    console.log(`📊 Organization filtered alerts: ${orgFilterResponse.data.data?.length || 0}`);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Get resolved alerts with organization filter
    console.log('📡 Test 4: Fetching resolved alerts with organization filter...');
    const resolvedOrgResponse = await axios.get('http://localhost:3001/api/sos?status=Resolved&organizationDomain=@example.com&limit=100', {
      timeout: 10000
    });
    
    console.log(`✅ Status: ${resolvedOrgResponse.status}`);
    console.log(`📊 Resolved + Organization filtered alerts: ${resolvedOrgResponse.data.data?.length || 0}`);

    // Show all unique customer emails to understand the data
    console.log('\n📧 All customer emails in database:');
    const allEmails = [...new Set(allAlertsResponse.data.data?.map(alert => alert.customerEmail) || [])];
    allEmails.forEach(email => console.log(`   - ${email}`));

    // Show all unique statuses
    console.log('\n📊 All statuses in database:');
    const allStatuses = [...new Set(allAlertsResponse.data.data?.map(alert => alert.status) || [])];
    allStatuses.forEach(status => console.log(`   - ${status}`));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Backend server might not be running. Try:');
      console.log('   cd abra_fleet_backend && npm start');
    }
  }
}

testClientSOSAPI();