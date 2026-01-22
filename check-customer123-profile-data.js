const { MongoClient, ObjectId } = require('mongodb');

async function checkCustomerProfile() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db('abra_fleet');
    
    // Find customer123
    const customer = await db.collection('customers').findOne({
      email: 'customer123@abrafleet.com'
    });
    
    if (!customer) {
      console.log('❌ Customer not found');
      return;
    }
    
    console.log('📋 Customer Record in Database:\n');
    console.log(JSON.stringify(customer, null, 2));
    
    console.log('\n🔍 Field Analysis:\n');
    console.log('ID:', customer._id.toString());
    console.log('Name:', customer.name || 'NOT SET');
    console.log('Email:', customer.email || 'NOT SET');
    console.log('Phone:', customer.phoneNumber || 'NOT SET');
    console.log('Alt Phone:', customer.alternativePhone || 'NOT SET');
    console.log('Company:', customer.companyName || 'NOT SET');
    console.log('Department:', customer.department || 'NOT SET');
    console.log('Employee ID:', customer.employeeId || 'NOT SET');
    console.log('Designation:', customer.designation || 'NOT SET');
    console.log('Photo URL:', customer.photoUrl || 'NOT SET');
    console.log('Role:', customer.role || 'NOT SET');
    console.log('Status:', customer.status || 'NOT SET');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkCustomerProfile();
