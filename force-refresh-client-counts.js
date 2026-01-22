const axios = require('axios');

// Force refresh client customer counts with detailed logging
async function forceRefreshClientCounts() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🔄 Force Refreshing Client Customer Counts...\n');
  
  try {
    // Step 1: Get current customer data from database
    console.log('1️⃣ Analyzing customer data in database...');
    
    // This endpoint should give us the total customer count
    const statsResponse = await axios.get(`${baseURL}/admin/analytics/manpower-stats`);
    
    if (statsResponse.data.success) {
      const stats = statsResponse.data.stats;
      console.log(`✅ Found ${stats.totalCustomers || 0} total customers in database`);
    }
    
    // Step 2: Force sync with detailed logging
    console.log('\n2️⃣ Forcing customer count sync...');
    const syncResponse = await axios.post(`${baseURL}/clients/sync-customer-counts`, {
      forceRefresh: true
    });
    
    if (syncResponse.data.success) {
      console.log('✅ Sync completed!');
      console.log(`   📊 Total customers processed: ${syncResponse.data.totalCustomers}`);
      console.log(`   🏢 Clients updated: ${syncResponse.data.updated}`);
      console.log(`   📝 Message: ${syncResponse.data.message}`);
    } else {
      console.log('❌ Sync failed:', syncResponse.data.message);
      return;
    }
    
    // Step 3: Verify updated counts
    console.log('\n3️⃣ Verifying updated client counts...');
    const clientsResponse = await axios.get(`${baseURL}/clients`);
    
    if (clientsResponse.data.success && clientsResponse.data.clients) {
      const clients = clientsResponse.data.clients;
      console.log(`✅ Verified ${clients.length} clients:\n`);
      
      let totalAssignedCustomers = 0;
      
      clients.forEach((client, index) => {
        const customerCount = client.totalCustomers || 0;
        totalAssignedCustomers += customerCount;
        
        console.log(`   ${index + 1}. ${client.name}`);
        console.log(`      📧 Email: ${client.email}`);
        console.log(`      🏢 Domain: @${client.email.split('@')[1] || 'no-domain'}`);
        console.log(`      👥 Assigned Customers: ${customerCount}`);
        
        if (customerCount > 0) {
          console.log(`      ✅ Has customers assigned`);
        } else {
          console.log(`      ⚠️  No customers assigned`);
        }
        console.log('');
      });
      
      console.log(`📊 SUMMARY:`);
      console.log(`   Total customers in database: ${statsResponse.data.stats?.totalCustomers || 0}`);
      console.log(`   Total assigned to clients: ${totalAssignedCustomers}`);
      
      if (totalAssignedCustomers === 0) {
        console.log('\n⚠️  WARNING: No customers are assigned to any clients!');
        console.log('   This could mean:');
        console.log('   - Customer email domains don\'t match client domains');
        console.log('   - No explicit clientId assignments exist');
        console.log('   - Customer data is in different format than expected');
        
        // Let's check a sample of customer data
        console.log('\n4️⃣ Checking sample customer data...');
        
        try {
          // Try to get some customer data to analyze
          const testResponse = await axios.get(`${baseURL}/admin/analytics/manpower-stats`);
          if (testResponse.data.success) {
            console.log('   ✅ Customer data exists in database');
            console.log('   💡 Recommendation: Check customer email domains vs client domains');
          }
        } catch (error) {
          console.log('   ❌ Could not access customer data');
        }
      } else {
        console.log('\n✅ SUCCESS: Customers are properly assigned to clients!');
      }
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Refresh your Flutter app to see updated counts');
    console.log('2. Check the client dashboard for correct employee numbers');
    console.log('3. If counts are still 0, run debug-client-customer-counts.js for detailed analysis');
    
  } catch (error) {
    console.error('❌ Force refresh failed:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 TIP: Make sure your backend is running on port 3001');
    } else if (error.response?.status === 500) {
      console.log('\n💡 TIP: Check backend logs for database connection issues');
    }
  }
}

// Run the force refresh
forceRefreshClientCounts();