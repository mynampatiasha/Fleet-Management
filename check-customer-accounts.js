const { MongoClient } = require('mongodb');

async function checkCustomerAccounts() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('abra_fleet');
    
    // Find all customers
    console.log('📋 All Customer Accounts:\n');
    const customers = await db.collection('customers').find({}).toArray();
    
    if (customers.length === 0) {
      console.log('❌ No customers found in database');
    } else {
      customers.forEach((customer, index) => {
        console.log(`\n${index + 1}. Customer:`);
        console.log('   ID:', customer._id.toString());
        console.log('   Name:', customer.name || 'NOT SET');
        console.log('   Email:', customer.email || 'NOT SET');
        console.log('   Phone:', customer.phoneNumber || 'NOT SET');
        console.log('   Alt Phone:', customer.alternativePhone || 'NOT SET');
        console.log('   Company:', customer.companyName || 'NOT SET');
        console.log('   Department:', customer.department || 'NOT SET');
        console.log('   Employee ID:', customer.employeeId || 'NOT SET');
        console.log('   Designation:', customer.designation || 'NOT SET');
        console.log('   Role:', customer.role || 'NOT SET');
        console.log('   Status:', customer.status || 'NOT SET');
        console.log('   Has Password:', customer.password ? 'YES' : 'NO');
      });
    }
    
    // Also check users collection
    console.log('\n\n📋 Checking users collection for customers:\n');
    const users = await db.collection('users').find({ role: 'customer' }).toArray();
    
    if (users.length === 0) {
      console.log('❌ No customer users found in users collection');
    } else {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User:`);
        console.log('   ID:', user._id.toString());
        console.log('   Name:', user.name || 'NOT SET');
        console.log('   Email:', user.email || 'NOT SET');
        console.log('   Phone:', user.phoneNumber || 'NOT SET');
        console.log('   Role:', user.role || 'NOT SET');
        console.log('   Has Password:', user.password ? 'YES' : 'NO');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkCustomerAccounts();
