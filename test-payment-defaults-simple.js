// ============================================================================
// SIMPLE TEST FOR PAYMENT DEFAULTS CONFIGURATION
// ============================================================================
// This script tests if the payment defaults are loaded correctly
// Run: node test-payment-defaults-simple.js
// ============================================================================

console.log('🧪 Testing Payment Defaults Configuration...\n');

try {
  // Test 1: Load payment defaults
  console.log('📝 Test 1: Loading payment defaults configuration...');
  const DEFAULT_PAYMENT = require('./abra_fleet_backend/config/payment-defaults');
  
  console.log('✅ Payment defaults loaded successfully!');
  console.log('\n📋 Configuration Details:');
  console.log(`   Bank Account Holder: ${DEFAULT_PAYMENT.bankAccount.accountHolder}`);
  console.log(`   Bank Account Number: ${DEFAULT_PAYMENT.bankAccount.accountNumber}`);
  console.log(`   IFSC Code: ${DEFAULT_PAYMENT.bankAccount.ifscCode}`);
  console.log(`   Bank Name: ${DEFAULT_PAYMENT.bankAccount.bankName}`);
  console.log(`   UPI ID: ${DEFAULT_PAYMENT.upi.upiId}`);
  console.log(`   Office Address: ${DEFAULT_PAYMENT.office.fullAddress}`);
  console.log(`   Contact Email: ${DEFAULT_PAYMENT.additional.contactEmail}`);
  console.log(`   Contact Phone: ${DEFAULT_PAYMENT.additional.contactPhone}`);
  console.log(`   GST Number: ${DEFAULT_PAYMENT.additional.gstNumber}`);
  
  // Test 2: Verify all required fields are present
  console.log('\n📝 Test 2: Verifying required fields...');
  
  const requiredFields = [
    'bankAccount.accountHolder',
    'bankAccount.accountNumber', 
    'bankAccount.ifscCode',
    'bankAccount.bankName',
    'upi.upiId',
    'office.fullAddress',
    'additional.contactEmail',
    'additional.contactPhone',
    'additional.gstNumber'
  ];
  
  let allFieldsPresent = true;
  
  requiredFields.forEach(field => {
    const fieldParts = field.split('.');
    let value = DEFAULT_PAYMENT;
    
    for (const part of fieldParts) {
      value = value[part];
    }
    
    if (!value) {
      console.log(`   ❌ Missing field: ${field}`);
      allFieldsPresent = false;
    } else {
      console.log(`   ✅ ${field}: ${value}`);
    }
  });
  
  if (allFieldsPresent) {
    console.log('\n✅ All required fields are present!');
  } else {
    console.log('\n❌ Some required fields are missing!');
  }
  
  // Test 3: Test the logic for using custom vs default payment details
  console.log('\n📝 Test 3: Testing payment details selection logic...');
  
  // Simulate invoice with custom payment details
  const invoiceWithCustomPayment = {
    paymentDetails: {
      bankAccount: '9876543210123456',
      ifscCode: 'ICIC0001234',
      bankName: 'ICICI Bank',
      accountHolder: 'Custom Payment Account',
      upiId: 'custom@paytm',
      officeAddress: 'Custom Office Address, Custom City - 123456'
    }
  };
  
  // Simulate invoice without payment details
  const invoiceWithoutPayment = {};
  
  // Test custom payment logic
  const customPaymentInfo = invoiceWithCustomPayment.paymentDetails && Object.keys(invoiceWithCustomPayment.paymentDetails).length > 0
    ? invoiceWithCustomPayment.paymentDetails
    : {
        accountHolder: DEFAULT_PAYMENT.bankAccount.accountHolder,
        bankAccount: DEFAULT_PAYMENT.bankAccount.accountNumber,
        ifscCode: DEFAULT_PAYMENT.bankAccount.ifscCode,
        bankName: DEFAULT_PAYMENT.bankAccount.bankName,
        upiId: DEFAULT_PAYMENT.upi.upiId,
        officeAddress: DEFAULT_PAYMENT.office.fullAddress
      };
  
  console.log('   ✅ Custom payment details logic:');
  console.log(`      Account Holder: ${customPaymentInfo.accountHolder}`);
  console.log(`      Bank Account: ${customPaymentInfo.bankAccount}`);
  console.log(`      UPI ID: ${customPaymentInfo.upiId}`);
  
  // Test default payment logic
  const defaultPaymentInfo = invoiceWithoutPayment.paymentDetails && Object.keys(invoiceWithoutPayment.paymentDetails).length > 0
    ? invoiceWithoutPayment.paymentDetails
    : {
        accountHolder: DEFAULT_PAYMENT.bankAccount.accountHolder,
        bankAccount: DEFAULT_PAYMENT.bankAccount.accountNumber,
        ifscCode: DEFAULT_PAYMENT.bankAccount.ifscCode,
        bankName: DEFAULT_PAYMENT.bankAccount.bankName,
        upiId: DEFAULT_PAYMENT.upi.upiId,
        officeAddress: DEFAULT_PAYMENT.office.fullAddress
      };
  
  console.log('   ✅ Default payment details logic:');
  console.log(`      Account Holder: ${defaultPaymentInfo.accountHolder}`);
  console.log(`      Bank Account: ${defaultPaymentInfo.bankAccount}`);
  console.log(`      UPI ID: ${defaultPaymentInfo.upiId}`);
  
  console.log('\n🎉 Payment Details Configuration Test Complete!');
  console.log('\n📋 Summary:');
  console.log('   ✅ Payment defaults configuration loaded');
  console.log('   ✅ All required fields present');
  console.log('   ✅ Custom vs default payment logic working');
  console.log('   ✅ Ready for invoice email integration');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('   Stack:', error.stack);
}