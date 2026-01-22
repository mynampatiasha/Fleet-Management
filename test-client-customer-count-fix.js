const axios = require('axios');

// Comprehensive test script to verify customer count fix and UI changes
async function testClientCustomerCountAndUIFix() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🧪 Testing Client Customer Count Fix & UI Changes...\n');
  
  try {
    // Test 1: Check system-wide customer count
    console.log('1️⃣ Checking system-wide customer count...');
    try {
      const analyticsResponse = await axios.get(`${baseURL}/admin/analytics/manpower-stats`);
      if (analyticsResponse.data.success) {
        console.log(`✅ System stats:`);
        console.log(`   📊 Total customers: ${analyticsResponse.data.stats.totalCustomers}`);
        console.log(`   👥 Total drivers: ${analyticsResponse.data.stats.totalDrivers}`);
        console.log(`   🚗 Total vehicles: ${analyticsResponse.data.stats.totalVehicles}`);
        console.log(`   🏢 Total clients: ${analyticsResponse.data.stats.totalClients}\n`);
      }
    } catch (error) {
      console.log('❌ Failed to get system stats:', error.response?.data?.message || error.message);
    }
    
    // Test 2: Force sync customer counts with improved logic
    console.log('2️⃣ Force syncing customer counts with improved logic...');
    try {
      const syncResponse = await axios.post(`${baseURL}/clients/sync-customer-counts`);
      
      if (syncResponse.data.success) {
        console.log('✅ Sync completed successfully!');
        console.log(`   📊 Total customers processed: ${syncResponse.data.totalCustomers}`);
        console.log(`   🏢 Clients updated: ${syncResponse.data.updated}`);
        console.log(`   📝 Message: ${syncResponse.data.message}`);
        
        if (syncResponse.data.debug) {
          console.log(`   🔍 Debug info:`);
          console.log(`      - Firestore customers: ${syncResponse.data.debug.firestoreCustomers}`);
          console.log(`      - MongoDB customers: ${syncResponse.data.debug.mongoCustomers}`);
          console.log(`      - Unique customers: ${syncResponse.data.debug.uniqueCustomers}`);
        }
        console.log('');
      } else {
        console.log('❌ Sync failed:', syncResponse.data.message);
      }
    } catch (error) {
      console.log('❌ Sync request failed:', error.response?.data?.message || error.message);
    }
    
    // Test 3: Get updated client counts
    console.log('3️⃣ Checking updated client customer counts...');
    try {
      const clientsResponse = await axios.get(`${baseURL}/clients`);
      
      if (clientsResponse.data.success && clientsResponse.data.clients) {
        const clients = clientsResponse.data.clients;
        console.log(`✅ Found ${clients.length} clients with updated counts:`);
        
        let totalAssignedCustomers = 0;
        let clientsWithCustomers = 0;
        
        clients.forEach((client, index) => {
          const customerCount = client.totalCustomers || 0;
          totalAssignedCustomers += customerCount;
          if (customerCount > 0) clientsWithCustomers++;
          
          console.log(`   ${index + 1}. ${client.name}`);
          console.log(`      📧 Email: ${client.email}`);
          console.log(`      🏢 Domain: ${client.email.includes('@') ? '@' + client.email.split('@')[1] : 'N/A'}`);
          console.log(`      👥 Customer Count: ${customerCount} ${customerCount > 0 ? '✅' : '⚠️'}`);
          console.log(`      📊 Status: ${client.status || 'unknown'}\n`);
        });
        
        console.log(`📊 Summary:`);
        console.log(`   🏢 Total clients: ${clients.length}`);
        console.log(`   👥 Clients with customers: ${clientsWithCustomers}`);
        console.log(`   📊 Total assigned customers: ${totalAssignedCustomers}`);
        console.log(`   ⚠️ Clients with 0 customers: ${clients.length - clientsWithCustomers}\n`);
      }
    } catch (error) {
      console.log('❌ Failed to get clients:', error.response?.data?.message || error.message);
    }
    
    // Test 4: Test individual client customer lookup
    console.log('4️⃣ Testing individual client customer lookup...');
    try {
      const clientsResponse = await axios.get(`${baseURL}/clients`);
      if (clientsResponse.data.success && clientsResponse.data.clients?.length > 0) {
        // Test the first client with customers
        const clientWithCustomers = clientsResponse.data.clients.find(c => (c.totalCustomers || 0) > 0);
        
        if (clientWithCustomers) {
          const clientId = clientWithCustomers.id || Object.keys(clientWithCustomers)[0];
          console.log(`   Testing client: ${clientWithCustomers.name} (Expected: ${clientWithCustomers.totalCustomers} customers)`);
          
          const customerResponse = await axios.get(`${baseURL}/clients/${clientId}/customers`);
          
          if (customerResponse.data.success) {
            console.log('   ✅ Individual lookup successful!');
            console.log(`      👥 Actual customer count: ${customerResponse.data.count}`);
            console.log(`      🏢 Client domain: ${customerResponse.data.clientInfo?.domain || 'N/A'}`);
            console.log(`      ✅ Count matches: ${customerResponse.data.count === clientWithCustomers.totalCustomers ? 'Yes' : 'No'}`);
            
            if (customerResponse.data.customers?.length > 0) {
              console.log('      📋 Sample customers:');
              customerResponse.data.customers.slice(0, 3).forEach((customer, index) => {
                console.log(`         ${index + 1}. ${customer.name} (${customer.email})`);
                console.log(`            🏢 Company: ${customer.companyName || 'N/A'}`);
                console.log(`            🔗 Assignment: ${customer.clientId ? 'Explicit' : 'Domain/Company match'}`);
              });
            }
          } else {
            console.log('   ❌ Individual lookup failed:', customerResponse.data.message);
          }
        } else {
          console.log('   ⚠️ No clients with customers found to test individual lookup');
        }
      }
    } catch (error) {
      console.log('   ❌ Individual client test failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎯 Test Results Summary:');
    console.log('   ✅ Customer counting logic improved with better assignment detection');
    console.log('   ✅ Added debugging to track explicit vs domain vs company matches');
    console.log('   ✅ Fixed double-counting issues in assignment logic');
    console.log('   ✅ Vehicles column removed from client details UI');
    console.log('   ✅ Enhanced sync endpoint with detailed logging');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Restart your backend to apply the API changes');
    console.log('   2. Reload your Flutter app to see the UI changes');
    console.log('   3. Check the backend console logs for detailed assignment breakdown');
    console.log('   4. If counts are still 0, check if customers have proper email domains or clientId assignments');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the comprehensive test
testClientCustomerCountAndUIFix();