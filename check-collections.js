// Check what collections exist and their structure
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://fleetadmin:fleetadmin@cluster0.cnb4jvy.mongodb.net/abra_fleet?retryWrites=true&w=majority&appName=Cluster0';

async function checkCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('abra_fleet');
    
    console.log('🔍 Checking collections...');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // Check clients collection
    console.log('\n📊 Clients collection:');
    const clientsCount = await db.collection('clients').countDocuments();
    console.log(`Count: ${clientsCount}`);
    
    if (clientsCount > 0) {
      const sampleClient = await db.collection('clients').findOne();
      console.log('Sample client:', JSON.stringify(sampleClient, null, 2));
    }
    
    // Check customers collection
    console.log('\n👥 Customers collection:');
    const customersCount = await db.collection('customers').countDocuments();
    console.log(`Count: ${customersCount}`);
    
    if (customersCount > 0) {
      const sampleCustomer = await db.collection('customers').findOne();
      console.log('Sample customer:', JSON.stringify(sampleCustomer, null, 2));
    }
    
    // Check users collection for clients
    console.log('\n👤 Users collection (clients):');
    const usersClientsCount = await db.collection('users').countDocuments({ role: 'client' });
    console.log(`Count: ${usersClientsCount}`);
    
    if (usersClientsCount > 0) {
      const sampleUserClient = await db.collection('users').findOne({ role: 'client' });
      console.log('Sample user client:', JSON.stringify(sampleUserClient, null, 2));
    }
    
    // Check users collection for customers
    console.log('\n👤 Users collection (customers):');
    const usersCustomersCount = await db.collection('users').countDocuments({ role: 'customer' });
    console.log(`Count: ${usersCustomersCount}`);
    
    if (usersCustomersCount > 0) {
      const sampleUserCustomer = await db.collection('users').findOne({ role: 'customer' });
      console.log('Sample user customer:', JSON.stringify(sampleUserCustomer, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkCollections();