const axios = require('axios');

// Debug script to check client customer counts and sync issues
async function debugClientCustomerCounts() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🔍 Debugging Client Customer Count Issues...\n');
  
  try {
    // Step 1: Check current client data
    console.log('1️⃣ Fetching current client data...');
    const clientsResponse = await axios.get(`${baseURL}/clients`);
    
    if (clientsResponse.data.success && clientsResponse.data.clients) {
      const clients = clientsResponse.data.clients;
      console.log(`✅ Found ${clients.length} clients:\n`);
      
      clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.name}`);
        console.log(`      📧 Email: ${client.email}`);
        console.log(`      🏢 Domain: @${client.email.split('@')[1] || 'no-domain'}`);
        console.log(`      👥 Total Customers: ${client.totalCustomers || 0}`);
        console.log(`      📊 Status: ${client.status || 'unknown'}\n`);
      });
    }
    
    // Step 2: Check actual customer data in database
    console.log('2️⃣ Checking actual customer data in database...');
    
    // Get all customers
    const customersResponse = await axios.get(`${baseURL}/admin/analytics/manpower-stats`);
    
    if (customersResponse.data.success) {
      const stats = customersResponse.data.stats;
      console.log('✅ Database customer stats:');
      console.log(`   👥 Total Customers: ${stats.totalCustomers || 0}`);
      console.log(`   🚗 Total Vehicles: ${stats.totalVehicles || 0}`);
      console.log(`   👨‍💼 Total Drivers: ${stats.totalDrivers || 0}`);
      console.log(`   🏢 Total Clients: ${stats.totalClients || 0}\n`);
    }
    
    // Step 3: Test sync functionality
    console.log('3️⃣ Testing customer count sync...');
    const syncResponse = await axios.post(`${baseURL}/clients/sync-customer-counts`);
    
    if (syncResponse.data.success) {
      console.log('✅ Sync completed successfully!');
      console.log(`   📊 Total customers processed: ${syncResponse.data.totalCustomers}`);
      console.log(`   🏢 Clients updated: ${syncResponse.data.updated}`);
      console.log(`   📝 Message: ${syncResponse.data.message}\n`);
    } else {
      console.log('❌ Sync failed:', syncResponse.data.message);
    }
    
    // Step 4: Check clients again after sync
    console.log('4️⃣ Checking client data after sync...');
    const updatedClientsResponse = await axios.get(`${baseURL}/clients`);
    
    if (updatedClientsResponse.data.success && updatedClientsResponse.data.clients) {
      const updatedClients = updatedClientsResponse.data.clients;
      console.log(`✅ Updated client data:\n`);
      
      updatedClients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.name}`);
        console.log(`      📧 Email: ${client.email}`);
        console.log(`      🏢 Domain: @${client.email.split('@')[1] || 'no-domain'}`);
        console.log(`      👥 Total Customers: ${client.totalCustomers || 0}`);
        console.log(`      📊 Status: ${client.status || 'unknown'}\n`);
      });
    }
    
    // Step 5: Test individual client customer fetching
    if (updatedClientsResponse.data.success && updatedClientsResponse.data.clients && updatedClientsResponse.data.clients.length > 0) {
      console.log('5️⃣ Testing individual client customer fetching...');
      
      for (const client of updatedClientsResponse.data.clients.slice(0, 3)) { // Test first 3 clients
        const clientId = client.id || Object.keys(client)[0];
        
        try {
          console.log(`\n   Testing client: ${client.name}`);
          const customerResponse = await axios.get(`${baseURL}/clients/${clientId}/customers`);
          
          if (customerResponse.data.success) {
            console.log(`   ✅ Found ${customerResponse.data.count} customers`);
            console.log(`   📧 Client domain: ${customerResponse.data.clientInfo?.domain || 'N/A'}`);
            
            if (customerResponse.data.customers && customerResponse.data.customers.length > 0) {
              console.log(`   📋 Sample customers:`);
              customerResponse.data.customers.slice(0, 2).forEach((customer, index) => {
                console.log(`      ${index + 1}. ${customer.name} (${customer.email})`);
                console.log(`         🏢 Company: ${customer.companyName || 'N/A'}`);
                console.log(`         🔗 Assignment: ${customer.clientId ? 'Explicit' : 'Domain-matched'}`);
              });
            }
          } else {
            console.log(`   ❌ Failed to fetch customers: ${customerResponse.data.message}`);
          }
        } catch (error) {
          console.log(`   ⚠️ Error testing client ${client.name}: ${error.response?.data?.message || error.message}`);
        }
      }
    }
    
    console.log('\n🎯 DIAGNOSIS SUMMARY:');
    console.log('=====================================');
    
    // Compare before and after sync
    if (clientsResponse.data.clients && updatedClientsResponse.data.clients) {
      const beforeSync = clientsResponse.data.clients;
      const afterSync = updatedClientsResponse.data.clients;
      
      let changesDetected = false;
      
      beforeSync.forEach((beforeClient, index) => {
        const afterClient = afterSync[index];
        if (afterClient && beforeClient.totalCustomers !== afterClient.totalCustomers) {
          console.log(`📈 ${beforeClient.name}: ${beforeClient.totalCustomers} → ${afterClient.totalCustomers} customers`);
          changesDetected = true;
        }
      });
      
      if (!changesDetected) {
        console.log('⚠️  No customer count changes detected after sync');
        console.log('   This could indicate:');
        console.log('   - Customer assignments are already correct');
        console.log('   - No customers match client domains');
        console.log('   - Sync logic needs adjustment');
      }
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('- If counts are still 0, check if customers have matching email domains');
    console.log('- Consider adding explicit clientId assignments to customer records');
    console.log('- Verify Firebase Realtime Database and MongoDB connectivity');
    console.log('- Check if customer data exists in both Firestore and MongoDB');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

// Run the debug
debugClientCustomerCounts();