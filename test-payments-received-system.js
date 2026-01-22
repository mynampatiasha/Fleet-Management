// Test script for Payments Received System
// Tests all API endpoints and functionality

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const TEST_TOKEN = 'test-token'; // Replace with actual Firebase token

// Test configuration
const testConfig = {
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Content-Type': 'application/json'
  },
  timeout: 10000
};

// Test data
const testPaymentData = {
  customerName: 'Asha',
  amountReceived: 5000.00,
  bankCharges: 50.00,
  paymentDate: '08/01/2026',
  paymentNumber: '4',
  paymentMode: 'Cash',
  depositTo: 'Asha',
  reference: 'REF001',
  taxDeduction: 'No Tax deducted',
  notes: 'Test payment for system verification',
  sendThankYouNote: false,
  invoiceNumber: 'INV-000001',
  status: 'paid'
};

async function testPaymentsReceivedSystem() {
  console.log('🧪 Testing Payments Received System');
  console.log('=' * 50);

  try {
    // Test 1: Get next payment number
    console.log('\n1️⃣ Testing: Get Next Payment Number');
    try {
      const response = await axios.get(`${BASE_URL}/payments-received/next-payment-number`, testConfig);
      console.log('✅ Next payment number:', response.data.data.nextPaymentNumber);
    } catch (error) {
      console.log('❌ Error getting next payment number:', error.response?.data?.message || error.message);
    }

    // Test 2: Create new payment
    console.log('\n2️⃣ Testing: Create New Payment');
    let createdPaymentId = null;
    try {
      const response = await axios.post(`${BASE_URL}/payments-received`, testPaymentData, testConfig);
      console.log('✅ Payment created successfully');
      console.log('   Payment ID:', response.data.data.id);
      console.log('   Payment Number:', response.data.data.paymentNumber);
      createdPaymentId = response.data.data.id;
    } catch (error) {
      console.log('❌ Error creating payment:', error.response?.data?.message || error.message);
    }

    // Test 3: Get all payments received
    console.log('\n3️⃣ Testing: Get All Payments Received');
    try {
      const response = await axios.get(`${BASE_URL}/payments-received`, testConfig);
      console.log('✅ Payments retrieved successfully');
      console.log('   Total payments:', response.data.total);
      console.log('   Sample payment:', response.data.data[0] || 'No payments found');
    } catch (error) {
      console.log('❌ Error getting payments:', error.response?.data?.message || error.message);
    }

    // Test 4: Get payments with filter
    console.log('\n4️⃣ Testing: Get Payments with Filter (Paid)');
    try {
      const response = await axios.get(`${BASE_URL}/payments-received?filter=Paid`, testConfig);
      console.log('✅ Filtered payments retrieved successfully');
      console.log('   Paid payments count:', response.data.total);
    } catch (error) {
      console.log('❌ Error getting filtered payments:', error.response?.data?.message || error.message);
    }

    // Test 5: Get payment by ID (if we created one)
    if (createdPaymentId) {
      console.log('\n5️⃣ Testing: Get Payment by ID');
      try {
        const response = await axios.get(`${BASE_URL}/payments-received/${createdPaymentId}`, testConfig);
        console.log('✅ Payment retrieved by ID successfully');
        console.log('   Customer:', response.data.data.customerName);
        console.log('   Amount:', response.data.data.amountReceived);
      } catch (error) {
        console.log('❌ Error getting payment by ID:', error.response?.data?.message || error.message);
      }
    }

    // Test 6: Get unpaid invoices for customer
    console.log('\n6️⃣ Testing: Get Unpaid Invoices for Customer');
    try {
      const response = await axios.get(`${BASE_URL}/payments-received/customer/Asha/unpaid-invoices`, testConfig);
      console.log('✅ Unpaid invoices retrieved successfully');
      console.log('   Unpaid invoices count:', response.data.total);
    } catch (error) {
      console.log('❌ Error getting unpaid invoices:', error.response?.data?.message || error.message);
    }

    // Test 7: Get payment statistics
    console.log('\n7️⃣ Testing: Get Payment Statistics');
    try {
      const response = await axios.get(`${BASE_URL}/payments-received/stats/summary`, testConfig);
      console.log('✅ Payment statistics retrieved successfully');
      console.log('   Total payments:', response.data.data.summary.totalPayments || 0);
      console.log('   Total amount:', response.data.data.summary.totalAmount || 0);
    } catch (error) {
      console.log('❌ Error getting payment statistics:', error.response?.data?.message || error.message);
    }

    // Test 8: Export payments to CSV
    console.log('\n8️⃣ Testing: Export Payments to CSV');
    try {
      const response = await axios.get(`${BASE_URL}/payments-received/export/csv`, testConfig);
      console.log('✅ Payments exported to CSV successfully');
      console.log('   CSV length:', response.data.length, 'characters');
    } catch (error) {
      console.log('❌ Error exporting payments:', error.response?.data?.message || error.message);
    }

    // Test 9: Update payment (if we created one)
    if (createdPaymentId) {
      console.log('\n9️⃣ Testing: Update Payment');
      try {
        const updateData = {
          notes: 'Updated test payment notes',
          amountReceived: 5500.00
        };
        const response = await axios.put(`${BASE_URL}/payments-received/${createdPaymentId}`, updateData, testConfig);
        console.log('✅ Payment updated successfully');
      } catch (error) {
        console.log('❌ Error updating payment:', error.response?.data?.message || error.message);
      }
    }

    // Test 10: Test error handling - Invalid payment ID
    console.log('\n🔟 Testing: Error Handling - Invalid Payment ID');
    try {
      const response = await axios.get(`${BASE_URL}/payments-received/invalid-id`, testConfig);
      console.log('❌ Should have failed with invalid ID');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly handled invalid payment ID');
      } else {
        console.log('❌ Unexpected error:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Payments Received System Test Complete!');
    console.log('=' * 50);

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Test data creation helper
async function createSamplePayments() {
  console.log('\n📝 Creating Sample Payment Data...');
  
  const samplePayments = [
    {
      customerName: 'Asha',
      amountReceived: 9000.00,
      paymentDate: '07/01/2026',
      paymentNumber: '1',
      paymentMode: 'Cash',
      depositTo: 'Asha',
      invoiceNumber: 'INV-000001',
      status: 'paid'
    },
    {
      customerName: 'Asha',
      amountReceived: 100.00,
      paymentDate: '07/01/2026',
      paymentNumber: '2',
      paymentMode: 'Cash',
      depositTo: 'Asha',
      invoiceNumber: 'INV-000003',
      status: 'paid'
    },
    {
      customerName: 'Asha',
      amountReceived: 5000.00,
      paymentDate: '07/01/2026',
      paymentNumber: '3',
      paymentMode: 'Cash',
      depositTo: 'Asha',
      status: 'paid'
    }
  ];

  for (const payment of samplePayments) {
    try {
      await axios.post(`${BASE_URL}/payments-received`, payment, testConfig);
      console.log(`✅ Created payment ${payment.paymentNumber}`);
    } catch (error) {
      console.log(`❌ Failed to create payment ${payment.paymentNumber}:`, error.response?.data?.message || error.message);
    }
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Payments Received System Tests');
  console.log('Time:', new Date().toISOString());
  console.log('Base URL:', BASE_URL);
  
  // Create sample data first
  await createSamplePayments();
  
  // Run main tests
  await testPaymentsReceivedSystem();
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testPaymentsReceivedSystem,
  createSamplePayments,
  runAllTests
};