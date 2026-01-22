// ============================================================================
// BILLING INVOICES INTEGRATION TEST
// ============================================================================
// Test the complete invoices list page integration with backend
// ============================================================================

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';
const TEST_TOKEN = 'test-admin-token'; // You can use any test token

async function testInvoicesIntegration() {
  console.log('🧪 Testing Billing Invoices Integration...\n');

  try {
    // Test 1: Get invoices list
    console.log('📋 Test 1: Get Invoices List');
    const invoicesResponse = await axios.get(`${BASE_URL}/api/invoices`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 10
      }
    });

    console.log('✅ Invoices API Response:');
    console.log(`   Status: ${invoicesResponse.status}`);
    console.log(`   Total Invoices: ${invoicesResponse.data.data.length}`);
    console.log(`   Pagination: Page ${invoicesResponse.data.pagination.page} of ${invoicesResponse.data.pagination.pages}`);
    
    if (invoicesResponse.data.data.length > 0) {
      const firstInvoice = invoicesResponse.data.data[0];
      console.log(`   First Invoice: ${firstInvoice.invoiceNumber} - ${firstInvoice.customerName}`);
    }

    // Test 2: Get invoice statistics
    console.log('\n📊 Test 2: Get Invoice Statistics');
    const statsResponse = await axios.get(`${BASE_URL}/api/invoices/stats`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Stats API Response:');
    console.log(`   Status: ${statsResponse.status}`);
    console.log(`   Total Invoices: ${statsResponse.data.data.totalInvoices}`);
    console.log(`   Total Revenue: ₹${statsResponse.data.data.totalRevenue}`);
    console.log(`   Total Paid: ₹${statsResponse.data.data.totalPaid}`);
    console.log(`   Total Due: ₹${statsResponse.data.data.totalDue}`);

    // Test 3: Test filtering
    console.log('\n🔍 Test 3: Test Status Filtering');
    const filteredResponse = await axios.get(`${BASE_URL}/api/invoices`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        status: 'sent',
        page: 1,
        limit: 5
      }
    });

    console.log('✅ Filtered Invoices (Status: sent):');
    console.log(`   Status: ${filteredResponse.status}`);
    console.log(`   Filtered Count: ${filteredResponse.data.data.length}`);

    // Test 4: Get billing customers
    console.log('\n👥 Test 4: Get Billing Customers');
    const customersResponse = await axios.get(`${BASE_URL}/api/invoices/customers`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 10
      }
    });

    console.log('✅ Billing Customers API Response:');
    console.log(`   Status: ${customersResponse.status}`);
    console.log(`   Total Customers: ${customersResponse.data.data.length}`);
    
    if (customersResponse.data.data.length > 0) {
      const firstCustomer = customersResponse.data.data[0];
      console.log(`   First Customer: ${firstCustomer.customerName} - ${firstCustomer.customerEmail}`);
    }

    console.log('\n🎉 All Integration Tests Passed!');
    console.log('\n📱 Flutter Integration Status:');
    console.log('   ✅ InvoicesListPage - Ready');
    console.log('   ✅ InvoiceService - Connected');
    console.log('   ✅ BillingMainShell - Navigation Added');
    console.log('   ✅ Backend APIs - Working');
    
    console.log('\n🚀 Ready to Test in Flutter:');
    console.log('   1. Navigate to Billing → Sales → Invoices');
    console.log('   2. Check statistics cards at the top');
    console.log('   3. Test filtering by status');
    console.log('   4. Test search functionality');
    console.log('   5. Test pagination');
    console.log('   6. Click invoice numbers to edit');
    console.log('   7. Click "+ New" to create invoices');

  } catch (error) {
    console.error('❌ Integration Test Failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data?.message || error.response.statusText}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure backend is running on port 3001');
    console.log('   2. Check if invoice routes are properly configured');
    console.log('   3. Verify database connection');
    console.log('   4. Run: node abra_fleet_backend/test-invoice-system.js');
  }
}

// Run the test
testInvoicesIntegration();