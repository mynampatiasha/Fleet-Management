const axios = require('axios');

// Simple test to check customer data and client assignments
async function testCustomerData() {
  const baseURL = 'http://localhost:3001/api';
  
  console.log('🧪 Testing Customer Data and Client Assignments...\n');
  
  try {
    // Test 1: Check if we can get customers directly
    console.log('1️⃣ Testing direct customer access...');
    
    // Try different endpoints to see customer data
    const endpoints = [
      '/admin/analytics/manpower-stats',
      '/clients/sync-customer-counts',
      '/clients'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`   Testing: ${endpoint}`);
        const response = await axios.get(endpoint.includes('sync') ? 
          axios.post(`${baseURL}${endpoint}`, {}) : 
          axios.get(`${baseURL}${endpoint}`)
        );
        
        if (endpoint === '/admin/analytics/manpower-stats') {
          console.log(`   ✅ Total customers: ${response.data.stats?.totalCustomers || 'N/A'}`);
        } else if (endpoint === '/clients') {
          const clients = response.data.clients || [];
          console.log(`   ✅ Found ${clients.length} clients`);
          clients.slice(0, 3).forEach(client => {
            console.log(`      - ${client.name}: ${client.totalCustomers || 0} customers`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Failed: ${error.response?.status || error.message}`);
      }
    }
    
    // Test 2: Force sync and check results
    console.log('\n2️⃣ Force syncing customer counts...');
    try {
      const syncResponse = await axios.post(`${baseURL}/clients/sync-customer-counts`);
      console.log('   ✅ Sync response:', {
        success: syncResponse.data.success,
        totalCustomers: syncResponse.data.totalCustomers,
        updated: syncResponse.data.updated,
        message: syncResponse.data.message
      });
    } catch (error) {
      console.log('   ❌ Sync failed:', error.response?.data || error.message);
    }
    
    // Test 3: Check specific client customers
    console.log('\n3️⃣ Testing specific client customer lookup...');
    try {
      const clientsResponse = await axios.get(`${baseURL}/clients`);
      if (clientsResponse.data.success && clientsResponse.data.clients?.length > 0) {
        const firstClient = clientsResponse.data.clients[0];
        const clientId = firstClient.id || Object.keys(firstClient)[0];
        
        console.log(`   Testing client: ${firstClient.name} (ID: ${clientId})`);
        
        const customerResponse = await axios.get(`${baseURL}/clients/${clientId}/customers`);
        console.log('   ✅ Customer lookup result:', {
          success: customerResponse.data.success,
          count: customerResponse.data.count,
          clientDomain: customerResponse.data.clientInfo?.domain
        });
        
        if (customerResponse.data.customers?.length > 0) {
          console.log('   📋 Sample customers:');
          customerResponse.data.customers.slice(0, 2).forEach(customer => {
            console.log(`      - ${customer.name} (${customer.email})`);
          });
        }
      }
    } catch (error) {
      console.log('   ❌ Client customer lookup failed:', error.response?.data || error.message);
    }
    
    console.log('\n🎯 Quick Diagnosis:');
    console.log('   - If total customers > 0 but client counts = 0: Assignment logic issue');
    console.log('   - If sync fails: Backend connection or database issue');
    console.log('   - If client lookup fails: Client ID or routing issue');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCustomerData();