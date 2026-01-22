// Test script to verify domain-based employee grouping
const http = require('http');

async function testDomainGrouping() {
  console.log('🧪 Testing Domain-Based Employee Grouping');
  console.log('==========================================');
  
  try {
    // Test the sync endpoint
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/clients/sync-customer-counts',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Sync Response:', JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log(`📊 Total customers processed: ${response.totalCustomers}`);
            console.log(`🏢 Clients updated: ${response.updated}`);
            console.log('✅ Domain-based grouping sync completed successfully!');
          } else {
            console.log('❌ Sync failed:', response.message);
          }
        } catch (e) {
          console.log('❌ Error parsing response:', e.message);
          console.log('Raw response:', data);
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Request error:', e.message);
    });

    req.end();
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

// Example of how domain grouping should work:
console.log('📋 Domain Grouping Logic:');
console.log('========================');
console.log('Client: Infosys Ltd (admin@infosys.com)');
console.log('Domain: @infosys.com');
console.log('Employees that will be counted:');
console.log('  - john.doe@infosys.com ✅');
console.log('  - jane.smith@infosys.com ✅');
console.log('  - mike.wilson@infosys.com ✅');
console.log('  - sarah.jones@google.com ❌ (different domain)');
console.log('  - alex.brown@microsoft.com ❌ (different domain)');
console.log('');

testDomainGrouping();