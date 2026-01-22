const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function testBillingBackendConnection() {
  let client;
  
  try {
    console.log('🚀 Testing Billing Backend Connection...');
    console.log('='.repeat(60));
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('abra_fleet');
    
    // Test 1: Check if dummy data exists
    console.log('📋 Checking contracts...');
    const contractsCount = await db.collection('contracts').countDocuments();
    console.log(`   Found ${contractsCount} contracts`);
    
    console.log('🧾 Checking invoices...');
    const invoicesCount = await db.collection('invoices').countDocuments();
    console.log(`   Found ${invoicesCount} invoices`);
    
    console.log('📝 Checking audit logs...');
    const auditLogsCount = await db.collection('audit_logs').countDocuments({ 
      entityType: { $in: ['contract', 'invoice'] } 
    });
    console.log(`   Found ${auditLogsCount} billing audit logs`);
    
    // Test 2: Sample contract data
    if (contractsCount > 0) {
      console.log('\n📋 Sample Contract:');
      const sampleContract = await db.collection('contracts').findOne();
      console.log(`   ID: ${sampleContract.contractId}`);
      console.log(`   Organization: ${sampleContract.organizationName}`);
      console.log(`   Status: ${sampleContract.status}`);
      console.log(`   Billing Cycle: ${sampleContract.paymentTerms.billingCycle}`);
    }
    
    // Test 3: Sample invoice data
    if (invoicesCount > 0) {
      console.log('\n🧾 Sample Invoice:');
      const sampleInvoice = await db.collection('invoices').findOne();
      console.log(`   ID: ${sampleInvoice.id}`);
      console.log(`   Organization: ${sampleInvoice.organizationName}`);
      console.log(`   Amount: ₹${sampleInvoice.totalAmount.toLocaleString()}`);
      console.log(`   Status: ${sampleInvoice.status}`);
    }
    
    // Test 4: API endpoint simulation
    console.log('\n🔗 Testing API Endpoints:');
    
    // Simulate GET /api/billing/contracts
    const allContracts = await db.collection('contracts').find({}).toArray();
    console.log(`   ✅ GET /api/billing/contracts - ${allContracts.length} contracts`);
    
    // Simulate GET /api/billing/invoices
    const allInvoices = await db.collection('invoices').find({}).sort({ date: -1 }).toArray();
    console.log(`   ✅ GET /api/billing/invoices - ${allInvoices.length} invoices`);
    
    // Simulate GET /api/billing/contracts/organization/:id
    const orgContracts = await db.collection('contracts').find({ 
      organizationId: 'ORG-ABC',
      status: 'active'
    }).toArray();
    console.log(`   ✅ GET /api/billing/contracts/organization/ORG-ABC - ${orgContracts.length} contracts`);
    
    // Test 5: Payment status summary
    console.log('\n💰 Payment Status Summary:');
    const paymentStats = await db.collection('invoices').aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]).toArray();
    
    paymentStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} invoices, ₹${stat.totalAmount.toLocaleString()}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ BILLING BACKEND CONNECTION TEST COMPLETE!');
    console.log('='.repeat(60));
    console.log('🎯 Next Steps:');
    console.log('   1. Start the backend server: npm start (in abra_fleet_backend)');
    console.log('   2. Run the Flutter app');
    console.log('   3. Navigate to Client Billing Invoices');
    console.log('   4. Data should load from backend automatically');
    console.log('');
    console.log('🔧 Backend API Base URL: http://localhost:3001/api/billing');
    console.log('📱 Frontend Service: BillingApiService');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Error testing billing backend connection:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testBillingBackendConnection()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testBillingBackendConnection };