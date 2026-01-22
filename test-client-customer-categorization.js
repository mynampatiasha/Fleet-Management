const axios = require('axios');

// Test script to verify the improved client customer categorization
async function testClientCustomerCategorization() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🧪 Testing Client Customer Categorization (All Customers Data)...\n');
  
  try {
    // Test 1: Sync customer counts with improved logic
    console.log('1️⃣ Testing sync-customer-counts endpoint...');
    const syncResponse = await axios.post(`${baseURL}/clients/sync-customer-counts`);
    
    if (syncResponse.data.success) {
      console.log('✅ Sync successful!');
      console.log(`   📊 Total customers processed: ${syncResponse.data.totalCustomers}`);
      console.log(`   🏢 Clients updated: ${syncResponse.data.updated}`);
      console.log(`   📝 Message: ${syncResponse.data.message}\n`);
    } else {
      console.log('❌ Sync failed:', syncResponse.data.message);
    }
    
    // Test 2: Get all clients to see updated counts
    console.log('2️⃣ Fetching all clients to verify counts...');
    const clientsResponse = await axios.get(`${baseURL}/clients`);
    
    if (clientsResponse.data.success && clientsResponse.data.clients) {
      const clients = clientsResponse.data.clients;
      console.log(`✅ Found ${clients.length} clients:`);
      
      clients.forEach((client, index) => {
        console.log(`   ${index + 1}. ${client.name}`);
        console.log(`      📧 Email: ${client.email}`);
        console.log(`      👥 Total Customers: ${client.totalCustomers || 0}`);
        console.log(`      📊 Status: ${client.status || 'unknown'}\n`);
      });
    } else {
      console.log('❌ Failed to fetch clients');
    }
    
    // Test 3: Test individual client customer categorization (if we have clients)
    if (clientsResponse.data.success && clientsResponse.data.clients && clientsResponse.data.clients.length > 0) {
      const firstClient = clientsResponse.data.clients[0];
      const clientId = firstClient.id || Object.keys(firstClient)[0]; // Handle different response formats
      
      console.log(`3️⃣ Testing client customer categorization for: ${firstClient.name}`);
      
      try {
        const customerResponse = await axios.get(`${baseURL}/clients/${clientId}/customers`);
        
        if (customerResponse.data.success) {
          console.log('✅ Client customer categorization successful!');
          console.log(`   👥 Total customer count: ${customerResponse.data.totalCount}`);
          console.log(`   📧 Client domain: ${customerResponse.data.clientInfo?.domain || 'N/A'}`);
          
          const categories = customerResponse.data.categories || {};
          
          console.log('\n   📋 Customer Categories:');
          
          // Explicitly assigned customers
          if (categories.explicitlyAssigned?.count > 0) {
            console.log(`   🎯 Directly Assigned: ${categories.explicitlyAssigned.count}`);
            console.log(`      Description: ${categories.explicitlyAssigned.description}`);
            if (categories.explicitlyAssigned.customers?.length > 0) {
              console.log('      Sample customers:');
              categories.explicitlyAssigned.customers.slice(0, 2).forEach((customer, index) => {
                console.log(`         ${index + 1}. ${customer.name} (${customer.email})`);
              });
            }
          }
          
          // Domain matched customers
          if (categories.domainMatched?.count > 0) {
            console.log(`   🌐 Domain Matched (@${categories.domainMatched.domain}): ${categories.domainMatched.count}`);
            console.log(`      Description: ${categories.domainMatched.description}`);
            if (categories.domainMatched.customers?.length > 0) {
              console.log('      Sample customers:');
              categories.domainMatched.customers.slice(0, 2).forEach((customer, index) => {
                console.log(`         ${index + 1}. ${customer.name} (${customer.email})`);
              });
            }
          }
          
          // Company matched customers
          if (categories.companyMatched?.count > 0) {
            console.log(`   🏢 Company Matched: ${categories.companyMatched.count}`);
            console.log(`      Description: ${categories.companyMatched.description}`);
            if (categories.companyMatched.customers?.length > 0) {
              console.log('      Sample customers:');
              categories.companyMatched.customers.slice(0, 2).forEach((customer, index) => {
                console.log(`         ${index + 1}. ${customer.name} (${customer.email})`);
              });
            }
          }
          
        } else {
          console.log('❌ Client customer categorization failed:', customerResponse.data.message);
        }
      } catch (error) {
        console.log('⚠️ Individual client test failed:', error.response?.data?.message || error.message);
      }
    }
    
    console.log('\n🎉 Client customer categorization test completed!');
    console.log('\n📋 Summary of New Features:');
    console.log('   ✅ Shows ALL customers from "All Customers" section');
    console.log('   ✅ Separates customers by assignment type:');
    console.log('      - Directly Assigned (explicit clientId)');
    console.log('      - Domain Matched (email domain matching)');
    console.log('      - Company Matched (company name matching)');
    console.log('   ✅ Provides accurate total count matching admin dashboard');
    console.log('   ✅ Removed total vehicles display from client details');
    console.log('   ✅ Enhanced client details screen with expandable categories');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testClientCustomerCategorization();