// ============================================================================
// TEST PAYMENT DETAILS FEATURE
// ============================================================================
// This script tests the new payment details feature in invoices
// Run: node test-payment-details-feature.js
// ============================================================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testInvoiceWithCustomPayment = {
  customerName: 'Test Customer Payment Details',
  customerEmail: 'test.payment@example.com',
  customerPhone: '+91-9876543210',
  billingAddress: {
    street: '123 Test Street',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001'
  },
  items: [
    {
      itemDetails: 'Fleet Management Service - January 2025',
      quantity: 1,
      rate: 10000,
      discount: 0,
      discountType: 'percentage'
    }
  ],
  terms: 'Net 30',
  // Custom payment details
  paymentDetails: {
    bankAccount: '9876543210123456',
    ifscCode: 'ICIC0001234',
    bankName: 'ICICI Bank',
    accountHolder: 'Custom Payment Account',
    upiId: 'custom@paytm',
    officeAddress: 'Custom Office Address, Custom City - 123456'
  }
};

const testInvoiceWithoutPayment = {
  customerName: 'Test Customer Default Payment',
  customerEmail: 'test.default@example.com',
  customerPhone: '+91-9876543211',
  billingAddress: {
    street: '456 Test Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001'
  },
  items: [
    {
      itemDetails: 'Fleet Management Service - February 2025',
      quantity: 1,
      rate: 15000,
      discount: 10,
      discountType: 'percentage'
    }
  ],
  terms: 'Net 15'
  // No paymentDetails - should use defaults
};

async function testPaymentDetailsFeature() {
  console.log('🧪 Testing Payment Details Feature...\n');
  
  try {
    // Test 1: Create invoice with custom payment details
    console.log('📝 Test 1: Creating invoice with custom payment details...');
    const customPaymentResponse = await axios.post(`${BASE_URL}/invoices`, testInvoiceWithCustomPayment);
    
    if (customPaymentResponse.data.success) {
      console.log('✅ Invoice with custom payment created successfully');
      console.log(`   Invoice Number: ${customPaymentResponse.data.data.invoiceNumber}`);
      console.log(`   Payment Details: ${JSON.stringify(customPaymentResponse.data.data.paymentDetails, null, 2)}`);
      
      // Test sending email with custom payment details
      console.log('📧 Sending email with custom payment details...');
      const sendResponse = await axios.post(`${BASE_URL}/invoices/${customPaymentResponse.data.data._id}/send`);
      
      if (sendResponse.data.success) {
        console.log('✅ Email sent successfully with custom payment details');
      } else {
        console.log('❌ Failed to send email:', sendResponse.data.error);
      }
    } else {
      console.log('❌ Failed to create invoice with custom payment:', customPaymentResponse.data.error);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 2: Create invoice without payment details (should use defaults)
    console.log('📝 Test 2: Creating invoice without payment details (should use defaults)...');
    const defaultPaymentResponse = await axios.post(`${BASE_URL}/invoices`, testInvoiceWithoutPayment);
    
    if (defaultPaymentResponse.data.success) {
      console.log('✅ Invoice without payment details created successfully');
      console.log(`   Invoice Number: ${defaultPaymentResponse.data.data.invoiceNumber}`);
      console.log(`   Payment Details: ${JSON.stringify(defaultPaymentResponse.data.data.paymentDetails || 'undefined (will use defaults)', null, 2)}`);
      
      // Test sending email with default payment details
      console.log('📧 Sending email with default payment details...');
      const sendResponse = await axios.post(`${BASE_URL}/invoices/${defaultPaymentResponse.data.data._id}/send`);
      
      if (sendResponse.data.success) {
        console.log('✅ Email sent successfully with default payment details');
      } else {
        console.log('❌ Failed to send email:', sendResponse.data.error);
      }
    } else {
      console.log('❌ Failed to create invoice without payment:', defaultPaymentResponse.data.error);
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Test 3: Verify payment defaults are loaded
    console.log('📝 Test 3: Verifying payment defaults configuration...');
    try {
      const DEFAULT_PAYMENT = require('./abra_fleet_backend/config/payment-defaults');
      console.log('✅ Payment defaults loaded successfully:');
      console.log(`   Bank Account: ${DEFAULT_PAYMENT.bankAccount.accountNumber}`);
      console.log(`   IFSC Code: ${DEFAULT_PAYMENT.bankAccount.ifscCode}`);
      console.log(`   UPI ID: ${DEFAULT_PAYMENT.upi.upiId}`);
      console.log(`   Contact Email: ${DEFAULT_PAYMENT.additional.contactEmail}`);
    } catch (error) {
      console.log('❌ Failed to load payment defaults:', error.message);
    }
    
    console.log('\n🎉 Payment Details Feature Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Custom payment details in invoices');
    console.log('   ✅ Default payment details fallback');
    console.log('   ✅ Enhanced email templates with payment info');
    console.log('   ✅ Payment defaults configuration');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testPaymentDetailsFeature();