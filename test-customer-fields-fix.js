// test-customer-fields-fix.js
// Test script to verify customer fields normalization is working

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/abra_fleet';

async function testCustomerFieldsFix() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('\n🧪 TESTING CUSTOMER FIELDS FIX');
    console.log('═'.repeat(80));
    
    await client.connect();
    const db = client.db();
    const customersCollection = db.collection('customers');
    
    // Test 1: Check for nested format customers
    console.log('\n📋 Test 1: Checking for nested format customers...');
    const nestedCount = await customersCollection.countDocuments({
      $or: [
        { 'name.firstName': { $exists: true } },
        { 'contactInfo.email': { $exists: true } },
        { 'company.name': { $exists: true } }
      ]
    });
    
    if (nestedCount > 0) {
      console.log(`⚠️  Found ${nestedCount} customers with nested format`);
      console.log('   → Run migration script: node abra_fleet_backend/scripts/migrate-customer-format.js');
    } else {
      console.log('✅ No nested format customers found');
    }
    
    // Test 2: Check for flat format customers
    console.log('\n📋 Test 2: Checking for flat format customers...');
    const flatCount = await customersCollection.countDocuments({
      name: { $type: 'string' },
      email: { $type: 'string' }
    });
    
    console.log(`✅ Found ${flatCount} customers with flat format`);
    
    // Test 3: Check for customers with missing required fields
    console.log('\n📋 Test 3: Checking for customers with missing fields...');
    
    const missingName = await customersCollection.countDocuments({
      $or: [
        { name: { $exists: false } },
        { name: '' },
        { name: null }
      ]
    });
    
    const missingEmail = await customersCollection.countDocuments({
      $or: [
        { email: { $exists: false } },
        { email: '' },
        { email: null }
      ]
    });
    
    const missingPhone = await customersCollection.countDocuments({
      $or: [
        { phone: { $exists: false } },
        { phone: null }
      ]
    });
    
    console.log(`   - Missing name: ${missingName}`);
    console.log(`   - Missing email: ${missingEmail}`);
    console.log(`   - Missing phone: ${missingPhone}`);
    
    if (missingName > 0 || missingEmail > 0) {
      console.log('⚠️  Some customers have missing required fields');
    } else {
      console.log('✅ All customers have required fields');
    }
    
    // Test 4: Sample customer data
    console.log('\n📋 Test 4: Sample customer data...');
    const sampleCustomers = await customersCollection.find({}).limit(5).toArray();
    
    console.log(`\nShowing ${sampleCustomers.length} sample customers:\n`);
    
    sampleCustomers.forEach((customer, index) => {
      console.log(`${index + 1}. Customer: ${customer.customerId || customer._id}`);
      console.log(`   ├─ Name: ${customer.name || '❌ MISSING'} ${typeof customer.name === 'object' ? '⚠️ NESTED' : '✅'}`);
      console.log(`   ├─ Email: ${customer.email || customer.contactInfo?.email || '❌ MISSING'} ${customer.contactInfo ? '⚠️ NESTED' : '✅'}`);
      console.log(`   ├─ Phone: ${customer.phone || customer.contactInfo?.phone || '❌ MISSING'} ${customer.contactInfo ? '⚠️ NESTED' : '✅'}`);
      console.log(`   ├─ Company: ${customer.companyName || customer.company?.name || 'N/A'} ${customer.company ? '⚠️ NESTED' : '✅'}`);
      console.log(`   ├─ Department: ${customer.department || 'N/A'}`);
      console.log(`   ├─ Branch: ${customer.branch || 'N/A'}`);
      console.log(`   ├─ Employee ID: ${customer.employeeId || 'N/A'}`);
      console.log(`   └─ Status: ${customer.status || 'N/A'}\n`);
    });
    
    // Test 5: Summary
    console.log('═'.repeat(80));
    console.log('📊 SUMMARY');
    console.log('═'.repeat(80));
    
    const totalCustomers = await customersCollection.countDocuments({});
    const activeCustomers = await customersCollection.countDocuments({ status: 'active' });
    const inactiveCustomers = await customersCollection.countDocuments({ status: 'inactive' });
    
    console.log(`Total Customers: ${totalCustomers}`);
    console.log(`├─ Active: ${activeCustomers}`);
    console.log(`├─ Inactive: ${inactiveCustomers}`);
    console.log(`├─ Flat Format: ${flatCount}`);
    console.log(`└─ Nested Format: ${nestedCount}`);
    
    // Final verdict
    console.log('\n' + '═'.repeat(80));
    if (nestedCount === 0 && missingName === 0 && missingEmail === 0) {
      console.log('✅ ALL TESTS PASSED - Customer data is in good shape!');
    } else {
      console.log('⚠️  SOME ISSUES FOUND - See details above');
      if (nestedCount > 0) {
        console.log('\n📝 Action Required:');
        console.log('   Run: node abra_fleet_backend/scripts/migrate-customer-format.js');
      }
    }
    console.log('═'.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run test
if (require.main === module) {
  testCustomerFieldsFix()
    .then(() => {
      console.log('\n👋 Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCustomerFieldsFix };
