// Test which collection Arjun Nair user is in
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testArjunNairCollections() {
  console.log('🔍 Testing Arjun Nair in all collections\n');
  
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const email = 'arjun.nair@wipro.com';
    
    // Check all possible collections
    const collections = ['users', 'customers', 'drivers', 'clients', 'employee_admins'];
    
    for (const collectionName of collections) {
      console.log(`\n📋 Checking ${collectionName} collection...`);
      
      try {
        const collection = db.collection(collectionName);
        const user = await collection.findOne({ email: email.toLowerCase() });
        
        if (user) {
          console.log(`✅ FOUND in ${collectionName}:`);
          console.log(`   MongoDB ID: ${user._id}`);
          console.log(`   Firebase UID: ${user.firebaseUid}`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Status: ${user.status || user.isActive}`);
        } else {
          console.log(`❌ Not found in ${collectionName}`);
        }
      } catch (error) {
        console.log(`⚠️  Error checking ${collectionName}: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('\n📝 MongoDB connection closed');
    }
  }
}

testArjunNairCollections();